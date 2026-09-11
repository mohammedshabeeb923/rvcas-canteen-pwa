'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime } from '@/lib/audio';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const passIdsParam = searchParams?.get('passIds') || '';
  const count = parseInt(searchParams?.get('count') || '1', 10);
  const totalAmount = count * 40;

  const [passes, setPasses] = useState<any[]>([]);
  const [waLink, setWaLink] = useState<string>('');

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    playSuccessChime();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#6B1D2F', '#10B981', '#D4AF37', '#FAF7F2'],
      });
    } catch (e) {}

    if (orderId) {
      fetch('/api/dashboard/stats')
        .then((res) => res.json())
        .then((data) => {
          if (data.passes) {
            const matched = data.passes.filter((p: any) => p.orderId === orderId);
            if (matched.length > 0) {
              setPasses(matched);
              const firstPass = matched[0];
              const verifyUrl = `${window.location.origin}/verify-pass/${firstPass.secureToken}`;
              const waText = encodeURIComponent(
                `🍱 *RVCAS CANTEEN*\nNEW MEAL BOOKING\n\n*Student:* ${firstPass.studentName}\n*Course:* ${firstPass.studentCourseSem}\n*Meal:* ${firstPass.mealName}\n*Amount:* ₹${firstPass.amount}\n*Pass ID:* ${firstPass.passId}\n\n*Verify Pass:* ${verifyUrl}`
              );
              setWaLink(`https://wa.me/?text=${waText}`);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [orderId]);

  const targetPassId = passes[0]?.passId || passIdsParam.split(',')[0] || 'active';

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-12 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-4 py-3 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-stone-900">Success</h1>
        </div>
      </header>

      {/* Main Success Content */}
      <main className="max-w-md mx-auto px-6 py-6 flex-1 flex flex-col items-center justify-center text-center">
        {/* Large Green Check Circle matching design */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-lg animate-in zoom-in-75 duration-300">
            <Check className="w-12 h-12 stroke-[3]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        <h2 className="text-2xl font-black text-stone-900 tracking-tight">
          Payment Successful!
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Your meal pass is ready.
        </p>

        {/* Green Pill Amount Card */}
        <div className="w-full bg-[#DCFCE7] border border-[#86EFAC]/60 rounded-3xl p-4 my-6 text-center shadow-xs">
          <p className="text-2xl font-black text-[#15803D] tracking-tight">
            ₹{totalAmount} PAID
          </p>
          <p className="text-xs text-[#166534]/80 mt-0.5 font-medium">
            {dateFormatted} • {timeFormatted}
          </p>
          {count > 1 && (
            <p className="text-[11px] font-bold text-[#15803D] mt-1 bg-white/60 inline-block px-2.5 py-0.5 rounded-full">
              {count} Meal Passes Issued
            </p>
          )}
        </div>

        {/* WhatsApp Notification Alert Status Card */}
        <div className="w-full bg-white rounded-2xl p-3.5 border border-stone-200/80 mb-6 text-left shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Canteen Staff Notified ✓
                </p>
                <p className="text-[11px] text-stone-500">
                  Secure verification link dispatched via WhatsApp
                </p>
              </div>
            </div>

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0"
              >
                <span>Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons matching design */}
        <div className="w-full space-y-3">
          <button
            onClick={() => router.push(`/pass/${targetPassId}`)}
            className="w-full bg-[#6B1D2F] hover:bg-[#501220] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl transition shadow-elevated text-sm"
          >
            View Meal Pass
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-white hover:bg-stone-50 text-stone-700 font-semibold py-3.5 px-4 rounded-2xl border border-stone-200 transition text-sm shadow-xs"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#6B1D2F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
