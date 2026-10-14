import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Sparkles,
  Zap,
  CheckCircle2,
  Circle,
  Calendar,
  Cloud,
  ShieldCheck,
  Crown,
  Award,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Clock,
  Target,
  Smile,
  Brain,
  Filter,
} from 'lucide-react';
import { StorageService, getTodayDateStr } from '../utils/storage';
import { DayHabitStatus, HabitStreakRecord, StreakMilestone, FocusAchievement } from '../types/logs';
import { useAuth } from '../context/AuthContext';
import { FirestoreService } from '../services/firestoreService';

interface ConsistencyHabitTrackerProps {
  onRefreshTrigger?: number;
  onOpenArchiveForDate?: (dateStr: string) => void;
  onScrollToModule?: (moduleId: string) => void;
}

type HabitFilterType = 'all' | 'energy' | 'cbt' | 'focus' | 'tasks';

export default function ConsistencyHabitTracker({
  onRefreshTrigger,
  onOpenArchiveForDate,
  onScrollToModule,
}: ConsistencyHabitTrackerProps) {
  const { user, isCloudSynced, syncLocalToCloud } = useAuth();
  const [habitDays, setHabitDays] = useState<DayHabitStatus[]>([]);
  const [streakStats, setStreakStats] = useState<HabitStreakRecord>({
    currentStreak: 0,
    longestStreak: 0,
    activeDaysLast30: 0,
    consistencyRate: 0,
    totalActionsCount: 0,
    updatedAt: Date.now(),
  });
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [focusBadges, setFocusBadges] = useState<FocusAchievement[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayHabitStatus | null>(null);
  const [activeFilter, setActiveFilter] = useState<HabitFilterType>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load habit streak data
  const loadHabitData = () => {
    const days = StorageService.get30DayHabitStatus();
    const stats = StorageService.calculateHabitStreakStats();
    const mileStonesList = StorageService.getStreakMilestones(stats.currentStreak);
    const badges = StorageService.getFocusAchievements();

    setHabitDays(days);
    setStreakStats(stats);
    setMilestones(mileStonesList);
    setFocusBadges(badges);

    // Auto-select today
    const today = days.find((d) => d.dayOffset === 0);
    if (today && !selectedDay) {
      setSelectedDay(today);
    }

    // Trigger celebration if reached a milestone
    if (stats.currentStreak === 7 || stats.currentStreak === 14 || stats.currentStreak === 21 || stats.currentStreak === 30) {
      setShowCelebration(true);
    }

    // Save to Firestore if user logged in
    if (user) {
      FirestoreService.saveHabitStreak(user.uid, stats).catch((err) =>
        console.warn('Could not sync streak to Firestore:', err)
      );
    }
  };

  useEffect(() => {
    loadHabitData();
  }, [onRefreshTrigger, user]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (user) {
        await syncLocalToCloud();
        await FirestoreService.saveHabitStreak(user.uid, streakStats);
      }
      loadHabitData();
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const todayStatus = useMemo(() => {
    return habitDays.find((d) => d.dayOffset === 0);
  }, [habitDays]);

  const nextMilestone = useMemo(() => {
    return milestones.find((m) => !m.unlocked) || milestones[milestones.length - 1];
  }, [milestones]);

  const milestoneProgress = useMemo(() => {
    if (!nextMilestone) return 100;
    const prevMilestoneDays =
      milestones
        .filter((m) => m.days < nextMilestone.days && m.unlocked)
        .sort((a, b) => b.days - a.days)[0]?.days || 0;
    const progressRange = nextMilestone.days - prevMilestoneDays;
    const currentProgress = Math.max(0, streakStats.currentStreak - prevMilestoneDays);
    return Math.min(100, Math.round((currentProgress / progressRange) * 100));
  }, [milestones, nextMilestone, streakStats.currentStreak]);

  // Determine if a day meets the active filter condition
  const isDayMatchingFilter = (day: DayHabitStatus) => {
    switch (activeFilter) {
      case 'energy':
        return day.energyLogged;
      case 'cbt':
        return day.cbtCount > 0;
      case 'focus':
        return day.focusMinutes > 0;
      case 'tasks':
        return day.tasksCompleted > 0;
      case 'all':
      default:
        return day.isActive;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-sand-200/90 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Top Header: Title, Firestore Cloud Status, and Manual Sync */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-400 text-white rounded-2xl shadow-sm shadow-amber-200/50">
              <Flame size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-serif text-ink-900 tracking-tight font-semibold">
                  30-Day Consistency Habit Tracker
                </h2>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200/80">
                  Neuroplastic Habituation
                </span>
              </div>
              <p className="text-xs md:text-sm text-ink-500 font-light mt-0.5">
                Visualizing daily micro-commitments across emotional check-ins, focus blocks, and cognitive restructuring.
              </p>
            </div>
          </div>
        </div>

        {/* Firestore Sync Badge & Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {user ? (
            <div className="flex items-center gap-2 bg-emerald-50/90 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-2xl text-xs font-medium">
              <Cloud size={13} className="text-emerald-600" />
              <span>Firestore Backed Up</span>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Sync latest 30-day streak to Firestore database"
                className="hover:text-emerald-950 transition-colors p-0.5"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-sand-100 text-ink-600 border border-sand-200 px-3 py-1.5 rounded-2xl text-xs font-medium">
              <Circle size={8} className="fill-amber-400 text-amber-500" />
              <span>Local Storage (Guest)</span>
              <span className="text-[10px] text-ink-400 hidden sm:inline">Sign in for Cloud backup</span>
            </div>
          )}

          {onOpenArchiveForDate && (
            <button
              onClick={() => onOpenArchiveForDate(getTodayDateStr())}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-sand-50 hover:bg-sand-100 text-ink-700 rounded-2xl border border-sand-200 transition-all hover:scale-[1.02]"
              title="Open the full calendar archive for all dates"
            >
              <Calendar size={13} className="text-ink-500" />
              <span>History Archive</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Streak Banner & Key Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {/* Main Flame Hero Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-lg shadow-orange-500/15"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/90 text-xs font-semibold uppercase tracking-wider">
                <Flame size={16} className="text-amber-200 animate-bounce" />
                <span>Active Streak Velocity</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full font-medium">
                {todayStatus?.isActive ? '✨ Streak Preserved Today' : '⏳ Today Awaiting Entry'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-5xl md:text-6xl font-serif font-bold tracking-tight">
                {streakStats.currentStreak}
              </span>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-serif font-light text-white/95">
                  {streakStats.currentStreak === 1 ? 'Day' : 'Days'} Consecutive
                </span>
                <span className="text-xs text-white/80">
                  {streakStats.currentStreak >= 7
                    ? '🔥 High momentum! Neural pathway consolidated.'
                    : '🌱 Every consecutive day compounds habit strength.'}
                </span>
              </div>
            </div>

            {/* Next Milestone Sub-bar */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white/90 font-medium flex items-center gap-1.5">
                  <Award size={13} className="text-amber-200" />
                  Target: {nextMilestone?.title} ({nextMilestone?.days} Days)
                </span>
                <span className="text-white/90 font-bold">{milestoneProgress}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${milestoneProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-white h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metric 2: 30-Day Consistency Rate */}
        <div className="rounded-3xl bg-sand-50/80 border border-sand-200 p-5 flex flex-col justify-between hover:bg-sand-50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              30-Day Rate
            </span>
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-serif font-bold text-ink-900">
              {streakStats.consistencyRate}%
            </div>
            <p className="text-xs text-ink-500 mt-1 font-light">
              <strong className="text-ink-800 font-semibold">{streakStats.activeDaysLast30}</strong> of 30 days active
            </p>
          </div>
          <div className="w-full bg-sand-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${streakStats.consistencyRate}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Longest Streak & Total Mindful Actions */}
        <div className="rounded-3xl bg-sand-50/80 border border-sand-200 p-5 flex flex-col justify-between hover:bg-sand-50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Historical Best
            </span>
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
              <Crown size={14} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-serif font-bold text-ink-900">
              {streakStats.longestStreak} Days
            </div>
            <p className="text-xs text-ink-500 mt-1 font-light">
              <strong className="text-ink-800 font-semibold">{streakStats.totalActionsCount}</strong> total actions recorded
            </p>
          </div>
          <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl self-start border border-emerald-100">
            {streakStats.currentStreak >= streakStats.longestStreak && streakStats.currentStreak > 0
              ? '⭐ Current streak is your personal best!'
              : `🎯 ${streakStats.longestStreak - streakStats.currentStreak} days to break record`}
          </div>
        </div>
      </div>

      {/* Habit Type Filter Pills */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900 flex items-center gap-1.5">
            <Calendar size={15} className="text-emerald-600" />
            30-Day Activity Matrix
          </h3>
          <p className="text-xs text-ink-500 font-light">
            Each cell represents 1 calendar day. Hover or click to inspect breakdown.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeFilter === 'all'
                ? 'bg-ink-900 text-white shadow-xs'
                : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveFilter('energy')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
              activeFilter === 'energy'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
            }`}
          >
            <Smile size={12} />
            Mood & Energy
          </button>
          <button
            onClick={() => setActiveFilter('cbt')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
              activeFilter === 'cbt'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
            }`}
          >
            <Brain size={12} />
            CBT Reframes
          </button>
          <button
            onClick={() => setActiveFilter('focus')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
              activeFilter === 'focus'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
            }`}
          >
            <Clock size={12} />
            Focus Sessions
          </button>
          <button
            onClick={() => setActiveFilter('tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
              activeFilter === 'tasks'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-sand-100 text-ink-600 hover:bg-sand-200'
            }`}
          >
            <CheckCircle2 size={12} />
            Tasks Completed
          </button>
        </div>
      </div>

      {/* 30-Day Heat Map Grid */}
      <div className="mt-4 p-4 md:p-5 rounded-2xl bg-sand-50/70 border border-sand-200/80">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2">
          {habitDays.map((day) => {
            const isMatch = isDayMatchingFilter(day);
            const isToday = day.dayOffset === 0;
            const isSelected = selectedDay?.date === day.date;

            // Visual intensity based on total actions
            let cellColor = 'bg-white border-sand-200 text-ink-400 hover:border-sand-300';
            if (isMatch) {
              if (day.totalActions >= 4) {
                cellColor = 'bg-emerald-600 border-emerald-700 text-white shadow-sm';
              } else if (day.totalActions >= 2) {
                cellColor = 'bg-emerald-500 border-emerald-600 text-white';
              } else {
                cellColor = 'bg-emerald-100 border-emerald-300 text-emerald-900';
              }
            } else if (day.isActive && activeFilter !== 'all') {
              // Active in another category but not current filter
              cellColor = 'bg-sand-200/80 border-sand-300 text-ink-500';
            }

            return (
              <motion.button
                key={day.date}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                className={`relative flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all ${cellColor} ${
                  isSelected ? 'ring-2 ring-ink-900 ring-offset-2' : ''
                } ${isToday ? 'font-bold' : ''}`}
                title={`${day.formattedDate} (${day.dayOfWeek}): ${day.totalActions} total actions recorded`}
              >
                {/* Day of Week Label */}
                <span className="text-[9px] uppercase tracking-wider opacity-80">
                  {day.dayOfWeek}
                </span>

                {/* Day Date number (e.g. 12) */}
                <span className="text-xs font-semibold my-0.5">
                  {day.date.split('-')[2]}
                </span>

                {/* Mini indicator dot / icon */}
                <div className="h-1.5 w-1.5 rounded-full mt-0.5 flex items-center justify-center">
                  {isMatch ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
                  ) : (
                    <div className="h-1 w-1 rounded-full bg-sand-300" />
                  )}
                </div>

                {/* "Today" pill on today's cell */}
                {isToday && (
                  <span className="absolute -top-2 -right-1 text-[8px] bg-amber-500 text-white font-bold px-1 rounded-full shadow-2xs">
                    NOW
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Heat Map Legend */}
        <div className="flex items-center justify-between text-xs text-ink-500 mt-4 pt-3 border-t border-sand-200/80 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span>Activity Intensity:</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-ink-400">None</span>
              <div className="w-3 h-3 rounded bg-white border border-sand-200" />
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
              <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" />
              <div className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700" />
              <span className="text-[10px] text-ink-400">4+ Actions</span>
            </div>
          </div>
          <div className="text-[11px] text-ink-500 font-light">
            Tip: Click any square to view its exact habit breakdown or jump to that day's archive.
          </div>
        </div>
      </div>

      {/* Selected Day Inspector & Quick Habit Nudge */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedDay.date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-5 rounded-2xl bg-white border border-sand-200/90 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink-900">
                    Day Breakdown: {selectedDay.formattedDate} ({selectedDay.dayOfWeek})
                  </h4>
                  <p className="text-xs text-ink-500 font-light">
                    {selectedDay.isActive
                      ? `Completed ${selectedDay.totalActions} mindful actions • Habit Score: ${selectedDay.completionScore}%`
                      : 'No actions logged on this calendar date.'}
                  </p>
                </div>
              </div>

              {/* Action buttons for selected day */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {onOpenArchiveForDate && (
                  <button
                    onClick={() => onOpenArchiveForDate(selectedDay.date)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-sand-100 hover:bg-sand-200 text-ink-800 rounded-xl transition-colors"
                  >
                    <span>View in Archive</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Habit Category Grid for the Selected Day */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {/* Pillar 1: Energy & Emotion Check-in */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  selectedDay.energyLogged
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-sand-50/50 border-sand-200 text-ink-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <Smile size={13} />
                    Mood & Energy
                  </span>
                  {selectedDay.energyLogged ? (
                    <CheckCircle2 size={13} className="text-emerald-600" />
                  ) : (
                    <Circle size={13} className="text-sand-400" />
                  )}
                </div>
                <p className="text-[11px] font-medium">
                  {selectedDay.energyLogged ? 'Check-in Recorded' : 'Pending Entry'}
                </p>
              </div>

              {/* Pillar 2: CBT Cognitive Reframe */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  selectedDay.cbtCount > 0
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                    : 'bg-sand-50/50 border-sand-200 text-ink-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <Brain size={13} />
                    CBT Reframe
                  </span>
                  {selectedDay.cbtCount > 0 ? (
                    <CheckCircle2 size={13} className="text-emerald-600" />
                  ) : (
                    <Circle size={13} className="text-sand-400" />
                  )}
                </div>
                <p className="text-[11px] font-medium">
                  {selectedDay.cbtCount > 0
                    ? `${selectedDay.cbtCount} distortion reframed`
                    : 'No reframes'}
                </p>
              </div>

              {/* Pillar 3: Ultradian Focus Minutes */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  selectedDay.focusMinutes > 0
                    ? 'bg-teal-50/70 border-teal-200 text-teal-900'
                    : 'bg-sand-50/50 border-sand-200 text-ink-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    Focus Block
                  </span>
                  {selectedDay.focusMinutes > 0 ? (
                    <CheckCircle2 size={13} className="text-emerald-600" />
                  ) : (
                    <Circle size={13} className="text-sand-400" />
                  )}
                </div>
                <p className="text-[11px] font-medium">
                  {selectedDay.focusMinutes > 0
                    ? `${selectedDay.focusMinutes} mins in bio-flow`
                    : 'No focus logged'}
                </p>
              </div>

              {/* Pillar 4: Task Completion */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  selectedDay.tasksCompleted > 0
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-sand-50/50 border-sand-200 text-ink-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Mindful Tasks
                  </span>
                  {selectedDay.tasksCompleted > 0 ? (
                    <CheckCircle2 size={13} className="text-emerald-600" />
                  ) : (
                    <Circle size={13} className="text-sand-400" />
                  )}
                </div>
                <p className="text-[11px] font-medium">
                  {selectedDay.tasksCompleted > 0
                    ? `${selectedDay.tasksCompleted} tasks completed`
                    : 'No completed tasks'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestones & Badges Carousel */}
      <div className="mt-8 pt-6 border-t border-sand-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-ink-900 flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500" />
              Neuro-Habituation Milestones
            </h3>
            <p className="text-xs text-ink-500 font-light">
              Scientifically proven thresholds for establishing psychological resilience and automaticity.
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
            {milestones.filter((m) => m.unlocked).length} / {milestones.length} Badges Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {milestones.map((m) => {
            const isUnlocked = m.unlocked;
            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-amber-50/60 to-white border-amber-200/90 shadow-2xs'
                    : 'bg-sand-50/40 border-sand-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isUnlocked
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-sand-200 text-ink-400'
                      }`}
                    >
                      {m.days}d
                    </div>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-ink-400">LOCKED</span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-ink-900">{m.title}</h4>
                  <p className="text-[11px] text-ink-500 font-light mt-1 line-clamp-2">
                    {m.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-sand-200/50 text-[10px] text-ink-400 italic">
                  "{m.psychologicalInsight}"
                </div>
              </div>
            );
          })}
        </div>

        {/* Ultradian 90-Min Focus Achievements & Badges */}
        {focusBadges.length > 0 && (
          <div className="mt-6 pt-5 border-t border-sand-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-ink-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Crown size={14} className="text-amber-500" />
                  Ultradian Focus Badges ({focusBadges.length} Earned)
                </h4>
                <p className="text-[11px] text-ink-500">
                  Earned by completing 90-minute deep concentration blocks. Synchronized with Firestore.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {focusBadges.map((b) => (
                <div
                  key={b.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/90 shadow-2xs text-xs font-medium text-amber-950 transition-all hover:scale-102"
                  title={`${b.badgeName} • ${b.description}`}
                >
                  <span className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-2xs">
                    👑
                  </span>
                  <span className="font-semibold text-ink-900">{b.badgeName}</span>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-200/70 px-1.5 py-0.5 rounded-md uppercase">
                    {b.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
