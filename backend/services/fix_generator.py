import os
import json
import asyncio
import httpx
from services.qwen import DEMO_MODE, OPENROUTER_API_KEY, _call_qwen

async def generate_fix(code: str, vuln_type: str, filepath: str) -> dict:
    if DEMO_MODE or not OPENROUTER_API_KEY:
        await asyncio.sleep(0.5)
        # Generate deterministic mock fix
        fixed_code = code.replace("dangerouslySetInnerHTML", "className")
        fixed_code = fixed_code.replace("f'SELECT", "execute('SELECT")
        
        return {
            "before": code,
            "after": fixed_code if fixed_code != code else f"// FIXED: {code}",
            "why": "The input is now properly parameterized/sanitized, preventing malicious injection.",
            "owasp": "A03:2021-Injection",
            "cwe": "CWE-89" if "SQL" in vuln_type else "CWE-79"
        }

    prompt = f"""You are a senior security engineer.
Generate a secure production-ready fix for the following vulnerability.

Vulnerability Type: {vuln_type}
File: {filepath}
Code:
{code}

Return ONLY valid JSON with keys:
- "before": original code snippet
- "after": fixed code snippet
- "why": brief explanation of why the fix works
- "owasp": OWASP category
- "cwe": CWE reference
"""

    try:
        return await _call_qwen(prompt)
    except Exception as e:
        print(f"Qwen Fix Generation Error: {e}")
        return {
            "before": code,
            "after": f"// Unable to reach AI API to generate fix.\n{code}",
            "why": "API Error.",
            "owasp": "Unknown",
            "cwe": "Unknown"
        }
