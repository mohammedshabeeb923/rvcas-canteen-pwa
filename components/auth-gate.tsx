'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { RvcasCrest } from './rvcas-crest';

interface AuthGateProps {
  requiredRole: 'staff' | 'admin';
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthGate({ requiredRole, title, subtitle, children }: AuthGateProps) {
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check active session on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          // Verify role match
          if (requiredRole === 'admin' && data.user.role !== 'admin') {
            setSession(null);
          } else {
            setSession(data.user);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [requiredRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role: requiredRole,
          pin: pin.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSession(data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#6B1D2F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If authenticated with authorized Gmail
  if (session) {
    return (
      <div>
        {/* Top Authorized Staff/Admin Bar */}
        <div className="bg-[#4A1220] text-white px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="max-w-md md:max-w-5xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-[11px] text-white/90">
                Authorized {session.role.toUpperCase()}: <strong>{session.email}</strong>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] text-white/80 hover:text-white underline font-semibold ml-3"
            >
              Sign Out
            </button>
          </div>
        </div>

        {children}
      </div>
    );
  }

  // AUTHENTICATION REQUIRED GATE
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-card border border-stone-200/80 space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#6B1D2F]/10 text-[#6B1D2F] mx-auto flex items-center justify-center p-1">
            <RvcasCrest className="w-12 h-12" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B1D2F]">
              RVCAS SECURITY GATEWAY
            </span>
            <h2 className="text-lg font-bold text-stone-900 leading-tight mt-0.5">
              {title}
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Security Warning / Info */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            This console is encrypted. Access is strictly restricted to designated authorized Gmail accounts.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Authorized Gmail Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. shibinsha@gmail.com"
              required
              className="w-full text-xs px-3.5 py-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#6B1D2F] font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Staff Security PIN
              </label>
              <span className="text-[10px] text-stone-400">Default: 842601</span>
            </div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (optional in dev)"
              className="w-full text-xs px-3.5 py-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#6B1D2F] font-mono tracking-widest"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#6B1D2F] hover:bg-[#501220] active:scale-[0.99] disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md text-xs flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Authorize &amp; Enter Console</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
