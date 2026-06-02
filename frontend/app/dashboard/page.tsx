"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Activity, ShieldAlert, ShieldCheck, TrendingUp, AlertCircle, ArrowUpRight, LogOut } from "lucide-react";
import PhishingSimulator from "@/components/PhishingSimulator";
import TrainingModal from "@/components/TrainingModal";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_email");
      if (stored) {
        setUserEmail(stored);
      } else {
        // Redirect to login if no active session
        window.location.href = "/login";
      }
    }
  }, []);

  const fetchUser = async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userEmail}`);
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUser();
    }
  }, [userEmail]);

  const handleAnalysisComplete = (result: any) => {
    if (result.new_risk_score !== null) {
      fetchUser();
    }
    if (result.classification) {
      setAnalysisResult(result);
      setIsModalOpen(true);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      window.location.href = "/login";
    }
  };

  const getRiskCardStyle = (score: number) => {
    if (score <= 30) {
      return {
        borderColor: "border-success/30",
        shadow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
        bg: "bg-success/5",
        text: "text-success",
        badge: "Safe / Low Risk"
      };
    }
    if (score <= 70) {
      return {
        borderColor: "border-warning/30",
        shadow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
        bg: "bg-warning/5",
        text: "text-warning",
        badge: "Suspicious / Medium Risk"
      };
    }
    return {
      borderColor: "border-danger/30",
      shadow: "shadow-[0_0_40px_rgba(244,63,94,0.25)]",
      bg: "bg-danger/5",
      text: "text-danger animate-pulse-glow",
      badge: "Vulnerable / High Risk"
    };
  };

  const cardStyle = user ? getRiskCardStyle(user.risk_score) : {
    borderColor: "border-white/10",
    shadow: "shadow-2xl",
    bg: "bg-white/5",
    text: "text-gray-400",
    badge: "Calculating..."
  };

  return (
    <div className="flex flex-col gap-8 animate-slide-up select-none max-w-7xl mx-auto">
      
      {/* Premium Apple Header */}
      <header className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-2">
            Security Command Center
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm md:text-base font-medium">
            Welcome back, <span className="text-white font-bold">{user ? user.name : "Agent"}</span>. Monitor your personal human threat vulnerability and practice defensive digital habits.
          </p>
        </div>
        
        {/* Dynamic status pill & logout */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs font-semibold text-gray-300 backdrop-blur-md">
            <span className={`w-2.5 h-2.5 rounded-full ${user ? (user.risk_score > 70 ? 'bg-danger animate-pulse' : user.risk_score > 30 ? 'bg-warning' : 'bg-success') : 'bg-gray-600'}`}></span>
            Active Session
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-300"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Risk Score Card (Circular Dial Facelift) */}
        <div className={`glass-panel p-8 flex flex-col items-center justify-between text-center border bg-black/40 rounded-3xl relative overflow-hidden group min-h-[380px] ${cardStyle.borderColor} ${cardStyle.shadow}`}>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
          
          <div className="flex flex-col items-center gap-1.5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle size={15} /> Human Risk Assessment
            </h3>
            <p className="text-xs text-gray-500">Real-time risk scoring evaluation</p>
          </div>
          
          <div className="my-6 relative flex items-center justify-center w-40 h-40">
            <div className={`absolute inset-0 rounded-full border-2 border-dashed opacity-25 ${user ? (user.risk_score > 70 ? 'border-danger animate-spin [animation-duration:20s]' : user.risk_score > 30 ? 'border-warning' : 'border-success') : 'border-gray-700'}`}></div>
            <div className={`absolute inset-3 rounded-full border border-white/5 bg-black/50 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]`}></div>
            
            <div className="z-10 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-white tracking-tighter leading-none drop-shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
                {user ? user.risk_score : "--"}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">out of 100</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-[0.25em] px-4.5 py-1.5 rounded-full bg-white/5 border border-white/10 ${cardStyle.text}`}>
              {cardStyle.badge}
            </span>
          </div>
        </div>

        {/* 2. Security Metrics Stats Card */}
        <div className="glass-panel p-8 bg-black/40 border border-white/10 rounded-3xl flex flex-col justify-between gap-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] min-h-[380px] hover:border-white/15 transition-all">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={15} className="text-primary" /> Defensive Metrics
            </h3>
            <p className="text-xs text-gray-500">Live interaction diagnostics breakdown</p>
          </div>
          
          <div className="flex flex-col gap-4.5">
            <div className="flex items-center justify-between group py-1.5">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-danger/10 text-danger border border-danger/20 rounded-xl group-hover:bg-danger/20 transition-all duration-300">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-200 block group-hover:text-white transition-colors">Phishing Traps Hit</span>
                  <span className="text-xs text-gray-500">Simulated links clicked in error</span>
                </div>
              </div>
              <span className="font-extrabold text-2xl text-white font-mono bg-black/40 border border-white/5 px-3 py-1 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                {user ? user.failed_attempts : "--"}
              </span>
            </div>
            
            <hr className="border-white/5" />
            
            <div className="flex items-center justify-between group py-1.5">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-success/10 text-success border border-success/20 rounded-xl group-hover:bg-success/20 transition-all duration-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-200 block group-hover:text-white transition-colors">Safe Confirmations</span>
                  <span className="text-xs text-gray-500">Safe elements identified correctly</span>
                </div>
              </div>
              <span className="font-extrabold text-2xl text-white font-mono bg-black/40 border border-white/5 px-3 py-1 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                {user ? (user.interactions?.filter((i: any) => !i.is_phishing).length || 0) : "--"}
              </span>
            </div>
            
            <hr className="border-white/5" />
            
            <div className="flex items-center justify-between group py-1.5">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl group-hover:bg-primary/20 transition-all duration-300">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-200 block group-hover:text-white transition-colors">Total Interactions</span>
                  <span className="text-xs text-gray-500">Scan & reporting transactions</span>
                </div>
              </div>
              <span className="font-extrabold text-2xl text-white font-mono bg-black/40 border border-white/5 px-3 py-1 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                {user ? user.interactions?.length : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Phishing Simulator */}
        <div className="lg:col-span-1">
          <PhishingSimulator onAnalysisComplete={handleAnalysisComplete} userEmail={userEmail} />
        </div>
      </div>

      {/* 4. Activity Log */}
      <div className="glass-panel p-8 bg-black/40 border border-white/10 rounded-3xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] hover:border-white/15 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 text-gray-300 rounded-xl border border-white/10 shadow-lg">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Vulnerability Logs</h2>
              <p className="text-xs text-gray-400">Chronological history of defensive actions and security scans</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5">
            Audit Ready <ArrowUpRight size={13} />
          </span>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/35 shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/10 text-gray-400 text-xs font-bold tracking-wider uppercase">
                <th className="py-4.5 px-6 font-bold">Transaction Time</th>
                <th className="py-4.5 px-6 font-bold">Action Event</th>
                <th className="py-4.5 px-6 font-bold">Transaction Details</th>
                <th className="py-4.5 px-6 font-bold">Security Status</th>
              </tr>
            </thead>
            <tbody>
              {user?.interactions?.slice().reverse().map((interaction: any, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6 text-xs text-gray-400 font-mono">
                    {new Date(interaction.timestamp).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm capitalize font-bold text-gray-200 group-hover:text-primary transition-colors">
                    {interaction.action.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-400 font-mono truncate max-w-xs group-hover:text-gray-200 transition-colors">
                    {interaction.details}
                  </td>
                  <td className="py-4 px-6">
                    {interaction.is_phishing ? (
                      <span className="text-[10px] px-3 py-1.5 rounded-full bg-danger/10 text-danger border border-danger/20 font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(244,63,94,0.08)]">
                        High Risk
                      </span>
                    ) : (
                      <span className="text-[10px] px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/20 font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.08)]">
                        Safe Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!user?.interactions || user.interactions.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-gray-500 italic">No vulnerability log history registered.</td>
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
