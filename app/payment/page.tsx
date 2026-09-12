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

const DEFAULT_PEERS: PeerStudent[] = [
  { id: 'student_albin', name: 'Albin John', courseSem: 'B.Com • Semester 5' },
  { id: 'student_nandana', name: 'Nandana P Nair', courseSem: 'BBA • Semester 3' },
  { id: 'student_jithin', name: 'Jithin Salim', courseSem: 'BCA • Semester 3' },
  { id: 'student_fathima', name: 'Fathima Rifa', courseSem: 'BSW • Semester 1' },
];

const COURSES = ['BCA', 'BBA', 'B.Com', 'BSW', 'Psychology'];
const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export default function PaymentPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'gpay' | 'phonepe' | 'paytm'>('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-meal support & Custom Classmate Additions
  const [peerList, setPeerList] = useState<PeerStudent[]>(DEFAULT_PEERS);
  const [selectedPeers, setSelectedPeers] = useState<PeerStudent[]>([]);
  const [showPeerModal, setShowPeerModal] = useState(false);

  // New Classmate Input States inside Popup
  const [newName, setNewName] = useState('');
  const [newCourse, setNewCourse] = useState('BCA');
  const [newSemester, setNewSemester] = useState('Semester 3');
  const [searchFilter, setSearchFilter] = useState('');

  // Load memorized classmates from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('rvcas_memorized_classmates');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPeerList(parsed);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Save to localStorage whenever classmates change
  const saveClassmates = (updated: PeerStudent[]) => {
    setPeerList(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rvcas_memorized_classmates', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const handleAddNewClassmate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = newName.trim();
    if (!cleanName) return;

    const newPeer: PeerStudent = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      courseSem: `${newCourse} • ${newSemester}`,
    };

    const updated = [newPeer, ...peerList.filter((p) => p.name.toLowerCase() !== cleanName.toLowerCase())];
    saveClassmates(updated);
    setSelectedPeers([...selectedPeers, newPeer]);
    setNewName('');
  };

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
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition ${
                selectedMethod === 'upi' ? 'bg-[#6B1D2F]/5 ring-1 ring-[#6B1D2F]/30' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img
                    src="/images/logos/upi.svg"
                    alt="UPI"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-stone-900 block leading-tight">UPI ID / QR</span>
                  <span className="text-[11px] text-stone-500 font-medium">Instant zero-fee transfer</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                selectedMethod === 'upi' ? 'border-[#6B1D2F] bg-[#6B1D2F]' : 'border-stone-300'
              }`}>
                {selectedMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>

            {/* Google Pay */}
            <button
              type="button"
              onClick={() => setSelectedMethod('gpay')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition ${
                selectedMethod === 'gpay' ? 'bg-[#6B1D2F]/5 ring-1 ring-[#6B1D2F]/30' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img
                    src="/images/logos/gpay.svg"
                    alt="Google Pay"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-stone-900 block leading-tight">Google Pay</span>
                  <span className="text-[11px] text-stone-500 font-medium">Pay via GPay UPI</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                selectedMethod === 'gpay' ? 'border-[#6B1D2F] bg-[#6B1D2F]' : 'border-stone-300'
              }`}>
                {selectedMethod === 'gpay' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>

            {/* PhonePe */}
            <button
              type="button"
              onClick={() => setSelectedMethod('phonepe')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition ${
                selectedMethod === 'phonepe' ? 'bg-[#6B1D2F]/5 ring-1 ring-[#6B1D2F]/30' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src="/images/logos/phonepe.svg"
                    alt="PhonePe"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-stone-900 block leading-tight">PhonePe</span>
                  <span className="text-[11px] text-stone-500 font-medium">Pay via PhonePe UPI</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                selectedMethod === 'phonepe' ? 'border-[#6B1D2F] bg-[#6B1D2F]' : 'border-stone-300'
              }`}>
                {selectedMethod === 'phonepe' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>

            {/* Paytm */}
            <button
              type="button"
              onClick={() => setSelectedMethod('paytm')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition ${
                selectedMethod === 'paytm' ? 'bg-[#6B1D2F]/5 ring-1 ring-[#6B1D2F]/30' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img
                    src="/images/logos/paytm.svg"
                    alt="Paytm"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-stone-900 block leading-tight">Paytm</span>
                  <span className="text-[11px] text-stone-500 font-medium">Paytm Wallet &amp; UPI</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                selectedMethod === 'paytm' ? 'border-[#6B1D2F] bg-[#6B1D2F]' : 'border-stone-300'
              }`}>
                {selectedMethod === 'paytm' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
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

      {/* Multi-Student Selection Modal with Dropdowns & Memory */}
      {showPeerModal && (
        <div
          onClick={() => setShowPeerModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6B1D2F]" />
                <h4 className="text-sm font-extrabold text-stone-900">Add Classmate Meal</h4>
              </div>
              <button
                onClick={() => setShowPeerModal(false)}
                className="text-xs font-bold text-stone-400 hover:text-stone-700 p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Quick Add Classmate Form */}
            <form onSubmit={handleAddNewClassmate} className="p-3 bg-[#FAF7F2] rounded-2xl border border-stone-200/80 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1D2F] block">
                Enter Classmate Details
              </span>

              {/* Student Name */}
              <div>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Student Full Name (e.g. Albin John)"
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B1D2F]/20 focus:border-[#6B1D2F]"
                />
              </div>

              {/* Two Dropdowns in 1 row: Department & Semester */}
              <div className="grid grid-cols-2 gap-2">
                {/* Department Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    Department
                  </label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B1D2F]/20 focus:border-[#6B1D2F]"
                  >
                    {COURSES.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester Dropdown (1 to 8) */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">
                    Semester
                  </label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B1D2F]/20 focus:border-[#6B1D2F]"
                  >
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full bg-[#6B1D2F] hover:bg-[#501220] disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save &amp; Add Classmate (+₹40)</span>
              </button>
            </form>

            {/* Memorized Classmates List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[140px]">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 px-1 pt-1">
                <span>Select from Saved Classmates</span>
                <span>{selectedPeers.length} selected</span>
              </div>

              {peerList.map((peer) => {
                const isSelected = selectedPeers.some((p) => p.id === peer.id);
                return (
                  <button
                    key={peer.id}
                    type="button"
                    onClick={() => handleTogglePeer(peer)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-[#6B1D2F] bg-[#6B1D2F]/5 ring-1 ring-[#6B1D2F]/30'
                        : 'border-stone-200 hover:bg-stone-50 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-stone-900">{peer.name}</p>
                      <p className="text-[10px] font-medium text-stone-500">{peer.courseSem}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-[#6B1D2F] border-[#6B1D2F] text-white shadow-xs'
                          : 'border-stone-300 bg-stone-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Done Button */}
            <button
              onClick={() => setShowPeerModal(false)}
              className="w-full bg-[#6B1D2F] hover:bg-[#501220] text-white py-3 rounded-2xl font-bold text-xs transition shadow-md"
            >
              Done ({selectedPeers.length} added • Total: ₹{totalAmount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
