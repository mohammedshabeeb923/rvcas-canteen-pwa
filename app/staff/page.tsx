'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ListOrdered,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Utensils,
  Check,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AuthGate } from '@/components/auth-gate';

function StaffDashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    todayRevenue: 19440,
    mealsPurchased: 486,
    mealsServed: 421,
    unusedPasses: 65,
    progressPercent: 86,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [manualToken, setManualToken] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'VALID' | 'SERVED'>('ALL');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.recentTransactions) setRecentTransactions(data.recentTransactions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    router.push(`/verify-pass/${encodeURIComponent(manualToken.trim())}`);
  };

  // Quick Serve directly from staff list
  const handleDirectServe = async (token: string, studentName: string) => {
    try {
      const res = await fetch('/api/passes/serve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`✓ Marked as served for ${studentName}`);
        fetchStats();
        setTimeout(() => setActionMessage(''), 3000);
      } else {
        alert(data.message || 'Could not serve pass');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const filteredTransactions = recentTransactions.filter((tx) => {
    if (filter === 'VALID') return tx.status === 'Purchased';
    if (filter === 'SERVED') return tx.status === 'Served';
    return true;
  });

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      <Navbar activeRole="staff" />

      <main className="max-w-md md:max-w-4xl mx-auto px-4 pt-4 space-y-5">
        {/* Header Strip */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">Staff Dashboard</h1>
            <p className="text-xs text-stone-500">{todayFormatted}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition shadow-xs"
              title="Refresh counts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Counter Active
            </div>
          </div>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold text-center animate-in fade-in shadow-md">
            {actionMessage}
          </div>
        )}

        {/* 4 Stats Grid (486, 421, 65, ₹19,440) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-card border border-stone-200/70 text-center">
            <p className="text-2xl md:text-3xl font-black text-rose-600 tracking-tight">
              {stats.mealsPurchased}
            </p>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-tight mt-1">
              Meals Purchased
            </p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-card border border-stone-200/70 text-center">
            <p className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tight">
              {stats.mealsServed}
            </p>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-tight mt-1">
              Meals Served
            </p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-card border border-stone-200/70 text-center">
            <p className="text-2xl md:text-3xl font-black text-amber-600 tracking-tight">
              {stats.unusedPasses}
            </p>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-tight mt-1">
              Remaining
            </p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-card border border-stone-200/70 text-center">
            <p className="text-2xl md:text-3xl font-black text-sky-600 tracking-tight">
              ₹{stats.todayRevenue?.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-tight mt-1">
              Today&apos;s Collection
            </p>
          </div>
        </div>

        {/* Direct Pass Verification Search Card (Replaces QR Scanner) */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70 space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#6B1D2F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Verify &amp; Mark Pass as Served
            </h3>
          </div>

          <form onSubmit={handleManualVerify} className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste or enter Pass ID (e.g. RVCAS-20260909-...) or token"
              className="w-full text-xs px-3.5 py-3 rounded-xl border border-stone-200 font-mono focus:outline-none focus:border-[#6B1D2F]"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-[#6B1D2F] hover:bg-[#501220] text-white font-bold rounded-xl text-xs shrink-0 transition"
            >
              Verify Pass
            </button>
          </form>
        </div>

        {/* Today's Progress Bar */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
            <span>Today&apos;s Progress</span>
            <span className="text-[#6B1D2F] font-black">{stats.progressPercent}%</span>
          </div>

          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-[#6B1D2F] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.progressPercent)}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-stone-500 mt-2 font-medium">
            {stats.mealsServed} / {stats.mealsPurchased} meals served
          </p>
        </div>

        {/* Today's Recent Transactions / Direct Serve Queue */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">Today&apos;s Meal Passes</h3>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-[11px]">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  filter === 'ALL' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('VALID')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  filter === 'VALID' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-500'
                }`}
              >
                Unserved
              </button>
              <button
                onClick={() => setFilter('SERVED')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  filter === 'SERVED' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Served
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTransactions.map((tx) => {
              const isServed = tx.status === 'Served';
              return (
                <div
                  key={tx.id || tx.passId}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-100 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isServed ? 'bg-stone-200 text-stone-600' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isServed ? '✓' : '●'}
                    </div>

                    <div>
                      <p className="font-bold text-stone-900">{tx.student}</p>
                      <p className="text-[11px] font-mono text-stone-500">{tx.passId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <span className="font-bold text-stone-900">₹{tx.amount}</span>
                      <p className="text-[10px] text-stone-400">{tx.time}</p>
                    </div>

                    {isServed ? (
                      <span className="px-3 py-1.5 rounded-xl font-bold text-[11px] bg-stone-200 text-stone-700">
                        Served
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDirectServe(tx.secureToken || tx.passId, tx.student)}
                        className="px-3 py-1.5 rounded-xl font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Served</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <AuthGate
      requiredRole="staff"
      title="Canteen Staff Console"
      subtitle="Encrypted access protected for designated canteen staff Gmail IDs"
    >
      <StaffDashboardContent />
    </AuthGate>
  );
}
