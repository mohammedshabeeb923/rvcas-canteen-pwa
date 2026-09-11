'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Utensils, ShieldCheck, ChevronRight, Check, Plus, Trash2, Users } from 'lucide-react';
import Script from 'next/script';

interface PeerStudent {
  id: string;
  name: string;
  courseSem: string;
}

const PEER_OPTIONS: PeerStudent[] = [
  { id: 'student_albin', name: 'Albin John', courseSem: 'B.Com • Semester 5' },
  { id: 'student_nandana', name: 'Nandana P Nair', courseSem: 'BBA • Semester 3' },
  { id: 'student_jithin', name: 'Jithin Salim', courseSem: 'BCA • Semester 3' },
  { id: 'student_fathima', name: 'Fathima Rifa', courseSem: 'B.Sc CS • Semester 1' },
];

export default function PaymentPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'gpay' | 'phonepe' | 'paytm'>('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-meal support
  const [selectedPeers, setSelectedPeers] = useState<PeerStudent[]>([]);
  const [showPeerModal, setShowPeerModal] = useState(false);

  const mealPrice = 40;
  const totalMeals = 1 + selectedPeers.length;
  const totalAmount = mealPrice * totalMeals;

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleTogglePeer = (peer: PeerStudent) => {
    if (selectedPeers.some((p) => p.id === peer.id)) {
      setSelectedPeers(selectedPeers.filter((p) => p.id !== peer.id));
    } else {
      setSelectedPeers([...selectedPeers, peer]);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Prepare recipients array
      const recipients = [
        {
          studentId: 'student_shabeeb',
          name: 'Shabeeb',
          courseSem: 'BCA • Semester 3',
        },
        ...selectedPeers.map((p) => ({
          studentId: p.id,
          name: p.name,
          courseSem: p.courseSem,
        })),
      ];

      // 2. Call server-side /api/orders/create
      const createRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'student_shabeeb',
          mealId: 'meal_today',
          quantity: totalMeals,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || 'Order creation failed');
      }

      // 3. Launch Cashfree SDK if in browser and not simulation
      const hasCashfreeSDK = typeof window !== 'undefined' && (window as any).Cashfree;
      if (!createData.isSimulated && hasCashfreeSDK && createData.paymentSessionId) {
        const cashfree = (window as any).Cashfree({
          mode: createData.environment === 'production' ? 'production' : 'sandbox',
        });

        await new Promise<void>((resolve, reject) => {
          cashfree
            .checkout({
              paymentSessionId: createData.paymentSessionId,
              redirectTarget: '_modal',
            })
            .then((result: any) => {
              if (result.error) {
                reject(new Error(result.error.message || 'Payment was cancelled or failed.'));
              } else {
                resolve();
              }
            })
            .catch((err: any) => reject(err));
        });
      }

      // 4. Send to server for genuine verification & pass generation
      const verifyRes = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createData.orderId,
          cashfreeOrderId: createData.cashfreeOrderId,
          recipients,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Server payment verification failed');
      }

      // 5. Success! Navigate to payment success screen with pass references
      const passIds = verifyData.passes.map((p: any) => p.passId).join(',');
      router.push(`/payment/success?orderId=${createData.orderId}&passIds=${passIds}&count=${totalMeals}`);
    } catch (err: any) {
      console.error('Payment failure:', err);
      setError(err.message || 'Payment could not be completed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200/80 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-stone-900">Payment</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Maroon Hero Meal Card with Kerala Meals Thumbnail */}
        <div className="bg-[#6B1D2F] text-white rounded-3xl p-5 shadow-elevated mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                Traditional Kerala Oonu
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">Daily College Meal</h2>
              <p className="text-xs text-white/80 mt-0.5">{todayFormatted}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 shadow-md shrink-0">
              <img
                src="/images/kerala-meals.jpg"
                alt="Kerala Meals"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Multi-Student Meal Selection Option */}
        <div className="bg-white rounded-3xl p-4 shadow-card border border-stone-200/70 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6B1D2F]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Meal Beneficiaries ({totalMeals})
              </h3>
            </div>
            <button
              onClick={() => setShowPeerModal(true)}
              className="text-xs font-bold text-[#6B1D2F] hover:bg-[#6B1D2F]/5 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Classmate
            </button>
          </div>

          <div className="space-y-2">
            {/* Primary Student */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#6B1D2F] text-white text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <p className="font-bold text-stone-900">Shabeeb (You)</p>
                  <p className="text-[11px] text-stone-500">BCA • Semester 3</p>
                </div>
              </div>
              <span className="font-bold text-[#6B1D2F]">₹40</span>
            </div>

            {/* Additional Selected Peers */}
            {selectedPeers.map((peer, idx) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-300 text-stone-700 text-[10px] font-bold flex items-center justify-center">
                    {idx + 2}
                  </span>
                  <div>
                    <p className="font-bold text-stone-900">{peer.name}</p>
                    <p className="text-[11px] text-stone-500">{peer.courseSem}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#6B1D2F]">₹40</span>
                  <button
                    onClick={() => handleTogglePeer(peer)}
                    className="text-stone-400 hover:text-red-500 transition p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown Card */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70 mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Meal Pass ({totalMeals} × ₹40)</span>
            <span className="font-semibold text-stone-900">₹{totalAmount}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>Platform Fee</span>
            <span className="font-semibold text-stone-900">₹0</span>
          </div>
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-sm font-bold text-stone-900">
            <span>Total Amount</span>
            <span className="text-xl font-extrabold text-[#6B1D2F]">₹{totalAmount}</span>
          </div>
        </div>

        {/* Pay Securely Section */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pay securely using</span>
          </div>

          <div className="bg-white rounded-3xl p-2 shadow-card border border-stone-200/70 space-y-1">
            {/* UPI Option */}
            <button
              onClick={() => setSelectedMethod('upi')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition ${
                selectedMethod === 'upi' ? 'bg-[#6B1D2F]/5' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-xs text-stone-700">
                  UPI
                </div>
                <span className="text-sm font-semibold text-stone-800">UPI ID / QR</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Google Pay */}
            <button
              onClick={() => setSelectedMethod('gpay')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition ${
                selectedMethod === 'gpay' ? 'bg-[#6B1D2F]/5' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  GPay
                </div>
                <span className="text-sm font-semibold text-stone-800">Google Pay</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* PhonePe */}
            <button
              onClick={() => setSelectedMethod('phonepe')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition ${
                selectedMethod === 'phonepe' ? 'bg-[#6B1D2F]/5' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                  Pe
                </div>
                <span className="text-sm font-semibold text-stone-800">PhonePe</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Paytm */}
            <button
              onClick={() => setSelectedMethod('paytm')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition ${
                selectedMethod === 'paytm' ? 'bg-[#6B1D2F]/5' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                  paytm
                </div>
                <span className="text-sm font-semibold text-stone-800">Paytm</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Pay Action Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-[#6B1D2F] hover:bg-[#501220] active:scale-[0.99] disabled:opacity-60 text-white font-bold py-4 px-4 rounded-2xl transition shadow-elevated text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              <span>Verifying & Issuing Pass...</span>
            </div>
          ) : (
            <span>Pay ₹{totalAmount}</span>
          )}
        </button>

        <p className="text-[11px] text-center text-stone-400 mt-3 font-medium">
          🔒 Payments are securely processed with Cashfree Payments.
        </p>

        {/* Cashfree Web SDK */}
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="lazyOnload"
        />
      </main>

      {/* Multi-Student Selection Modal */}
      {showPeerModal && (
        <div
          onClick={() => setShowPeerModal(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-900">Add Classmate Meal</h4>
              <button
                onClick={() => setShowPeerModal(false)}
                className="text-xs font-semibold text-stone-400 hover:text-stone-600"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Each student receives an independent digital meal pass and verification token.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {PEER_OPTIONS.map((peer) => {
                const isSelected = selectedPeers.some((p) => p.id === peer.id);
                return (
                  <button
                    key={peer.id}
                    onClick={() => handleTogglePeer(peer)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-[#6B1D2F] bg-[#6B1D2F]/5'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-stone-900">{peer.name}</p>
                      <p className="text-[11px] text-stone-500">{peer.courseSem}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#6B1D2F] border-[#6B1D2F] text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowPeerModal(false)}
              className="w-full bg-[#6B1D2F] text-white py-3 rounded-xl font-bold text-xs transition"
            >
              Done ({selectedPeers.length} added)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
