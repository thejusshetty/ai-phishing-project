"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Users, AlertTriangle, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
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

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`);
        setUsers(res.data);
      } catch (error) {
        console.warn("Backend offline. Initiating offline organization data fallback...");
        
        // Grab user profile from local sandbox cache
        let sandboxUser = {
          name: "Thejus Shetty",
          email: "thejusshetty479@gmail.com",
          risk_score: 15,
          failed_attempts: 1
        };
        
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("sandbox_user_profile");
          if (stored) {
            sandboxUser = JSON.parse(stored);
          }
        }

        // Pre-populate with realistic monitored team metrics containing the user's live score!
        setUsers([
          sandboxUser,
          {
            name: "Alex Johnson",
            email: "alex@company.com",
            risk_score: 82,
            failed_attempts: 3
          },
          {
            name: "Sarah Parker",
            email: "sarah@company.com",
            risk_score: 45,
            failed_attempts: 1
          },
          {
            name: "David Chen",
            email: "david@company.com",
            risk_score: 12,
            failed_attempts: 0
          }
        ]);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const highRiskUsers = users.filter(u => u.risk_score > 70).length;
  const avgRiskScore = totalUsers > 0 ? Math.round(users.reduce((acc, u) => acc + u.risk_score, 0) / totalUsers) : 0;

  const chartData = {
    labels: users.map(u => u.name),
    datasets: [
      {
        label: 'Risk Score',
        data: users.map(u => u.risk_score),
        backgroundColor: users.map(u => u.risk_score > 70 ? 'rgba(244, 63, 94, 0.75)' : u.risk_score > 30 ? 'rgba(245, 158, 11, 0.75)' : 'rgba(16, 185, 129, 0.75)'),
        borderColor: users.map(u => u.risk_score > 70 ? 'rgba(244, 63, 94, 0.9)' : u.risk_score > 30 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(16, 185, 129, 0.9)'),
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
        backgroundColor: '#0f0f16',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-slide-up select-none max-w-7xl mx-auto">
      
      {/* Premium Header */}
      <header className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-2">
            Security Operations Dashboard
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm md:text-base font-medium">
            Monitor organization-wide human risk metrics, suspicious interactions, and vulnerability distribution.
          </p>
        </div>
        
        <Link 
          href="/" 
          className="flex items-center gap-1.5 self-start md:self-auto bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-300 px-4.5 py-2.5 rounded-full transition-all duration-300"
        >
          <ArrowLeft size={14} /> Back to Command Center
        </Link>
      </header>

      {/* Organization Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Total Users */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center text-center animate-slide-up bg-black/45 border-white/10 border-t-4 border-t-primary rounded-3xl relative overflow-hidden group hover:scale-[1.01] hover:border-white/15 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4 text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Users size={28} />
          </div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monitored Personnel</h3>
          <span className="text-5xl font-black mt-2.5 text-white drop-shadow-[0_4px_15px_rgba(59,130,246,0.3)]">{totalUsers}</span>
        </div>
        
        {/* Avg Risk Score */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center text-center animate-slide-up bg-black/45 border-white/10 border-t-4 border-t-warning rounded-3xl relative overflow-hidden group hover:scale-[1.01] hover:border-white/15 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <div className="p-3 bg-warning/10 rounded-2xl border border-warning/20 mb-4 text-warning group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Activity size={28} />
          </div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Average Organization Risk</h3>
          <span className="text-5xl font-black mt-2.5 text-white drop-shadow-[0_4px_15px_rgba(245,158,11,0.3)]">{avgRiskScore}</span>
        </div>

        {/* High Risk Users */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center text-center animate-slide-up bg-black/45 border-white/10 border-t-4 border-t-danger rounded-3xl relative overflow-hidden group hover:scale-[1.01] hover:border-white/15 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <div className="p-3 bg-danger/10 rounded-2xl border border-danger/20 mb-4 text-danger group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(244,63,94,0.1)] animate-pulse-glow">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">High Vulnerability Alerts</h3>
          <span className="text-5xl font-black mt-2.5 text-white drop-shadow-[0_4px_15px_rgba(244,63,94,0.3)]">{highRiskUsers}</span>
        </div>
      </div>

      {/* Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-2">
        
        {/* Risk Distribution Chart */}
        <div className="glass-panel p-8 bg-black/40 border border-white/10 rounded-3xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] hover:border-white/15 transition-all lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><div className="w-2.5 h-6 bg-primary rounded-full"></div> Organization Risk Profiler</h2>
          <div className="h-72 w-full relative">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* User Directory */}
        <div className="glass-panel p-8 bg-black/40 border border-white/10 rounded-3xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] hover:border-white/15 transition-all lg:col-span-2 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><div className="w-2.5 h-6 bg-success rounded-full"></div> Personnel Directory</h2>
          
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/35">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/10 text-gray-400 text-xs font-bold tracking-wider uppercase">
                  <th className="py-4 px-4 font-semibold">User Details</th>
                  <th className="py-4 px-4 font-semibold text-center">Score</th>
                  <th className="py-4 px-4 font-semibold text-center">Click Fails</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-4">
                      <span className="text-sm font-bold text-gray-200 block group-hover:text-primary transition-colors">{user.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{user.email}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
                        user.risk_score > 70 ? 'bg-danger/10 text-danger border border-danger/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]' : 
                        user.risk_score > 30 ? 'bg-warning/10 text-warning border border-warning/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]' : 
                        'bg-success/10 text-success border border-success/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      }`}>
                        {user.risk_score}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-300 text-sm font-mono">{user.failed_attempts}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-gray-500 italic">No personnel currently logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
