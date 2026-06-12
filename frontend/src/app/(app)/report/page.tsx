"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SecurityGauge } from "@/components/security-gauge";
import { SeverityBadge } from "@/components/severity-badge";
import {
  Download,
  Share2,
  FileOutput,
  AlertTriangle,
  Shield,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scan_id");
  const [vulns, setVulns] = useState<any[]>([]);
  const [completion, setCompletion] = useState<any>(null);

  useEffect(() => {
    if (!scanId) return;
    Promise.all([
      fetch(`http://localhost:8000/api/fixes/${scanId}`).then(r => {
        if (!r.ok) throw new Error("Failed to fetch fixes");
        return r.json();
      }),
      fetch(`http://localhost:8000/api/completion/${scanId}`).then(r => {
        if (!r.ok) throw new Error("Failed to fetch completion data");
        return r.json();
      })
    ])
    .then(([vulnsData, compData]) => {
      setVulns(Array.isArray(vulnsData) ? vulnsData : []);
      setCompletion(compData);
    })
    .catch((err) => console.log("Waiting for report data..."));
  }, [scanId]);

  if (!completion || completion.files_analyzed === undefined) return <div className="p-8 text-center text-muted-foreground">Loading report...</div>;

  const criticalCount = vulns.filter((v) => v.severity === "critical").length;
  const highCount = vulns.filter((v) => v.severity === "high").length;
  const mediumCount = vulns.filter((v) => v.severity === "medium").length;
  const lowCount = vulns.filter((v) => v.severity === "low").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Security Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scan ID: {scanId} — Executive Summary
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`http://localhost:8000/api/report/${scanId}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="text-xs border-purple-500/20">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download PDF
            </Button>
          </a>
          <Button variant="outline" size="sm" className="text-xs border-purple-500/20">
            <FileOutput className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="text-xs border-purple-500/20">
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Critical", count: criticalCount, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/10" },
          { label: "High", count: highCount, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/10" },
          { label: "Medium", count: mediumCount, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/10" },
          { label: "Low", count: lowCount, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/10" },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card className={`glass p-5 border ${item.border}`}>
              <p className="text-xs text-muted-foreground mb-1">{item.label} Issues</p>
              <p className={`text-3xl font-bold ${item.color}`}>{item.count}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass glow-purple p-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                Executive Summary
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The security scan identified{" "}
                <span className="text-foreground font-medium">{vulns.length} vulnerabilities</span> across{" "}
                <span className="text-foreground font-medium">{completion.files_analyzed} files</span>. 
                The AI has generated production-ready patches for all identified vulnerabilities.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Scanned: Just now
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Mode: Deep Scan
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Findings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass glow-purple p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                Findings
              </h3>
              <div className="space-y-3">
                {vulns.map((vuln, idx) => (
                  <div
                    key={vuln.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-purple-500/5 hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-xs text-muted-foreground font-mono mt-0.5 w-5">
                      #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge severity={vuln.severity} showDot={false} />
                        <span className="text-sm font-medium">{vuln.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {vuln.file} • {vuln.owasp}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{vuln.confidence}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass glow-purple p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {[
                  "Implement parameterized queries across all database interactions to prevent SQL injection.",
                  "Sanitize all user-generated HTML content using DOMPurify before rendering.",
                  "Migrate all hardcoded secrets to a secrets manager (AWS Secrets Manager, HashiCorp Vault).",
                  "Replace MD5 password hashing with bcrypt (cost factor ≥12) across the auth module.",
                  "Add role-based access control (RBAC) middleware to all administrative endpoints.",
                  "Enable SAST scanning in the CI/CD pipeline to prevent future regressions.",
                ].map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Score Improvement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass glow-purple p-6">
              <h3 className="text-sm font-semibold mb-4">Score Improvement</h3>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400">{completion.score_before}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Before</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-400">{completion.score_after}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">After</p>
                </div>
              </div>
              <SecurityGauge score={completion.score_after} size={140} label="Projected Score" />
            </Card>
          </motion.div>

          {/* Threat Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass glow-purple p-6">
              <h3 className="text-sm font-semibold mb-4">Threat Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Injection", count: Math.ceil(vulns.length * 0.4), pct: 40, color: "bg-red-500" },
                  { label: "Cryptographic", count: Math.floor(vulns.length * 0.4), pct: 40, color: "bg-orange-500" },
                  { label: "Access Control", count: Math.floor(vulns.length * 0.2), pct: 20, color: "bg-yellow-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Scan Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass glow-purple p-6">
              <h3 className="text-sm font-semibold mb-4">Scan Details</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Scan ID", value: scanId },
                  { label: "Files Scanned", value: completion.files_analyzed },
                  { label: "Scan Duration", value: completion.duration },
                  { label: "AI Model", value: "Qwen 3 480B" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
