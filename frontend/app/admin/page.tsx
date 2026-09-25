"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  AlertTriangle,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  TrendingDown,
  Sparkles,
  UserCheck,
  UserX,
  ExternalLink
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminSOCPage() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const defaultUsers = [
    {
      name: "Thejas Shetty",
      email: "thejusshetty479@gmail.com",
      risk_score: 20,
      failed_attempts: 1,
      phishing_attempts: 3
    },
    {
      name: "Alex Johnson",
      email: "alex.j@company.com",
      risk_score: 82,
      failed_attempts: 4,
      phishing_attempts: 5
    },
    {
      name: "Sarah Parker",
      email: "sarah.p@company.com",
      risk_score: 45,
      failed_attempts: 2,
      phishing_attempts: 4
    },
    {
      name: "David Chen",
      email: "david.c@company.com",
      risk_score: 12,
      failed_attempts: 0,
      phishing_attempts: 3
    },
    {
      name: "Elena Rostova",
      email: "elena.r@company.com",
      risk_score: 74,
      failed_attempts: 3,
      phishing_attempts: 4
    }
  ];

  useEffect(() => {
    setMounted(true);
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setUsers(res.data);
          return;
        }
      } catch (error) {
        // fallback
      }

      // Check local storage for sandbox user profile
      let initialList = [...defaultUsers];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sandbox_user_profile");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            initialList[0] = {
              ...initialList[0],
              name: parsed.name || initialList[0].name,
              email: parsed.email || initialList[0].email,
              risk_score: parsed.risk_score ?? initialList[0].risk_score,
              failed_attempts: parsed.failed_attempts ?? initialList[0].failed_attempts
            };
          } catch (e) {
            // keep default
          }
        }
      }
      setUsers(initialList);
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const highRiskUsers = users.filter(u => (u.risk_score || 0) > 70).length;
  const mediumRiskUsers = users.filter(u => (u.risk_score || 0) > 30 && (u.risk_score || 0) <= 70).length;
  const lowRiskUsers = users.filter(u => (u.risk_score || 0) <= 30).length;
  const avgRiskScore = totalUsers > 0 ? Math.round(users.reduce((acc, u) => acc + (u.risk_score || 0), 0) / totalUsers) : 0;
  const complianceRate = totalUsers > 0 ? Math.round((lowRiskUsers / totalUsers) * 100) : 100;

  const chartData = {
    labels: users.map(u => u.name || u.email.split("@")[0]),
    datasets: [
      {
        label: 'Human Risk Score',
        data: users.map(u => u.risk_score || 0),
        backgroundColor: users.map(u => (u.risk_score || 0) > 70 ? 'rgba(244, 63, 94, 0.8)' : (u.risk_score || 0) > 30 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(16, 185, 129, 0.8)'),
        borderColor: users.map(u => (u.risk_score || 0) > 70 ? '#f43f5e' : (u.risk_score || 0) > 30 ? '#f59e0b' : '#10b981'),
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c0e17',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      }
    }
  };

  const filteredPersonnel = users.filter((u) => {
    const score = u.risk_score || 0;
    if (riskFilter === "high" && score <= 70) return false;
    if (riskFilter === "medium" && (score <= 30 || score > 70)) return false;
    if (riskFilter === "low" && score > 30) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Security Operations Center (SOC)
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/15 text-primary-light border border-primary/30 font-bold uppercase">
              Admin Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organization-wide human vulnerability assessment, risk distribution, and threat incident monitoring.
          </p>
        </div>
      </div>

      {/* SOC KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Personnel */}
        <div className="surface-card p-5 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Personnel</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary-light border border-primary/20">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white font-mono">{totalUsers}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Monitored identities</span>
          </div>
        </div>

        {/* Avg Risk */}
        <div className="surface-card p-5 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Avg Risk Score</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white font-mono">{avgRiskScore}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Out of 100 Index</span>
          </div>
        </div>

        {/* High Risk Alerts */}
        <div className="surface-card p-5 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">High Risk Alerts</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-400 font-mono">{highRiskUsers}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Personnel &gt; 70 score</span>
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="surface-card p-5 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Safe Compliance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-400 font-mono">{complianceRate}%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Low-risk ratio</span>
          </div>
        </div>
      </div>

      {/* Main Content: Chart & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Chart Column (3 cols) */}
        <div className="surface-card p-6 border border-white/[0.08] lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Organization Risk Distribution</h2>
              <p className="text-xs text-slate-400">Individual personnel human vulnerability scores</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded-md">
              Score Metric (0-100)
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full relative">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Directory Column (2 cols) */}
        <div className="surface-card p-6 border border-white/[0.08] lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Personnel Directory</h2>
              <p className="text-xs text-slate-400">Threat vulnerability status</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search personnel..."
                className="w-full bg-[#07080d] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/[0.06] self-start">
              <button
                onClick={() => setRiskFilter("all")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  riskFilter === "all" ? "bg-primary text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRiskFilter("high")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  riskFilter === "high" ? "bg-rose-500/20 text-rose-300" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                High
              </button>
              <button
                onClick={() => setRiskFilter("medium")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  riskFilter === "medium" ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Med
              </button>
              <button
                onClick={() => setRiskFilter("low")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  riskFilter === "low" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Low
              </button>
            </div>
          </div>

          {/* Directory list */}
          <div className="overflow-y-auto max-h-[260px] flex flex-col gap-2 pr-1">
            {filteredPersonnel.map((person, idx) => {
              const score = person.risk_score || 0;
              const isHigh = score > 70;
              const isMed = score > 30 && score <= 70;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#07080d] border border-white/[0.06] flex items-center justify-between gap-3 hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {person.name || person.email.split("@")[0]}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono truncate">
                      {person.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isHigh
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                          : isMed
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {score} Risk
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredPersonnel.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-6">
                No personnel found matching filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
