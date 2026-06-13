"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/severity-badge";
import { SecurityGauge } from "@/components/security-gauge";
import { CodeDiffViewer } from "@/components/code-diff-viewer";
import {
  CheckCircle,
  Shield,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Zap,
  Brain,
} from "lucide-react";

function FixesPageContent() {
  const searchParams = useSearchParams();
  const [scanId, setScanId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlScanId = searchParams.get("scan_id");
    if (urlScanId) {
      setScanId(urlScanId);
    } else {
      const stored = localStorage.getItem("latest_scan_id");
      if (stored) {
        setScanId(stored);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/fixes/${scanId}`)
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to fetch data");
        }
        return res.json();
      })
      .then(data => {
        // API returns an array of fix objects directly
        const fixes = Array.isArray(data) ? data : [];
        setVulnerabilities(fixes);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error:", err);
        if (err.message.includes("rate-limited") || err.message.includes("RATE_LIMITED")) {
           setError("The free model is currently rate-limited. Please try again later.");
        } else {
           setError(err.message || "Scan Failed");
        }
        setLoading(false);
      });
  }, [scanId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading fixes...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
  if (!vulnerabilities || vulnerabilities.length === 0) return (
    <div className="p-8 text-center text-muted-foreground">
      <p className="text-lg font-medium mb-2">No fixes available</p>
      <p className="text-sm">AI-generated fixes were unavailable due to provider rate limits. Static analysis vulnerabilities were detected — check the Investigation page.</p>
    </div>
  );

  const vuln = vulnerabilities[activeIndex];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg gradient-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Generated Fixes</h1>
            <p className="text-sm text-muted-foreground">
              AI-generated secure patches for all {vulnerabilities.length} vulnerabilities
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="glass glow-purple">
          <div className="flex items-center divide-x divide-purple-500/10">
            {vulnerabilities.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => setActiveIndex(idx)}
                className={`flex-1 p-4 text-center transition-all duration-200 ${
                  idx === activeIndex
                    ? "bg-purple-500/10"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <SeverityBadge severity={v.severity} showDot={false} />
                </div>
                <p className={`text-xs font-medium truncate px-2 ${
                  idx === activeIndex ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {v.title.split(" ").slice(0, 3).join(" ")}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {v.file}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Fix Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SeverityBadge severity={vuln.severity} />
          <h2 className="text-lg font-semibold">{vuln.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500/20 h-8"
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground px-2 font-mono">
            {activeIndex + 1} / {vulnerabilities.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500/20 h-8"
            onClick={() => setActiveIndex(Math.min(vulnerabilities.length - 1, activeIndex + 1))}
            disabled={activeIndex === vulnerabilities.length - 1}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Vulnerability", value: vuln.title.split(" ").slice(0, 2).join(" "), color: "text-red-400" },
          { label: "Severity", value: vuln.severity.toUpperCase(), color: vuln.severity === "critical" ? "text-red-400" : vuln.severity === "high" ? "text-orange-400" : "text-yellow-400" },
          { label: "Affected File", value: vuln.file, color: "text-purple-300" },
          { label: "Confidence", value: `${vuln.confidence}%`, color: "text-emerald-400" },
          { label: "Risk Reduction", value: `${vuln.riskReduction}%`, color: "text-cyan-400" },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass p-3 border border-purple-500/10">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">{card.label}</p>
              <p className={`text-xs font-semibold mt-1 truncate ${card.color}`}>{card.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Code Diff Viewer */}
      <motion.div
        key={vuln.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CodeDiffViewer
          vulnerableCode={vuln.vulnerableCode}
          fixedCode={vuln.fixedCode}
        />
      </motion.div>

      {/* Bottom: Explanation + Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Explanation — 2/3 */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass glow-purple p-6 h-full">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Why This Fix Works
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {vuln.fixExplanation}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-500/10">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                    OWASP Category
                  </span>
                </div>
                <p className="text-xs font-mono text-purple-300">{vuln.owasp}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                    CWE Reference
                  </span>
                </div>
                <p className="text-xs font-mono text-cyan-300">{vuln.cwe}</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                  Security Principle Applied
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {vuln.severity === "critical" && vuln.cwe === "CWE-89"
                  ? "Defense in Depth — Parameterized queries provide primary defense, while input validation and least-privilege database accounts provide secondary barriers."
                  : vuln.severity === "critical"
                  ? "Secrets Management — Separating secrets from code ensures credentials cannot be extracted from version control or build artifacts."
                  : vuln.cwe === "CWE-79"
                  ? "Input Sanitization — All user-generated content must be sanitized before rendering, using allowlists rather than blocklists."
                  : vuln.cwe === "CWE-862"
                  ? "Least Privilege — Every endpoint must explicitly verify the caller has the minimum necessary permissions for the requested action."
                  : "Strong Cryptography — Password storage must use memory-hard algorithms designed specifically to resist GPU-accelerated brute force attacks."}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Impact Analysis — 1/3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="glass glow-purple p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              Impact Analysis
            </h3>

            {/* Score improvement */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">42</p>
                <p className="text-[10px] text-muted-foreground">Before</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">91</p>
                <p className="text-[10px] text-muted-foreground">After</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Risk Reduction</span>
                  <span className="text-emerald-400 font-semibold">{vuln.riskReduction}%</span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    key={`risk-${vuln.id}`}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${vuln.riskReduction}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs py-2 border-t border-purple-500/10">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-1 text-red-400">
                  {vuln.severity === "critical" ? "Critical" : "High"} → <span className="text-emerald-400">Resolved</span>
                </span>
              </div>

              <div className="flex justify-between text-xs py-2 border-t border-purple-500/10">
                <span className="text-muted-foreground">Threat Reduction</span>
                <span className="text-emerald-400 font-semibold">{vuln.confidence}%</span>
              </div>
            </div>
          </Card>

          <Card className="glass glow-purple p-4 flex items-center justify-center">
            <SecurityGauge score={vuln.riskReduction} size={120} label="Fix Effectiveness" />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


export default function FixesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FixesPageContent />
    </Suspense>
  );
}
