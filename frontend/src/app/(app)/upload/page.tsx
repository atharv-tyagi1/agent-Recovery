"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { UploadZone } from "@/components/upload-zone";
import { GithubImport } from "@/components/github-import";
import { FolderGit2, FileCode, Code2, Package, Upload as UploadIcon, GitBranch } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [uploadMethod, setUploadMethod] = useState<"zip" | "github">("zip");

  const handleUploadComplete = (scanId: string) => {
    router.push(`/analysis?scan_id=${scanId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Analyze Repository</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a ZIP archive or import directly from GitHub
        </p>
      </motion.div>

      {/* Toggle between methods */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex p-1 bg-white/5 border border-purple-500/20 rounded-xl w-fit"
      >
        <button
          onClick={() => setUploadMethod("zip")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            uploadMethod === "zip"
              ? "bg-purple-500/20 text-purple-200 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <UploadIcon className="h-4 w-4" />
          Upload ZIP
        </button>
        <button
          onClick={() => setUploadMethod("github")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            uploadMethod === "github"
              ? "bg-purple-500/20 text-purple-200 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <GitBranch className="h-4 w-4" />
          GitHub URL
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {uploadMethod === "zip" ? (
          <UploadZone key="zip" onUploadComplete={handleUploadComplete} />
        ) : (
          <GithubImport key="github" onUploadComplete={handleUploadComplete} />
        )}
      </AnimatePresence>

      {/* Repository Metadata Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass glow-purple p-6">
          <h3 className="text-sm font-semibold mb-4">Repository Preview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FolderGit2, label: "Repository", value: "acme/web-platform", color: "text-purple-400" },
              { icon: FileCode, label: "Total Files", value: "847", color: "text-blue-400" },
              { icon: Code2, label: "Lines of Code", value: "124,563", color: "text-cyan-400" },
              { icon: Package, label: "Dependencies", value: "234", color: "text-emerald-400" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-purple-500/5">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Language breakdown */}
          <div className="mt-5 pt-5 border-t border-purple-500/10">
            <p className="text-xs text-muted-foreground mb-3">Language Breakdown</p>
            <div className="space-y-2">
              {[
                { lang: "TypeScript", pct: 62, color: "bg-blue-500" },
                { lang: "JavaScript", pct: 25, color: "bg-yellow-500" },
                { lang: "CSS", pct: 8, color: "bg-purple-500" },
                { lang: "SQL", pct: 5, color: "bg-emerald-500" },
              ].map((l) => (
                <div key={l.lang} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{l.lang}</span>
                  <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${l.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${l.pct}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{l.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
