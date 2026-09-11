'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, AlertTriangle, XCircle, ArrowLeft, ShieldCheck, CheckCircle2, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playErrorBeep } from '@/lib/audio';

type VerificationState = 'LOADING' | 'VALID' | 'SERVED_SUCCESS' | 'ALREADY_SERVED' | 'EXPIRED' | 'NOT_FOUND';

export default function StaffVerifyPassPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [state, setState] = useState<VerificationState>('LOADING');
  const [passData, setPassData] = useState<any>(null);
  const [servedDetails, setServedDetails] = useState<{ time: string; by: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch pass status on mount
  useEffect(() => {
    if (!token) return;

    fetch(`/api/passes/verify?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pass) {
          setPassData(data.pass);
        }

        if (data.success && data.pass?.status === 'VALID') {
          setState('VALID');
        } else if (data.reason === 'ALREADY_SERVED' || data.pass?.status === 'SERVED') {
          setState('ALREADY_SERVED');
          playErrorBeep();
          const timeStr = data.pass?.servedAt
            ? new Date(data.pass.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '12:35 PM';
          setServedDetails({ time: timeStr, by: data.pass?.servedBy || 'Staff Counter 1' });
        } else if (data.reason === 'EXPIRED' || data.pass?.status === 'EXPIRED') {
          setState('EXPIRED');
          playErrorBeep();
        } else {
          setState('NOT_FOUND');
          setErrorMessage(data.message || 'This meal pass could not be verified.');
          playErrorBeep();
        }
      })
      .catch((err) => {
        console.error('Verification error:', err);
        setState('NOT_FOUND');
        setErrorMessage('Network or server connection failed.');
        playErrorBeep();
      });
  }, [token]);

  // 2. Mark as Served (Atomic backend update)
  const handleMarkAsServed = async () => {
    if (actionLoading || !token) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/passes/serve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          servedBy: 'Staff Counter 1',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Atomic transition succeeded!
        setPassData(data.pass);
        const servedTime = data.servedAt
          ? new Date(data.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setServedDetails({ time: servedTime, by: data.servedBy || 'Staff Counter 1' });
        setState('SERVED_SUCCESS');

        playSuccessChime();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.4 },
            colors: ['#10B981', '#6B1D2F', '#D4AF37'],
          });
        } catch (e) {}
      } else {
        // Double redemption prevention catch
        playErrorBeep();
        if (data.reason === 'ALREADY_SERVED') {
          const timeStr = data.servedAt
            ? new Date(data.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'earlier today';
          setServedDetails({ time: timeStr, by: data.servedBy || 'Staff Counter' });
          setState('ALREADY_SERVED');
        } else {
          setState('NOT_FOUND');
          setErrorMessage(data.message || 'Could not serve meal.');
        }
      }
    } catch (err: any) {
      playErrorBeep();
      console.error(err);
      alert('Network error while marking meal as served.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-12">
      {/* Top Header */}
      <header className="px-4 py-3 sticky top-0 z-30 bg-white border-b border-stone-200/80">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/staff')}
              className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D2F] block">
                Canteen Verification
              </span>
              <h1 className="text-sm font-bold text-stone-900 leading-tight">
                Staff Counter Terminal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-full text-[11px] font-mono text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Counter 1</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* 1. LOADING STATE */}
        {state === 'LOADING' && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#6B1D2F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-stone-700">Verifying Meal Pass...</p>
            <p className="text-xs text-stone-400">Querying database source of truth</p>
          </div>
        )}

        {/* 2. VALID MEAL PASS STATE */}
        {state === 'VALID' && passData && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Green Valid Pass Banner */}
            <div className="bg-[#10B981] text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-extrabold text-sm tracking-wide uppercase">
                VALID MEAL PASS
              </span>
            </div>

            {/* Student & Meal Card */}
            <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/80 space-y-5">
              <div className="flex items-center gap-3.5 pb-4 border-b border-stone-100">
                <img
                  src={
                    passData.studentId === 'student_shabeeb'
                      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={passData.studentName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-stone-100 shadow-xs"
                />
                <div>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-tight block">
                    Student
                  </span>
                  <h3 className="text-base font-bold text-stone-900 leading-tight">
                    {passData.studentName}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {passData.studentCourseSem}
                  </p>
                </div>
              </div>

              {/* Meal Details */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="text-stone-400 font-semibold">Meal</span>
                  <span className="font-bold text-stone-900">{passData.mealName}</span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span className="text-stone-400 font-semibold">Amount</span>
                  <span className="font-bold text-stone-900 text-sm">₹{passData.amount}</span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span className="text-stone-400 font-semibold">Date</span>
                  <span className="font-semibold text-stone-800">{passData.mealDate}</span>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-stone-600">
                  <span className="text-stone-400 font-semibold font-mono">Pass ID</span>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                    {passData.passId}
                  </span>
                </div>
              </div>
            </div>

            {/* ONLY ACTION: MARK AS SERVED */}
            <button
              onClick={handleMarkAsServed}
              disabled={actionLoading}
              className="w-full bg-[#10B981] hover:bg-[#059669] active:scale-[0.99] disabled:opacity-60 text-white font-extrabold py-4 px-4 rounded-2xl transition shadow-lg text-base flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  <span>Updating Database...</span>
                </div>
              ) : (
                <>
                  <Utensils className="w-5 h-5" />
                  <span>Mark as Served</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 3. MEAL SERVED CONFIRMATION */}
        {state === 'SERVED_SUCCESS' && passData && (
          <div className="pt-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-lg mx-auto">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                MEAL SERVED!
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Enjoy your meal 😄
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/80 space-y-3 text-left">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <img
                  src={
                    passData.studentId === 'student_shabeeb'
                      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={passData.studentName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-stone-900">{passData.studentName}</p>
                  <p className="text-xs font-mono text-stone-500">{passData.passId}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Served at</span>
                <span className="font-bold text-stone-900">
                  {passData.mealDate} • {servedDetails?.time || '12:35 PM'}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/staff')}
              className="w-full bg-[#6B1D2F] hover:bg-[#501220] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl transition shadow-md text-sm"
            >
              Continue
            </button>
          </div>
        )}

        {/* 4. ALREADY SERVED / DUPLICATE REDEMPTION PREVENTED */}
        {state === 'ALREADY_SERVED' && (
          <div className="pt-4 space-y-4 animate-in fade-in duration-200">
            <div className="bg-red-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 shadow-md">
              <XCircle className="w-6 h-6" />
              <span className="font-black text-sm tracking-wide uppercase">
                MEAL ALREADY COLLECTED
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card border border-red-200 space-y-4">
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-center">
                <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">
                  Previously Served At
                </p>
                <p className="text-xl font-black text-red-700 mt-0.5">
                  {servedDetails?.time || '12:35 PM'}
                </p>
                <p className="text-[11px] text-red-500 mt-0.5">
                  by {servedDetails?.by || 'Counter 1'}
                </p>
              </div>

              {passData && (
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Student</span>
                    <span className="font-bold text-stone-900">{passData.studentName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Course</span>
                    <span className="font-medium text-stone-800">{passData.studentCourseSem}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-400 font-mono">Pass ID</span>
                    <span className="font-mono font-bold text-stone-900">{passData.passId}</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Security notice:</strong> This digital pass has already been redeemed. Single-use enforcement prevents duplicate meal collection.
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/staff')}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3.5 px-4 rounded-2xl transition text-sm"
            >
              Back to Staff Console
            </button>
          </div>
        )}

        {/* 5. EXPIRED PASS */}
        {state === 'EXPIRED' && (
          <div className="pt-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Pass Expired</h3>
            <p className="text-xs text-stone-500">
              This meal pass was issued for a previous date and is no longer valid.
            </p>
            <button
              onClick={() => router.push('/staff')}
              className="w-full bg-[#6B1D2F] text-white font-bold py-3.5 rounded-2xl text-sm"
            >
              Back to Staff Console
            </button>
          </div>
        )}

        {/* 6. NOT FOUND */}
        {state === 'NOT_FOUND' && (
          <div className="pt-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Invalid Pass</h3>
            <p className="text-xs text-stone-500">
              {errorMessage || 'This meal pass could not be verified.'}
            </p>
            <button
              onClick={() => router.push('/staff')}
              className="w-full bg-[#6B1D2F] text-white font-bold py-3.5 rounded-2xl text-sm"
            >
              Back to Staff Console
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
