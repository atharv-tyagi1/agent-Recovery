"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface CodeDiffViewerProps {
  vulnerableCode: string;
  fixedCode: string;
  className?: string;
}

export function CodeDiffViewer({ vulnerableCode, fixedCode, className = "" }: CodeDiffViewerProps) {
  const renderCodeBlock = (
    code: string,
    type: "vulnerable" | "fixed"
  ) => {
    const lines = code.split("\n");
    const isVulnerable = type === "vulnerable";

    return (
      <div className="flex-1 min-w-0">
        <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${
          isVulnerable
            ? "bg-red-500/5 border-red-500/10"
            : "bg-emerald-500/5 border-emerald-500/10"
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isVulnerable ? "bg-red-500" : "bg-emerald-500"
          }`} />
          <span className={`text-xs font-semibold ${
            isVulnerable ? "text-red-400" : "text-emerald-400"
          }`}>
            {isVulnerable ? "VULNERABLE" : "PATCHED"}
          </span>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-xs font-mono leading-relaxed">
            {lines.map((line, i) => {
              let lineClass = "text-slate-400";
              let bgClass = "";
              const trimmed = line.trim();

              if (isVulnerable && (trimmed.startsWith("// VULNERABLE") || trimmed.includes("VULNERABLE"))) {
                lineClass = "text-red-400";
                bgClass = "bg-red-500/5";
              } else if (!isVulnerable && (trimmed.startsWith("// FIXED") || trimmed.includes("FIXED"))) {
                lineClass = "text-emerald-400";
                bgClass = "bg-emerald-500/5";
              } else if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
                lineClass = "text-slate-500";
              } else if (trimmed.startsWith("import") || trimmed.startsWith("const") || trimmed.startsWith("async") || trimmed.startsWith("function") || trimmed.startsWith("return")) {
                lineClass = "text-purple-300";
              }

              return (
                <div key={i} className={`px-2 -mx-2 ${bgClass}`}>
                  <span className="inline-block w-6 text-right mr-3 text-slate-600 select-none text-[10px]">
                    {i + 1}
                  </span>
                  <span className={lineClass}>{line}</span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="glass overflow-hidden">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-purple-500/10">
          {renderCodeBlock(vulnerableCode, "vulnerable")}
          {renderCodeBlock(fixedCode, "fixed")}
        </div>
      </Card>
    </motion.div>
  );
}
