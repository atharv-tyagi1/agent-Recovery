import os
import json
import asyncio
from services.gemini import DEMO_MODE, GEMINI_API_KEY, _call_gemini, _make_metadata


async def generate_fix(code: str, vuln_type: str, filepath: str) -> tuple[dict, dict]:
    """Generate an AI-powered secure fix. Returns (fix_result, metadata)."""
    if not DEMO_MODE and not GEMINI_API_KEY:
        raise Exception(
            "LIVE MODE is enabled (DEMO_MODE=false) but GEMINI_API_KEY is not set. "
            "Refusing to fallback silently."
        )

    if DEMO_MODE:
        print(f"[Gemini] FALLBACK mode=fallback reason=DEMO_MODE function=generate_fix file={filepath}")
        await asyncio.sleep(0.3)
        # Generate a simple deterministic mock fix
        fixed_code = code.replace("dangerouslySetInnerHTML", "className")
        fixed_code = fixed_code.replace("f'SELECT", "execute('SELECT")
        result = {
            "before": code,
            "after": fixed_code if fixed_code != code else f"# FIXED: {code}",
            "why": "The input is now properly parameterized/sanitized, preventing malicious injection.",
            "owasp": "A03:2021-Injection",
            "cwe": "CWE-89" if "SQL" in vuln_type else "CWE-79",
        }
        metadata = _make_metadata("fallback", latency_ms=300, request_id="demo", error_reason="DEMO_MODE")
        return result, metadata

    prompt = f"""You are a senior security engineer.
Generate a secure, production-ready fix for the following vulnerability.

Vulnerability Type: {vuln_type}
File: {filepath}
Vulnerable Code:
{code}

Return ONLY valid JSON (no markdown fences) with these exact keys:
- "before": the original vulnerable code snippet (string)
- "after": the fixed secure code snippet (string)
- "why": a brief explanation of why the fix works (string)
- "owasp": the OWASP category (e.g. "A03:2021-Injection")
- "cwe": the CWE reference (e.g. "CWE-89")
"""

    try:
        return await _call_gemini(prompt)
    except Exception as e:
        if not DEMO_MODE:
            raise  # Never silently fall back in live mode
        print(f"[Gemini] FIX_GEN_FAILED error={e} file={filepath}. Using fallback.")
        result = {
            "before": code,
            "after": f"# Unable to reach Gemini API to generate fix.\n{code}",
            "why": "API Error — fix could not be generated.",
            "owasp": "Unknown",
            "cwe": "Unknown",
        }
        metadata = _make_metadata("fallback", latency_ms=0, request_id="error", error_reason=str(e))
        return result, metadata
