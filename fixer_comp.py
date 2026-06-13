import os

backend_dir = r'c:\Users\athar\OneDrive\Desktop\Agent Recovery\agent-Recovery\backend'
comp_path = os.path.join(backend_dir, 'api', 'completion.py')

with open(comp_path, "r") as f:
    c = f.read()

if 'cache.get' in c:
    c = c.replace('cache.get("ai_available", True)', 'data.get("ai_available", True)')
    with open(comp_path, "w") as f:
        f.write(c)

print("done")
