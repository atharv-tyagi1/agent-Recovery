"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  Shield,
  FileText,
  Zap,
  CheckCircle,
} from "lucide-react";
import type { ActivityItem } from "@/lib/mock-data";

const typeConfig = {
  detection: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  fix: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  report: { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
  scan: { icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10" },
  improvement: { icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10" },
};

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className = "" }: ActivityFeedProps) {
  return (
    <Card className={`glass glow-purple p-5 ${className}`}>
      <h3 className="text-sm font-semibold mb-4 text-foreground">Activity Feed</h3>
      <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
        {items.map((item, index) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group"
            >
              <div className={`p-1.5 rounded-md ${config.bg} mt-0.5 shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                  {item.message}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {item.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
