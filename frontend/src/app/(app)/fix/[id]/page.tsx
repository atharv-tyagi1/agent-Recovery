"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeDiffViewer } from "@/components/code-diff-viewer";
import { SecurityGauge } from "@/components/security-gauge";
import { SeverityBadge } from "@/components/severity-badge";
import { CheckCircle, Shield, TrendingDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FixPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scan_id");
  const [vuln, setVuln] = useState<any>(null);

  useEffect(() => {
    if (!scanId || !params.id) return;
    fetch(`http://localhost:8000/api/fixes/${scanId}`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((v: any) => v.id === params.id);
        if (found) setVuln(found);
      })
      .catch(console.error);
  }, [scanId, params.id]);

  if (!vuln) return <div className="p-8 text-center text-muted-foreground">Loading fix...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/vulnerability/${vuln.id}?scan_id=${scanId}`}>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <SeverityBadge severity={vuln.severity} />
          <h1 className="text-2xl font-bold">Fix: {vuln.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-generated secure patch for {vuln.file}
        </p>
      </motion.div>

      {/* Code Diff */}
      <CodeDiffViewer
        vulnerableCode={vuln.vulnerableCode}
        fixedCode={vuln.fixedCode}
      />

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Why This Fix Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass glow-purple p-6 h-full">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Why This Fix Works
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {vuln.fixExplanation}
            </p>
            <div className="mt-4 pt-4 border-t border-purple-500/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs text-muted-foreground">OWASP Category</span>
                  </div>
                  <p className="text-xs font-mono text-purple-300">{vuln.owasp}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs text-muted-foreground">CWE Reference</span>
                  </div>
                  <p className="text-xs font-mono text-cyan-300">{vuln.cwe}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Risk Reduction + Security Improvement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <Card className="glass glow-purple p-6 flex flex-col items-center">
            <h3 className="text-sm font-semibold mb-3 self-start flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              Risk Reduction
            </h3>
            <SecurityGauge score={vuln.riskReduction} size={120} label="Reduction" />
          </Card>

          <Card className="glass glow-purple p-6">
            <h3 className="text-sm font-semibold mb-3">Security Improvement</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Before Fix</span>
                <span className="text-red-400 font-semibold">42/100</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: "42%" }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">After Fix</span>
                <span className="text-emerald-400 font-semibold">91/100</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: "42%" }}
                  animate={{ width: "91%" }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
