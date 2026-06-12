"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/animated-counter";
import { SecurityGauge } from "@/components/security-gauge";
import {
  CheckCircle,
  FileCode,
  AlertTriangle,
  Wrench,
  ArrowRight,
  Search,
  Code,
  FileBarChart,
  FolderGit2,
  Sparkles,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function ScanCompletePage() {
  const searchParams = useSearchParams();
  const [scanId, setScanId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

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
    fetch(`http://localhost:8000/api/completion/${scanId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch completion data");
        return res.json();
      })
      .then(json => setData(json))
      .catch((err) => console.log("Waiting for scan completion data..."));
  }, [scanId]);

  if (!data || data.files_analyzed === undefined) return <div className="p-8 text-center text-muted-foreground">Loading completion...</div>;

  const metrics = [
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
  ];

  const actionCards = [
    {
      title: "View Investigation",
      description: "Full timeline of the AI security investigation",
      href: `/investigation?scan_id=${scanId}`,
      icon: Search,
      color: "text-cyan-400",
      gradient: "from-cyan-500/10 to-blue-500/10",
    },
    {
      title: "View Repository",
      description: "Explore source code and vulnerability locations",
      href: `/repository?scan_id=${scanId}`,
      icon: Code,
      color: "text-purple-400",
      gradient: "from-purple-500/10 to-indigo-500/10",
    },
    {
      title: "View Fixes",
      description: "AI-generated secure patches with diffs",
      href: `/fixes?scan_id=${scanId}`,
      icon: Wrench,
      color: "text-emerald-400",
      gradient: "from-emerald-500/10 to-green-500/10",
    },
    {
      title: "View Report",
      description: "Executive security summary with recommendations",
      href: `/report?scan_id=${scanId}`,
      icon: FileBarChart,
      color: "text-blue-400",
      gradient: "from-blue-500/10 to-indigo-500/10",
    },
    {
      title: "Run New Scan",
      description: "Upload and analyze another repository",
      href: "/upload",
      icon: FolderGit2,
      color: "text-yellow-400",
      gradient: "from-yellow-500/10 to-orange-500/10",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <Card className="glass glow-purple overflow-hidden">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />

          <div className="relative z-10 py-12 px-8 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
              >
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              <span className="gradient-text">Investigation Complete</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed"
            >
              Agent Phantom successfully analyzed your repository and generated
              remediation recommendations for all identified vulnerabilities.
            </motion.p>

            {/* Score Improvement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center justify-center gap-6"
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-red-400">{data.score_before}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Before</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-400">{data.score_after}</p>
                <p className="text-[10px] text-muted-foreground mt-1">After Fixes</p>
              </div>
            </motion.div>

            {/* Scan badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground bg-white/[0.03] border border-purple-500/10 rounded-full px-4 py-1.5"
            >
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>
                Powered by <span className="font-semibold text-purple-300">Qwen 3 480B</span> •
                Scan Duration: {data.duration} • Scan ID: {scanId}
              </span>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
            >
              <Card className={`glass p-5 border ${metric.borderColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${metric.color}`}>
                    <AnimatedCounter end={metric.value} />
                  </span>
                  {metric.suffix && (
                    <span className="text-sm text-muted-foreground">{metric.suffix}</span>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Security Gauge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="glass glow-purple p-8 flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-6">Projected Security Score</h3>
          <SecurityGauge score={data.score_after} size={200} label="After Fixes" />
          <p className="text-xs text-muted-foreground mt-4 text-center max-w-sm">
            Applying all {data.fixes_generated} generated patches will bring your security score from
            <span className="text-red-400 font-semibold"> {data.score_before} </span>to
            <span className="text-emerald-400 font-semibold"> {data.score_after} </span>
            — a <span className="text-cyan-400 font-semibold">{Math.round(((data.score_after - data.score_before) / data.score_before) * 100)}%</span> improvement.
          </p>
        </Card>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-sm font-semibold mb-4">Next Steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actionCards.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + idx * 0.08 }}
              >
                <Link href={action.href}>
                  <Card className="glass group cursor-pointer hover:border-purple-500/30 transition-all duration-300 overflow-hidden h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10 p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`h-5 w-5 ${action.color}`} />
                        <h3 className="text-sm font-semibold group-hover:text-purple-300 transition-colors">
                          {action.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
