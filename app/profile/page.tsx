'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { User, Shield, GraduationCap, Phone, Mail, ChevronRight, LogOut } from 'lucide-react';
import { RvcasCrest } from '@/components/rvcas-crest';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      <Navbar activeRole="student" />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-stone-200/70 text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-3 border-[#6B1D2F] shadow-sm mb-3">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
              alt="Shabeeb"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-lg font-bold text-[#6B1D2F]">Shabeeb</h2>
          <p className="text-xs text-[#6B1D2F] font-semibold">BCA • Semester 3</p>
          <p className="text-[11px] font-mono text-stone-400 mt-1">
            Student ID: RVCAS/2024/BCA/042
          </p>

          <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-stone-50">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Role</span>
              <span className="font-bold text-stone-800">Regular Student</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-stone-50">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Passes Used</span>
              <span className="font-bold text-stone-800">14 Meals</span>
            </div>
          </div>
        </div>

        {/* Institution Info */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            College Information
          </h3>

          <div className="flex items-center gap-3.5">
            <RvcasCrest className="w-10 h-10" />
            <div>
              <p className="text-xs font-bold text-stone-900">Rajagiri Viswajyothi College</p>
              <p className="text-[11px] text-stone-500">Arts &amp; Applied Sciences, Vengoor</p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-3xl p-2 shadow-card border border-stone-200/70 space-y-1">

          <button
            onClick={async () => {
              try { await fetch('/api/auth/logout', { method: 'POST' }); } catch(e) {}
              if (typeof window !== 'undefined') {
                localStorage.removeItem('rvcas_user');
                localStorage.removeItem('rvcas_token');
              }
              window.location.href = '/';
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50 text-red-600 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-600">Sign Out</p>
                <p className="text-[11px] text-stone-500">End your active student session</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
