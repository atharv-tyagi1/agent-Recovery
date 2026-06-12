import os
import json
import uuid
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

MAX_RETRIES = 1
BASE_DELAY = 1.0  # seconds

async def _call_gemini(prompt: str) -> dict:
    """Call Gemini API with retry + exponential backoff for 429 rate limits."""
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GEMINI_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gemini-2.5-flash",
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
    if DEMO_MODE or not GEMINI_API_KEY:
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
        return await _call_gemini(prompt)
    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        # Fallback
        return {
            "description": "AI analysis failed. Fallback description provided.",
            "impact": "Unknown impact.",
            "severity": "high",
            "confidence": "50"
        }
