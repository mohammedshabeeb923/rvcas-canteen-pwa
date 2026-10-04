'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft, Phone, Mail, Check, X } from 'lucide-react';

interface LoginScreenProps {
  onSuccess: (user: any) => void;
  selectedRole?: 'day_scholar' | 'hosteller' | 'faculty' | 'staff' | 'admin';
  defaultRole?: 'student' | 'staff' | 'admin';
  onBackToRoles?: () => void;
}

export function LoginScreen({
  onSuccess,
  selectedRole,
  defaultRole = 'student',
  onBackToRoles,
}: LoginScreenProps) {
  const [isStaffMode, setIsStaffMode] = useState(
    defaultRole !== 'student' || selectedRole === 'staff' || selectedRole === 'admin'
  );

  const getInitialPhone = () => {
    if (selectedRole === 'hosteller') return '9847123456';
    if (selectedRole === 'faculty') return '9847123400';
    return '9847111222';
  };

  const [phone, setPhone] = useState(getInitialPhone());
  const [password, setPassword] = useState('123456');
  const [email, setEmail] = useState('shibinsha@gmail.com');
  const [pin, setPin] = useState('842601');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Authentication States
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);
  const [phoneForGoogle, setPhoneForGoogle] = useState('');

  useEffect(() => {
    setPhone(getInitialPhone());
    setIsStaffMode(selectedRole === 'staff' || selectedRole === 'admin');
    setError(null);
  }, [selectedRole]);

  const executeGoogleAuth = async (emailToUse: string, nameToUse?: string) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          name: nameToUse,
          selectedRole: selectedRole || 'day_scholar',
          role: isStaffMode ? 'staff' : (selectedRole || 'student'),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Google authentication failed');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('rvcas_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('rvcas_token', data.token);
        }
      }

      setShowGoogleModal(false);

      if (data.needsPhone) {
        setPendingGoogleUser(data.user);
        setShowPhonePrompt(true);
      } else {
        onSuccess(data.user);
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePhonePromptSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phoneForGoogle.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          studentId: pendingGoogleUser?.id,
        }),
      });

      const updatedUser = { ...pendingGoogleUser, phone: cleanPhone };
      if (typeof window !== 'undefined') {
        localStorage.setItem('rvcas_user', JSON.stringify(updatedUser));
      }
      setShowPhonePrompt(false);
      onSuccess(updatedUser);
    } catch (err: any) {
      setShowPhonePrompt(false);
      onSuccess(pendingGoogleUser);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        role: isStaffMode ? 'staff' : (selectedRole || 'student'),
        selectedRole: isStaffMode ? 'staff' : (selectedRole || 'day_scholar'),
        rememberMe,
      };

      if (!isStaffMode) {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10) {
          throw new Error('Please enter a valid 10-digit mobile number.');
        }
        payload.phone = cleanPhone;
        payload.password = password;
      } else {
        payload.email = email.trim().toLowerCase();
        payload.pin = pin || '842601';
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('rvcas_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('rvcas_token', data.token);
        }
      }

      onSuccess(data.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getHeaderTitle = () => {
    if (isStaffMode) return 'Staff & Admin Console';
    if (selectedRole === 'hosteller') return 'Hosteller Sign In';
    if (selectedRole === 'faculty') return 'Faculty Sign In';
    return 'Day Scholar Sign In';
  };

  const getHeaderSubtitle = () => {
    if (isStaffMode) return 'Authorized canteen personnel & admin access';
    if (selectedRole === 'hosteller') return 'Enter mobile number to declare your meal requirements';
    if (selectedRole === 'faculty') return 'Enter mobile number to book faculty lunch coupon';
    return 'Enter mobile number to book today’s lunch';
  };

  return (
    <div className="h-[100dvh] w-full bg-[#FAF7F2] sm:bg-[#F4EFE6] flex justify-center items-center overflow-hidden sm:p-4">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-sm h-full sm:h-[844px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-stone-300/80 sm:shadow-2xl overflow-hidden relative flex flex-col justify-between bg-[#FAF7F2]">
        
        {/* TOP SECTION: College Campus Photo focused on the Main Academic Building */}
        <div className="relative h-[29%] min-h-[170px] max-h-[225px] w-full overflow-hidden shrink-0">
          <img
            src="/images/rvcas-campus-uhd.jpg"
            alt="Rajagiri Viswajyothi College Building"
            className="w-full h-full object-cover object-[center_52%]"
          />
          {/* Subtle vignette overlay to keep building clear while ensuring header readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/30" />

          {/* Top College Header Bar with Back to Roles if applicable */}
          <div className="absolute top-4 inset-x-0 px-4 flex items-center justify-between text-white z-10">
            {onBackToRoles ? (
              <button
                type="button"
                onClick={onBackToRoles}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-black/45 hover:bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white/95 shadow-sm transition cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change Role</span>
              </button>
            ) : (
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/95 drop-shadow-md">
                RVCAS • DINING PORTAL
              </span>
            )}

            <span className="text-[10px] font-semibold bg-black/45 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-white/95 shadow-sm">
              Rajagiri
            </span>
          </div>

          {/* Circular Crest Logo taken upwards inside the photo */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-xl ring-3 ring-white/90 flex items-center justify-center">
              <img
                src="/images/rvcas-crest.png"
                alt="RVCAS Crest"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM FORM SHEET: Clean & Human-Designed */}
        <div className="flex-1 flex flex-col justify-between pt-5 sm:pt-6 px-5 pb-4 overflow-y-auto z-10">
          
          {/* Titles */}
          <div className="text-center space-y-0.5">
            <h1 className="text-lg sm:text-xl font-serif font-black tracking-wider text-[#6B1D2F] leading-tight">
              RVCAS CANTEEN
            </h1>
            <p className="text-[11px] text-stone-500 font-medium">
              Rajagiri Viswajyothi College of Arts &amp; Applied Sciences
            </p>

            <div className="pt-2">
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
                {getHeaderTitle()}
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {getHeaderSubtitle()}
              </p>
            </div>
          </div>

          {/* Google Sign-In Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-stone-50 active:scale-[0.99] border-2 border-stone-200 hover:border-stone-300 text-stone-800 font-bold py-2.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{googleLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center gap-2 my-2 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex-1 h-px bg-stone-200" />
                <span>or use {isStaffMode ? 'gmail pin' : 'phone'}</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="my-auto py-1 space-y-2.5">
            {!isStaffMode ? (
              <>
                {/* Mobile Phone Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Phone Number
                  </label>
                  <div className="flex rounded-xl bg-white border border-stone-300/80 shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-[#6B1D2F]/30 focus-within:border-[#6B1D2F] transition">
                    <div className="inline-flex items-center gap-1 px-3 bg-stone-50 border-r border-stone-200 text-xs font-bold text-stone-700 select-none">
                      <span className="text-sm">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={getInitialPhone()}
                      className="w-full px-3 py-2.5 text-stone-900 placeholder:text-stone-300 text-sm font-bold tracking-wider focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Password
                  </label>
                  <div className="relative rounded-xl bg-white border border-stone-300/80 shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-[#6B1D2F]/30 focus-within:border-[#6B1D2F] transition">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter student password"
                      className="w-full pl-9 pr-10 py-2.5 text-stone-900 placeholder:text-stone-300 text-sm font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Quick Demo Accounts */}
                  <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-stone-400">Quick Test:</span>
                    {selectedRole === 'hosteller' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setPhone('9847123456');
                            setPassword('123456');
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#6B1D2F]/10 text-[#6B1D2F] hover:bg-[#6B1D2F]/20 transition"
                        >
                          ⚡ Shabeeb (Hosteller)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhone('9847234567');
                            setPassword('123456');
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 transition"
                        >
                          ⚡ Nandana (Hosteller)
                        </button>
                      </>
                    ) : selectedRole === 'faculty' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPhone('9847123400');
                          setPassword('123456');
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                      >
                        ⚡ Prof. Mathew (Faculty)
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setPhone('9847111222');
                            setPassword('123456');
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition"
                        >
                          ⚡ Albin (Day Scholar)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhone('9847123459');
                            setPassword('123456');
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition"
                        >
                          ⚡ Jithin (Day Scholar)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Staff / Admin College Gmail */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Authorized Gmail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shibinsha@gmail.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-300/80 text-stone-900 placeholder:text-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6B1D2F]/30 focus:border-[#6B1D2F] transition shadow-xs"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Authorized: <span className="font-semibold text-stone-600">shibinsha@gmail.com</span>
                  </p>
                </div>

                {/* Counter PIN */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Security PIN
                  </label>
                  <div className="relative rounded-xl bg-white border border-stone-300/80 shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-[#6B1D2F]/30 focus-within:border-[#6B1D2F] transition">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="842601"
                      className="w-full pl-9 pr-10 py-2.5 text-stone-900 placeholder:text-stone-300 text-sm font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#6B1D2F] focus:ring-[#6B1D2F] border-stone-300 accent-[#6B1D2F]"
                />
                <span className="text-[11px] font-medium text-stone-600">
                  Stay signed in on this device
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6B1D2F] to-[#501220] hover:from-[#501220] hover:to-[#380B16] active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-60 mt-1 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>{isStaffMode ? 'Access Counter Console' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher & Security Footer */}
          <div className="pt-2 border-t border-stone-200/80 text-center space-y-1.5">
            {onBackToRoles && (
              <button
                type="button"
                onClick={onBackToRoles}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center justify-center gap-1 mx-auto cursor-pointer mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Role Selection</span>
              </button>
            )}

            {!isStaffMode ? (
              <button
                type="button"
                onClick={() => { setIsStaffMode(true); setError(null); }}
                className="text-xs font-semibold text-[#6B1D2F] hover:underline cursor-pointer block mx-auto"
              >
                Canteen Staff or Administrator? Sign In Here →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setIsStaffMode(false); setError(null); }}
                className="text-xs font-semibold text-[#6B1D2F] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to User Sign In</span>
              </button>
            )}

            <p className="text-[10px] text-stone-400 font-medium">
              🔒 256-Bit SSL Encrypted • Rajagiri Viswajyothi Dining PWA
            </p>
          </div>
        </div>

        {/* Google Account Picker Modal */}
        {showGoogleModal && (
          <div
            onClick={() => setShowGoogleModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <h3 className="text-sm font-bold text-stone-900">Sign In with Google</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-500 font-medium">
                Select an account for <span className="font-bold text-[#6B1D2F]">{getHeaderTitle()}</span>:
              </p>

              {/* Quick Pick Google Accounts */}
              <div className="space-y-1.5 overflow-y-auto max-h-[220px]">
                {isStaffMode ? (
                  <button
                    type="button"
                    onClick={() => executeGoogleAuth('shibinsha@gmail.com', 'Shibinsha')}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-stone-200 hover:border-[#6B1D2F] hover:bg-[#6B1D2F]/5 transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                        S
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900">Shibinsha (Authorized Staff/Admin)</p>
                        <p className="text-[10px] text-stone-500">shibinsha@gmail.com</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                ) : selectedRole === 'hosteller' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => executeGoogleAuth('shabeeb@rvcas.ac.in', 'Shabeeb')}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-stone-200 hover:border-[#6B1D2F] hover:bg-[#6B1D2F]/5 transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                          S
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">Shabeeb (Hosteller)</p>
                          <p className="text-[10px] text-stone-500">shabeeb@rvcas.ac.in</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeGoogleAuth('nandana@rvcas.ac.in', 'Nandana P Nair')}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-stone-200 hover:border-[#6B1D2F] hover:bg-[#6B1D2F]/5 transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                          N
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">Nandana P Nair (Hosteller)</p>
                          <p className="text-[10px] text-stone-500">nandana@rvcas.ac.in</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  </>
                ) : selectedRole === 'faculty' ? (
                  <button
                    type="button"
                    onClick={() => executeGoogleAuth('mathew.joseph@rvcas.ac.in', 'Prof. Mathew Joseph')}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-stone-200 hover:border-[#6B1D2F] hover:bg-[#6B1D2F]/5 transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        M
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900">Prof. Mathew Joseph (Faculty)</p>
                        <p className="text-[10px] text-stone-500">mathew.joseph@rvcas.ac.in</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => executeGoogleAuth('albin@rvcas.ac.in', 'Albin John')}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-stone-200 hover:border-[#6B1D2F] hover:bg-[#6B1D2F]/5 transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-xs">
                          A
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">Albin John (Day Scholar)</p>
                          <p className="text-[10px] text-stone-500">albin@rvcas.ac.in</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeGoogleAuth('jithin@rvcas.ac.in', 'Jithin Salim')}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-stone-200 hover:border-[#6B1D2F] hover:bg-[#6B1D2F]/5 transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-xs">
                          J
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">Jithin Salim (Day Scholar)</p>
                          <p className="text-[10px] text-stone-500">jithin@rvcas.ac.in</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  </>
                )}
              </div>

              {/* Custom Google Email Input */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Or enter your Google Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={googleCustomEmail}
                    onChange={(e) => setGoogleCustomEmail(e.target.value)}
                    placeholder="student@rvcas.ac.in"
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B1D2F]/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (googleCustomEmail.trim()) {
                        executeGoogleAuth(googleCustomEmail.trim());
                      }
                    }}
                    disabled={!googleCustomEmail.trim() || googleLoading}
                    className="bg-[#6B1D2F] hover:bg-[#501220] disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl text-xs transition"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phone Collection Prompt Modal (for Google Users without Phone Number) */}
        {showPhonePrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                <div className="w-9 h-9 rounded-xl bg-[#6B1D2F]/10 text-[#6B1D2F] flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Enter Mobile Number</h3>
                  <p className="text-[11px] text-stone-500">Required for food coupons &amp; Cashfree payment</p>
                </div>
              </div>

              <form onSubmit={handlePhonePromptSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    10-Digit Mobile Number
                  </label>
                  <div className="flex rounded-xl bg-stone-50 border border-stone-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#6B1D2F]/30 focus-within:border-[#6B1D2F] transition">
                    <div className="inline-flex items-center gap-1 px-3 bg-stone-100 border-r border-stone-200 text-xs font-bold text-stone-700 select-none">
                      <span className="text-sm">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phoneForGoogle}
                      onChange={(e) => setPhoneForGoogle(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9847123456"
                      className="w-full px-3 py-2.5 text-stone-900 placeholder:text-stone-300 text-sm font-bold tracking-wider bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={phoneForGoogle.replace(/[^0-9]/g, '').length !== 10}
                  className="w-full bg-[#6B1D2F] hover:bg-[#501220] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Save &amp; Continue to Canteen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
