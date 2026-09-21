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
    <div
      onClick={() => {
        if (onEnter) onEnter();
        else router.push('/');
      }}
      className="h-[100dvh] w-full bg-[#FAF7F2] sm:bg-[#F4EFE6] flex justify-center items-center overflow-hidden sm:p-4 cursor-pointer select-none"
    >
      {/* Mobile Screen Container */}
      <div className="w-full max-w-sm h-full sm:h-[844px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-stone-300/80 sm:shadow-2xl overflow-hidden relative flex flex-col justify-between bg-gradient-to-b from-[#FDFBF8] via-[#FAF7F2] to-[#141E28]">
        
        {/* TOP SECTION: Logo & Clean College Title */}
        <div className="pt-10 sm:pt-12 px-6 text-center z-20 flex flex-col items-center">
          {/* Circular Crest Logo */}
          <div className="w-20 h-20 mb-3 rounded-full bg-white p-2 shadow-lg ring-2 ring-stone-200/60 flex items-center justify-center">
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
            <p className="text-xs font-bold text-stone-700 mt-1.5">
              Rajagiri Viswajyothi College
            </p>
            <p className="text-[11px] text-stone-500 font-medium">
              Arts &amp; Applied Sciences • Vengoor
            </p>
          </div>
        </div>

        {/* MIDDLE & LOWER SECTION: Aerial College Campus Picture focused on Academic Buildings */}
        <div className="absolute inset-x-0 bottom-0 top-[32%] sm:top-[34%] z-10 overflow-hidden">
          <img
            src="/images/rvcas-campus-uhd.jpg"
            alt="Rajagiri Viswajyothi College Campus"
            className="w-full h-full object-cover object-[center_52%]"
          />
          {/* Top fade overlay to smoothly blend with sky */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/60 to-transparent" />
          {/* Bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* BOTTOM: Simple & Suitable Loading Effect */}
        <div className="p-6 pb-10 sm:pb-12 z-30 w-full flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-xl text-white">
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-amber-400 rounded-full animate-spin shrink-0" />
            <span className="text-xs font-semibold tracking-wider text-white/95">
              Loading Canteen...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
