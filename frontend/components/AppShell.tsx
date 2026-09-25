"use client";

import Navbar from "@/components/Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col antialiased relative selection:bg-primary/30 selection:text-white">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Floating Navbar */}
      <div className="relative z-40">
        <Navbar />
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>
    </div>
  );
}
