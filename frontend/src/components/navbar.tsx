"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Bell, Search, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-purple-500/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scans, vulnerabilities..."
            className="pl-9 bg-white/[0.03] border-purple-500/10 h-9 text-sm focus:border-purple-500/30 focus:ring-purple-500/20"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-white/[0.05] transition-colors">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
