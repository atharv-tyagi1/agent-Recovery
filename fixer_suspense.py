import os
import glob

pages_dir = r"c:\Users\athar\OneDrive\Desktop\Agent Recovery\agent-Recovery\frontend\src\app\(app)"
pages = glob.glob(os.path.join(pages_dir, "*", "page.tsx"))

for p in pages:
    with open(p, "r", encoding="utf-8") as f:
        c = f.read()
    
    if "Suspense" not in c and "export default function " in c:
        # We need to import Suspense from react if not already imported
        if "import React" in c and "Suspense" not in c:
            c = c.replace("import React", "import React, { Suspense }")
        
        # Rename default export
        import re
        match = re.search(r"export default function ([A-Za-z0-9_]+)\(\) {", c)
        if match:
            comp_name = match.group(1)
            inner_name = comp_name + "Content"
            c = c.replace(f"export default function {comp_name}() {{", f"function {inner_name}() {{")
            
            c += f"\n\nexport default function {comp_name}() {{\n  return (\n    <Suspense fallback={{<div>Loading...</div>}}>\n      <{inner_name} />\n    </Suspense>\n  );\n}}\n"
            
            with open(p, "w", encoding="utf-8") as f:
                f.write(c)

print("Suspense fixed")
