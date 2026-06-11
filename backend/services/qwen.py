import os
import json
import uuid
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

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

Return ONLY valid JSON with keys: description, impact, severity, confidence.
"""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "http://localhost:3000",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "qwen/qwen-3-480b-instruct",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                }
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)
    except Exception as e:
        print(f"OpenRouter Error: {e}")
        # Fallback
        return {
            "description": "AI analysis failed. Fallback description provided.",
            "impact": "Unknown impact.",
            "severity": "high",
            "confidence": "50"
        }
