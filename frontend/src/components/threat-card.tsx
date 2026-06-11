"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/severity-badge";
import { ChevronDown, FileCode, MapPin } from "lucide-react";
import type { Vulnerability } from "@/lib/mock-data";

interface ThreatCardProps {
  vulnerability: Vulnerability;
  index?: number;
  onClick?: () => void;
}

export function ThreatCard({ vulnerability, index = 0, onClick }: ThreatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className="glass glow-purple overflow-hidden cursor-pointer group hover:border-purple-500/30 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <SeverityBadge severity={vulnerability.severity} />
                <span className="text-xs text-muted-foreground font-mono">
                  {vulnerability.confidence}% confidence
                </span>
              </div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-purple-300 transition-colors">
                {vulnerability.title}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileCode className="h-3 w-3" />
                  {vulnerability.file}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Line {vulnerability.line}
                </span>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-purple-500/10 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {vulnerability.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-400">{vulnerability.owasp}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-mono text-cyan-400">{vulnerability.cwe}</span>
                  </div>
                  {onClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
