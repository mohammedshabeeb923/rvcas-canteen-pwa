'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WelcomeScreenProps {
  onEnter?: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onEnter) {
        onEnter();
      } else {
        router.push('/');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onEnter, router]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F4EFE6] flex justify-center items-center sm:p-4">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-sm min-h-[100dvh] sm:min-h-0 sm:h-[844px] sm:max-h-[92vh] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col justify-between border-stone-300/60 sm:border bg-gradient-to-b from-[#FDFBF8] via-[#FAF7F2] to-[#1E293B]">
        
        {/* TOP SECTION: Logo & Clean College Title */}
        <div className="pt-10 sm:pt-12 px-6 text-center z-20 flex flex-col items-center">
          {/* Circular Crest Logo */}
          <div className="w-20 h-20 mb-3 rounded-full bg-white/95 p-2 shadow-lg ring-2 ring-stone-200/50 flex items-center justify-center">
            <img
              src="/images/rvcas-crest.png"
              alt="RVCAS Crest"
              className="w-full h-full object-contain"
            />
          </div>

          {/* RVCAS CANTEEN Typography */}
          <div className="space-y-0.5 text-center">
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-[#6B1D2F] leading-none">
              RVCAS CANTEEN
            </h1>
            <p className="text-xs font-semibold text-stone-600 mt-1">
              Rajagiri Viswajyothi College
            </p>
          </div>
        </div>

        {/* MIDDLE & LOWER SECTION: Aerial College Campus Picture */}
        <div className="absolute inset-x-0 bottom-0 top-[38%] z-10 overflow-hidden">
          <img
            src="/images/rvcas-campus.jpg"
            alt="Rajagiri Viswajyothi College Campus"
            className="w-full h-full object-cover object-bottom"
          />
          {/* Subtle top fade overlay to smoothly blend with sky */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/60 to-transparent"></div>
          {/* Subtle bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        </div>

        {/* BOTTOM: Simple & Suitable Loading Effect */}
        <div className="p-6 pb-12 sm:pb-10 z-30 w-full flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/15 shadow-xl text-white">
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-amber-400 rounded-full animate-spin shrink-0" />
            <span className="text-xs font-medium tracking-wider text-white/90">
              Loading...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
