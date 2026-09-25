"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Shield,
  Award,
  Calendar,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import PhishingSimulator from "@/components/PhishingSimulator";
import TrainingModal from "@/components/TrainingModal";
import RiskScoreGauge from "@/components/RiskScoreGauge";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterAction, setFilterAction] = useState<"all" | "phishing" | "safe">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fallbackUser = {
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
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      let email = localStorage.getItem("user_email");
      let name = localStorage.getItem("user_name");

      if (!email) {
        email = "thejusshetty479@gmail.com";
        name = "Thejas Shetty";
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_name", name);
      }

      setUserEmail(email);
      setUserName(name || email.split("@")[0]);

      // Try local sandbox profile first
      const stored = localStorage.getItem("sandbox_user_profile");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(fallbackUser);
        }
      } else {
        setUser(fallbackUser);
      }
    }
  }, []);

  const fetchUser = async (email: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${email}`);
      if (res.data) {
        setUser(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("sandbox_user_profile", JSON.stringify(res.data));
        }
      }
    } catch (error) {
      // Backend offline: keep existing state
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUser(userEmail);
    }
  }, [userEmail]);

  const handleAnalysisComplete = (result: any) => {
    const updatedUser = { ...(user || fallbackUser) };
    updatedUser.phishing_attempts += 1;

    if (result.is_phishing) {
      updatedUser.failed_attempts += 1;
      updatedUser.risk_score = Math.min(100, updatedUser.risk_score + 15);
    } else if (result.new_risk_score !== null) {
      updatedUser.risk_score = Math.max(0, updatedUser.risk_score - 2);
    }

    const detailText = result.url_analysis && result.sender_analysis
      ? `Sender: ${result.sender_analysis.slice(0, 24)}... | URL: ${result.url_verification}`
      : "Profile link simulation test";

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

  const currentUser = user || fallbackUser;

  const filteredInteractions = (currentUser.interactions || []).filter((item: any) => {
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

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* Profile Header Card */}
      <div className="surface-card p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 text-primary-light font-black text-xl flex items-center justify-center shadow-lg shadow-primary/20">
              {userName ? (userName.slice(0, 2).toUpperCase()) : "TS"}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {userName || currentUser.name}
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {userEmail || currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/[0.06] text-xs text-slate-300">
            <Shield size={16} className="text-primary-light" />
            <span>Human Security Profile • Tier 1</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Risk Gauge */}
        <div className="surface-card p-6 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Human Risk Metric
            </span>
            <span className="text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md font-mono">
              Score: 0 - 100
            </span>
          </div>

          <RiskScoreGauge score={currentUser.risk_score} />

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300 block mb-1">Scoring Rules:</span>
            <span>• Phishing link clicked: <b className="text-rose-400">+15 Penalty</b></span><br/>
            <span>• Safe link interaction: <b className="text-emerald-400">-2 Reward</b></span><br/>
            <span>• Suspicious email reported: <b className="text-primary-light">-5 Safe Defense</b></span>
          </div>
        </div>

        {/* Column 2 & 3: Threat Simulator */}
        <div className="lg:col-span-2">
          <PhishingSimulator
            onAnalysisComplete={handleAnalysisComplete}
            userEmail={userEmail || currentUser.email}
          />
        </div>
      </div>

      {/* Vulnerability Logs Section */}
      <div className="surface-card p-6 border border-white/[0.08] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-bold text-white">Personal Threat History</h2>
            <p className="text-xs text-slate-400">Record of simulated scans and defensive actions</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-[#07080d] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => setFilterAction("all")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterAction === "all" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterAction("phishing")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterAction === "phishing" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                High Risk
              </button>
              <button
                onClick={() => setFilterAction("safe")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterAction === "safe" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Safe
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#07080d]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
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
                    {item.details}
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
                    No activity logs match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={analysisResult}
      />
    </div>
  );
}
