import os
import json
import uuid
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

MAX_RETRIES = 1
BASE_DELAY = 1.0  # seconds

async def _call_qwen(prompt: str) -> dict:
    """Call Qwen API via OpenRouter with retry + exponential backoff."""
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
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
                        "model": "qwen/qwen-3-coder-480b-a35b",
                        "messages": [{"role": "user", "content": prompt}],
                        "response_format": {"type": "json_object"}
                    }
                )
                if response.status_code == 429:
                    delay = BASE_DELAY * (2 ** attempt)
                    print(f"Gemini 429 rate limit (attempt {attempt+1}/{MAX_RETRIES}). Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                    continue
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                delay = BASE_DELAY * (2 ** attempt)
                print(f"Gemini 429 rate limit (attempt {attempt+1}/{MAX_RETRIES}). Retrying in {delay}s...")
                await asyncio.sleep(delay)
                last_error = e
                continue
            last_error = e
            break
        except Exception as e:
            last_error = e
            break
    raise last_error or Exception("Gemini API call failed after retries")


async def analyze_vulnerability(code: str, vuln_type: str, filepath: str) -> dict:
    if DEMO_MODE or not OPENROUTER_API_KEY:
        await asyncio.sleep(0.5) # Simulate API latency
        return {
            "description": f"The file {filepath} contains a {vuln_type} vulnerability due to unsanitized input.",
            "impact": "Attackers could exploit this to compromise the system or access unauthorized data.",
            "severity": "high" if "Missing" in vuln_type else "critical",
            "confidence": "95"
        }
        
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
        print(f"Qwen Analysis Error: {e}")
        # Fallback
        return {
            "description": "AI analysis failed. Fallback description provided.",
            "impact": "Unknown impact.",
            "severity": "high",
            "confidence": "50"
        }
