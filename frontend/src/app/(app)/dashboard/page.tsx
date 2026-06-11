"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { SecurityGauge } from "@/components/security-gauge";
import { ActivityFeed } from "@/components/activity-feed";
import { SeverityBadge } from "@/components/severity-badge";
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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  dashboardStats,
  threatDistribution,
  recentScans,
  activityFeed,
} from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
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
          change="+12 this week"
          changeType="positive"
          icon={FolderGit2}
          iconColor="text-purple-400"
          delay={0}
        />
        <MetricCard
          title="Files Analyzed"
          value={dashboardStats.filesAnalyzed}
          change="+2,341 this week"
          changeType="positive"
          icon={FileCode}
          iconColor="text-blue-400"
          delay={0.1}
        />
        <MetricCard
          title="Vulnerabilities Found"
          value={dashboardStats.vulnerabilitiesFound}
          change="-15% from last week"
          changeType="positive"
          icon={AlertTriangle}
          iconColor="text-orange-400"
          delay={0.2}
        />
        <MetricCard
          title="Security Score"
          value={`${dashboardStats.securityScore}/100`}
          change="+7 points"
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
              {recentScans.map((scan) => (
                <TableRow
                  key={scan.id}
                  className="border-purple-500/10 hover:bg-white/[0.02] cursor-pointer"
                >
                  <TableCell>
                    <Link href="/results" className="text-sm font-medium hover:text-purple-300 transition-colors">
                      {scan.repository}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
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
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  );
}
