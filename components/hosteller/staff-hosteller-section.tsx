'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Utensils,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Search,
  Download,
  Coffee,
  Sun,
  Moon,
  AlertCircle,
  RefreshCw,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { MealType, HostellerMealSummary, StudentMealDetail, SpecialMealDate } from '@/lib/types';

interface StaffHostellerSectionProps {
  isAdmin?: boolean;
}

const MEAL_META: Record<
  MealType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  BREAKFAST: { label: 'Breakfast', icon: Coffee, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  LUNCH: { label: 'Lunch', icon: Sun, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  EVENING_SNACK: { label: 'Evening Snack', icon: Utensils, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  DINNER: { label: 'Dinner', icon: Moon, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
};

export function StaffHostellerSection({ isAdmin = false }: StaffHostellerSectionProps) {
  const [dates, setDates] = useState<SpecialMealDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-26');
  const [summary, setSummary] = useState<HostellerMealSummary | null>(null);
  const [details, setDetails] = useState<StudentMealDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMealFilter, setSelectedMealFilter] = useState<'ALL' | MealType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load available special dates
  const loadDates = async () => {
    try {
      const res = await fetch('/api/hosteller/admin/dates');
      const data = await res.json();
      if (data.success && data.dates && data.dates.length > 0) {
        setDates(data.dates);
        // Default to first date or 2026-09-26 if available
        const found = data.dates.find((d: any) => d.date === '2026-09-26');
        if (found) {
          setSelectedDate(found.date);
        } else {
          setSelectedDate(data.dates[0].date);
        }
      }
    } catch (err) {
      console.error('Error loading dates:', err);
    }
  };

  // Load summary and details for selected date
  const loadSummary = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hosteller/staff-summary?date=${date}&includeDetails=true`);
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setDetails(data.details || []);
      }
    } catch (err) {
      console.error('Error loading staff summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadSummary(selectedDate);
    }
  }, [selectedDate]);

  // Handle Finalize
  const handleFinalize = async () => {
    if (!confirm(`Are you sure you want to finalize the meal preparation count for ${selectedDate}? Hostellers will no longer be able to submit or change responses.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/hosteller/admin/dates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalize',
          date: selectedDate,
          finalizedBy: isAdmin ? 'Admin' : 'Kitchen Staff',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage('✓ Meal count finalized successfully.');
        loadSummary(selectedDate);
        loadDates();
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(data.error || 'Failed to finalize');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reopen (Admin)
  const handleReopen = async () => {
    if (!confirm(`Reopen meal declaration for ${selectedDate}? Students will be able to update requirements until deadline.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/hosteller/admin/dates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reopen',
          date: selectedDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage('✓ Meal declarations reopened.');
        loadSummary(selectedDate);
        loadDates();
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(data.error || 'Failed to reopen');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter student details
  const filteredDetails = details.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.hostelRoom && s.hostelRoom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedMealFilter !== 'ALL') {
      const mealResp = s.mealResponses?.[selectedMealFilter];
      return mealResp === 'NEED_MEAL' || mealResp === 'DONT_NEED_MEAL';
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* 1. DATE SELECTOR & STATUS BAR */}
      <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6B1D2F] bg-[#6B1D2F]/10 px-2 py-0.5 rounded-md">
                HOSTELLER MEAL REQUIREMENTS
              </span>
              {summary?.isFinalized ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  Finalized &amp; Locked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Unlock className="w-3 h-3" />
                  Open for Responses
                </span>
              )}
            </div>

            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              Food Preparation Planning
            </h2>
            <p className="text-xs text-stone-500">
              Kitchen staff counts based strictly on Hosteller requirement declarations.
            </p>
          </div>

          {/* Quick Date Chips / Date Picker */}
          <div className="flex flex-wrap items-center gap-2">
            {dates.map((d) => (
              <button
                key={d.id || d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedDate === d.date
                    ? 'bg-[#6B1D2F] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(d.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                {d.isFinalized && <Lock className="w-3 h-3 opacity-70" />}
              </button>
            ))}

            <button
              onClick={() => loadSummary(selectedDate)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              title="Refresh counts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {statusMessage}
          </div>
        )}
      </div>

      {/* 2. OVERVIEW METRICS STRIP */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <span className="text-[11px] font-bold text-stone-400 block">Total Hostellers</span>
            <span className="text-2xl font-black text-stone-900 tracking-tight">
              {summary.totalHostellers}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Enrolled residents</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 block">Responded</span>
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {summary.respondedHostellers}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Declared choices</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 block">Pending</span>
            <span className="text-2xl font-black text-amber-700 tracking-tight">
              {summary.notRespondedHostellers}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">No response yet</span>
          </div>
        </div>
      )}

      {/* 3. FOUR AGGREGATED MEAL PREPARATION CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Preparation Counts by Meal
            </h3>
            <p className="text-[11px] text-stone-500">
              Kitchen staff should prepare exact quantity under &ldquo;Prepare Count&rdquo;
            </p>
          </div>

          {/* Finalize Button */}
          <div className="flex items-center gap-2">
            {summary?.isFinalized ? (
              isAdmin && (
                <button
                  onClick={handleReopen}
                  disabled={actionLoading}
                  className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Reopen Declarations</span>
                </button>
              )
            ) : (
              <button
                onClick={handleFinalize}
                disabled={actionLoading}
                className="text-xs font-bold text-white bg-[#6B1D2F] hover:bg-[#521423] px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Finalize Meal Count</span>
              </button>
            )}
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'] as MealType[]).map((m) => {
              const meta = MEAL_META[m];
              const mealData = summary.meals[m];
              const Icon = meta.icon;

              return (
                <div
                  key={m}
                  className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/80 flex flex-col justify-between"
                >
                  <div>
                    {/* Meal Title & Icon */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-extrabold text-stone-900">{meta.label}</h4>
                      </div>

                      <span className="text-[10px] font-black uppercase text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                        {m === 'BREAKFAST'
                          ? '07:30 AM'
                          : m === 'LUNCH'
                          ? '12:30 PM'
                          : m === 'EVENING_SNACK'
                          ? '04:30 PM'
                          : '07:30 PM'}
                      </span>
                    </div>

                    {/* PREPARE COUNT HERO */}
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 text-center mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-0.5">
                        PREPARE COUNT
                      </span>
                      <span className="text-4xl font-black text-[#6B1D2F] tracking-tight">
                        {mealData.prepare}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500 block mt-0.5">
                        Meals to Cook
                      </span>
                    </div>

                    {/* Breakdown counts */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between px-1 py-1 rounded-lg bg-emerald-50/60 text-emerald-900 border border-emerald-100">
                        <span className="font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Need Meal:
                        </span>
                        <span className="font-black">{mealData.need}</span>
                      </div>

                      <div className="flex items-center justify-between px-1 py-1 rounded-lg bg-rose-50/60 text-rose-900 border border-rose-100">
                        <span className="font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Don&apos;t Need:
                        </span>
                        <span className="font-black">{mealData.dontNeed}</span>
                      </div>

                      <div className="flex items-center justify-between px-1 py-1 rounded-lg bg-stone-100/60 text-stone-600 border border-stone-200">
                        <span className="font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-stone-400" />
                          Not Responded:
                        </span>
                        <span className="font-black">{mealData.notResponded}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. STUDENT DRILLDOWN ("VIEW DETAILS") SECTION */}
      <div className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Hosteller Roster &amp; Responses
            </h3>
            <p className="text-[11px] text-stone-500">
              Individual student declaration breakdown for {selectedDate}
            </p>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-bold text-[#6B1D2F] hover:text-[#521423] bg-[#6B1D2F]/10 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
          </button>
        </div>

        {showDetails && (
          <div className="pt-4 space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, room or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6B1D2F]/30"
                />
              </div>

              {/* Meal Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'] as const).map((mf) => (
                  <button
                    key={mf}
                    onClick={() => setSelectedMealFilter(mf)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 cursor-pointer ${
                      selectedMealFilter === mf
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {mf === 'ALL' ? 'All Meals' : MEAL_META[mf].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 font-bold uppercase text-[10px] border-b border-stone-200">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Room / Dept</th>
                    <th className="py-2.5 px-3 text-center">Breakfast</th>
                    <th className="py-2.5 px-3 text-center">Lunch</th>
                    <th className="py-2.5 px-3 text-center">Snack</th>
                    <th className="py-2.5 px-3 text-center">Dinner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                  {filteredDetails.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        No hostellers match the query.
                      </td>
                    </tr>
                  ) : (
                    filteredDetails.map((student) => {
                      const mr = student.mealResponses;

                      const renderBadge = (meal: MealType) => {
                        const status = mr?.[meal];
                        if (status === 'NEED_MEAL') {
                          return (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              ✓ Need
                            </span>
                          );
                        }
                        if (status === 'DONT_NEED_MEAL') {
                          return (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500">
                              ✕ No
                            </span>
                          );
                        }
                        return (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                            — Pending
                          </span>
                        );
                      };

                      return (
                        <tr key={student.studentId} className="hover:bg-stone-50/80 transition">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-stone-900 block">{student.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {student.studentIdCode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-stone-800 block">
                              Room {student.hostelRoom || '—'}
                            </span>
                            <span className="text-[10px] text-stone-400">{student.department}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center">{renderBadge('BREAKFAST')}</td>
                          <td className="py-2.5 px-3 text-center">{renderBadge('LUNCH')}</td>
                          <td className="py-2.5 px-3 text-center">{renderBadge('EVENING_SNACK')}</td>
                          <td className="py-2.5 px-3 text-center">{renderBadge('DINNER')}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
