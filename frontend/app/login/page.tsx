"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Mail, User, Sparkles, AlertCircle, ArrowRight, KeyRound } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_email");
      if (stored) {
        // user already has session
      }
    }
  }, []);

  const handleDemoLogin = () => {
    const demoEmail = "thejusshetty479@gmail.com";
    const demoName = "Thejas Shetty";
    if (typeof window !== "undefined") {
      localStorage.setItem("user_email", demoEmail);
      localStorage.setItem("user_name", demoName);
      window.location.href = "/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg("");
    setIsLoading(true);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/${isLogin ? 'login' : 'register'}`;
      const payload = isLogin ? { email } : { name, email };

      const res = await axios.post(url, payload);

      if (res.data && res.data.email) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user_email", res.data.email);
          localStorage.setItem("user_name", res.data.name || res.data.email.split("@")[0]);
          localStorage.setItem("sandbox_user_profile", JSON.stringify(res.data));
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        // Fallback offline sign in/up for seamless demo operation
        if (typeof window !== "undefined") {
          const fallbackProfile = {
            name: name || email.split("@")[0],
            email: email.toLowerCase().trim(),
            risk_score: 15,
            phishing_attempts: 0,
            failed_attempts: 0,
            interactions: []
          };
          localStorage.setItem("user_email", email);
          localStorage.setItem("user_name", fallbackProfile.name);
          localStorage.setItem("sandbox_user_profile", JSON.stringify(fallbackProfile));
          window.location.href = "/dashboard";
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="surface-card w-full max-w-md p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 text-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield size={22} />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
            PhishGuard <span className="text-primary-light">AI</span>
          </h2>
          <p className="text-xs text-slate-400">
            Security Command Center Authorization Gate
          </p>
        </div>

        {/* 1-Click Quick Demo Sign In */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full mb-5 py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary-light text-xs font-bold flex items-center justify-center gap-2 transition-all group"
        >
          <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
          <span>Quick Demo Sign-In (Thejas Shetty)</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-[1px] bg-white/[0.08] flex-1"></div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">or sign in with email</span>
          <div className="h-[1px] bg-white/[0.08] flex-1"></div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.06] mb-5">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isLogin ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isLogin ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Profile
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User size={13} className="text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thejas Shetty"
                className="w-full bg-[#07080d] border border-white/[0.08] focus:border-primary/80 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400" /> Corporate Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. thejas@company.com"
              className="w-full bg-[#07080d] border border-white/[0.08] focus:border-primary/80 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 outline-none transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || (!isLogin && !name)}
            className="w-full mt-2 bg-primary hover:bg-primary-hover disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/25 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <KeyRound size={14} />
                <span>{isLogin ? "Authenticate Access" : "Create Security Identity"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
