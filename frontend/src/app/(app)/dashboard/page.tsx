"use client";

import React, { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { SecurityGauge } from "@/components/security-gauge";
import { ActivityFeed } from "@/components/activity-feed";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderGit2,
  FileCode,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Link from "next/link";

interface DashboardData {
  dashboardStats: {
    repositoriesScanned: number;
    filesAnalyzed: number;
    vulnerabilitiesFound: number;
    securityScore: number;
  };
  threatDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  recentScans: {
    id: string;
    repository: string;
    status: string;
    threats: number;
    date: string;
    duration: string;
    filesAnalyzed: number;
    scoreBefore: number;
    scoreAfter: number;
  }[];
  activityFeed: {
    id: string;
    message: string;
    type: "detection" | "fix" | "report" | "scan" | "improvement";
    timestamp: string;
  }[];
}

function DashboardPageContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("http://localhost:8000/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard statistics");
        return res.json();
      })
      .then((d) => {
        if (active) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(err.message || "Failed to load dashboard data.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
        <p className="text-slate-400 text-sm">Loading dashboard data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-200 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-400 text-sm">{error || "No dashboard data found"}</p>
        </div>
      </div>
    );
  }

  const { dashboardStats, threatDistribution, recentScans, activityFeed } = data;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your security posture
        </p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Repositories Scanned"
          value={dashboardStats.repositoriesScanned}
          change=""
          changeType="positive"
          icon={FolderGit2}
          iconColor="text-purple-400"
          delay={0}
        />
        <MetricCard
          title="Files Analyzed"
          value={dashboardStats.filesAnalyzed}
          change=""
          changeType="positive"
          icon={FileCode}
          iconColor="text-blue-400"
          delay={0.1}
        />
        <MetricCard
          title="Vulnerabilities Found"
          value={dashboardStats.vulnerabilitiesFound}
          change=""
          changeType="positive"
          icon={AlertTriangle}
          iconColor="text-orange-400"
          delay={0.2}
        />
        <MetricCard
          title="Security Score"
          value={`${dashboardStats.securityScore}/100`}
          change=""
          changeType="positive"
          icon={ShieldCheck}
          iconColor="text-emerald-400"
          delay={0.3}
        />
      </div>

      {/* Middle Row: Score + Threat Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass glow-purple p-6 flex flex-col items-center justify-center h-full">
            <SecurityGauge score={dashboardStats.securityScore} size={180} />
            <p className="text-xs text-muted-foreground mt-4">
              Based on latest scan results
            </p>
          </Card>
        </motion.div>

        {/* Threat Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass glow-purple p-6 h-full">
            <h3 className="text-sm font-semibold mb-4">Threat Distribution</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={threatDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {threatDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#111",
                      border: "1px solid rgba(124,58,237,0.2)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {threatDistribution.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: t.color }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {t.name} ({t.value})
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ActivityFeed items={activityFeed} className="h-full" />
        </motion.div>
      </div>

      {/* Recent Scans Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="glass glow-purple overflow-hidden">
          <div className="p-5 border-b border-purple-500/10">
            <h3 className="text-sm font-semibold">Recent Scans</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-purple-500/10 hover:bg-transparent">
                <TableHead className="text-xs">Repository</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Threats</TableHead>
                <TableHead className="text-xs">Files</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-slate-400">
                    No scans found. Upload a repository to start.
                  </TableCell>
                </TableRow>
              ) : (
                recentScans.map((scan) => (
                  <TableRow
                    key={scan.id}
                    className="border-purple-500/10 hover:bg-white/[0.02] cursor-pointer"
                  >
                    <TableCell>
                      <Link href={`/results?scan_id=${scan.id}`} className="text-sm font-medium hover:text-purple-300 transition-colors">
                        {scan.repository}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase ${
                          scan.status === "completed"
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                            : scan.status === "in-progress"
                            ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
                            : scan.status === "queued"
                            ? "text-slate-400 border-slate-500/20 bg-slate-500/5"
                            : "text-red-400 border-red-500/20 bg-red-500/5"
                        }`}
                      >
                        {scan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${
                        scan.threats > 0 ? "text-orange-400" : "text-muted-foreground"
                      }`}>
                        {scan.threats}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {scan.filesAnalyzed.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {scan.date}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
