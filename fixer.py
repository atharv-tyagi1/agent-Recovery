import os
def update_qwen():
    p = 'backend/services/qwen.py'
    c = open(p).read()
    c = c.replace('async def analyze_vulnerability(code: str, vuln_type: str, filepath: str) -> dict:', 'async def analyze_vulnerability(code: str, vuln_type: str, filepath: str) -> tuple[dict, dict]:\n    if not DEMO_MODE and not OPENROUTER_API_KEY:\n        raise Exception("LIVE MODE but NO KEY")')
    c = c.replace('if DEMO_MODE or not OPENROUTER_API_KEY:\n        await asyncio.sleep(0.5) # Simulate API latency\n        return {\n            "description": f"The file {filepath} contains a {vuln_type} vulnerability due to unsanitized input.",\n            "impact": "Attackers could exploit this to compromise the system or access unauthorized data.",\n            "severity": "high" if "Missing" in vuln_type else "critical",\n            "confidence": "95"\n        }', 'if DEMO_MODE:\n        await asyncio.sleep(0.5)\n        return {"description": f"The file {filepath} contains a {vuln_type} vulnerability.", "impact": "Impact", "severity": "high", "confidence": "95"}, _make_metadata("fallback", 500, "demo")')
    c = c.replace('    except Exception as e:\n        print(f"Qwen Analysis Error: {e}")\n        # Fallback\n        return {\n            "description": "AI analysis failed. Fallback description provided.",\n            "impact": "Unknown impact.",\n            "severity": "high",\n            "confidence": "50"\n        }', '    except Exception as e:\n        if not DEMO_MODE: raise\n        return {"description": "AI analysis failed.", "impact": "Unknown", "severity": "high", "confidence": "50"}, _make_metadata("fallback", 0, str(e))')
    open(p, 'w').write(c)

def update_fix_gen():
    p = 'backend/services/fix_generator.py'
    c = open(p).read()
    c = c.replace('from services.qwen import DEMO_MODE, OPENROUTER_API_KEY, _call_qwen', 'from services.qwen import DEMO_MODE, OPENROUTER_API_KEY, _call_qwen, _make_metadata')
    c = c.replace('async def generate_fix(code: str, vuln_type: str, filepath: str) -> dict:', 'async def generate_fix(code: str, vuln_type: str, filepath: str) -> tuple[dict, dict]:\n    if not DEMO_MODE and not OPENROUTER_API_KEY: raise Exception("LIVE MODE but NO KEY")')
    c = c.replace('if DEMO_MODE or not OPENROUTER_API_KEY:\n        await asyncio.sleep(0.5)\n        # Generate deterministic mock fix\n        fixed_code = code.replace("dangerouslySetInnerHTML", "className")\n        fixed_code = fixed_code.replace("f\'SELECT", "execute(\'SELECT")\n        \n        return {\n            "before": code,\n            "after": fixed_code if fixed_code != code else f"// FIXED: {code}",\n            "why": "The input is now properly parameterized/sanitized, preventing malicious injection.",\n            "owasp": "A03:2021-Injection",\n            "cwe": "CWE-89" if "SQL" in vuln_type else "CWE-79"\n        }', 'if DEMO_MODE:\n        await asyncio.sleep(0.5)\n        return {"before": code, "after": f"// FIXED: {code}", "why": "Fixed", "owasp": "A03:2021-Injection", "cwe": "CWE-79"}, _make_metadata("fallback", 500, "demo")')
    c = c.replace('    except Exception as e:\n        print(f"Fix Generation Error: {e}")\n        # Fallback\n        return {\n            "before": code,\n            "after": f"// Unable to generate fix.\\n{code}",\n            "why": "API Error.",\n            "owasp": "Unknown",\n            "cwe": "Unknown"\n        }', '    except Exception as e:\n        if not DEMO_MODE: raise\n        return {"before": code, "after": f"// Unable to generate fix.\\n{code}", "why": "API Error.", "owasp": "Unknown", "cwe": "Unknown"}, _make_metadata("fallback", 0, str(e))')
    open(p, 'w').write(c)

def update_scan():
    p = 'backend/api/scan.py'
    c = open(p).read()
    if 'RateLimitError' not in c:
        c = c.replace('except Exception as e:', 'except RateLimitError as rle:\n        update_status(scan_id, "RATE_LIMITED", 0, "Scan incomplete", {"current_focus": "Rate Limit Reached", "current_hypothesis": "The provider is rate-limiting requests.", "evidence": ["Rate limit hit"], "confidence": "100", "next_action": "Retry later"})\n    except Exception as e:')
    c = c.replace('    if scan[\'status\'] in ["RUNNING", "COMPLETED"]:\n        return {"message": "Scan already running or completed"}', '    if scan[\'status\'] == "RUNNING": raise HTTPException(status_code=400, detail="Scan is already running")\n    if scan[\'status\'] in ["COMPLETED", "FAILED", "RATE_LIMITED"]: raise HTTPException(status_code=400, detail="Scan has already been processed and is immutable. Please upload a new repository to start a fresh scan.")')
    c = c.replace('ai_exp = await analyze_vulnerability', 'ai_exp, exp_meta = await analyze_vulnerability')
    c = c.replace('ai_fix = await generate_fix', 'ai_fix, fix_meta = await generate_fix')
    c = c.replace("vuln_payload['confidence'] = parse_confidence(ai_exp.get('confidence', 90))", "vuln_payload['confidence'] = parse_confidence(ai_exp.get('confidence', 90))\n            vuln_payload['ai_metadata'] = exp_meta")
    c = c.replace("fix_payload['file'] = vuln_payload['file_path']", "fix_payload['file'] = vuln_payload['file_path']\n            fix_payload['ai_metadata'] = fix_meta")
    c = c.replace("from services.qwen import analyze_vulnerability", "from services.qwen import analyze_vulnerability, RateLimitError")
    open(p, 'w').write(c)

def update_others():
    for f in ['backend/api/investigation.py', 'backend/api/fixes.py', 'backend/api/completion.py']:
        c = open(f).read()
        if 'SELECT status' not in c:
            c = c.replace('    if not os.path.exists(cache_file):\n        raise HTTPException(status_code=404, detail="', '    if not os.path.exists(cache_file):\n        from database.db import get_db_connection\n        conn = get_db_connection()\n        cursor = conn.cursor()\n        cursor.execute("SELECT status FROM scans WHERE id = ?", (scan_id,))\n        scan = cursor.fetchone()\n        conn.close()\n        if scan and scan[\'status\'] in ["RATE_LIMITED", "FAILED"]:\n            reason = "The free model is currently rate-limited. Please try again later." if scan[\'status\'] == "RATE_LIMITED" else "Scan failed"\n            raise HTTPException(status_code=400, detail=reason)\n        raise HTTPException(status_code=404, detail="')
            open(f, 'w').write(c)

def update_repo():
    p = 'backend/api/repository.py'
    c = open(p).read()
    c = c.replace('def build_tree(base_path: str) -> list:', 'def build_tree(base_path: str, vulns=[]) -> list:')
    c = c.replace('        if not os.path.exists(cache_file):\n            # Return empty repo if scan results not ready\n            return {"repository": build_tree(extract_path)}\n', '        vulns = []\n        if os.path.exists(cache_file):\n            import json\n            with open(cache_file, \'r\') as f:\n                vulns = json.load(f).get(\'vulnerabilities\', [])\n')
    c = c.replace('        return {"repository": build_tree(extract_path)}\n', '        return {"repository": build_tree(extract_path, vulns)}\n')
    open(p, 'w').write(c)

try: update_qwen()
except Exception as e: print("Qwen fail", e)
try: update_fix_gen()
except Exception as e: print("Fix fail", e)
try: update_scan()
except Exception as e: print("Scan fail", e)
try: update_others()
except Exception as e: print("Others fail", e)
try: update_repo()
except Exception as e: print("Repo fail", e)
