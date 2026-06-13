import os

frontend_dir = r"c:\Users\athar\OneDrive\Desktop\Agent Recovery\agent-Recovery\frontend\src\app\(app)"

# 1. Investigation Page
inv_path = os.path.join(frontend_dir, "investigation", "page.tsx")
with open(inv_path, "r", encoding="utf-8") as f:
    c = f.read()
if "{data.ai_available === false &&" not in c:
    c = c.replace(
        '<div className="max-w-7xl mx-auto space-y-6">',
        '''<div className="max-w-7xl mx-auto space-y-6">
      {data.ai_available === false && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Brain className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-200">Degraded Mode</h3>
            <p className="text-xs text-yellow-400/80">AI validation unavailable. Showing static analysis findings.</p>
          </div>
        </div>
      )}'''
    )
    with open(inv_path, "w", encoding="utf-8") as f:
        f.write(c)

# 2. Fixes Page
fixes_path = os.path.join(frontend_dir, "fixes", "page.tsx")
with open(fixes_path, "r", encoding="utf-8") as f:
    c = f.read()

# Fix the API response destructuring
if 'setVulnerabilities(Array.isArray(data) ? data : [])' in c:
    c = c.replace(
        'setVulnerabilities(Array.isArray(data) ? data : [])',
        'setVulnerabilities(data.fixes ? data.fixes : [])'
    )

if '!vuln.fix_available' not in c:
    c = c.replace(
        '<CodeDiffViewer before={vuln.before} after={vuln.after} />',
        '''{vuln.fix_available === false ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-yellow-500/20 rounded-xl bg-yellow-500/5 mt-4">
                  <Brain className="h-8 w-8 text-yellow-400 mb-3 opacity-50" />
                  <p className="text-yellow-200 font-medium mb-1">AI-generated fixes unavailable due to provider rate limits.</p>
                  <p className="text-sm text-yellow-400/60">Static findings are available, but code patches could not be generated.</p>
                </div>
              ) : (
                <CodeDiffViewer before={vuln.before} after={vuln.after} />
              )}'''
    )
    with open(fixes_path, "w", encoding="utf-8") as f:
        f.write(c)

# 3. Report Page
report_path = os.path.join(frontend_dir, "report", "page.tsx")
with open(report_path, "r", encoding="utf-8") as f:
    c = f.read()
if "{data.ai_available === false &&" not in c:
    c = c.replace(
        '<p className="text-sm text-muted-foreground mt-1">\n          Comprehensive security analysis',
        '''<p className="text-sm text-muted-foreground mt-1">
          Comprehensive security analysis
        </p>
        {data.ai_available === false && (
          <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Brain className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-200">AI analysis unavailable due to provider rate limits.</p>
              <p className="text-xs text-yellow-400/80">The report contains static detection findings only.</p>
            </div>
          </div>
        )}
        <p className="hidden">'''
    )
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(c)

# 4. Scan Complete Page
comp_path = os.path.join(frontend_dir, "scan-complete", "page.tsx")
with open(comp_path, "r", encoding="utf-8") as f:
    c = f.read()
if 'data.ai_available === false' not in c:
    c = c.replace(
        '<span className="text-sm font-medium">Active</span>',
        '''{data.ai_available === false ? (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-500/20 bg-yellow-500/10">UNAVAILABLE</Badge>
                      ) : (
                        <span className="text-sm font-medium">Active</span>
                      )}'''
    )
    with open(comp_path, "w", encoding="utf-8") as f:
        f.write(c)

print("Frontend pages updated.")
