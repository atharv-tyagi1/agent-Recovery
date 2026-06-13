import os
import json
import asyncio
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-2.5-flash-lite"
MAX_RETRIES = 2
BASE_DELAY = 1.0  # seconds


class RateLimitError(Exception):
    def __init__(self, message, retry_after_seconds=None):
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds


def _sanitize_json_content(content: str) -> str:
    """Strip markdown code fences from model output."""
    content = content.strip()
    if content.startswith("```"):
        # Remove first and last fence lines
        lines = content.splitlines()
        # Drop opening fence
        lines = lines[1:]
        # Drop closing fence if present
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        content = "\n".join(lines).strip()
    return content


def _make_metadata(source: str, latency_ms: int = 0, request_id: str = "unknown", **kwargs) -> dict:
    return {"source": source, "latency_ms": latency_ms, "request_id": request_id, **kwargs}


async def _call_gemini(prompt: str) -> tuple[dict, dict]:
    """Call Gemini API with bounded retry on quota errors."""
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY is not set")

    client = genai.Client(api_key=GEMINI_API_KEY)
    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            req_start = time.time()
            
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                    max_output_tokens=2048,
                ),
            )

            latency_ms = int((time.time() - req_start) * 1000)
            content = response.text
            request_id = getattr(response, "response_id", f"gemini-{int(time.time())}")

            print(f"Log: gemini {MODEL_NAME} 200 {request_id} {latency_ms}ms")

            sanitized = _sanitize_json_content(content)
            result = json.loads(sanitized)

            metadata = _make_metadata("live_model", latency_ms=latency_ms, request_id=request_id)
            return result, metadata

        except Exception as e:
            err_str = str(e).lower()
            latency_ms = int((time.time() - req_start) * 1000) if 'req_start' in dir() else 0

            # Handle quota / rate limit errors
            if "quota" in err_str or "429" in err_str or "resource_exhausted" in err_str:
                delay = BASE_DELAY * (2 ** attempt)
                if attempt == MAX_RETRIES - 1:
                    raise RateLimitError(f"Gemini rate limited: {e}", retry_after_seconds=delay)
                print(f"[Gemini] Rate limited attempt {attempt+1}, sleeping {delay}s")
                await asyncio.sleep(delay)
                last_error = e
                continue

            print(f"[Gemini] Error on attempt {attempt+1}: {e}")
            last_error = e
            break

    raise last_error or Exception("Gemini API call failed after retries")


async def analyze_vulnerability(code: str, vuln_type: str, filepath: str) -> tuple[dict, dict]:
    if not DEMO_MODE and not GEMINI_API_KEY:
        raise Exception("LIVE MODE but GEMINI_API_KEY is not set")
    if DEMO_MODE:
        await asyncio.sleep(0.3)
        return (
            {
                "description": f"The file {filepath} contains a {vuln_type} vulnerability.",
                "impact": "Attackers may exploit this to gain unauthorized access or execute malicious code.",
                "severity": "high",
                "confidence": "90",
            },
            _make_metadata("fallback", 300, "demo"),
        )

    prompt = f"""You are a senior application security engineer.
Analyze the following vulnerability and provide a detailed assessment.

Vulnerability Type: {vuln_type}
File: {filepath}
Code:
{code}

Return ONLY valid JSON (no markdown fences) with these exact keys:
- "description": string explaining the vulnerability
- "impact": string describing the business and security impact
- "severity": one of "critical", "high", "medium", "low"
- "confidence": integer from 0 to 100
"""

    try:
        return await _call_gemini(prompt)
    except RateLimitError:
        raise
    except Exception as e:
        if not DEMO_MODE:
            raise
        return (
            {"description": "AI analysis failed.", "impact": "Unknown", "severity": "high", "confidence": "50"},
            _make_metadata("fallback", 0, str(e)),
        )
