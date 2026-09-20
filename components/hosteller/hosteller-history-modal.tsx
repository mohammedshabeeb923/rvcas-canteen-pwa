'use client';

import React from 'react';
import { X, Clock, Calendar, Check, Utensils } from 'lucide-react';
import { HostellerMealResponse, MealType } from '@/lib/types';

interface HostellerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  responses: HostellerMealResponse[];
}

export function HostellerHistoryModal({
  isOpen,
  onClose,
  responses,
}: HostellerHistoryModalProps) {
  if (!isOpen) return null;

  // Group responses by date
  const groupedByDate: Record<string, HostellerMealResponse[]> = {};
  responses.forEach((r) => {
    if (!groupedByDate[r.date]) groupedByDate[r.date] = [];
    groupedByDate[r.date].push(r);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const mealLabels: Record<MealType, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    EVENING_SNACK: 'Snack',
    DINNER: 'Dinner',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200/80 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md p-5 border-b border-stone-200/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6B1D2F]/10 text-[#6B1D2F] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 tracking-tight">
                Meal Requirement History
              </h2>
              <p className="text-[11px] text-stone-500">
                Your past meal requirement declarations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 flex-1">
          {sortedDates.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Utensils className="w-10 h-10 mx-auto stroke-1 text-stone-300 mb-2" />
              <p className="text-sm font-semibold">No requirement history yet</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Responses you submit for upcoming special dates will appear here.
              </p>
            </div>
          ) : (
            sortedDates.map((d) => {
              const dateItems = groupedByDate[d];
              const dateFormatted = new Date(d).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={d}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6B1D2F]" />
                      <span className="text-xs font-bold text-stone-900">{dateFormatted}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {dateItems[0]?.updatedAt
                        ? `Updated ${new Date(dateItems[0].updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : ''}
                    </span>
                  </div>

                  {/* 4 meals grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {(['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'] as MealType[]).map((m) => {
                      const item = dateItems.find((r) => r.mealType === m);
                      const isNeeded = item?.response === 'NEED_MEAL';
                      const isDontNeed = item?.response === 'DONT_NEED_MEAL';

                      return (
                        <div
                          key={m}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                            isNeeded
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                              : isDontNeed
                              ? 'bg-stone-50 border-stone-200 text-stone-500'
                              : 'bg-stone-50/40 border-stone-100 text-stone-400'
                          }`}
                        >
                          <span className="font-semibold">{mealLabels[m]}</span>
                          <span className="text-[11px] font-bold">
                            {isNeeded ? '✓ Need' : isDontNeed ? '✕ No' : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
