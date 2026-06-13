import os
import glob

pages_dir = r"c:\Users\athar\OneDrive\Desktop\Agent Recovery\agent-Recovery\frontend\src\app\(app)"
pages = glob.glob(os.path.join(pages_dir, "*", "page.tsx"))

for p in pages:
    with open(p, "r", encoding="utf-8") as f:
        c = f.read()
    
    if "import React, { Suspense }, {" in c:
        c = c.replace("import React, { Suspense }, {", "import React, { Suspense,")
        with open(p, "w", encoding="utf-8") as f:
            f.write(c)

print("Syntax fixed")
