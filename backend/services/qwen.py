import os
import json
import uuid
import asyncio
import httpx
import time
from dotenv import load_dotenv

load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL_NAME = "qwen/qwen3-coder:free"
MAX_RETRIES = 2
BASE_DELAY = 1.0  # seconds

class RateLimitError(Exception):
    def __init__(self, message, retry_after_seconds=None):
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds

def _sanitize_json_content(content: str) -> str:
    # Ensure raw markdown code blocks are removed if present
    content = content.replace("```json", "").replace("```", "").strip()
    return content

def _make_metadata(source: str, latency_ms: int, request_id: str) -> dict:
    return {"source": source, "latency_ms": latency_ms, "request_id": request_id}

async def _call_qwen(prompt: str) -> tuple[dict, dict]:
    """Call Qwen API via OpenRouter with bounded retry."""
    last_error = None
    start_time = time.time()
    
    for attempt in range(MAX_RETRIES):
        try:
            req_start = time.time()
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:8000",
                        "X-Title": "Agent Phantom"
                    },
                    json={
                        "model": MODEL_NAME,
                        "messages": [{"role": "user", "content": prompt}],
                        "response_format": {"type": "json_object"}
                    }
                )
                
                latency_ms = int((time.time() - req_start) * 1000)
                
                if response.status_code == 429:
                    delay = BASE_DELAY * (2 ** attempt)
                    retry_after = None
                    try:
                        err_data = response.json()
                        retry_after = err_data.get("error", {}).get("metadata", {}).get("retry_after_seconds")
                        if retry_after: delay = max(delay, float(retry_after) + 1.0)
                    except Exception: pass
                    
                    if attempt == MAX_RETRIES - 1:
                        raise RateLimitError("Rate limited by OpenRouter", retry_after_seconds=retry_after)
                        
                    await asyncio.sleep(delay)
                    last_error = Exception(f"429 rate limit after {MAX_RETRIES} attempts")
                    continue
                    
                response.raise_for_status()
                response_json = response.json()
                request_id = response_json.get("id", "unknown")
                content = response_json["choices"][0]["message"]["content"]
                
                print(f"Log: openrouter {MODEL_NAME} {response.status_code} {request_id} {latency_ms}")
                
                sanitized = _sanitize_json_content(content)
                result = json.loads(sanitized)
                
                metadata = _make_metadata("live_model", latency_ms=latency_ms, request_id=request_id)
                return result, metadata
                
        except RateLimitError as re:
            raise re
        except httpx.HTTPStatusError as e:
            latency_ms = int((time.time() - req_start) * 1000)
            if e.response.status_code == 429:
                try:
                    err_json = e.response.json()
                    delay = err_json.get('error', {}).get('metadata', {}).get('retry_after_seconds', BASE_DELAY * (2 ** attempt))
                except Exception:
                    delay = BASE_DELAY * (2 ** attempt)
                if attempt == MAX_RETRIES - 1:
                    raise RateLimitError("Rate limited by OpenRouter")
                print(f"Rate limited by openrouter, sleeping for {delay} seconds")
                await asyncio.sleep(float(delay) + 1.0)
                last_error = e
                continue
            print(f"Log: openrouter {MODEL_NAME} {e.response.status_code} {e.response.headers.get('x-request-id', 'unknown')} {latency_ms}")
            last_error = e
            break
        except Exception as e:
            last_error = e
            break
            
    raise last_error or Exception("Qwen API call failed after retries")


async def analyze_vulnerability(code: str, vuln_type: str, filepath: str) -> tuple[dict, dict]:
    if not DEMO_MODE and not OPENROUTER_API_KEY:
        raise Exception("LIVE MODE but NO KEY")
    if DEMO_MODE:
        await asyncio.sleep(0.5)
        return {"description": f"The file {filepath} contains a {vuln_type} vulnerability.", "impact": "Impact", "severity": "high", "confidence": "95"}, _make_metadata("fallback", 500, "demo")
        
    prompt = f"""Act as a senior application security engineer.
Explain:
1. Vulnerability
2. Impact
3. Exploit scenario
4. Severity
5. Recommended remediation

Vulnerability Type: {vuln_type}
File: {filepath}
Code:
{code}

Return ONLY valid JSON with keys: description (string), impact (string), severity (string), confidence (integer between 0 and 100).
"""

    try:
        return await _call_qwen(prompt)
    except Exception as e:
        if not DEMO_MODE: raise
        return {"description": "AI analysis failed.", "impact": "Unknown", "severity": "high", "confidence": "50"}, _make_metadata("fallback", 0, str(e))
