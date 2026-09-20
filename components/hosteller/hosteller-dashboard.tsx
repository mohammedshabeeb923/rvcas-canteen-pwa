'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  History,
  ShieldCheck,
  Building,
  Info,
  Utensils,
  Sun,
  Moon,
  Coffee,
  Check,
} from 'lucide-react';
import { SpecialMealDate, HostellerMealResponse, MealType } from '@/lib/types';
import { MealDeclarationModal } from './meal-declaration-modal';
import { HostellerHistoryModal } from './hosteller-history-modal';

interface HostellerDashboardProps {
  currentUser: any;
}

export function HostellerDashboard({ currentUser }: HostellerDashboardProps) {
  const [specialDates, setSpecialDates] = useState<SpecialMealDate[]>([]);
  const [userResponses, setUserResponses] = useState<HostellerMealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<SpecialMealDate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchHostellerData = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.id || 'student_shabeeb';
      const res = await fetch(`/api/hosteller/dates?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();

      if (data.success) {
        setSpecialDates(data.dates || []);
        setUserResponses(data.userResponses || []);
      }
    } catch (err) {
      console.error('Error loading hosteller dates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostellerData();
  }, [currentUser?.id]);

  const handleOpenDeclare = (date: SpecialMealDate) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const mealLabels: Record<MealType, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    EVENING_SNACK: 'Snack',
    DINNER: 'Dinner',
  };

  return (
    <div className="space-y-5">
      {/* 1. WELCOME GREETING & HOSTELLER IDENTIFICATION */}
      <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 bg-[#6B1D2F]/10 text-[#6B1D2F] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#6B1D2F]/15">
                <Building className="w-3 h-3" />
                Hostel Resident
              </span>
              {currentUser?.hostelRoom && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                  Room {currentUser.hostelRoom}
                </span>
              )}
            </div>

            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              {currentUser?.name || 'Shabeeb'} 👋
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {currentUser?.courseSem || 'BCA • Semester 3'} • Hosteller Food Plan
            </p>
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#6B1D2F] bg-[#FAF7F2] hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
            title="View Past Declarations"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        {/* Informational Card: Zero Purchase / Planning System */}
        <div className="mt-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#6B1D2F] shrink-0 mt-0.5" />
          <p className="text-xs text-stone-600 leading-relaxed">
            <strong className="text-stone-900 font-semibold">Hostel Food Arrangement Active:</strong> Your meals are covered by the hostel mess. Please declare your requirement for upcoming weekends and special days so our canteen staff can accurately prepare meals and eliminate food wastage.
          </p>
        </div>
      </div>

      {/* 2. UPCOMING SPECIAL DATES & REQUIREMENT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Upcoming Special Days
            </h3>
            <p className="text-[11px] text-stone-500">
              Weekends, holidays &amp; vacation meal planning
            </p>
          </div>

          <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            {specialDates.length} Days Open
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200/70 text-center text-stone-400">
            <div className="w-6 h-6 border-2 border-[#6B1D2F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading upcoming planning dates...</p>
          </div>
        ) : specialDates.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200/70 text-center text-stone-400">
            <Calendar className="w-10 h-10 mx-auto stroke-1 text-stone-300 mb-2" />
            <p className="text-xs font-bold text-stone-600">No Special Days Scheduled</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              All routine hostel mess schedules are proceeding normally.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {specialDates.map((d) => {
              const responsesForDate = userResponses.filter((r) => r.date === d.date);
              const hasResponded = responsesForDate.length > 0;
              const isPastDeadline =
                d.responseDeadline && new Date() > new Date(d.responseDeadline);
              const isLocked = Boolean(d.isFinalized || isPastDeadline);

              const formattedDate = new Date(d.date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              const formattedDeadline = d.responseDeadline
                ? new Date(d.responseDeadline).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '08:00 PM';

              const neededCount = responsesForDate.filter(
                (r) => r.response === 'NEED_MEAL'
              ).length;

              return (
                <div
                  key={d.id || d.date}
                  className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-stone-200/70 hover:border-stone-300 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Date Icon Box */}
                      <div className="w-12 h-12 rounded-2xl bg-[#6B1D2F]/10 border border-[#6B1D2F]/15 flex flex-col items-center justify-center text-[#6B1D2F] shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-wider leading-none">
                          {new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                        </span>
                        <span className="text-lg font-black leading-tight">
                          {new Date(d.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-stone-900 tracking-tight">
                            {d.title}
                          </h4>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              d.dateType === 'WEEKEND'
                                ? 'bg-purple-100 text-purple-800'
                                : d.dateType === 'HOLIDAY'
                                ? 'bg-amber-100 text-amber-800'
                                : d.dateType === 'VACATION'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {d.dateType}
                          </span>
                        </div>

                        <p className="text-xs text-stone-500 font-medium mt-0.5">
                          {formattedDate} • {d.description || 'Special hostel meal planning'}
                        </p>
                      </div>
                    </div>

                    {/* Deadline status */}
                    <div className="text-right shrink-0">
                      {d.isFinalized ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                          Finalized
                        </span>
                      ) : isPastDeadline ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          Deadline Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-stone-400" />
                          Due {formattedDeadline}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 MEALS STATUS BADGES */}
                  <div className="mt-3.5 pt-3 border-t border-stone-100 grid grid-cols-4 gap-1.5 sm:gap-2">
                    {(['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'] as MealType[]).map(
                      (m) => {
                        const resp = responsesForDate.find((r) => r.mealType === m);
                        const isNeed = resp?.response === 'NEED_MEAL';
                        const isDontNeed = resp?.response === 'DONT_NEED_MEAL';

                        return (
                          <div
                            key={m}
                            className={`p-2 rounded-xl text-center border transition ${
                              isNeed
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : isDontNeed
                                ? 'bg-stone-50 border-stone-200 text-stone-500'
                                : 'bg-stone-50/60 border-stone-100 text-stone-400'
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-tight block">
                              {mealLabels[m]}
                            </span>
                            <span className="text-[11px] font-extrabold mt-0.5 block">
                              {isNeed ? '✓ Need' : isDontNeed ? '✕ No' : '—'}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="mt-3.5 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-medium text-stone-500">
                      {hasResponded
                        ? `Requirement declared (${neededCount} of 4 meals requested)`
                        : 'No requirement declared yet'}
                    </span>

                    <button
                      onClick={() => handleOpenDeclare(d)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isLocked
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          : hasResponded
                          ? 'bg-white hover:bg-stone-50 text-[#6B1D2F] border border-[#6B1D2F]/30 shadow-xs'
                          : 'bg-[#6B1D2F] hover:bg-[#521423] text-white shadow-sm'
                      }`}
                    >
                      <span>
                        {isLocked
                          ? 'View Declaration'
                          : hasResponded
                          ? 'Update Requirement'
                          : 'Declare Meals'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MODALS */}
      {selectedDate && (
        <MealDeclarationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          userId={currentUser?.id || 'student_shabeeb'}
          existingResponses={userResponses}
          onSaved={fetchHostellerData}
        />
      )}

      <HostellerHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        responses={userResponses}
      />
    </div>
  );
}
