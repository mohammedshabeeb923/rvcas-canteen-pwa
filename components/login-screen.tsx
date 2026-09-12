'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

interface LoginScreenProps {
  onSuccess: (user: any) => void;
  defaultRole?: 'student' | 'staff' | 'admin';
}

export function LoginScreen({ onSuccess, defaultRole = 'student' }: LoginScreenProps) {
  const [isStaffMode, setIsStaffMode] = useState(defaultRole !== 'student');
  const [phone, setPhone] = useState('9847123456');
  const [password, setPassword] = useState('123456');
  const [email, setEmail] = useState('shibinsha@gmail.com');
  const [pin, setPin] = useState('842601');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        role: isStaffMode ? 'staff' : 'student',
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

          {/* Top College Header Bar */}
          <div className="absolute top-4 inset-x-0 px-4 flex items-center justify-between text-white z-10">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/95 drop-shadow-md">
              RVCAS • DINING PORTAL
            </span>
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
                {isStaffMode ? 'Staff & Admin Console' : 'Student Sign In'}
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {isStaffMode
                  ? 'Authorized canteen personnel & admin access'
                  : 'Enter mobile number to book today’s lunch'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="my-auto py-2 space-y-3">
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
                      placeholder="9847123456"
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
            {!isStaffMode ? (
              <button
                type="button"
                onClick={() => { setIsStaffMode(true); setError(null); }}
                className="text-xs font-semibold text-[#6B1D2F] hover:underline cursor-pointer"
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
                <span>Back to Student Sign In</span>
              </button>
            )}

            <p className="text-[10px] text-stone-400 font-medium">
              🔒 256-Bit SSL Encrypted • Rajagiri Viswajyothi Dining PWA
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
