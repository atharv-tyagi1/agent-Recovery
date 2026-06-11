"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { scanLogLines } from "@/lib/mock-data";

interface ScanConsoleProps {
  isRunning?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function ScanConsole({ isRunning = true, onComplete, className = "" }: ScanConsoleProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRunning) return;

    const timeouts: NodeJS.Timeout[] = [];

    scanLogLines.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        if (index === scanLogLines.length - 1 && onComplete) {
          setTimeout(onComplete, 500);
        }
      }, line.delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isRunning, onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const colorLine = (text: string) => {
    if (text.startsWith("[CRIT]")) return "text-red-400 font-semibold";
    if (text.startsWith("[HIGH]")) return "text-orange-400 font-semibold";
    if (text.startsWith("[MED]")) return "text-yellow-400 font-semibold";
    if (text.startsWith("[WARN]")) return "text-yellow-400";
    if (text.startsWith("[FIX]")) return "text-emerald-400";
    if (text.startsWith("[DONE]")) return "text-cyan-400 font-semibold";
    if (text.startsWith("[INIT]")) return "text-purple-400";
    if (text.startsWith("[LOAD]")) return "text-blue-400";
    if (text.startsWith("[SCAN]")) return "text-indigo-400";
    if (text.startsWith("$")) return "text-emerald-400 font-semibold";
    return "text-slate-400";
  };

  return (
    <Card className={`glass border-purple-500/10 overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border-b border-purple-500/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">
          phantom-scanner — analysis
        </span>
        {isRunning && visibleLines.length < scanLogLines.length && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono">RUNNING</span>
          </div>
        )}
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="p-4 font-mono text-xs leading-relaxed max-h-[400px] overflow-y-auto bg-[#05050A]"
      >
        {visibleLines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={`${colorLine(line)} ${line === "" ? "h-3" : ""}`}
          >
            {line}
          </motion.div>
        ))}
        {isRunning && visibleLines.length < scanLogLines.length && (
          <span className="inline-block w-2 h-4 bg-purple-400 animate-typing-cursor ml-0.5" />
        )}
      </div>
    </Card>
  );
}
