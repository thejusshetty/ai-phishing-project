"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Globe,
  BookOpen,
  X,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export default function TrainingModal({ isOpen, onClose, result }: TrainingModalProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (isOpen && result) {
      setAnimatedScore(0);
      const timer = setTimeout(() => {
        setAnimatedScore(result.confidence_score || 0);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const isPhishing = result.is_phishing;
  const isSuspicious = result.classification === "Suspicious";

  let statusConfig = {
    title: "Safe Interaction Verified",
    subtitle: "No malicious threat patterns or typosquatting detected.",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    headerBg: "bg-emerald-500/10 border-emerald-500/20",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-400",
    icon: ShieldCheck,
  };

  if (isPhishing) {
    statusConfig = {
      title: "Security Threat: Phishing Attack Detected",
      subtitle: "High probability malicious communication engineered to steal data or credentials.",
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      headerBg: "bg-rose-500/10 border-rose-500/20",
      barColor: "bg-rose-500",
      textColor: "text-rose-400",
      icon: ShieldAlert,
    };
  } else if (isSuspicious) {
    statusConfig = {
      title: "Caution: Suspicious Elements Flagged",
      subtitle: "Unverified domain or manipulation keywords detected.",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      headerBg: "bg-amber-500/10 border-amber-500/20",
      barColor: "bg-amber-500",
      textColor: "text-amber-400",
      icon: AlertTriangle,
    };
  }

  const StatusIcon = statusConfig.icon;

  const getSenderBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">Verified Official</span>;
      case "Suspicious":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase">Impersonation</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">Unverified Domain</span>;
    }
  };

  const getUrlBadge = (status: string) => {
    switch (status) {
      case "Safe":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">Safe Domain</span>;
      case "Typosquatting":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase">Typosquatting</span>;
      case "Malicious":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase">Raw IP Address</span>;
      case "Suspicious":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">Suspicious Link</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/30 uppercase">Unverified</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="surface-card w-full max-w-2xl bg-[#0c0e17] border border-white/[0.12] rounded-2xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">

        {/* Header Banner */}
        <div className={`p-4 sm:p-5 flex items-start justify-between border-b ${statusConfig.headerBg}`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl bg-black/40 border border-white/[0.08] ${statusConfig.textColor}`}>
              <StatusIcon size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {statusConfig.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {statusConfig.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 text-slate-300">

          {/* Threat Metric Bar */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                Calculated Threat Probability
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-2xl font-black ${statusConfig.textColor}`}>
                  {result.classification || "Scanned"}
                </span>
                <span className="text-xs text-slate-400 font-mono font-semibold">
                  ({animatedScore.toFixed(1)}% Threat Score)
                </span>
              </div>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span>Safe (0%)</span>
                <span>High Threat (100%)</span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/[0.05]">
                <div
                  className={`h-full ${statusConfig.barColor} transition-all duration-700 ease-out rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(5, animatedScore))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Forensic Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Sender Domain Analysis */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Mail size={14} className="text-primary-light" />
                  <span>Sender Authenticity</span>
                </div>
                {getSenderBadge(result.sender_verification)}
              </div>
              <p className="text-xs text-slate-400 bg-black/40 p-2.5 rounded-lg border border-white/[0.04] leading-relaxed">
                {result.sender_analysis || "Standard domain format analyzed."}
              </p>
            </div>

            {/* URL & Link Analysis */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Globe size={14} className="text-primary-light" />
                  <span>Destination Link Scan</span>
                </div>
                {getUrlBadge(result.url_verification)}
              </div>
              <p className="text-xs text-slate-400 bg-black/40 p-2.5 rounded-lg border border-white/[0.04] leading-relaxed font-mono">
                {result.url_analysis || "No destination URL was present."}
              </p>
            </div>
          </div>

          {/* Urgency Trigger Keywords */}
          {result.suspicious_words && result.suspicious_words.length > 0 && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Psychological Manipulation Keywords Detected:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.suspicious_words.map((word: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25"
                  >
                    "{word}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Educational AI Insight & Training */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3 items-start">
            <div className="p-2 rounded-lg bg-primary/20 text-primary-light shrink-0">
              <Lightbulb size={18} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-primary-light flex items-center gap-1">
                <Sparkles size={12} /> Defensive Cyber Training Tip
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {result.ai_explanation ||
                  (isPhishing
                    ? "Never click links from unexpected emails asking for urgent credential verification. Always navigate directly to the official website in a separate tab."
                    : "Legitimate organizations communicate using verified corporate domains over HTTPS. Keep inspecting sender headers regularly.")}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-1.5"
          >
            <span>Acknowledge & Continue</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
