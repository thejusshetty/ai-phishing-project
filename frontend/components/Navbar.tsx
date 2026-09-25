"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Terminal, Users, LogIn, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("user_email");
      const name = localStorage.getItem("user_name");
      setUserEmail(email);
      setUserName(name || (email ? email.split("@")[0] : null));
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      setUserEmail(null);
      setUserName(null);
      window.location.href = "/";
    }
  };

  const navLinks = [
    { href: "/", label: "Simulator & Scanner", icon: Terminal },
    { href: "/dashboard", label: "My Risk Profile", icon: LayoutDashboard },
    { href: "/admin", label: "Admin SOC", icon: Users },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-3 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <nav className="glass-panel px-4 sm:px-6 py-3 flex items-center justify-between border border-white/[0.08] bg-[#0c0e17]/85 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-light group-hover:scale-105 transition-transform duration-200 shadow-md shadow-primary/20">
            <Shield size={20} className="text-primary-light" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
              PhishGuard<span className="text-primary-light font-black">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Threat Defense Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Status / Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {userEmail ? (
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full py-1 px-3">
                <div className="w-7 h-7 rounded-full bg-primary/25 border border-primary/50 text-primary-light text-xs font-bold flex items-center justify-center">
                  {userName ? getInitials(userName) : "U"}
                </div>
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {userName || "User"}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 leading-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 shadow-md shadow-primary/25"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 p-3 surface-card flex flex-col gap-2 border border-white/[0.08] bg-[#0c0e17]/95 shadow-2xl animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white font-bold"
                    : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-1 border-t border-white/[0.08] flex items-center justify-between">
            {userEmail ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/25 border border-primary/50 text-primary-light text-xs font-bold flex items-center justify-center">
                    {userName ? getInitials(userName) : "U"}
                  </div>
                  <span className="text-xs text-slate-300 truncate max-w-[140px]">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center bg-primary text-white text-xs font-semibold py-2 rounded-lg shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
