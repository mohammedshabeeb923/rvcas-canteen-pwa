'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Camera, ShieldCheck, ArrowRight } from 'lucide-react';

export default function StaffQRScanPage() {
  const router = useRouter();
  const [torchOn, setTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Sample quick passes for effortless testing in browser
  const quickTestPasses = [
    { label: 'Shabeeb (VALID)', token: 'tok_rvcas_seed_8f42k_shabeeb', id: 'RVCAS-20260827-8F42K' },
    { label: 'Albin John (SERVED)', token: 'tok_rvcas_seed_7k91d_albin', id: 'RVCAS-20260827-7K91D' },
    { label: 'Fathima Rifa (VALID)', token: 'tok_rvcas_seed_4p73q_fathima', id: 'RVCAS-20260827-4P73Q' },
  ];

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    router.push(`/verify-pass/${manualCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-between select-none">
      {/* Top Header matching design */}
      <header className="px-4 py-3 flex items-center justify-between z-30 bg-black/40 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-white tracking-wide">QR Scanner</h1>
        <button
          onClick={() => setTorchOn(!torchOn)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
            torchOn ? 'bg-amber-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title="Toggle Flashlight"
        >
          <Zap className="w-4 h-4" />
        </button>
      </header>

      {/* Center Viewfinder matching screenshot */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Ambient Dark Canteen Background */}
        <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none filter blur-xs"
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80')" }}>
        </div>

        {/* Viewfinder Reticle Frame */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
          {/* 4 Corner Markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>

          {/* Animated Red Scanning Laser Line */}
          <div className="absolute left-3 right-3 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-bounce top-1/2"></div>
        </div>

        {/* Guide text */}
        <p className="text-xs text-stone-300 text-center font-medium mt-6 max-w-xs">
          Place the student&apos;s QR code inside the frame
        </p>

        {/* Browser Sandbox Quick QR Simulation Shortcuts */}
        <div className="mt-8 bg-stone-900/90 border border-stone-800 rounded-3xl p-4 w-full max-w-xs space-y-3 z-20">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block text-center">
            Simulate QR Detection
          </span>

          <div className="space-y-1.5">
            {quickTestPasses.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/verify-pass/${p.token}`)}
                className="w-full text-left px-3 py-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-xs flex items-center justify-between transition"
              >
                <div>
                  <p className="font-semibold text-white">{p.label}</p>
                  <p className="text-[10px] font-mono text-stone-400">{p.id}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            ))}
          </div>

          <form onSubmit={handleScanSubmit} className="pt-2 border-t border-stone-800 flex gap-1.5">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or enter pass token..."
              className="w-full text-xs px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#6B1D2F] text-white rounded-xl text-xs font-bold shrink-0"
            >
              Scan
            </button>
          </form>
        </div>
      </main>

      <footer className="p-4 text-center text-[11px] text-stone-500">
        RVCAS Canteen Staff Fallback Optical Terminal
      </footer>
    </div>
  );
}
