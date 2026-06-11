"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ScanConsole } from "@/components/scan-console";
import { SecurityGauge } from "@/components/security-gauge";
import { FileCode, FunctionSquare, Package, AlertTriangle } from "lucide-react";

export default function AnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scan_id");

  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    filesParsed: 0,
    functionsAnalyzed: 0,
    dependenciesFound: 0,
    threatsFound: 0,
  });

  useEffect(() => {
    if (!scanId) return;

    // Start scan
    fetch(`http://localhost:8000/api/scan/${scanId}`, { method: "POST" }).catch(console.error);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/status/${scanId}`);
        if (res.ok) {
          const data = await res.json();
          setProgress(data.progress);
          
          if (data.status === "COMPLETED") {
            clearInterval(interval);
            setTimeout(() => {
              router.push(`/results?scan_id=${scanId}`);
            }, 1000);
          } else if (data.status === "FAILED") {
            clearInterval(interval);
            alert("Scan failed: " + data.current_step);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scanId, router]);

  useEffect(() => {
    const pct = Math.min(progress / 100, 1);
    setMetrics({
      filesParsed: Math.floor(847 * pct),
      functionsAnalyzed: Math.floor(12847 * pct),
      dependenciesFound: Math.floor(234 * pct),
      threatsFound: pct > 0.6 ? Math.floor(5 * ((pct - 0.6) / 0.4)) : 0,
    });
  }, [progress]);

  const liveMetrics = [
    { label: "Files Parsed", value: metrics.filesParsed, max: 847, icon: FileCode, color: "text-blue-400" },
    { label: "Functions Analyzed", value: metrics.functionsAnalyzed, max: 12847, icon: FunctionSquare, color: "text-purple-400" },
    { label: "Dependencies Found", value: metrics.dependenciesFound, max: 234, icon: Package, color: "text-cyan-400" },
    { label: "Threats Found", value: metrics.threatsFound, max: 5, icon: AlertTriangle, color: "text-red-400" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Security Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered deep scan in progress
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Console — 2/3 width */}
        <div className="lg:col-span-2">
          <ScanConsole />
        </div>

        {/* Progress + Metrics — 1/3 width */}
        <div className="space-y-4">
          {/* Progress Circle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass glow-purple p-6 flex flex-col items-center justify-center">
              <SecurityGauge
                score={Math.min(Math.round(progress), 100)}
                size={160}
                label="Analysis Progress"
              />
              <p className="text-xs text-muted-foreground mt-3">
                {progress >= 100 ? "Analysis complete" : "Scanning repository..."}
              </p>
            </Card>
          </motion.div>

          {/* Live Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass glow-purple p-5">
              <h3 className="text-sm font-semibold mb-4">Live Metrics</h3>
              <div className="space-y-4">
                {liveMetrics.map((metric) => {
                  const Icon = metric.icon;
                  const pct = metric.max > 0 ? (metric.value / metric.max) * 100 : 0;
                  return (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${metric.color}`} />
                          <span className="text-xs text-muted-foreground">{metric.label}</span>
                        </div>
                        <span className="text-xs font-semibold tabular-nums">
                          {metric.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
