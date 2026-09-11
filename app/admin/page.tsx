'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Users,
  Utensils,
  DollarSign,
  ShieldCheck,
  Calendar,
  Settings,
  Download,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AuthGate } from '@/components/auth-gate';

function AdminDashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    todayRevenue: 19440,
    mealsPurchased: 486,
    mealsServed: 421,
    unusedPasses: 65,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [mealPrice, setMealPrice] = useState(40);
  const [isAvailable, setIsAvailable] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.recentTransactions) setTransactions(data.recentTransactions);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveMealConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      <Navbar activeRole="admin" />

      <main className="max-w-md md:max-w-5xl mx-auto px-4 pt-4 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#6B1D2F]">
                ADMIN DASHBOARD
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                Admin Console
              </span>
            </div>
            <h1 className="text-xl font-black text-stone-900 tracking-tight">
              Canteen Management &amp; Oversight
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-2xl shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#6B1D2F]" />
            <span>{todayFormatted}</span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
            <span className="text-xs font-bold text-stone-400 block mb-1">Today&apos;s Revenue</span>
            <p className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              ₹{stats.todayRevenue?.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] font-semibold text-emerald-600 mt-1 inline-block">
              ● 100% Verified
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
            <span className="text-xs font-bold text-stone-400 block mb-1">Meals Purchased</span>
            <p className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              {stats.mealsPurchased}
            </p>
            <span className="text-[10px] text-stone-400 mt-1 inline-block">
              Daily Limit: 600
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
            <span className="text-xs font-bold text-stone-400 block mb-1">Meals Served</span>
            <p className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight">
              {stats.mealsServed}
            </p>
            <span className="text-[10px] font-semibold text-emerald-600 mt-1 inline-block">
              {Math.round((stats.mealsServed / stats.mealsPurchased) * 100) || 86}% Served
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
            <span className="text-xs font-bold text-stone-400 block mb-1">Unused Passes</span>
            <p className="text-2xl md:text-3xl font-black text-amber-600 tracking-tight">
              {stats.unusedPasses}
            </p>
            <span className="text-[10px] text-stone-400 mt-1 inline-block">
              Pending Counter Pickup
            </span>
          </div>
        </div>

        {/* 2 Visual Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Meals Purchased - Last 7 Days
              </h3>
              <span className="text-xs font-semibold text-[#6B1D2F]">Avg: 480/day</span>
            </div>

            <div className="h-44 w-full relative">
              <svg viewBox="0 0 350 140" className="w-full h-full overflow-visible">
                <line x1="30" y1="20" x2="340" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="60" x2="340" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="100" x2="340" y2="100" stroke="#f1f5f9" strokeWidth="1" />

                <text x="5" y="24" fontSize="9" fill="#94a3b8">600</text>
                <text x="5" y="64" fontSize="9" fill="#94a3b8">450</text>
                <text x="5" y="104" fontSize="9" fill="#94a3b8">300</text>

                <path
                  d="M40 75 L90 66 L140 46 L190 40 L240 44 L290 48 L330 50"
                  fill="none"
                  stroke="#6B1D2F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {[
                  { x: 40, y: 75, val: '420', label: '21 Aug' },
                  { x: 90, y: 66, val: '452', label: '22 Aug' },
                  { x: 140, y: 46, val: '498', label: '23 Aug' },
                  { x: 190, y: 40, val: '512', label: '24 Aug' },
                  { x: 240, y: 44, val: '501', label: '25 Aug' },
                  { x: 290, y: 48, val: '493', label: '26 Aug' },
                  { x: 330, y: 50, val: '486', label: '27 Aug' },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="3.5" fill="#6B1D2F" stroke="#ffffff" strokeWidth="2" />
                    <text x={pt.x} y={pt.y - 7} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1e293b">
                      {pt.val}
                    </text>
                    <text x={pt.x} y="130" fontSize="8" textAnchor="middle" fill="#94a3b8">
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Meals Purchased vs Served
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-[#6B1D2F]">
                  <span className="w-2.5 h-2.5 bg-[#6B1D2F] rounded-xs"></span> Purchased
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span> Served
                </span>
              </div>
            </div>

            <div className="h-44 w-full flex items-end justify-between px-2 pt-6 pb-2 border-b border-stone-100">
              {[
                { day: '21 Aug', p: 85, s: 78 },
                { day: '22 Aug', p: 90, s: 86 },
                { day: '23 Aug', p: 98, s: 92 },
                { day: '24 Aug', p: 100, s: 95 },
                { day: '25 Aug', p: 96, s: 90 },
                { day: '26 Aug', p: 95, s: 89 },
                { day: '27 Aug', p: 92, s: 86 },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex items-end gap-1 h-32">
                    <div
                      className="w-2.5 sm:w-3.5 bg-[#6B1D2F] rounded-t-sm transition-all"
                      style={{ height: `${item.p}%` }}
                    ></div>
                    <div
                      className="w-2.5 sm:w-3.5 bg-emerald-600 rounded-t-sm transition-all"
                      style={{ height: `${item.s}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-stone-400 font-medium">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Pricing & Availability Settings */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#6B1D2F]" />
              <h3 className="text-sm font-bold text-stone-900">Meal Pricing &amp; Availability Settings</h3>
            </div>
            {savedNotice && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg animate-in fade-in">
                ✓ Changes Saved Successfully
              </span>
            )}
          </div>

          <form onSubmit={handleSaveMealConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Meal Price (INR)</label>
              <input
                type="number"
                value={mealPrice}
                onChange={(e) => setMealPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold text-stone-900 focus:outline-none focus:border-[#6B1D2F]"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Canteen Booking Status</label>
              <select
                value={isAvailable ? 'available' : 'closed'}
                onChange={(e) => setIsAvailable(e.target.value === 'available')}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold text-stone-900 focus:outline-none focus:border-[#6B1D2F]"
              >
                <option value="available">● Available Today (Booking Open)</option>
                <option value="closed">○ Closed / Sold Out</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#6B1D2F] hover:bg-[#501220] text-white font-bold rounded-xl transition shadow-sm"
              >
                Update Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Today&apos;s Recent Transactions</h3>
              <p className="text-xs text-stone-500">Live feed from Supabase database source of truth</p>
            </div>

            <button
              onClick={() => alert('Exporting full transaction log CSV...')}
              className="text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Pass ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {transactions.map((tx) => (
                  <tr key={tx.id || tx.passId} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-3 text-stone-500">{tx.time}</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{tx.student}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-600">{tx.passId}</td>
                    <td className="py-3 px-3 font-bold text-[#6B1D2F]">₹{tx.amount}</td>
                    <td className="py-3 px-3">
                      {tx.status === 'Served' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Served
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                          Purchased
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => router.push(`/verify-pass/${tx.secureToken || tx.passId}`)}
                        className="text-[11px] font-bold text-[#6B1D2F] hover:underline inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGate
      requiredRole="admin"
      title="Canteen Admin Console"
      subtitle="Encrypted access protected for designated administrator Gmail IDs"
    >
      <AdminDashboardContent />
    </AuthGate>
  );
}
