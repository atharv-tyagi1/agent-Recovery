"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Upload, FileArchive, CheckCircle, Loader2 } from "lucide-react";

type UploadState = "idle" | "dragging" | "uploading" | "uploaded";

interface UploadZoneProps {
  onUploadComplete?: (scanId: string) => void;
  className?: string;
}

export function UploadZone({ onUploadComplete, className = "" }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performUpload = async (file: File) => {
    setState("uploading");
    setProgress(20);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Create a fake progress interval while uploading
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 500);

      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      setState("uploaded");
      if (onUploadComplete) {
        setTimeout(() => onUploadComplete(data.scan_id), 1000);
      }
    } catch (e) {
      console.error(e);
      setState("idle");
      alert("Failed to upload file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === "idle") setState("dragging");
  };

  const handleDragLeave = () => {
    if (state === "dragging") setState("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (state !== "dragging") return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      performUpload(file);
    } else {
      setState("idle");
      alert("Please upload a ZIP file.");
    }
  };

  const handleClick = () => {
    if (state === "idle") {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      performUpload(file);
    }
  };

  const stateConfig = {
    idle: {
      icon: Upload,
      title: "Drop your repository here",
      subtitle: "Upload a ZIP file or drag and drop",
      borderColor: "border-purple-500/20 hover:border-purple-500/40",
    },
    dragging: {
      icon: FileArchive,
      title: "Release to upload",
      subtitle: "We'll analyze your repository for vulnerabilities",
      borderColor: "border-purple-500/60",
    },
    uploading: {
      icon: Loader2,
      title: "Analyzing repository...",
      subtitle: `${Math.min(Math.round(progress), 100)}% uploaded`,
      borderColor: "border-cyan-500/40",
    },
    uploaded: {
      icon: CheckCircle,
      title: "Repository uploaded!",
      subtitle: "Ready for security analysis",
      borderColor: "border-emerald-500/40",
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".zip" 
        onChange={handleFileChange} 
      />
      <Card
        className={`glass relative overflow-hidden cursor-pointer transition-all duration-500 ${config.borderColor}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Upload progress bar */}
        {state === "uploading" && (
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        )}

        {/* Background glow */}
        <AnimatePresence>
          {state === "dragging" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-purple-500/5"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center justify-center py-20 px-8">
          <motion.div
            animate={{
              scale: state === "dragging" ? 1.1 : 1,
              rotate: state === "uploading" ? 360 : 0,
            }}
            transition={{
              rotate: { duration: 1.5, repeat: state === "uploading" ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.2 },
            }}
            className={`p-6 rounded-2xl mb-6 ${
              state === "uploaded"
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-purple-500/10 border border-purple-500/20"
            }`}
          >
            <Icon
              className={`h-10 w-10 ${
                state === "uploaded" ? "text-emerald-400" : "text-purple-400"
              }`}
            />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>

          {state === "idle" && (
            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground/60">
              <span>ZIP</span>
              <span>•</span>
              <span>TAR.GZ</span>
              <span>•</span>
              <span>Max 500MB</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
