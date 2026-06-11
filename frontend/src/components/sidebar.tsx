"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Shield,
  FolderGit2,
  FileBarChart,
  Settings,
  Ghost,
  Search,
  Code,
  BookOpen,
  CheckCircle,
  Wrench,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/upload", label: "Repositories", icon: FolderGit2 },
      { href: "/results", label: "Scans", icon: Shield },
    ],
  },
  {
    label: "Investigation",
    items: [
      { href: "/investigation", label: "Investigation", icon: Search },
      { href: "/repository", label: "Explorer", icon: Code },
      { href: "/fixes", label: "Fixes", icon: Wrench },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/scan-complete", label: "Completion", icon: CheckCircle },
      { href: "/report", label: "Reports", icon: FileBarChart },
      { href: "/knowledge", label: "Knowledge", icon: BookOpen },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#0D0D15] border-r border-purple-500/10 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Ghost className="h-5 w-5 text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl gradient-primary opacity-50 blur-md group-hover:opacity-80 transition-opacity" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">AGENT PHANTOM</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider">AI SECURITY</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? "text-white bg-purple-500/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-purple-500"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <Icon className={`h-4 w-4 ${isActive ? "text-purple-400" : ""}`} />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Agent Status */}
      <div className="p-4 border-t border-purple-500/10 mx-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <div>
            <p className="text-xs font-medium">Agent Status</p>
            <p className="text-[10px] text-emerald-400 font-medium">ONLINE</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
