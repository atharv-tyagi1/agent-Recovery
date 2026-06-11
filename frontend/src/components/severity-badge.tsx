"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const severityConfig = {
  critical: {
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
  high: {
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    dot: "bg-orange-500",
  },
  medium: {
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  low: {
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
};

interface SeverityBadgeProps {
  severity: "critical" | "high" | "medium" | "low";
  showDot?: boolean;
  className?: string;
}

export function SeverityBadge({ severity, showDot = true, className = "" }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
      <Badge
        variant="outline"
        className={`${config.color} border font-medium text-xs uppercase tracking-wider ${className}`}
      >
        {showDot && (
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 animate-pulse`} />
        )}
        {severity}
      </Badge>
    </motion.div>
  );
}
