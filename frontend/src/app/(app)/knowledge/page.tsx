"use client";

import React, { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/severity-badge";
import {
  Database,
  Code,
  Key,
  Lock,
  ShieldOff,
  ShieldAlert,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  Globe,
  Shield,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import { knowledgeBase, type KnowledgeEntry } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ElementType> = {
  Database,
  Code,
  Key,
  Lock,
  ShieldOff,
  ShieldAlert,
};

function KnowledgeCard({
  entry,
  index,
  onClick,
}: {
  entry: KnowledgeEntry;
  index: number;
  onClick: () => void;
}) {
  const Icon = iconMap[entry.icon] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card
        className="glass glow-purple p-6 cursor-pointer group hover:border-purple-500/30 transition-all duration-300 h-full"
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/10 group-hover:bg-purple-500/15 transition-colors">
              <Icon className="h-5 w-5 text-purple-400" />
            </div>
            <SeverityBadge severity={entry.severity} showDot={false} />
          </div>
          <h3 className="font-semibold text-sm mb-1 group-hover:text-purple-300 transition-colors">
            {entry.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {entry.description}
          </p>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-[9px] text-purple-300 border-purple-500/20 bg-purple-500/5"
            >
              {entry.owasp}
            </Badge>
            <span className="text-xs text-purple-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function KnowledgeDetail({
  entry,
  onBack,
}: {
  entry: KnowledgeEntry;
  onBack: () => void;
}) {
  const Icon = iconMap[entry.icon] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Back + Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Knowledge Base
        </Button>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl gradient-primary">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{entry.title}</h1>
              <SeverityBadge severity={entry.severity} />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono text-purple-300">{entry.owasp}</span>
              <span>•</span>
              <span>{entry.category}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <Card className="glass glow-purple p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-400" />
              Description
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {entry.description}
            </p>
          </Card>

          {/* Real-World Impact */}
          <Card className="glass glow-purple p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-red-400" />
              Real-World Impact
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {entry.realWorldImpact}
            </p>
          </Card>

          {/* Attack Example */}
          <Card className="glass overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/5 border-b border-red-500/10">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs font-semibold text-red-400">
                ATTACK EXAMPLE
              </span>
            </div>
            <pre className="p-4 text-[12px] font-mono leading-relaxed text-slate-400 overflow-x-auto bg-[#05050A]">
              {entry.attackExample}
            </pre>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Mitigation */}
          <Card className="glass glow-purple p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Mitigation
            </h3>
            <div className="space-y-2">
              {entry.mitigation.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Best Practices */}
          <Card className="glass glow-purple p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              Best Practices
            </h3>
            <div className="space-y-2">
              {entry.bestPractices.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="text-yellow-400 shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function KnowledgePageContent() {
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {selectedEntry ? (
          <KnowledgeDetail
            key="detail"
            entry={selectedEntry}
            onBack={() => setSelectedEntry(null)}
          />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg gradient-primary">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Security Knowledge Base</h1>
                  <p className="text-sm text-muted-foreground">
                    OWASP Top 10 vulnerability reference and best practices
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {knowledgeBase.map((entry, index) => (
                <KnowledgeCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onClick={() => setSelectedEntry(entry)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function KnowledgePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KnowledgePageContent />
    </Suspense>
  );
}
