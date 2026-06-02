"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Activity, ShieldAlert, ShieldCheck, TrendingUp, AlertCircle, ArrowUpRight, Shield, Terminal, Globe, Award, Sparkles, ChevronRight, Lock, HelpCircle, AlertTriangle } from "lucide-react";
import PhishingSimulator from "@/components/PhishingSimulator";
import TrainingModal from "@/components/TrainingModal";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"home" | "dashboard">("home");
  
  const [user, setUser] = useState<any>({
    name: "Thejus Shetty",
    email: "thejusshetty479@gmail.com",
    risk_score: 15,
    phishing_attempts: 2,
    failed_attempts: 1,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: true,
        details: "From: support@amazon00.com | Link: http://amazon00.com/login",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        action: "clicked_link",
        is_phishing: false,
        details: "From: shipping@amazon.in | Link: https://amazon.in/orders",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      }
    ]
  });

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // Pre-initialize session
      localStorage.setItem("user_email", "thejusshetty479@gmail.com");
      localStorage.setItem("user_name", "Thejus Shetty");
      
      const storedUser = localStorage.getItem("sandbox_user_profile");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        localStorage.setItem("sandbox_user_profile", JSON.stringify(user));
      }
    }
  }, []);

  const handleAnalysisComplete = (result: any) => {
    const updatedUser = { ...user };
    updatedUser.phishing_attempts += 1;
    
    if (result.is_phishing) {
      updatedUser.failed_attempts += 1;
      updatedUser.risk_score = Math.min(100, updatedUser.risk_score + 15);
    } else {
      updatedUser.risk_score = Math.max(0, updatedUser.risk_score - 2);
    }

    const details = result.url_analysis && result.sender_analysis 
      ? `From: ${result.sender_analysis.substring(0, 30)}... | Scan: ${result.url_verification}`
      : "Sandbox Simulation Link Scan";

    updatedUser.interactions.push({
      action: "clicked_link",
      is_phishing: result.is_phishing,
      details: details,
      timestamp: new Date().toISOString()
    });

    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("sandbox_user_profile", JSON.stringify(updatedUser));
    }

    if (result.classification) {
      setAnalysisResult(result);
      setIsModalOpen(true);
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

  const cardStyle = getRiskCardStyle(user.risk_score);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-slide-up select-none max-w-7xl mx-auto">
      
      {/* Dynamic Navbar Unifying the Apple Aesthetic */}
      <nav className="glass-panel px-6 py-4 flex items-center justify-between border border-white/10 bg-black/50 backdrop-blur-xl rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 text-primary group cursor-pointer" onClick={() => setView("home")}>
          <Shield size={30} className="animate-pulse-glow group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            PhishGuard<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">AI</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView("home")} 
            className={`font-bold text-xs uppercase tracking-wider transition-all duration-300 ${view === "home" ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-gray-400 hover:text-white'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setView("dashboard")} 
            className={`font-bold text-xs uppercase tracking-wider transition-all duration-300 ${view === "dashboard" ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-gray-400 hover:text-white'}`}
          >
            Sandbox Command
          </button>
          
          <div className="flex items-center gap-2.5 ml-2 border-l border-white/10 pl-5">
            <div 
              title="Agent: Thejus Shetty [Clearance Level 5]"
              className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 text-primary text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              TS
            </div>
          </div>
        </div>
      </nav>

      {/* VIEW 1: PRE-LAUNCH HOME PAGE */}
      {view === "home" && (
        <div className="flex flex-col gap-16 py-8 animate-slide-up">
          <section className="text-center flex flex-col items-center gap-6 relative">
            <div className="absolute -top-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-300 tracking-wider uppercase backdrop-blur-md shadow-lg">
              <Sparkles size={12} className="text-blue-400 animate-spin [animation-duration:8s]" /> Powered by State-of-the-Art Gemini AI
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 max-w-4xl mt-3">
              Next-Gen Human Risk & Phishing Defense
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mt-2">
              Train your organization, scan suspicious embeds in a secure sandbox, and evaluate dynamic human vulnerability with advanced threat intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 z-10">
              <button 
                onClick={() => setView("dashboard")}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold px-8 py-4.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(59,130,246,0.35)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all duration-300 active:scale-[0.98] text-sm uppercase tracking-wider"
              >
                Enter Threat Sandbox Command
                <ChevronRight size={16} />
              </button>
            </div>
          </section>

          {/* Quick Metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 text-center border-white/5 bg-black/35 rounded-2xl">
              <div className="text-3xl font-black text-white font-mono">99.9%</div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">Detection Accuracy</p>
            </div>
            <div className="glass-panel p-6 text-center border-white/5 bg-black/35 rounded-2xl">
              <div className="text-3xl font-black text-white font-mono">&lt; 50ms</div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">Scanning Latency</p>
            </div>
            <div className="glass-panel p-6 text-center border-white/5 bg-black/35 rounded-2xl">
              <div className="text-3xl font-black text-white font-mono">Real-Time</div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">Telemetry Feed</p>
            </div>
            <div className="glass-panel p-6 text-center border-white/5 bg-black/35 rounded-2xl">
              <div className="text-3xl font-black text-white font-mono">100%</div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">Privacy Sandboxed</p>
            </div>
          </section>

          {/* Luxury Feature Showcase */}
          <section className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="glass-panel p-8 bg-black/40 border border-white/10 rounded-3xl flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-lg"><Terminal size={22} /></div>
                <h3 className="text-xl font-bold text-white mt-1">Sandboxed Inbox Simulator</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Safely paste suspicious email contents, destination links, and sender addresses. Test interactions inside our sandboxed scanning environment without risking credentials.
                </p>
              </div>

              <div className="glass-panel p-8 bg-black/40 border border-white/10 rounded-3xl flex flex-col gap-4 relative overflow-hidden group hover:border-danger/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger border border-danger/20 flex items-center justify-center shadow-lg"><AlertTriangle size={22} /></div>
                <h3 className="text-xl font-bold text-white mt-1">Levenshtein Typosquatting Checker</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Catches spelling alterations (e.g. `11flipkart.com`, `amzon.com`) mimicking global brands. Analyzes domain structure and segments to isolate impersonation indicators.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* VIEW 2: ACTIVE SANDBOX COMMAND CENTER DASHBOARD */}
      {view === "dashboard" && (
        <div className="flex flex-col gap-8 animate-slide-up">
          
          {/* Top Security Operations WORK BANNER */}
          <div className="w-full bg-[#0b0c16] border border-primary/30 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/30 shrink-0">
                <Terminal size={18} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block mb-0.5">Operational Sandboxed Gate</span>
                <h4 className="text-sm font-bold text-white font-mono tracking-tight uppercase">
                  Terminal: SECURE SCANS Feed // Agent: TS-479 (Thejus Shetty)
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-4.5 font-mono text-[10px] text-gray-400 flex-wrap">
              <div><span className="text-primary font-bold">CLEARANCE:</span> LEVEL 5</div>
              <div className="hidden sm:block"><span className="text-primary font-bold">STATUS:</span> ACTIVE SANDBOX</div>
              <div><span className="text-primary font-bold">LOG FEED:</span> MONITORED</div>
            </div>
          </div>

          <header className="mb-2">
            <h2 className="text-3xl font-black text-white">Security Workspace</h2>
            <p className="text-gray-400 mt-1 text-sm font-medium">
              Run real-time scans on links or emails. Track your personal telemetry logs below.
            </p>
          </header>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Risk Card */}
            <div className={`glass-panel p-8 flex flex-col items-center justify-between text-center border bg-black/40 rounded-3xl relative overflow-hidden group min-h-[380px] ${cardStyle.borderColor} ${cardStyle.shadow}`}>
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="flex flex-col items-center gap-1.5">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle size={15} /> Human Risk Assessment
                </h3>
                <p className="text-xs text-gray-500">Real-time risk scoring evaluation</p>
              </div>
              
              <div className="my-6 relative flex items-center justify-center w-40 h-40">
                <div className={`absolute inset-0 rounded-full border-2 border-dashed opacity-25 ${user.risk_score > 70 ? 'border-danger animate-spin [animation-duration:20s]' : user.risk_score > 30 ? 'border-warning' : 'border-success'}`}></div>
                <div className={`absolute inset-3 rounded-full border border-white/5 bg-black/50 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]`}></div>
                
                <div className="z-10 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-white tracking-tighter leading-none drop-shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
                    {user.risk_score}
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

            {/* Stats Metrics Card */}
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
                    {user.failed_attempts}
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
                    {user.interactions?.filter((i: any) => !i.is_phishing).length || 0}
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
                    {user.interactions?.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Phishing Simulator Scanner */}
            <div className="lg:col-span-1">
              <PhishingSimulator onAnalysisComplete={handleAnalysisComplete} userEmail={user.email} />
            </div>
          </div>

          {/* Activity Log */}
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
                  {user.interactions?.slice().reverse().map((interaction: any, i: number) => (
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
                  {(!user.interactions || user.interactions.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-sm text-gray-500 italic">No vulnerability log history registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Security Threat Assessment modal overlay */}
      <TrainingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        result={analysisResult} 
      />

    </div>
  );
}
