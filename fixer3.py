import os
import re

files_to_fix = [
    'frontend/src/app/(app)/investigation/page.tsx',
    'frontend/src/app/(app)/fixes/page.tsx',
    'frontend/src/app/(app)/scan-complete/page.tsx',
    'frontend/src/app/(app)/report/page.tsx',
    'frontend/src/app/(app)/repository/page.tsx'
]

error_render = """  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-200 mb-2">Scan Error</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }
"""

for f in files_to_fix:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Add error state
    if 'const [error, setError]' not in content:
        content = content.replace('const [data, setData] = useState<any>(null);', 'const [data, setData] = useState<any>(null);\n  const [error, setError] = useState<string | null>(null);')
        
    # 2. Update fetch logic
    # Look for the .then(res => { if (!res.ok) throw new Error... })
    fetch_pattern = re.compile(r'\.then\(res => \{\s*if \(!res\.ok\) throw new Error\("[^"]+"\);\s*return res\.json\(\);\s*\}\)')
    new_fetch = """.then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to fetch data");
        }
        return res.json();
      })"""
    content = fetch_pattern.sub(new_fetch, content)
    
    # Update the .catch
    catch_pattern = re.compile(r'\.catch\(\(err\) => console\.log\("[^"]+"\)\);')
    new_catch = """.catch((err) => {
        console.log("Error:", err);
        if (err.message.includes("rate-limited") || err.message.includes("RATE_LIMITED")) {
           setError("The free model is currently rate-limited. Please try again later.");
        } else {
           setError(err.message || "Scan Failed");
        }
      });"""
    content = catch_pattern.sub(new_catch, content)
    
    # 3. Add error render logic before the loading check
    # E.g. before `if (!data) return` or `if (!data || !data.timeline) return`
    if 'if (error) {' not in content:
        render_insert = re.compile(r'(if \(!data[^\n]*\n)')
        content = render_insert.sub(error_render + r'\1', content, count=1)
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Frontend pages updated.")
