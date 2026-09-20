'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { WelcomeScreen } from '@/components/welcome-screen';
import { LoginScreen } from '@/components/login-screen';
import { Utensils, CheckCircle2, ArrowRight, Sparkles, Building2, ExternalLink } from 'lucide-react';

export default function FirstPage() {
  const router = useRouter();
  // Starts on 'welcome', transitions to 'login' (or 'home' if persistent session exists)
  const [currentView, setCurrentView] = useState<'welcome' | 'login' | 'home'>('welcome');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mealStatus, setMealStatus] = useState<'NOT_PURCHASED' | 'VALID' | 'SERVED'>('NOT_PURCHASED');
  const [activePass, setActivePass] = useState<any>(null);

  useEffect(() => {
    // 1. Check persistent authentication session
    fetch('/api/auth/session')
      .then((res) => {
        if (res.ok) return res.json();
        return { authenticated: false };
      })
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('rvcas_user');
          if (cached) {
            try { setCurrentUser(JSON.parse(cached)); } catch (e) {}
          }
        }
      })
      .catch((err) => console.error('Session check error:', err));

    // 2. Check if student has an active pass for today
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.passes && data.passes.length > 0) {
          const studentPasses = data.passes.filter(
            (p: any) => p.studentId === (currentUser?.id || 'student_shabeeb')
          );
          if (studentPasses.length > 0) {
            const latest = studentPasses[0];
            setActivePass(latest);
            if (latest.status === 'VALID') {
              setMealStatus('VALID');
            } else if (latest.status === 'SERVED') {
              setMealStatus('SERVED');
            } else {
              setMealStatus('NOT_PURCHASED');
            }
          }
        }
      })
      .catch((err) => console.error(err));
  }, [currentUser?.id]);

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleWelcomeComplete = () => {
    // Check if user is already authenticated
    const cached = currentUser || (typeof window !== 'undefined' && localStorage.getItem('rvcas_user') ? JSON.parse(localStorage.getItem('rvcas_user')!) : null);
    if (cached) {
      if (cached.role === 'staff') {
        router.push('/staff');
      } else if (cached.role === 'admin') {
        router.push('/admin');
      } else {
        setCurrentView('home');
      }
    } else {
      setCurrentView('login');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  // SCREEN 1: WELCOME SPLASH SCREEN (Auto-transitions after 2 seconds)
  if (currentView === 'welcome') {
    return <WelcomeScreen onEnter={handleWelcomeComplete} />;
  }

  // SCREEN 2: DEDICATED LOGIN SCREEN (If not authenticated)
  if (currentView === 'login') {
    return (
      <LoginScreen
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'staff') {
            router.push('/staff');
          } else if (user.role === 'admin') {
            router.push('/admin');
          } else {
            setCurrentView('home');
          }
        }}
      />
    );
  }

  // SCREEN 3: STUDENT HOME SCREEN (Once authenticated)
  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Top Navbar */}
      <Navbar activeRole="student" onLogout={handleLogout} />

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Welcome Greeting with Dynamic Student Name */}
        <div className="mb-4">
          <p className="text-sm text-stone-500 font-medium">Good afternoon,</p>
          <h2 className="text-2xl font-black text-[#6B1D2F] tracking-tight leading-tight">
            {currentUser?.name || 'Student'} 👋
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            {currentUser?.courseSem || 'BCA • Semester 3'} — Ready for lunch?
          </p>
        </div>

        {/* TODAY'S MEAL CARD: Royal Maroon theme */}
        <div className="bg-gradient-to-br from-[#6B1D2F] to-[#4A1220] text-white rounded-4xl p-5 shadow-xl border border-white/10 mb-5 relative overflow-hidden">
          {/* Subtle ambient lighting */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/90">
                TODAY&apos;S MEAL
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white tracking-tight">₹40</span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug">
                Daily College Meal
              </h3>
              <div className="pt-1.5">
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Available today
                </span>
              </div>
            </div>

            {/* Meal Photo (authentic Kerala meals matching college canteen) */}
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-2 border-white/40 ring-2 ring-amber-400/30 shrink-0 relative">
              <img
                src="/images/kerala-meals.jpg"
                alt="Kerala College Meals - Oonu"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Primary Action Button: Get Today's Meal - ₹40 */}
          <div className="mt-5 relative z-10">
            <button
              onClick={() => router.push('/payment')}
              className="w-full bg-white hover:bg-amber-50 active:scale-[0.99] text-[#6B1D2F] font-black py-4 px-4 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <span>Get Today&apos;s Meal — ₹40</span>
              <ArrowRight className="w-4 h-4 text-[#6B1D2F]" />
            </button>
          </div>
        </div>

        {/* YOUR MEAL STATUS CARD matching design screenshot */}
        <div className="bg-white rounded-4xl p-5 shadow-card border border-stone-200/70 mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
            Your Meal Status
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Cloche Dome in Mint Circle */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  mealStatus === 'VALID'
                    ? 'bg-emerald-100 text-emerald-700'
                    : mealStatus === 'SERVED'
                    ? 'bg-stone-100 text-stone-600'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <Utensils className="w-6 h-6 text-emerald-700" />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-tight block">
                  Today&apos;s Pass
                </span>
                <p
                  className={`text-sm font-bold ${
                    mealStatus === 'VALID'
                      ? 'text-emerald-700'
                      : mealStatus === 'SERVED'
                      ? 'text-stone-700'
                      : 'text-stone-800'
                  }`}
                >
                  {mealStatus === 'VALID'
                    ? 'Purchased ✓ (VALID)'
                    : mealStatus === 'SERVED'
                    ? 'Meal Served'
                    : 'Not Purchased'}
                </p>
                <p className="text-[11px] text-stone-400">{todayFormatted}</p>
              </div>
            </div>

            {/* Quick Action Button */}
            {mealStatus === 'VALID' ? (
              <button
                onClick={() => router.push(activePass ? `/pass/${activePass.passId}` : '/pass/active')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
              >
                View Pass
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : mealStatus === 'SERVED' ? (
              <button
                onClick={() => router.push(activePass ? `/pass/${activePass.passId}` : '/pass/active')}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
              >
                Receipt
              </button>
            ) : (
              <button
                onClick={() => router.push('/payment')}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
              >
                Order
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Nav matching screenshot 2 */}
      <BottomNav />
    </div>
  );
}
