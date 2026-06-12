"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ChevronDown,
  Clock,
  FileCode,
  Brain,
  Crosshair,
  Lightbulb,
  Zap,
  ArrowRight,
  Cpu,
  Activity,
} from "lucide-react";
import { agentReasoning, type InvestigationStep } from "@/lib/mock-data";

function StepCard({ step, index }: { step: InvestigationStep | any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors: any = {
    completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "in-progress": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    pending: "text-slate-500 bg-slate-500/10 border-slate-500/20",
  };

  const isCriticalStep =
    step.title.includes("SQL Injection") ||
    step.title.includes("Exploitability") ||
    step.title.includes("Vulnerability Confirmed") ||
    step.title.includes("Verified");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <div className="flex gap-4">
        {/* Timeline line + dot */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
              isCriticalStep
                ? "bg-red-500/10 border-red-500/30"
                : statusColors[step.status]
            }`}
          >
            <CheckCircle
              className={`h-4 w-4 ${
                isCriticalStep ? "text-red-400" : "text-emerald-400"
              }`}
            />
          </div>
          <div className="w-px flex-1 bg-gradient-to-b from-purple-500/20 to-transparent min-h-[20px]" />
        </div>

        {/* Step content */}
        <Card
          className={`glass flex-1 mb-3 overflow-hidden cursor-pointer group transition-all duration-300 ${
            isCriticalStep
              ? "border-red-500/20 hover:border-red-500/40"
              : "hover:border-purple-500/30"
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold group-hover:text-purple-300 transition-colors">
                    {step.title}
                  </h3>
                  {isCriticalStep && (
                    <Badge
                      variant="outline"
                      className="text-[9px] text-red-400 border-red-500/20 bg-red-500/5"
                    >
                      ALERT
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {step.timestamp || "Just now"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {step.duration}
                  </span>
                  <span
                    className={`font-semibold ${
                      parseInt(step.confidence) >= 95
                        ? "text-emerald-400"
                        : parseInt(step.confidence) >= 90
                        ? "text-cyan-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {step.confidence}
                  </span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-purple-500/10 space-y-3">
                    {/* Reasoning */}
                    {step.reasoning && (
                      <div>
                        <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1.5">
                          Reasoning
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Code Snippet */}
                    {step.evidence && (
                      <div>
                        <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1.5">
                          Code Evidence
                        </p>
                        <pre className="text-[11px] font-mono text-slate-400 bg-[#05050A] border border-purple-500/10 rounded-lg p-3 overflow-x-auto leading-relaxed">
                          {step.evidence}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export default function InvestigationPage() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scan_id");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!scanId) return;
    fetch(`http://localhost:8000/api/investigation/${scanId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch investigation timeline");
        return res.json();
      })
      .then(json => setData(json))
      .catch((err) => console.log("Waiting for investigation timeline..."));
  }, [scanId]);

  if (!data || !data.timeline) return <div className="p-8 text-center text-muted-foreground">Loading timeline...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">AI Investigation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full investigation timeline for Scan ID: {scanId}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Investigation Timeline — 3/5 */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-4"
          >
            <Card className="glass glow-purple p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Investigation Complete</p>
                <p className="text-[11px] text-muted-foreground">
                  {data.timeline.length} steps • 17.4 seconds
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
              >
                COMPLETED
              </Badge>
            </Card>
          </motion.div>

          {data.timeline.map((step: any, index: number) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>

        {/* Agent Reasoning Panel — 2/5 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Agent Identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass glow-purple p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl gradient-primary">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Agent Reasoning</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Live AI thinking process
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Focus */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                      Current Focus
                    </span>
                  </div>
                  <p className="text-sm font-medium text-cyan-300">
                    {agentReasoning.currentFocus}
                  </p>
                </div>

                {/* Hypothesis */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                      Current Hypothesis
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {agentReasoning.currentHypothesis}
                  </p>
                </div>

                {/* Evidence */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCode className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                      Evidence Collected
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {agentReasoning.evidenceCollected.map((ev, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="text-purple-400 mt-0.5 shrink-0">
                          •
                        </span>
                        <span className="leading-relaxed">{ev}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Confidence */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                      Confidence Level
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {agentReasoning.confidence}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${agentReasoning.confidence}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Next Action */}
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                      Next Action
                    </span>
                  </div>
                  <p className="text-sm font-medium text-purple-300 flex items-center gap-2">
                    {agentReasoning.nextAction}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Model Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass glow-purple p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                Model Performance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Model", value: agentReasoning.model },
                  { label: "Tokens Used", value: agentReasoning.tokensUsed.toLocaleString() },
                  { label: "Reasoning Steps", value: agentReasoning.reasoningSteps.toString() },
                  { label: "Latency", value: "17.4s total" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-purple-500/5"
                  >
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className="text-xs font-semibold mt-0.5 gradient-text">
                      {s.value}
                    </p>
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
