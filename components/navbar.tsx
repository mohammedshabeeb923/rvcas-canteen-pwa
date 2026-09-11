'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { Menu, X, Bell, User, ShieldCheck, QrCode, LayoutDashboard, ChevronDown, LogOut, Clock } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar({ 
  activeRole = 'student',
  onLogout,
}: { 
  activeRole?: 'student' | 'staff' | 'admin';
  onLogout?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rvcas_user');
      localStorage.removeItem('rvcas_token');
      // Hard redirect to root to reset session and show login screen
      window.location.href = '/';
    }
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Menu & Brand with Official Logo */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-[#6B1D2F] hover:bg-stone-50 active:scale-95 transition shadow-xs cursor-pointer select-none"
            aria-label="Open Navigation Menu"
            title="Menu"
          >
            {menuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>

          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white p-1 border border-stone-200/80 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/images/rvcas-crest.png"
                alt="RVCAS Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D2F] block">
                RVCAS CANTEEN
              </span>
              <h1 className="text-xs font-bold text-stone-900 leading-tight">
                Rajagiri Viswajyothi
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Notification Bell & Avatar */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => alert('No new canteen notifications')}
            className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-600 hover:text-[#6B1D2F] transition shadow-xs relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></span>
          </button>

          {/* Quick Role Switcher Avatar */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1 p-1 rounded-full bg-white border border-stone-200/80 shadow-xs hover:ring-2 hover:ring-[#6B1D2F]/20 transition"
              title="Switch role"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt="Shabeeb Profile"
                className="w-8 h-8 rounded-full object-cover border border-[#6B1D2F]/30"
              />
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 mr-0.5" />
            </button>

            {/* Dropdown Menu */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-stone-100">
                  <p className="text-xs font-semibold text-stone-800">Shabeeb</p>
                  <p className="text-[11px] text-stone-500">BCA • Semester 3</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      router.push('/profile');
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-stone-50 transition text-stone-700"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      router.push('/history');
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-stone-50 transition text-stone-700"
                  >
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    Meal History
                  </button>

                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-red-50 text-red-600 font-semibold border-t border-stone-100 transition mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Overlay if menu opened */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-[100] flex animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 max-w-[85vw] bg-[#FAF7F2] h-full shadow-2xl p-5 flex flex-col justify-between border-r border-stone-200 animate-in slide-in-from-left duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 border border-stone-200 flex items-center justify-center shadow-xs">
                    <img src="/images/rvcas-crest.png" alt="RVCAS Crest" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">RVCAS Canteen</h3>
                    <p className="text-[11px] text-stone-500">Rajagiri Viswajyothi</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-stone-200/60 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition"
                  title="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 space-y-2 text-sm font-medium">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 hover:bg-stone-200/60 transition"
                >
                  🏠 Student Home
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/pass/active');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 hover:bg-stone-200/60 transition"
                >
                  🎫 Today&apos;s Meal Pass
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/history');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 hover:bg-stone-200/60 transition"
                >
                  🕒 Order History
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/profile');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 hover:bg-stone-200/60 transition"
                >
                  👤 Student Profile
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition flex items-center gap-2 border-t border-stone-200/60 mt-1"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 text-center text-xs text-stone-400">
              <p className="font-semibold text-stone-600">Rajagiri Viswajyothi College</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Canteen Dining System</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
