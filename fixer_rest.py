import os

backend_dir = r'c:\Users\athar\OneDrive\Desktop\Agent Recovery\agent-Recovery\backend'
for ep in ['reports.py', 'repository.py']:
    p = os.path.join(backend_dir, 'api', ep)
    with open(p, 'r') as f:
        c = f.read()
    
    c = c.replace(
        '        if scan and scan[\'status\'] in ["RATE_LIMITED", "FAILED"]:\n            reason = "The free model is currently rate-limited. Please try again later." if scan[\'status\'] == "RATE_LIMITED" else "Scan failed"\n            return JSONResponse({"error": reason}, status_code=400)',
        '        if scan and scan[\'status\'] == "FAILED":\n            return JSONResponse({"error": "Scan failed"}, status_code=400)'
    )
    
    if ep == 'reports.py':
        c = c.replace('return {', 'return {\n            "ai_available": cache.get("ai_available", True),')
    elif ep == 'repository.py':
        c = c.replace('return {', 'return {\n            "ai_available": cache.get("ai_available", True),')
        
    with open(p, 'w') as f:
        f.write(c)
print("done")
