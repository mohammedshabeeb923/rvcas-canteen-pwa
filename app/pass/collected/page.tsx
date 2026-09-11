'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime } from '@/lib/audio';

function MealCollectedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passId = searchParams?.get('passId') || 'RVCAS-20260827-8F42K';
  const dateStr = searchParams?.get('date') || '27 August 2026';

  useEffect(() => {
    playSuccessChime();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.35 },
        colors: ['#10B981', '#6B1D2F', '#D4AF37'],
      });
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-12 flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-4 py-3 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-stone-900">Meal Collected</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-6 flex-1 flex flex-col items-center justify-center text-center">
        {/* Big Green Circle Check */}
        <div className="w-24 h-24 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-lg mb-6">
          <Check className="w-12 h-12 stroke-[3]" />
        </div>

        <h2 className="text-2xl font-black text-stone-900 tracking-tight">
          Meal Collected!
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Enjoy your meal 🍱
        </p>

        {/* Summary Card */}
        <div className="w-full bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs my-6 space-y-3 text-left">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <span>📅</span> Date
            </span>
            <span className="font-semibold text-stone-900">{dateStr}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <span>₹</span> Amount
            </span>
            <span className="font-bold text-[#6B1D2F] text-sm">₹40</span>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1.5 font-mono">
              Pass ID
            </span>
            <span className="font-mono font-bold text-stone-900">{passId}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-[#6B1D2F] hover:bg-[#501220] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl transition shadow-elevated text-sm"
        >
          Done
        </button>
      </main>
    </div>
  );
}

export default function MealCollectedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#6B1D2F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <MealCollectedContent />
    </Suspense>
  );
}
