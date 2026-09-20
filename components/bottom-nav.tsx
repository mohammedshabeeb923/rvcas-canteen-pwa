'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Ticket, Clock, User, Calendar } from 'lucide-react';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isHosteller, setIsHosteller] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('rvcas_user');
      if (cached) {
        try {
          const u = JSON.parse(cached);
          if (u.studentType === 'hosteller' || u.role === 'hosteller') {
            setIsHosteller(true);
          }
        } catch (e) {}
      }
    }
  }, []);

  const tabs = isHosteller
    ? [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Special Days', path: '/', icon: Calendar },
        { label: 'History', path: '/history', icon: Clock },
        { label: 'Profile', path: '/profile', icon: User },
      ]
    : [
        { label: 'Home', path: '/', icon: Home },
        { label: 'My Pass', path: '/pass/active', icon: Ticket },
        { label: 'History', path: '/history', icon: Clock },
        { label: 'Profile', path: '/profile', icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive =
            tab.path === '/'
              ? pathname === '/' && idx === 0
              : tab.path === '/pass/active'
              ? pathname.startsWith('/pass')
              : pathname.startsWith(tab.path);

          return (
            <button
              key={`${tab.label}-${idx}`}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition relative cursor-pointer ${
                isActive
                  ? 'text-[#6B1D2F] font-bold'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-[#6B1D2F] rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
