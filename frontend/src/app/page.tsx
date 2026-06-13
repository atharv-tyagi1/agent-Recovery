"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/particle-background";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  Ghost,
  Shield,
  Wrench,
  FileText,
  GitBranch,
  AlertTriangle,
  Code,
  ArrowRight,
  ChevronRight,
  Zap,
  Star,
} from "lucide-react";
import { features, testimonials, howItWorks, landingStats } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Wrench,
  FileText,
  GitBranch,
  AlertTriangle,
  Code,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">
      <ParticleBackground />

      {/* ── NAVBAR ── */}
      <nav className="relative z-20 border-b border-purple-500/10 bg-[#0A0A0A]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Ghost className="h-4 w-4 text-white" />
              </div>
              <div className="absolute inset-0 rounded-lg gradient-primary opacity-0 blur-md group-hover:opacity-60 transition-opacity" />
            </div>
            <span className="text-sm font-bold tracking-wide">AGENT PHANTOM</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="sm" className="gradient-primary text-white border-0 hover:opacity-90">
                Start Scan
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-xs text-purple-300 mb-8">
              <Zap className="h-3 w-3" />
              <span>Powered by Gemini 2.5 Flash</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="gradient-text">Your AI Security</span>
            <br />
            <span className="text-foreground">Engineer</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Analyze repositories. Detect vulnerabilities. Generate secure fixes.
            <br />
            Enterprise-grade AI security in seconds.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href="/upload">
              <Button size="lg" className="gradient-primary text-white border-0 h-12 px-8 text-sm font-semibold hover:opacity-90">
                Start Scan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/analysis">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm border-purple-500/20 hover:bg-purple-500/5 hover:border-purple-500/40">
                View Demo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Hero glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 py-16 border-y border-purple-500/10 bg-[#0A0A0A]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { label: "Repositories Analyzed", value: landingStats.repositoriesAnalyzed, suffix: "+" },
              { label: "Threats Detected", value: landingStats.threatsDetected, suffix: "+" },
              { label: "Reports Generated", value: landingStats.reportsGenerated, suffix: "+" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Security Superpowers for Your Code
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Agent Phantom combines cutting-edge AI with deep security expertise to protect your applications.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature, idx) => {
              const Icon = iconMap[feature.icon] || Shield;
              return (
                <motion.div key={idx} variants={item}>
                  <Card className="glass glow-purple p-6 h-full group hover:border-purple-500/30 transition-all duration-300 cursor-default">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/10 w-fit mb-4 group-hover:bg-purple-500/15 transition-colors">
                        <Icon className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="font-semibold mb-2 text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 border-t border-purple-500/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Five steps to bulletproof security.</p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-cyan-500/50 to-purple-500/50 hidden md:block" />

            <div className="space-y-8">
              {howItWorks.map((step, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="relative z-10 shrink-0">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ── */}
      <section className="relative z-10 py-24 px-6 border-t border-purple-500/10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-muted-foreground text-lg">A real-time security analysis of your codebase.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="glass glow-purple overflow-hidden">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-purple-500/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/[0.05] rounded-md px-3 py-1 text-xs text-muted-foreground font-mono">
                    app.agentphantom.ai/dashboard
                  </div>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {["Repos Scanned", "Files Analyzed", "Vulns Found", "Score"].map((label, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-purple-500/10">
                      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                      <p className="text-lg font-bold gradient-text">
                        {["1,247", "89,432", "3,891", "89"][i]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] rounded-lg p-4 border border-purple-500/10 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">89/100</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Security Score</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-4 border border-purple-500/10 h-32">
                    <p className="text-[10px] text-muted-foreground mb-2">Threat Distribution</p>
                    <div className="space-y-1.5">
                      {[
                        { label: "Critical", pct: "40%", color: "bg-red-500" },
                        { label: "High", pct: "30%", color: "bg-orange-500" },
                        { label: "Medium", pct: "20%", color: "bg-yellow-500" },
                        { label: "Low", pct: "10%", color: "bg-blue-500" },
                      ].map((t) => (
                        <div key={t.label} className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground w-10">{t.label}</span>
                          <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div className={`h-full ${t.color} rounded-full`} style={{ width: t.pct }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="relative z-10 py-24 px-6 border-t border-purple-500/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Security Teams</h2>
            <p className="text-muted-foreground text-lg">See what industry leaders say about Agent Phantom.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {testimonials.map((t, idx) => (
              <motion.div key={idx} variants={item}>
                <Card className="glass glow-purple p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-6 border-t border-purple-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Secure Your Code?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Start your first security scan in under 60 seconds. No credit card required.
            </p>
            <Link href="/upload">
              <Button size="lg" className="gradient-primary text-white border-0 h-14 px-12 text-base font-semibold hover:opacity-90">
                Start Free Scan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
          {/* CTA glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-purple-500/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Ghost className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wide">AGENT PHANTOM</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © 2025 Agent Phantom. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
