"use client";

import { AlertCircle, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

interface RiskScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function RiskScoreGauge({ score, size = "md" }: RiskScoreGaugeProps) {
  // Determine risk category
  let riskLevel = "Safe / Low Risk";
  let strokeColor = "#10b981"; // success green
  let glowColor = "rgba(16, 185, 129, 0.25)";
  let badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let textColor = "text-emerald-400";
  let Icon = ShieldCheck;

  if (score > 70) {
    riskLevel = "Vulnerable / High Risk";
    strokeColor = "#f43f5e"; // danger red
    glowColor = "rgba(244, 63, 94, 0.35)";
    badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse";
    textColor = "text-rose-400";
    Icon = ShieldAlert;
  } else if (score > 30) {
    riskLevel = "Suspicious / Medium Risk";
    strokeColor = "#f59e0b"; // warning amber
    glowColor = "rgba(245, 158, 11, 0.25)";
    badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    textColor = "text-amber-400";
    Icon = AlertTriangle;
  }

  // SVG circle calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-5 text-center relative">
      {/* Circle Gauge */}
      <div className="relative flex items-center justify-center w-36 h-36">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
          {/* Background track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-white/[0.06]"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated score indicator */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
            {score}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
            Risk Index
          </span>
        </div>
      </div>

      {/* Dynamic Badge */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeClass} flex items-center gap-1.5`}>
          <Icon size={12} />
          {riskLevel}
        </span>
      </div>

      <p className="text-[11px] text-slate-500 mt-2 max-w-[200px] leading-relaxed">
        {score <= 30
          ? "Good security hygiene. Defensive actions awarded."
          : score <= 70
          ? "Moderate vulnerability detected. Exercise caution on links."
          : "Elevated risk. High propensity to click unverified phishing embeds."}
      </p>
    </div>
  );
}
