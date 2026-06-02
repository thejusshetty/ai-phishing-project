"use client";

import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="glass-panel m-4 px-6 py-4 flex items-center justify-between sticky top-4 z-50 border border-white/10 bg-black/50 backdrop-blur-xl rounded-2xl shadow-xl select-none">
      <div className="flex items-center gap-3 text-primary group">
        <Shield size={30} className="animate-pulse-glow group-hover:scale-110 transition-transform duration-300" />
        <Link href="/" className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          PhishGuard<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">AI</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        <Link 
          href="/" 
          className="font-bold text-xs uppercase tracking-wider text-gray-300 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
        >
          Dashboard
        </Link>
        <Link 
          href="/admin" 
          className="font-bold text-xs uppercase tracking-wider text-gray-300 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
        >
          Admin Panel
        </Link>
        
        <div className="flex items-center gap-2.5 ml-2 border-l border-white/10 pl-5">
          <div 
            title="Logged in as Thejus Shetty (thejusshetty479@gmail.com) [Offline Sandbox]"
            className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 text-primary text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            TS
          </div>
        </div>
      </div>
    </nav>
  );
}
