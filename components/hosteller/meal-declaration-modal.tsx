'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Clock, AlertCircle, ShieldAlert, Sparkles, Utensils, Coffee, Moon, Sun } from 'lucide-react';
import { MealType, HostellerResponseState, SpecialMealDate, HostellerMealResponse } from '@/lib/types';

interface MealDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: SpecialMealDate;
  userId: string;
  existingResponses?: HostellerMealResponse[];
  onSaved: () => void;
}

const MEAL_CONFIG: {
  type: MealType;
  title: string;
  timeWindow: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    type: 'BREAKFAST',
    title: 'Breakfast',
    timeWindow: '07:30 AM – 09:00 AM',
    icon: Coffee,
    description: 'Hot breakfast served in the dining hall.',
  },
  {
    type: 'LUNCH',
    title: 'Lunch',
    timeWindow: '12:30 PM – 02:00 PM',
    icon: Sun,
    description: 'Traditional lunch & sides.',
  },
  {
    type: 'EVENING_SNACK',
    title: 'Evening Snack',
    timeWindow: '04:30 PM – 05:30 PM',
    icon: Utensils,
    description: 'Evening tea/coffee & light snack.',
  },
  {
    type: 'DINNER',
    title: 'Dinner',
    timeWindow: '07:30 PM – 09:00 PM',
    icon: Moon,
    description: 'Nutritious dinner served before quiet hours.',
  },
];

export function MealDeclarationModal({
  isOpen,
  onClose,
  date,
  userId,
  existingResponses = [],
  onSaved,
}: MealDeclarationModalProps) {
  const [selections, setSelections] = useState<Record<MealType, HostellerResponseState>>({
    BREAKFAST: 'NOT_RESPONDED',
    LUNCH: 'NOT_RESPONDED',
    EVENING_SNACK: 'NOT_RESPONDED',
    DINNER: 'NOT_RESPONDED',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  // Initialize selections from existing responses
  useEffect(() => {
    const initial: Record<MealType, HostellerResponseState> = {
      BREAKFAST: 'NOT_RESPONDED',
      LUNCH: 'NOT_RESPONDED',
      EVENING_SNACK: 'NOT_RESPONDED',
      DINNER: 'NOT_RESPONDED',
    };

    if (existingResponses && existingResponses.length > 0) {
      existingResponses.forEach((r) => {
        if (r.date === date.date) {
          initial[r.mealType] = r.response;
        }
      });
    }

    setSelections(initial);
    setError(null);
    setSuccessNotice(false);
  }, [date, existingResponses]);

  if (!isOpen) return null;

  const isPastDeadline =
    date.responseDeadline && new Date() > new Date(date.responseDeadline);
  const isLocked = Boolean(date.isFinalized || isPastDeadline);

  const formattedDate = new Date(date.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedDeadline = date.responseDeadline
    ? new Date(date.responseDeadline).toLocaleString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Before 08:00 PM';

  const handleSelect = (mealType: MealType, choice: 'NEED_MEAL' | 'DONT_NEED_MEAL') => {
    if (isLocked) return;
    setSelections((prev) => ({
      ...prev,
      [mealType]: choice,
    }));
  };

  const handleQuickAll = (choice: 'NEED_MEAL' | 'DONT_NEED_MEAL') => {
    if (isLocked) return;
    setSelections({
      BREAKFAST: choice,
      LUNCH: choice,
      EVENING_SNACK: choice,
      DINNER: choice,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    // Filter out unselected meals or require all?
    // Let's create array of meals that user made a choice on (NEED_MEAL or DONT_NEED_MEAL)
    const payloadResponses = (['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'] as MealType[])
      .filter((m) => selections[m] === 'NEED_MEAL' || selections[m] === 'DONT_NEED_MEAL')
      .map((m) => ({
        mealType: m,
        response: selections[m],
      }));

    if (payloadResponses.length === 0) {
      setError('Please select Yes or No for at least one meal.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/hosteller/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: date.date,
          responses: payloadResponses,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not save meal requirement');
      }

      setSuccessNotice(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit requirements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200/80 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md p-5 border-b border-stone-200/80 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6B1D2F] bg-[#6B1D2F]/10 px-2 py-0.5 rounded-md">
                Meal Requirement
              </span>
              <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                {date.title}
              </span>
            </div>
            <h2 className="text-lg font-black text-stone-900 tracking-tight mt-1">
              {formattedDate}
            </h2>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Deadline: {formattedDeadline}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Alert if Locked or Finalized */}
        {isLocked && (
          <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Requirements Locked</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {date.isFinalized
                  ? 'The canteen staff has finalized the meal plan count for this date.'
                  : 'The response deadline for this date has passed.'}{' '}
                Responses are displayed in read-only mode.
              </p>
            </div>
          </div>
        )}

        {/* Notice for Hosteller */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-xs text-stone-600 leading-relaxed">
            Will you need food on this day? Please specify your requirement for each meal independently so the canteen can prepare accurate quantities and prevent food wastage.
          </p>

          {!isLocked && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-200/60">
              <span className="text-[11px] font-semibold text-stone-500">Quick Select:</span>
              <button
                type="button"
                onClick={() => handleQuickAll('NEED_MEAL')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-lg transition"
              >
                ✓ Yes to All
              </button>
              <button
                type="button"
                onClick={() => handleQuickAll('DONT_NEED_MEAL')}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-2.5 py-1 rounded-lg transition"
              >
                ✕ No to All
              </button>
            </div>
          )}
        </div>

        {/* 4 Meal Cards Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {MEAL_CONFIG.map((meal) => {
            const Icon = meal.icon;
            const currentChoice = selections[meal.type];

            return (
              <div
                key={meal.type}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                  currentChoice === 'NEED_MEAL'
                    ? 'border-emerald-300 ring-1 ring-emerald-200/60'
                    : currentChoice === 'DONT_NEED_MEAL'
                    ? 'border-stone-200 opacity-90'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        currentChoice === 'NEED_MEAL'
                          ? 'bg-emerald-100 text-emerald-700'
                          : currentChoice === 'DONT_NEED_MEAL'
                          ? 'bg-stone-100 text-stone-500'
                          : 'bg-[#6B1D2F]/10 text-[#6B1D2F]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900 leading-tight">
                        {meal.title}
                      </h4>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {meal.timeWindow}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {currentChoice === 'NEED_MEAL' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Need Meal
                      </span>
                    )}
                    {currentChoice === 'DONT_NEED_MEAL' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                        ✕ Don&apos;t Need
                      </span>
                    )}
                    {currentChoice === 'NOT_RESPONDED' && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Not Declared
                      </span>
                    )}
                  </div>
                </div>

                {/* Question & Toggle Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-stone-600">
                    Will you need this meal?
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* YES BUTTON */}
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleSelect(meal.type, 'NEED_MEAL')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                        currentChoice === 'NEED_MEAL'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                          : 'bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 border border-stone-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Yes, Need It</span>
                    </button>

                    {/* NO BUTTON */}
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleSelect(meal.type, 'DONT_NEED_MEAL')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                        currentChoice === 'DONT_NEED_MEAL'
                          ? 'bg-stone-700 text-white shadow-sm ring-2 ring-stone-600/30'
                          : 'bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200'
                      }`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>No, Don&apos;t Need</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Error / Success Feedback */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Meal requirements submitted successfully!</span>
            </div>
          )}

          {/* Action Button */}
          {!isLocked && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B1D2F] hover:bg-[#521423] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Saving Choices...</span>
                  </div>
                ) : (
                  <>
                    <span>Confirm &amp; Submit Requirement</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
