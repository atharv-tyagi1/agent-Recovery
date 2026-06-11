"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface SecurityGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
  className?: string;
}

export function SecurityGauge({
  score,
  maxScore = 100,
  size = 200,
  label = "Security Score",
  className = "",
}: SecurityGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 1;
        if (start <= score) {
          setAnimatedScore(start);
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const percentage = (animatedScore / maxScore) * 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return { stroke: "#10B981", glow: "rgba(16, 185, 129, 0.3)" };
    if (percentage >= 60) return { stroke: "#EAB308", glow: "rgba(234, 179, 8, 0.3)" };
    if (percentage >= 40) return { stroke: "#F97316", glow: "rgba(249, 115, 22, 0.3)" };
    return { stroke: "#EF4444", glow: "rgba(239, 68, 68, 0.3)" };
  };

  const color = getColor();

  return (
    <motion.div
      ref={ref}
      className={`relative inline-flex items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(124, 58, 237, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 1.5s ease-out",
            filter: `drop-shadow(0 0 8px ${color.glow})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: color.stroke }}>
          {animatedScore}
        </span>
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      </div>
    </motion.div>
  );
}
