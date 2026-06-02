"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, BookOpen, XCircle, ShieldAlert, ShieldCheck, Mail, Globe, CheckCircle, HelpCircle } from 'lucide-react';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export default function TrainingModal({ isOpen, onClose, result }: TrainingModalProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (isOpen && result) {
      setAnimatedProgress(0);
      const timer = setTimeout(() => {
        setAnimatedProgress(result.confidence_score || 0);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const isPhishing = result.is_phishing;
  const isSuspicious = result.classification === "Suspicious";
  
  // Theme styling based on classification
  let headerBg = "bg-success/15 border-success/30 text-success";
  let progressColor = "bg-success";
  let statusIcon = <ShieldCheck className="text-success animate-bounce" size={24} />;
  
  if (isPhishing) {
    headerBg = "bg-danger/15 border-danger/30 text-danger";
    progressColor = "bg-danger";
    statusIcon = <ShieldAlert className="text-danger animate-pulse" size={24} />;
  } else if (isSuspicious) {
    headerBg = "bg-warning/15 border-warning/30 text-warning";
    progressColor = "bg-warning";
    statusIcon = <AlertTriangle className="text-warning" size={24} />;
  }

  // Get status badges
  const getSenderBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <span className="text-[10px] px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.15)]">Verified Brand</span>;
      case 'Suspicious':
        return <span className="text-[10px] px-2.5 py-1 rounded-full bg-danger/10 text-danger border border-danger/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(244,63,94,0.15)]">Suspicious Fake</span>;
      default:
        return <span className="text-[10px] px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.15)]">Unverified Domain</span>;
    }
  };

  const getUrlBadge = (status: string) => {
    switch (status) {
      case 'Safe':
        return <span className="text-[10px] px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.15)]">Safe Link</span>;
      case 'Typosquatting':
        return <span className="text-[10px] px-2.5 py-1 rounded-full bg-danger/10 text-danger border border-danger/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(244,63,94,0.15)]">Typosquatting</span>;
      case 'Malicious':
        return <span className="text-[10px] px-2.5 py-1 rounded-full bg-danger/10 text-danger border border-danger/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(244,63,94,0.15)]">Malicious IP</span>;
      case 'Suspicious':
        return <span className="text-[10px] px-2.5 py-1 rounded-full bg-danger/10 text-danger border border-danger/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(244,63,94,0.15)]">Suspicious URL</span>;
      default:
        return <span className="text-[10px] px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.15)]">Unverified</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-2xl bg-gradient-to-b from-[#0e0e16] to-[#06060c] border border-white/10 rounded-3xl overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.9)] animate-slide-up duration-300 relative flex flex-col">
        
        {/* Dynamic header */}
        <div className={`p-5 flex items-center justify-between border-b border-white/5 ${headerBg}`}>
          <div className="flex items-center gap-3">
            {statusIcon}
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {isPhishing ? "Security Alert: Phishing Detected" : isSuspicious ? "Warning: Highly Suspicious" : "Verification: Safe Interaction"}
              </h3>
              <p className="text-xs opacity-75">Sandboxed Phishing Diagnostics Assessment</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
          
          {/* Big Risk Indicator */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Calculated Threat Level</h4>
              <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                <span className={`text-4xl ${isPhishing ? 'text-danger' : isSuspicious ? 'text-warning' : 'text-success'}`}>
                  {result.classification}
                </span>
                <span className="text-gray-400 text-lg">({result.confidence_score}%)</span>
              </div>
            </div>
            
            {/* Elegant progress meter */}
            <div className="w-full md:w-1/2 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <span>Safe</span>
                <span>Highly Dangerous</span>
              </div>
              <div className="w-full h-3 bg-black/60 border border-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${progressColor} transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]`}
                  style={{ width: `${animatedProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Security Diagnostics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sender email analysis */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors flex flex-col gap-3.5 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-gray-300">
                  <Mail size={16} className="text-primary group-hover:scale-110 transition-transform" />
                  <span>Sender Verification</span>
                </div>
                {getSenderBadge(result.sender_verification)}
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-gray-400 min-h-[50px] flex items-center">
                {result.sender_analysis || "No sender email analysis was triggered."}
              </div>
            </div>

            {/* URL/Link analysis */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors flex flex-col gap-3.5 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-gray-300">
                  <Globe size={16} className="text-primary group-hover:scale-110 transition-transform" />
                  <span>Destination URL Scan</span>
                </div>
                {getUrlBadge(result.url_verification)}
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-gray-400 min-h-[50px] flex items-center font-mono">
                {result.url_analysis || "No URL analysis was triggered."}
              </div>
            </div>
          </div>

          {/* Suspicious Keywords */}
          {result.suspicious_words && result.suspicious_words.length > 0 && (
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2.5">
                Urgency & Manipulation Indicators Found:
              </span>
              <div className="flex gap-2.5 flex-wrap">
                {result.suspicious_words.map((word: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-warning/10 text-warning text-xs font-semibold rounded-lg border border-warning/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]">
                    "{word}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gemini AI explanation */}
          {isPhishing && (
            <div className="bg-gradient-to-tr from-primary/10 to-purple-600/10 border border-primary/20 rounded-2xl p-5 md:p-6 flex gap-4 items-start relative overflow-hidden shadow-[0_12px_30px_rgba(99,102,241,0.1)] group">
              {/* background glow */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="p-2.5 bg-primary/20 text-primary rounded-xl border border-primary/30 shrink-0 group-hover:rotate-6 transition-transform">
                <BookOpen size={20} className="text-blue-400" />
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3.5 flex-wrap">
                  <h4 className="font-extrabold text-sm text-blue-300 tracking-tight">✨ AI Security Insight</h4>
                  {result.ai_explanation && (
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-0.5 rounded-md shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
                      Gemini Guided Training
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-normal">
                  {result.ai_explanation 
                    ? result.ai_explanation 
                    : "Always verify the sender's email address and hover over links before clicking. Look out for urgent language designed to make you panic."}
                </p>
              </div>
            </div>
          )}

          {/* Apple-style Action Close */}
          <button 
            onClick={onClose}
            className="w-full mt-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-all duration-300 active:scale-[0.99] text-sm uppercase tracking-wider border border-white/5 hover:border-white/10"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
