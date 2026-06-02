"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Mail, User, Sparkles, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, skip login screen
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_email");
      if (stored) {
        window.location.href = "/dashboard";
      }
    }
  }, []);

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
        // Save session details
        localStorage.setItem("user_email", res.data.email);
        localStorage.setItem("user_name", res.data.name);
        
        // Redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg("Failed to connect to backend auth server. Ensure backend is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="glass-panel w-full max-w-md bg-gradient-to-b from-[#0e0e16] to-[#06060c] border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
        
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2.5 mb-8">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] mb-1">
            <Shield size={28} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            PhishGuard <span className="text-primary font-black">AI</span>
          </h2>
          <p className="text-xs text-gray-400">Security Command Center Authorization Gate</p>
        </div>

        {/* Toggler Tabs */}
        <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl mb-6 relative">
          <button 
            onClick={() => { setIsLogin(true); setErrorMsg(""); }}
            className={`flex-1 text-center font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-all ${isLogin ? 'bg-white/5 border border-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setErrorMsg(""); }}
            className={`flex-1 text-center font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-all ${!isLogin ? 'bg-white/5 border border-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Create Account
          </button>
        </div>

        {/* Error Message banner */}
        {errorMsg && (
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-3 flex items-start gap-2 mb-6 animate-slide-up">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="text-xs font-semibold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Full Name field (Signup only) */}
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <User size={12} className="text-gray-500" /> Full Name
              </label>
              <input 
                type="text"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                placeholder="e.g. Thejas"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          {/* Email Address Field */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Mail size={12} className="text-gray-500" /> Email Address
            </label>
            <input 
              type="email"
              required
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm font-mono"
              placeholder="e.g. thejas@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading || !email || (!isLogin && !name)}
            className="w-full mt-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white font-extrabold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.45)] transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authorizing Access...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {isLogin ? "Access Command Center" : "Generate Security Profile"}
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-gray-500 text-center font-semibold mt-6 uppercase tracking-wider">
          Secure Sandboxed Telemetry Guaranteed
        </p>

      </div>
    </div>
  );
}
