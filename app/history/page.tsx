'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { Clock, Calendar, ArrowRight, CheckCircle2, Utensils } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.passes) {
          const myPasses = data.passes.filter((p: any) => p.studentId === 'student_shabeeb');
          setPasses(myPasses);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      <Navbar activeRole="student" />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">Meal History</h1>
            <p className="text-xs text-stone-500">Your past daily meal bookings and receipts</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-[#6B1D2F] shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">Loading history...</div>
        ) : passes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center space-y-2 border border-stone-200/70 shadow-xs">
            <Utensils className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-800">No Meals Booked Yet</p>
            <p className="text-xs text-stone-500">Book today&apos;s meal for ₹40 to get started.</p>
            <button
              onClick={() => router.push('/payment')}
              className="mt-3 px-4 py-2 bg-[#6B1D2F] text-white rounded-xl text-xs font-bold"
            >
              Book Today&apos;s Meal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {passes.map((p) => {
              const isServed = p.status === 'SERVED';
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/pass/${p.passId}`)}
                  className="bg-white rounded-3xl p-4 shadow-card border border-stone-200/70 hover:border-[#6B1D2F] transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isServed
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isServed ? '✓' : '●'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-stone-900">{p.mealName}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isServed
                              ? 'bg-stone-100 text-stone-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isServed ? 'Served' : 'Valid'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{p.mealDate}</p>
                      <p className="text-[10px] font-mono text-stone-400 mt-0.5">{p.passId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#6B1D2F] text-sm">₹{p.amount}</span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
