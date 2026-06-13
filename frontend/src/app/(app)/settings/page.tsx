"use client";

import React, { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Cpu,
  Shield,
  Bell,
  Zap,
  Gauge,
  Search,
  Mail,
  MessageSquare,
  Webhook,
} from "lucide-react";

function SettingsPageContent() {
  const [scanMode, setScanMode] = useState<"quick" | "standard" | "deep">("deep");
  const [notifications, setNotifications] = useState({
    email: true,
    slack: false,
    webhook: true,
    criticalOnly: false,
  });

  const scanModes = [
    {
      id: "quick" as const,
      label: "Quick",
      description: "Fast surface-level scan. ~30 seconds.",
      icon: Zap,
    },
    {
      id: "standard" as const,
      label: "Standard",
      description: "Balanced analysis with dependency scanning. ~2 minutes.",
      icon: Gauge,
    },
    {
      id: "deep" as const,
      label: "Deep",
      description: "Full AI analysis with data flow tracing. ~5 minutes.",
      icon: Search,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure Agent Phantom
        </p>
      </motion.div>

      {/* Model Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass glow-purple p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            AI Model Configuration
          </h3>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-purple-500/10">
            <div className="p-3 rounded-xl gradient-primary">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Gemini 2.5 Flash</p>
              <p className="text-xs text-muted-foreground">
                State-of-the-art reasoning model for deep security analysis
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                ACTIVE
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Context Window", value: "128K tokens" },
              { label: "Response Time", value: "~2.3s avg" },
              { label: "Accuracy", value: "98.7%" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-lg bg-white/[0.02] border border-purple-500/5 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold mt-0.5 gradient-text">{stat.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Scan Modes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass glow-purple p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            Scan Mode
          </h3>
          <div className="space-y-2">
            {scanModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = scanMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => setScanMode(mode.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${
                    isActive ? "gradient-primary" : "bg-white/[0.05]"
                  }`}>
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {mode.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass glow-purple p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-yellow-400" />
            Notifications
          </h3>
          <div className="space-y-4">
            {[
              {
                key: "email" as const,
                label: "Email Notifications",
                description: "Get scan results and alerts via email",
                icon: Mail,
              },
              {
                key: "slack" as const,
                label: "Slack Integration",
                description: "Post scan results to your Slack channel",
                icon: MessageSquare,
              },
              {
                key: "webhook" as const,
                label: "Webhook Alerts",
                description: "Send scan data to your webhook endpoint",
                icon: Webhook,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.key}>
                  {idx > 0 && <Separator className="bg-purple-500/10" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.03]">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                </React.Fragment>
              );
            })}

            <Separator className="bg-purple-500/10" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Critical Alerts Only</p>
                <p className="text-xs text-muted-foreground">Only notify for critical severity findings</p>
              </div>
              <Switch
                checked={notifications.criticalOnly}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, criticalOnly: checked }))
                }
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-end"
      >
        <Button className="gradient-primary text-white border-0">
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
}


export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
