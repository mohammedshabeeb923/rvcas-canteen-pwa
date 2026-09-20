'use client';

import React from 'react';
import { GraduationCap, Building2, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export type UserRoleChoice = 'day_scholar' | 'hosteller' | 'faculty';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRoleChoice) => void;
  onStaffLogin: () => void;
}

export function RoleSelectionScreen({
  onSelectRole,
  onStaffLogin,
}: RoleSelectionScreenProps) {
  return (
    <div className="h-[100dvh] w-full bg-[#FAF7F2] sm:bg-[#F4EFE6] flex justify-center items-center overflow-hidden sm:p-4">
      {/* Mobile Screen Container matching existing design */}
      <div className="w-full max-w-sm h-full sm:h-[844px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-stone-300/80 sm:shadow-2xl overflow-hidden relative flex flex-col justify-between bg-[#FAF7F2]">
        
        {/* TOP SECTION: College Campus Photo focused on Main Academic Building */}
        <div className="relative h-[28%] min-h-[165px] max-h-[220px] w-full overflow-hidden shrink-0">
          <img
            src="/images/rvcas-campus-uhd.jpg"
            alt="Rajagiri Viswajyothi College Building"
            className="w-full h-full object-cover object-[center_52%]"
          />
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/35" />

          {/* Top College Header Bar */}
          <div className="absolute top-4 inset-x-0 px-4 flex items-center justify-between text-white z-10">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/95 drop-shadow-md">
              RVCAS • DINING PORTAL
            </span>
            <span className="text-[10px] font-semibold bg-black/45 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-white/95 shadow-sm">
              Rajagiri
            </span>
          </div>

          {/* Circular Crest Logo */}
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

        {/* BOTTOM CONTENT: "Who are you?" Selection Sheet */}
        <div className="flex-1 flex flex-col justify-between pt-5 sm:pt-6 px-5 pb-5 overflow-y-auto z-10">
          
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#6B1D2F] tracking-tight leading-tight">
              Who are you?
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              Please select your role to continue
            </p>
          </div>

          {/* 3 ROLE OPTIONS */}
          <div className="my-auto py-3 space-y-3">
            {/* OPTION 1: DAY SCHOLAR */}
            <button
              type="button"
              onClick={() => onSelectRole('day_scholar')}
              className="w-full bg-white hover:bg-stone-50 active:scale-[0.99] border-2 border-stone-200 hover:border-[#6B1D2F]/50 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-stone-900 leading-tight">
                      Day Scholar
                    </h3>
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                      Student
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    Lunch coupon booking &amp; canteen dining
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#6B1D2F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* OPTION 2: HOSTELLER */}
            <button
              type="button"
              onClick={() => onSelectRole('hosteller')}
              className="w-full bg-white hover:bg-stone-50 active:scale-[0.99] border-2 border-stone-200 hover:border-[#6B1D2F]/50 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-stone-900 leading-tight">
                      Hosteller
                    </h3>
                    <span className="text-[9px] font-bold text-purple-800 bg-purple-100/80 px-1.5 py-0.5 rounded-md">
                      Resident
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    Breakfast, lunch, snack &amp; dinner requirements
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#6B1D2F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* OPTION 3: FACULTY */}
            <button
              type="button"
              onClick={() => onSelectRole('faculty')}
              className="w-full bg-white hover:bg-stone-50 active:scale-[0.99] border-2 border-stone-200 hover:border-[#6B1D2F]/50 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-stone-900 leading-tight">
                      Faculty
                    </h3>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                      Teaching Staff
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    Faculty lunch coupons &amp; dining passes
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#6B1D2F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>

          {/* BOTTOM: Staff / Admin Console Link & Footer */}
          <div className="pt-3 border-t border-stone-200/80 text-center space-y-2">
            <button
              type="button"
              onClick={onStaffLogin}
              className="text-xs font-semibold text-[#6B1D2F] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Canteen Staff or Administrator? Sign in here →</span>
            </button>

            <p className="text-[10px] text-stone-400 font-medium flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>256-Bit SSL Encrypted • Rajagiri Viswajyothi Dining PWA</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
