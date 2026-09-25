"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Terminal,
  Activity,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  Lock,
  Layers,
  ArrowUpRight
} from "lucide-react";
import PhishingSimulator from "@/components/PhishingSimulator";
import TrainingModal from "@/components/TrainingModal";
import RiskScoreGauge from "@/components/RiskScoreGauge";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>({
    name: "Thejas Shetty",
    email: "thejusshetty479@gmail.com",
    risk_score: 20,
    phishing_attempts: 3,
    failed_attempts: 1,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: true,
        details: "From: security@amazon00.com | Link: http://amazon00.com/login",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      },
      {
        action: "reported_phishing",
        is_phishing: false,
        details: "Reported: Urgent Account Verification Alert",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        action: "clicked_link",
        is_phishing: false,
        details: "From: shipping@amazon.in | Link: https://amazon.in/orders",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
      }
    ]
  });

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterAction, setFilterAction] = useState<"all" | "phishing" | "safe">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sandbox_user_profile");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          // keep fallback
        }
      } else {
        localStorage.setItem("sandbox_user_profile", JSON.stringify(user));
      }

      const activeEmail = localStorage.getItem("user_email");
      if (!activeEmail) {
        localStorage.setItem("user_email", "thejusshetty479@gmail.com");
        localStorage.setItem("user_name", "Thejas Shetty");
      }
    }
  }, []);

  const handleAnalysisComplete = (result: any) => {
    const updatedUser = { ...user };
    updatedUser.phishing_attempts += 1;

    if (result.is_phishing) {
      updatedUser.failed_attempts += 1;
      updatedUser.risk_score = Math.min(100, updatedUser.risk_score + 15);
    } else if (result.new_risk_score !== null) {
      updatedUser.risk_score = Math.max(0, updatedUser.risk_score - 2);
    }

    const detailText = result.url_analysis && result.sender_analysis
      ? `Sender: ${result.sender_analysis.slice(0, 24)}... | Link: ${result.url_verification}`
      : "Sandbox simulation test";

    updatedUser.interactions = [
      {
        action: result.new_risk_score === null ? "reported_phishing" : "clicked_link",
        is_phishing: !!result.is_phishing,
        details: detailText,
        timestamp: new Date().toISOString()
      },
      ...(updatedUser.interactions || [])
    ];

    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("sandbox_user_profile", JSON.stringify(updatedUser));
    }

    if (result.classification) {
      setAnalysisResult(result);
      setIsModalOpen(true);
    }
  };

  const filteredInteractions = (user.interactions || []).filter((item: any) => {
    if (filterAction === "phishing" && !item.is_phishing) return false;
    if (filterAction === "safe" && item.is_phishing) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.details?.toLowerCase().includes(q) ||
        item.action?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* Cyber Threat Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0e111d] to-[#08090e] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary-light text-xs font-semibold self-start shadow-sm">
              <Sparkles size={13} />
              <span>Multi-Vector AI Threat Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Real-Time Phishing Simulation &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary-light to-cyan-400">Human Risk Scoring</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Analyze deceptive emails, calculate Levenshtein typosquatting distances, detect unencrypted IP redirects, and quantify employee cyber vulnerability in an isolated sandbox.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 self-stretch sm:self-auto shrink-0">
            <Link
              href="/dashboard"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95"
            >
              <Activity size={15} />
              <span>My Risk Profile</span>
            </Link>
            <Link
              href="/admin"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 text-xs font-bold px-5 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <Shield size={15} />
              <span>Admin SOC</span>
            </Link>
          </div>
        </div>

        {/* Feature Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Levenshtein Distance Engine</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Scikit-Learn NLP Classifier</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-primary-light"></span>
            <span>Gemini Guided Explanations</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Dynamic Human Risk Index</span>
          </div>
        </div>
      </section>

      {/* Main Sandbox Interactive Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Risk Score & Defensive Metrics */}
        <div className="flex flex-col gap-6">

          {/* Risk Score Card */}
          <div className="surface-card p-6 border border-white/[0.08] flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-2">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Live Risk Assessment
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                Live Sync
              </span>
            </div>

            <RiskScoreGauge score={user.risk_score} />
          </div>

          {/* Defense Metrics Breakdown */}
          <div className="surface-card p-6 border border-white/[0.08] flex flex-col gap-4 shadow-2xl">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Defensive Telemetry
            </span>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ShieldAlert size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Phishing Traps Hit</span>
                    <span className="text-[10px] text-slate-400">Clicked malicious embeds</span>
                  </div>
                </div>
                <span className="text-base font-black font-mono text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                  {user.failed_attempts}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Safe Confirmations</span>
                    <span className="text-[10px] text-slate-400">Verified official links</span>
                  </div>
                </div>
                <span className="text-base font-black font-mono text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                  {(user.interactions || []).filter((i: any) => !i.is_phishing).length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary-light border border-primary/20">
                    <TrendingUp size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Total Scans Executed</span>
                    <span className="text-[10px] text-slate-400">Sandbox simulations</span>
                  </div>
                </div>
                <span className="text-base font-black font-mono text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                  {(user.interactions || []).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Threat Simulator */}
        <div className="lg:col-span-2">
          <PhishingSimulator
            onAnalysisComplete={handleAnalysisComplete}
            userEmail={user.email}
          />
        </div>
      </section>

      {/* Vulnerability Telemetry Audit Log */}
      <section className="surface-card p-6 border border-white/[0.08] shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary-light border border-primary/20">
              <Terminal size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-snug">
                Vulnerability Telemetry Log
              </h2>
              <p className="text-xs text-slate-400">
                Audit trail of recent link clicks, heuristic scans, and phishing reports
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-[#07080d] border border-white/[0.08] focus:border-primary/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => setFilterAction("all")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterAction === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterAction("phishing")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterAction === "phishing"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                High Risk
              </button>
              <button
                onClick={() => setFilterAction("safe")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterAction === "safe"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Safe
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#07080d]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Telemetry Details</th>
                <th className="py-3 px-4 text-center">Threat Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredInteractions.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200 capitalize">
                    {item.action?.replace("_", " ") || "Interaction"}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 truncate max-w-sm">
                    {item.details || "Simulation event recorded"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.is_phishing ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[10px] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        High Threat
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Safe Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredInteractions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                    No activity logs match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Threat Training Modal */}
      <TrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={analysisResult}
      />
    </div>
  );
}
