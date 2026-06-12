"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { GitBranch, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GithubImportProps {
  onUploadComplete?: (scanId: string) => void;
  className?: string;
}

export function GithubImport({ onUploadComplete, className = "" }: GithubImportProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:8000/api/github-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to analyze repository.");
      }

      if (onUploadComplete) {
        onUploadComplete(data.scan_id);
      }
    } catch (err: any) {
      console.error("Github Import Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="glass relative overflow-hidden transition-all duration-500 border-purple-500/20">
        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <GitBranch className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Import from GitHub</h3>
              <p className="text-sm text-muted-foreground">Paste a public repository URL to analyze</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                disabled={status === "loading"}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg outline-none focus:border-purple-500/60 transition-colors text-sm"
              />
            </div>

            {status === "error" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={!url.trim() || status === "loading"}
              className="w-full h-12 gradient-primary text-white border-0"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Downloading Repository...
                </>
              ) : (
                "Analyze Repository"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
