"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/severity-badge";
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  Folder,
  FolderOpen,
  AlertTriangle,
  Shield,
  Eye,
} from "lucide-react";
import { type FileTreeNode } from "@/lib/mock-data";

function TreeNode({
  node,
  depth = 0,
  selectedFile,
  onSelect,
  fileContents
}: {
  node: FileTreeNode;
  depth?: number;
  selectedFile: string;
  onSelect: (path: string) => void;
  fileContents: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const hasVulns = node.vulnerabilities && node.vulnerabilities.length > 0;

  const getFilePath = (n: FileTreeNode, prefix: string = ""): string => {
    return prefix ? `${prefix}/${n.name}` : n.name;
  };

  const buildPath = (): string => {
    return node.name;
  };

  const sevColor = (sev: string) => {
    if (sev === "critical") return "text-red-400";
    if (sev === "high") return "text-orange-400";
    if (sev === "medium") return "text-yellow-400";
    return "text-blue-400";
  };

  const langColor = (lang?: string) => {
    if (lang === "typescript" || lang === "tsx") return "text-blue-400";
    if (lang === "javascript") return "text-yellow-400";
    if (lang === "css") return "text-purple-400";
    if (lang === "json") return "text-green-400";
    if (lang === "env") return "text-red-400";
    return "text-slate-400";
  };

  // For file nodes: try to find a matching key in fileContents
  const getContentKey = (): string | null => {
    for (const key of Object.keys(fileContents)) {
      if (key.endsWith(node.name)) return key;
    }
    return null;
  };

  const contentKey = !isFolder ? getContentKey() : null;
  const isSelected = contentKey ? selectedFile === contentKey : false;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            setExpanded(!expanded);
          } else if (contentKey) {
            onSelect(contentKey);
          }
        }}
        className={`w-full flex items-center gap-1.5 py-1 px-2 rounded text-[12px] font-mono transition-colors group ${
          isSelected
            ? "bg-purple-500/10 text-purple-300"
            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <>
            {expanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/50" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
            )}
            {expanded ? (
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-purple-400" />
            ) : (
              <Folder className="h-3.5 w-3.5 shrink-0 text-purple-400/60" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <FileCode className={`h-3.5 w-3.5 shrink-0 ${langColor(node.language)}`} />
          </>
        )}
        <span className="truncate">{node.name}</span>
        {hasVulns && (
          <span className="ml-auto flex items-center gap-1">
            {node.vulnerabilities!.map((v, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  v.severity === "critical"
                    ? "bg-red-500"
                    : v.severity === "high"
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                }`}
              />
            ))}
          </span>
        )}
      </button>
      <AnimatePresence>
        {isFolder && expanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.name}
                node={child}
                depth={depth + 1}
                selectedFile={selectedFile}
                onSelect={onSelect}
                fileContents={fileContents}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RepositoryPage() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scan_id");

  const [selectedFile, setSelectedFile] = useState("");
  const [data, setData] = useState<any>(null);
  const [vulns, setVulns] = useState<any[]>([]);

  useEffect(() => {
    if (!scanId) return;

    Promise.all([
      fetch(`http://localhost:8000/api/repository/${scanId}`).then((r) => r.json()),
      fetch(`http://localhost:8000/api/fixes/${scanId}`).then((r) => r.json())
    ])
      .then(([repoData, vulnsData]) => {
        setData(repoData);
        setVulns(vulnsData);
        if (Object.keys(repoData.fileContents).length > 0) {
          setSelectedFile(Object.keys(repoData.fileContents)[0]);
        }
      })
      .catch(console.error);
  }, [scanId]);

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading repository...</div>;

  const content = data.fileContents[selectedFile] || "// Select a file to view its contents";
  const lines = content.split("\n");

  // Find vulnerabilities for this file
  const fileVulns = vulns.filter((v) =>
    selectedFile.endsWith(v.file.replace(/^.*\//, "")) || v.file === selectedFile
  );

  // Find vulnerable lines for highlighting
  const vulnLines = new Set(fileVulns.map((v) => parseInt(v.line)));

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Repository Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse source code and vulnerability locations
        </p>
      </motion.div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
        {/* Panel 1: File Tree */}
        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass glow-purple h-full overflow-hidden flex flex-col">
            <div className="p-3 border-b border-purple-500/10">
              <h3 className="text-xs font-semibold flex items-center gap-2">
                <Folder className="h-3.5 w-3.5 text-purple-400" />
                Repository Tree
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <TreeNode
                node={data.tree}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
                fileContents={data.fileContents}
              />
            </div>
            <div className="p-3 border-t border-purple-500/10 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Critical
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> High
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Medium
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Panel 2: Code Viewer */}
        <motion.div
          className="col-span-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass h-full overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border-b border-purple-500/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-[11px] text-muted-foreground font-mono ml-2">
                {selectedFile}
              </span>
              {fileVulns.length > 0 && (
                <span className="ml-auto text-[10px] text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {fileVulns.length} vulnerability{fileVulns.length > 1 ? "ies" : "y"}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-auto bg-[#05050A]">
              <pre className="p-4 text-[12px] font-mono leading-[1.7]">
                {lines.map((line, i) => {
                  const lineNum = i + 1;
                  const isVulnLine = vulnLines.has(lineNum);
                  const isComment =
                    line.trim().startsWith("//") || line.trim().startsWith("#");
                  const isVulnComment =
                    line.includes("VULNERABLE") || line.includes("TAINTED");

                  let textColor = "text-slate-400";
                  if (isVulnComment) textColor = "text-red-400";
                  else if (isComment) textColor = "text-slate-600";
                  else if (
                    line.trim().startsWith("import") ||
                    line.trim().startsWith("export") ||
                    line.trim().startsWith("const") ||
                    line.trim().startsWith("async") ||
                    line.trim().startsWith("function") ||
                    line.trim().startsWith("interface") ||
                    line.trim().startsWith("return")
                  )
                    textColor = "text-purple-300";
                  else if (line.includes("'") || line.includes('"') || line.includes("`"))
                    textColor = "text-emerald-300/80";

                  return (
                    <div
                      key={i}
                      className={`flex ${
                        isVulnLine
                          ? "bg-red-500/10 border-l-2 border-red-500 -ml-0.5 pl-0.5"
                          : ""
                      }`}
                    >
                      <span className="inline-block w-10 text-right pr-4 text-slate-600 select-none shrink-0 text-[11px]">
                        {lineNum}
                      </span>
                      <span className={textColor}>{line || " "}</span>
                      {isVulnLine && (
                        <span className="ml-4 text-[10px] text-red-400/60 font-sans">
                          ← vulnerability
                        </span>
                      )}
                    </div>
                  );
                })}
              </pre>
            </div>
          </Card>
        </motion.div>

        {/* Panel 3: Vulnerability Insights */}
        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass glow-purple h-full overflow-hidden flex flex-col">
            <div className="p-3 border-b border-purple-500/10">
              <h3 className="text-xs font-semibold flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                Vulnerability Insights
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {fileVulns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Shield className="h-10 w-10 text-emerald-500/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No Vulnerabilities
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    This file has no detected security issues.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fileVulns.map((vuln) => (
                    <Card
                      key={vuln.id}
                      className="bg-white/[0.02] border-purple-500/10 p-3 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={vuln.severity} />
                      </div>
                      <h4 className="text-xs font-semibold">{vuln.title}</h4>

                      <div className="space-y-2 text-[11px]">
                        <div>
                          <span className="text-muted-foreground/60 uppercase tracking-wider text-[9px]">
                            OWASP
                          </span>
                          <p className="text-purple-300 font-mono mt-0.5">
                            {vuln.owasp}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground/60 uppercase tracking-wider text-[9px]">
                            Description
                          </span>
                          <p className="text-muted-foreground leading-relaxed mt-0.5">
                            {vuln.description}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground/60 uppercase tracking-wider text-[9px]">
                            Impact
                          </span>
                          <p className="text-muted-foreground leading-relaxed mt-0.5">
                            {vuln.impact}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground/60 uppercase tracking-wider text-[9px]">
                            Confidence
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                                style={{ width: `${vuln.confidence}%` }}
                              />
                            </div>
                            <span className="text-emerald-400 font-semibold text-[11px]">
                              {vuln.confidence}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground/60 uppercase tracking-wider text-[9px]">
                            Recommended Fix
                          </span>
                          <p className="text-emerald-300/80 leading-relaxed mt-0.5">
                            {vuln.fixExplanation}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
