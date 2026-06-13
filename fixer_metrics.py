import os

comp_path = r"c:\Users\athar\OneDrive\Desktop\Agent Recovery\agent-Recovery\frontend\src\app\(app)\scan-complete\page.tsx"
with open(comp_path, "r", encoding="utf-8") as f:
    c = f.read()

replacement = '''  const metrics = data.ai_available === false ? [
    {
      label: "Files Analyzed",
      value: data.files_analyzed,
      icon: FileCode,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/10",
    },
    {
      label: "Static Findings",
      value: data.threats_found,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/10",
    },
    {
      label: "AI Findings",
      value: "0",
      icon: Brain,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/10",
    },
    {
      label: "AI Available",
      value: "No",
      icon: Shield,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/10",
    },
  ] : [
    {
      label: "Files Analyzed",
      value: data.files_analyzed,
      icon: FileCode,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/10",
    },
    {
      label: "Threats Found",
      value: data.threats_found,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/10",
    },
    {
      label: "Fixes Generated",
      value: data.fixes_generated,
      icon: Wrench,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/10",
    },
    {
      label: "Security Score",
      value: data.score_after,
      icon: Shield,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/10",
      suffix: "/100",
    },
  ];'''

original = '''  const metrics = [
    {
      label: "Files Analyzed",
      value: data.files_analyzed,
      icon: FileCode,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/10",
    },
    {
      label: "Threats Found",
      value: data.threats_found,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/10",
    },
    {
      label: "Fixes Generated",
      value: data.fixes_generated,
      icon: Wrench,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/10",
    },
    {
      label: "Security Score",
      value: data.score_after,
      icon: Shield,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/10",
      suffix: "/100",
    },
  ];'''

if original in c:
    c = c.replace(original, replacement)
    
# also replace Brain import if needed
if 'Brain' not in c:
    c = c.replace('import {\n  CheckCircle', 'import {\n  Brain,\n  CheckCircle')
    
with open(comp_path, "w", encoding="utf-8") as f:
    f.write(c)

print("done metric update")
