import os
import json

backend_dir = r"c:\Users\athar\OneDrive\Desktop\Agent Recovery\agent-Recovery\backend"
scan_py = os.path.join(backend_dir, "api", "scan.py")

with open(scan_py, "r") as f:
    content = f.read()

# Replace the loop in scan.py
start_marker = "vulns_data = []"
end_marker = "update_status(scan_id, \"RUNNING\", 90, \"Patches Generated\""

before = content.split(start_marker)[0]
after = "        update_status(scan_id, \"RUNNING\", 90, \"Patches Generated\"" + content.split(end_marker)[1]

new_middle = """vulns_data = []
        fixes_data = []
        timeline = [
            {"title": "Repository Loaded", "status": "completed", "duration": "0.5s", "confidence": "100%"},
            {"title": "Repository Structure Analyzed", "status": "completed", "duration": "1.2s", "confidence": "100%"},
            {"title": "Potential Vulnerabilities Found", "status": "completed", "duration": "2.4s", "confidence": "100%"}
        ]
        
        # Immediate persistence of static findings
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            for v in raw_vulns:
                v_id = f"vuln_{uuid.uuid4().hex[:8]}"
                f_id = f"fix_{uuid.uuid4().hex[:8]}"
                v['id'] = v_id
                v['fix_id'] = f_id
                
                cursor.execute(\"\"\"
                    INSERT INTO vulnerabilities (id, scan_id, type, severity, file_path, line_number, description, impact, confidence)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                \"\"\", (v_id, scan_id, v['type'], v['severity'], v['file_path'], v['line_number'], v['description'], v['impact'], 90))
                
                cursor.execute(\"\"\"
                    INSERT INTO fixes (id, vulnerability_id, before_code, after_code, explanation, owasp, cwe)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                \"\"\", (f_id, v_id, v['matched_code'], "", "AI analysis pending...", v['owasp'], v['cwe']))
                
                vulns_data.append({
                    **v,
                    'ai_metadata': {'source': 'static', 'note': 'Static detection rule matched.'}
                })
                fixes_data.append({
                    'id': f_id,
                    'vulnerability_id': v_id,
                    'severity': v['severity'],
                    'title': v['type'],
                    'file': v['file_path'],
                    'before': v['matched_code'],
                    'after': '',
                    'why': 'AI analysis pending...',
                    'fix_available': False,
                    'ai_metadata': {'source': 'static', 'note': 'AI fix pending...'}
                })
            conn.commit()
        finally:
            conn.close()

        ai_available = True
        
        # Phase 5: AI Explanation and Fix Gen
        for idx, v in enumerate(raw_vulns):
            if not ai_available:
                break
                
            if idx > 0:
                await asyncio.sleep(1.0)
            
            try:
                # Explain
                ai_exp, exp_meta = await analyze_vulnerability(v['matched_code'], v['type'], v['file_path'])
                
                # Generate Fix
                ai_fix, fix_meta = await generate_fix(v['matched_code'], v['type'], v['file_path'])
                
                # Update DB
                conn = get_db_connection()
                try:
                    cursor = conn.cursor()
                    cursor.execute(\"\"\"
                        UPDATE vulnerabilities SET severity=?, description=?, impact=?, confidence=? WHERE id=?
                    \"\"\", (ai_exp.get('severity', v['severity']), ai_exp.get('description', v['description']), ai_exp.get('impact', v['impact']), parse_confidence(ai_exp.get('confidence', 90)), v['id']))
                    
                    cursor.execute(\"\"\"
                        UPDATE fixes SET after_code=?, explanation=?, owasp=?, cwe=? WHERE id=?
                    \"\"\", (ai_fix.get('after', ''), ai_fix.get('why', ''), ai_fix.get('owasp', v['owasp']), ai_fix.get('cwe', v['cwe']), v['fix_id']))
                    conn.commit()
                finally:
                    conn.close()
                
                # Update cache payloads
                v_payload = next(x for x in vulns_data if x['id'] == v['id'])
                v_payload['severity'] = ai_exp.get('severity', v['severity'])
                v_payload['description'] = ai_exp.get('description', v['description'])
                v_payload['impact'] = ai_exp.get('impact', v['impact'])
                v_payload['confidence'] = parse_confidence(ai_exp.get('confidence', 90))
                v_payload['ai_metadata'] = exp_meta
                
                f_payload = next(x for x in fixes_data if x['id'] == v['fix_id'])
                f_payload['after'] = ai_fix.get('after', '')
                f_payload['why'] = ai_fix.get('why', '')
                f_payload['fix_available'] = True
                f_payload['ai_metadata'] = fix_meta
                
                timeline.append({
                    "title": f"Verified {v['type']}",
                    "status": "completed",
                    "duration": "1.5s",
                    "confidence": str(ai_exp.get('confidence', 90)) + "%",
                    "reasoning": f"Confirmed vulnerability in {v['file_path']} via AI AST reasoning.",
                    "evidence": v['matched_code']
                })
            except RateLimitError:
                ai_available = False
                # Mark remaining items in cache as degraded
                for remaining_f in fixes_data:
                    if not remaining_f.get('fix_available'):
                        remaining_f['reason'] = "Provider rate limited"
                        remaining_f['ai_metadata'] = {"source": "static", "note": "AI fix generation unavailable due to rate limit."}
                for remaining_v in vulns_data:
                    if remaining_v['ai_metadata']['note'] == 'Static detection rule matched.':
                        remaining_v['ai_metadata'] = {"source": "static", "note": "AI validation unavailable due to rate limit."}
                break

"""

content = before + new_middle + after

# Update final cache
content = content.replace(
    '''        final_cache = {
            "scan_id": scan_id,
            "scores": scores,
            "vulnerabilities": vulns_data,
            "fixes": fixes_data,
            "timeline": timeline
        }''',
    '''        final_cache = {
            "scan_id": scan_id,
            "scores": scores,
            "vulnerabilities": vulns_data,
            "fixes": fixes_data,
            "timeline": timeline,
            "ai_available": ai_available,
            "degraded_mode": not ai_available
        }'''
)

# Remove the except RateLimitError catch block
content = content.replace(
    '''    except RateLimitError as rle:
        update_status(scan_id, "RATE_LIMITED", 0, "Scan incomplete", {"current_focus": "Rate Limit Reached", "current_hypothesis": "The provider is rate-limiting requests.", "evidence": ["Rate limit hit"], "confidence": "100", "next_action": "Retry later"})
    except Exception as e:''',
    '''    except Exception as e:'''
)

with open(scan_py, "w") as f:
    f.write(content)

print("Updated scan.py successfully.")

# Now update endpoints to return ai_available
endpoints = ["investigation.py", "fixes.py", "completion.py", "report.py", "repository.py"]
for ep in endpoints:
    p = os.path.join(backend_dir, "api", ep)
    with open(p, "r") as f:
        c = f.read()
    
    # Remove RATE_LIMITED checks
    c = c.replace(
        '''        if scan and scan['status'] in ["RATE_LIMITED", "FAILED"]:
            reason = "The free model is currently rate-limited. Please try again later." if scan['status'] == "RATE_LIMITED" else "Scan failed"
            return JSONResponse({"error": reason}, status_code=400)''',
        '''        if scan and scan['status'] == "FAILED":
            return JSONResponse({"error": "Scan failed"}, status_code=400)'''
    )
    
    if ep == "investigation.py":
        c = c.replace('return {"vulnerabilities": cache.get("vulnerabilities", [])}', 'return {"vulnerabilities": cache.get("vulnerabilities", []), "ai_available": cache.get("ai_available", True)}')
    elif ep == "fixes.py":
        c = c.replace('return cache.get("fixes", [])', 'return {"fixes": cache.get("fixes", []), "ai_available": cache.get("ai_available", True)}')
    elif ep == "completion.py":
        c = c.replace('return {', 'return {\n            "ai_available": cache.get("ai_available", True),')
    elif ep == "report.py":
        c = c.replace('return {', 'return {\n            "ai_available": cache.get("ai_available", True),')
    elif ep == "repository.py":
        c = c.replace('return {', 'return {\n            "ai_available": cache.get("ai_available", True),')
        
    with open(p, "w") as f:
        f.write(c)
        
print("Updated API endpoints successfully.")
