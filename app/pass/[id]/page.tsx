'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Copy, Check, ShieldCheck, RefreshCw, CheckCircle2, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playErrorBeep } from '@/lib/audio';

export default function MealPassPage() {
  const router = useRouter();
  const params = useParams();
  const passIdParam = params?.id as string;

  const [pass, setPass] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serving, setServing] = useState(false);
  const [serveSuccess, setServeSuccess] = useState(false);

  const fetchPass = () => {
    setLoading(true);
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.passes) {
          let found = data.passes.find(
            (p: any) =>
              p.passId.toLowerCase() === passIdParam.toLowerCase() ||
              p.secureToken === passIdParam ||
              p.id === passIdParam
          );

          // If looking for "active", grab Shabeeb's latest pass
          if (!found && (passIdParam === 'active' || passIdParam === 'latest')) {
            found = data.passes.find((p: any) => p.studentId === 'student_shabeeb') || data.passes[0];
          }

          setPass(found || data.passes[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPass();
  }, [passIdParam]);

  const handleCopy = () => {
    if (!pass) return;
    navigator.clipboard.writeText(pass.passId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct "Mark as Served" action (replaces QR code)
  const handleMarkAsServed = async () => {
    if (!pass || pass.status === 'SERVED' || serving) return;

    setServing(true);
    try {
      const res = await fetch('/api/passes/serve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: pass.secureToken,
          servedBy: 'Canteen Staff Counter',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPass(data.pass);
        setServeSuccess(true);
        playSuccessChime();
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.4 },
            colors: ['#10B981', '#6B1D2F', '#D4AF37'],
          });
        } catch (e) {}
        setTimeout(() => {
          router.push(`/pass/collected?passId=${pass.passId}&date=${encodeURIComponent(pass.mealDate)}`);
        }, 1200);
      } else {
        playErrorBeep();
        alert(data.message || 'Pass already served or invalid.');
        fetchPass();
      }
    } catch (err: any) {
      console.error(err);
      alert('Error updating pass status.');
    } finally {
      setServing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#6B1D2F] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-stone-500 font-semibold">Loading Meal Pass...</p>
        </div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] p-6 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-bold text-stone-700">Meal Pass Not Found</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-[#6B1D2F] text-white rounded-xl text-xs font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isServed = pass.status === 'SERVED';

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-12">
      {/* Top Header */}
      <header className="px-4 py-3 sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-9 h-9 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-700 hover:bg-stone-50 transition shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-stone-900">Meal Pass</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPass}
              className="w-9 h-9 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-500 hover:text-stone-800 transition"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-2">
        {/* Pass Container with Cutout Aesthetic */}
        <div className="bg-white rounded-4xl shadow-elevated border border-stone-200/70 overflow-hidden relative">
          {/* Top Maroon Header Card */}
          <div className="bg-[#6B1D2F] text-white p-5 text-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/80">
                RVCAS CANTEEN
              </span>
              <h2 className="text-lg font-extrabold text-white mt-0.5">
                Digital Meal Pass
              </h2>
            </div>
          </div>

          {/* Pass Body */}
          <div className="p-6 text-center space-y-5">
            {/* Today's Meal & Laurel Wheat ₹40 Price */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                TODAY&apos;S MEAL
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-amber-600 text-lg">🌾</span>
                <span className="text-4xl font-black text-stone-900 tracking-tight">₹40</span>
                <span className="text-amber-600 text-lg scale-x-[-1]">🌾</span>
              </div>
            </div>

            {/* Student Profile Detail */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <img
                src={
                  pass.studentId === 'student_shabeeb'
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80'
                }
                alt={pass.studentName}
                className="w-12 h-12 rounded-full object-cover border-2 border-stone-100 shadow-xs"
              />
              <div className="text-left">
                <h3 className="text-sm font-bold text-stone-900 leading-tight">
                  {pass.studentName}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {pass.studentCourseSem}
                </p>
              </div>
            </div>

            {/* Date & Status Pill */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
              <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                <span>📅</span>
                <span>{pass.mealDate}</span>
              </div>

              <div>
                {isServed ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-200 text-stone-700 font-bold text-xs">
                    ✓ SERVED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    VALID PASS
                  </span>
                )}
              </div>
            </div>

            {/* Pass ID with Copy Button */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200">
                Pass ID: {pass.passId}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
                title="Copy Pass ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* ONLY MARK AS SERVED OPTION (Replaces QR Code per user request) */}
            <div className="pt-3 pb-1">
              {isServed ? (
                <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-stone-600" />
                  </div>
                  <p className="text-xs font-bold text-stone-800">Meal Already Served</p>
                  <p className="text-[11px] text-stone-500">
                    Collected at {new Date(pass.servedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'earlier today'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleMarkAsServed}
                  disabled={serving || serveSuccess}
                  className="w-full bg-[#10B981] hover:bg-[#059669] active:scale-[0.99] disabled:opacity-60 text-white font-extrabold py-4 px-4 rounded-2xl transition shadow-lg text-base flex items-center justify-center gap-2"
                >
                  {serving ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Utensils className="w-5 h-5" />
                      <span>Mark as Served</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer Maroon Banner */}
          <div className="bg-[#6B1D2F] text-white py-3 px-4 text-center">
            <p className="text-[11px] font-semibold text-white/90 tracking-wide">
              One pass • One meal • Today only
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
