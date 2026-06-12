"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ThreatCard } from "@/components/threat-card";
import { SecurityGauge } from "@/components/security-gauge";
import { SeverityBadge } from "@/components/severity-badge";
import { AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scanId, setScanId] = useState<string | null>(null);

  const [data, setData] = useState<{
    security_score: number;
    security_score_after: number;
    vulnerabilities: any[];
  } | null>(null);

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
    fetch(`http://localhost:8000/api/scan/${scanId}/results`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => console.log("Waiting for scan results..."));
  }, [scanId]);

  if (!data || !data.vulnerabilities) return <div className="p-8 text-center text-muted-foreground">Loading results...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Scan Results</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scan ID: {scanId} — Deep Scan
        </p>
      </motion.div>

      {/* Results Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vuln count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass glow-purple p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-3xl font-bold">{data.vulnerabilities.length}</p>
              <p className="text-xs text-muted-foreground">Vulnerabilities Found</p>
            </div>
          </Card>
        </motion.div>

        {/* Score improvement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass glow-purple p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-red-400">{data.security_score}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold text-emerald-400">{data.security_score_after}</span>
              </div>
              <p className="text-xs text-muted-foreground">Security Score</p>
            </div>
          </Card>
        </motion.div>

        {/* Security Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass glow-purple p-4 flex items-center justify-center">
            <SecurityGauge score={data.security_score_after} size={120} label="After Fixes" />
          </Card>
        </motion.div>
      </div>

      {/* Severity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <span className="text-xs text-muted-foreground">By Severity:</span>
        {(["critical", "high", "medium", "low"] as const).map((sev) => {
          const count = data.vulnerabilities.filter((v) => v.severity === sev).length;
          return (
            <div key={sev} className="flex items-center gap-1.5">
              <SeverityBadge severity={sev} showDot={false} />
              <span className="text-xs text-muted-foreground">({count})</span>
            </div>
          );
        })}
      </motion.div>

      {/* Vulnerability Cards */}
      <div className="space-y-3">
        {data.vulnerabilities.map((vuln, index) => (
          <ThreatCard
            key={vuln.id}
            vulnerability={vuln}
            index={index}
            onClick={() => router.push(`/vulnerability/${vuln.id}?scan_id=${scanId}`)}
          />
        ))}
      </div>
    </div>
  );
}
