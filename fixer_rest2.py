import os
import json

backend_dir = r'c:\Users\athar\OneDrive\Desktop\Agent Recovery\agent-Recovery\backend'
for ep in ['reports.py', 'repository.py']:
    p = os.path.join(backend_dir, 'api', ep)
    with open(p, 'r') as f:
        c = f.read()

    # We need to add reading the cache file
    if 'import json' not in c:
        c = "import json\n" + c
    if 'from api.scan import SCANS_DIR' not in c:
        c = "from api.scan import SCANS_DIR\n" + c
        
    read_cache_code = '''
    cache_file = os.path.join(SCANS_DIR, f"{scan_id}.json")
    ai_available = True
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            cdata = json.load(f)
            ai_available = cdata.get("ai_available", True)
'''
    if 'cache_file = os.path.join(SCANS_DIR' not in c:
        # insert right before return
        c = c.replace('    return {\n            "ai_available": cache.get("ai_available", True),', read_cache_code + '    return {\n            "ai_available": ai_available,')
        
    with open(p, 'w') as f:
        f.write(c)

print("fixed endpoints")
