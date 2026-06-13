import os, glob

def update_page(f):
    c = open(f).read()
    if 'AlertTriangle' not in c:
        # We need to insert AlertTriangle if not present, but it's simpler to just add error boundaries
        c = c.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { AlertTriangle } from "lucide-react";')
        
        # Replace the `if (loading)` logic in pages
        loading_logic = 'if (loading) {\n    return (\n      <div className="flex flex-col items-center justify-center min-h-[60vh]">\n        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />\n        <p className="text-slate-400">Loading...</p>\n      </div>\n    );\n  }'
        error_logic = 'if (error) {\n    return (\n      <div className="flex flex-col items-center justify-center min-h-[60vh]">\n        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center">\n          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />\n          <h2 className="text-xl font-bold text-slate-200 mb-2">Scan Failed</h2>\n          <p className="text-slate-400">{error}</p>\n        </div>\n      </div>\n    );\n  }\n  if (loading) {\n    return (\n      <div className="flex flex-col items-center justify-center min-h-[60vh]">\n        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />\n        <p className="text-slate-400">Loading...</p>\n      </div>\n    );\n  }'
        c = c.replace(loading_logic, error_logic)
        
        # In fetch loops:
        c = c.replace('if (!res.ok) throw new Error("Failed to load");', 'if (!res.ok) {\n          const errData = await res.json().catch(() => ({}));\n          throw new Error(errData.detail || "Failed to load");\n        }')
        c = c.replace('if (!res.ok) throw new Error("Failed to load data");', 'if (!res.ok) {\n          const errData = await res.json().catch(() => ({}));\n          throw new Error(errData.detail || "Failed to load data");\n        }')
        
        open(f, 'w').write(c)

for f in ['frontend/src/app/(app)/investigation/page.tsx', 'frontend/src/app/(app)/fixes/page.tsx', 'frontend/src/app/(app)/scan-complete/page.tsx', 'frontend/src/app/(app)/report/page.tsx']:
    update_page(f)

# Also update analysis page
f_analysis = 'frontend/src/app/(app)/analysis/page.tsx'
c = open(f_analysis).read()
if 'rate-limited' not in c:
    c = c.replace('if (data.status === "COMPLETED") {', 'if (data.status === "RATE_LIMITED" || data.status === "FAILED") {\n          setPhase("Rate Limit Reached" if data.status === "RATE_LIMITED" else "Analysis Failed");\n          setLoading(false);\n          if (data.status === "RATE_LIMITED") {\n            setHypothesis("The free model is currently rate-limited. Please try again later.");\n          } else {\n             setHypothesis("Scan encountered an error.");\n          }\n          return;\n        }\n        if (data.status === "COMPLETED") {')
    open(f_analysis, 'w').write(c)

# Fix Repository bugs (vulnerabilities ?? [])
p_repo = 'frontend/src/app/(app)/repository/page.tsx'
cr = open(p_repo).read()
cr = cr.replace('const severityColors: any = {', 'const vulns = node.vulnerabilities ?? [];\n  const severityColors: any = {')
cr = cr.replace('node.vulnerabilities.map((vuln: any, idx: number)', 'vulns.map((vuln: any, idx: number)')
cr = cr.replace('node.vulnerabilities.length > 0', 'vulns.length > 0')
open(p_repo, 'w').write(cr)
