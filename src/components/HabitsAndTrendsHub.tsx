import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  TrendingUp,
  Brain,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Calendar,
  ShieldCheck,
  Crown,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Wind,
  Info
} from 'lucide-react';
import ConsistencyHabitTracker from './ConsistencyHabitTracker';
import MoodEnergyTrend from './MoodEnergyTrend';
import PsychologicalAnalysis from './PsychologicalAnalysis';
import { StorageService, FOCUS_BADGE_CATALOGUE, BadgeTemplate, getTodayDateStr } from '../utils/storage';
import { 
  HabitStreakRecord, 
  DayHabitStatus, 
  FocusAchievement, 
  StreakMilestone, 
  EnergyLog,
  PsychologicalAnalysisResult,
  BadgeRarity
} from '../types/logs';
import { useAuth } from '../context/AuthContext';
import { AppIntentMode } from './CircadianGuideBanner';

interface HabitsAndTrendsHubProps {
  onRefreshTrigger?: number;
  onOpenArchiveForDate?: (dateStr: string) => void;
  onStartBreathing?: () => void;
  onNavigateToMode?: (mode: AppIntentMode) => void;
}

export type HabitTrendsSubcategory = 'habits' | 'trends' | 'psych' | 'badges' | 'unified';

export default function HabitsAndTrendsHub({
  onRefreshTrigger,
  onOpenArchiveForDate,
  onStartBreathing,
  onNavigateToMode,
}: HabitsAndTrendsHubProps) {
  const { user } = useAuth();
  const [activeSubcategory, setActiveSubcategory] = useState<HabitTrendsSubcategory>('habits');
  const [streakStats, setStreakStats] = useState<HabitStreakRecord>({
    currentStreak: 0,
    longestStreak: 0,
    activeDaysLast30: 0,
    consistencyRate: 0,
    totalActionsCount: 0,
    updatedAt: Date.now(),
  });
  const [habitDays, setHabitDays] = useState<DayHabitStatus[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<FocusAchievement[]>([]);
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [recentEnergyLogs, setRecentEnergyLogs] = useState<EnergyLog[]>([]);
  const [savedAnalysis, setSavedAnalysis] = useState<PsychologicalAnalysisResult | null>(null);

  // Badge Vault Filters
  const [badgeRarityFilter, setBadgeRarityFilter] = useState<'all' | BadgeRarity>('all');
  const [badgeStatusFilter, setBadgeStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Unified mode collapsible states
  const [collapsedSections, setCollapsedSections] = useState({
    habits: false,
    trends: false,
    psych: false,
    badges: false,
  });

  const toggleSection = (key: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Load aggregated summaries
  useEffect(() => {
    const stats = StorageService.calculateHabitStreakStats();
    const days = StorageService.get30DayHabitStatus();
    const achievements = StorageService.getFocusAchievements();
    const mileStonesList = StorageService.getStreakMilestones(stats.currentStreak);
    const logs = StorageService.getEnergyLogs();
    const analysis = StorageService.getSavedAnalysis();

    setStreakStats(stats);
    setHabitDays(days);
    setUnlockedAchievements(achievements);
    setMilestones(mileStonesList);
    setRecentEnergyLogs(logs);
    setSavedAnalysis(analysis);
  }, [onRefreshTrigger, user]);

  const todayStatus = useMemo(() => {
    return habitDays.find((d) => d.dayOffset === 0);
  }, [habitDays]);

  // 7-day average vitality calculation
  const vitalitySummary = useMemo(() => {
    const recent = recentEnergyLogs.slice(0, 7);
    if (recent.length === 0) return { avgEnergy: 65, avgEmotion: 68, trend: 'Optimal' };
    const avgEnergy = Math.round(recent.reduce((acc, l) => acc + l.energy, 0) / recent.length);
    const avgEmotion = Math.round(recent.reduce((acc, l) => acc + l.emotion, 0) / recent.length);
    
    let trend = 'Stable Flow';
    if (avgEnergy >= 75) trend = 'High Vitality';
    else if (avgEnergy <= 45 && avgEmotion <= 50) trend = 'Rest Needed';

    return { avgEnergy, avgEmotion, trend };
  }, [recentEnergyLogs]);

  // Next milestone calculation
  const nextMilestone = useMemo(() => {
    return milestones.find((m) => !m.unlocked) || milestones[milestones.length - 1];
  }, [milestones]);

  // Rarity color helpers
  const getRarityBadgeClasses = (rarity: BadgeRarity) => {
    switch (rarity) {
      case 'mythic':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'gold':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'silver':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'bronze':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pillar Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
            <span className="font-semibold text-orange-800">Pillar IV</span>
            <span aria-hidden="true">·</span>
            <span>Longitudinal Analytics & Habit Formation</span>
            <span aria-hidden="true">·</span>
            <span className="text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
              Categorized & Anti-Overwhelm
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-light text-ink-900 mt-1">
            Habits, Trends & <span className="font-semibold text-orange-900">Neuroplastic Insights</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenArchiveForDate && (
            <button
              onClick={() => onOpenArchiveForDate(getTodayDateStr())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/90 hover:bg-sand-50 text-ink-700 rounded-2xl border border-sand-200 shadow-2xs transition-all hover:scale-[1.02]"
              title="Browse past days' full history archive"
            >
              <Calendar size={13} className="text-emerald-600" />
              <span>Full Archive</span>
            </button>
          )}

          {onNavigateToMode && (
            <button
              onClick={() => onNavigateToMode('focus')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-ink-900 text-white rounded-2xl shadow-2xs hover:bg-ink-800 transition-all hover:scale-[1.02]"
            >
              <span>Back to Focus</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. EXECUTIVE SUMMARY (AT-A-GLANCE HIGH-LEVEL DASHBOARD)        */}
      {/* Progressive disclosure: users get the full story in 5 seconds */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Active Habit Streak */}
        <div 
          onClick={() => setActiveSubcategory('habits')}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-sand-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
            <span className="font-medium flex items-center gap-1.5 text-amber-800">
              <Flame size={14} className="text-amber-500 animate-pulse" />
              Habit Streak
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
              {streakStats.consistencyRate}% Rate
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-ink-900">
              {streakStats.currentStreak}
            </span>
            <span className="text-xs text-ink-500">consecutive days</span>
          </div>
          <div className="text-[11px] text-ink-500 mt-1 flex items-center justify-between">
            <span>{todayStatus?.isActive ? '✨ Preserved today' : '⏳ Entry awaiting'}</span>
            <span className="text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium">View Heatmap →</span>
          </div>
        </div>

        {/* KPI 2: Vitality & Emotion Baseline */}
        <div 
          onClick={() => setActiveSubcategory('trends')}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-sand-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
            <span className="font-medium flex items-center gap-1.5 text-emerald-800">
              <TrendingUp size={14} className="text-emerald-600" />
              Vitality Pulse
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              7-Day Mean
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-ink-900">
              {vitalitySummary.avgEnergy}
            </span>
            <span className="text-xs text-ink-500">/ 100 energy avg</span>
          </div>
          <div className="text-[11px] text-ink-500 mt-1 flex items-center justify-between">
            <span>Mood {vitalitySummary.avgEmotion}/100 · {vitalitySummary.trend}</span>
            <span className="text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium">View Trends →</span>
          </div>
        </div>

        {/* KPI 3: Cognitive Diagnosis */}
        <div 
          onClick={() => setActiveSubcategory('psych')}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-sand-200/90 shadow-2xs hover:border-violet-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
            <span className="font-medium flex items-center gap-1.5 text-violet-800">
              <Brain size={14} className="text-violet-600" />
              Cognitive State
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200/60">
              AI Synthesis
            </span>
          </div>
          <div className="text-sm md:text-base font-semibold text-ink-900 truncate mt-1">
            {savedAnalysis ? savedAnalysis.mindsetDiagnosis : 'Balanced Flow'}
          </div>
          <div className="text-[11px] text-ink-500 mt-1.5 flex items-center justify-between">
            <span className="truncate">
              {savedAnalysis?.riskFlags && savedAnalysis.riskFlags.length > 0 
                ? `⚠️ ${savedAnalysis.riskFlags[0].indicator}` 
                : 'Shield active: Low burnout'}
            </span>
            <span className="text-violet-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Insights →</span>
          </div>
        </div>

        {/* KPI 4: Achievement Badges Vault */}
        <div 
          onClick={() => setActiveSubcategory('badges')}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-sand-200/90 shadow-2xs hover:border-orange-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
            <span className="font-medium flex items-center gap-1.5 text-orange-800">
              <Award size={14} className="text-orange-600" />
              Badge Vault
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200/60">
              {unlockedAchievements.length} Unlocked
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-ink-900">
              {unlockedAchievements.length + milestones.filter((m) => m.unlocked).length}
            </span>
            <span className="text-xs text-ink-500">awards earned</span>
          </div>
          <div className="text-[11px] text-ink-500 mt-1 flex items-center justify-between">
            <span>Next: {nextMilestone?.title || 'Mastery'}</span>
            <span className="text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Open Vault →</span>
          </div>
        </div>
      </div>

      {/* Next Best Action Suggestion Bar (Anti-Overwhelm Guidance) */}
      <div className="bg-gradient-to-r from-sand-100/90 via-sand-50/80 to-sand-100/90 rounded-2xl p-3.5 border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-700">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles size={13} />
          </div>
          <div>
            <span className="font-semibold text-ink-900 mr-1.5">Neuro-Recommendation:</span>
            {!todayStatus?.isActive ? (
              <span>Your streak is awaiting today's commitment. A single 2-minute check-in or focus block locks in your habit momentum.</span>
            ) : vitalitySummary.avgEnergy <= 45 ? (
              <span>Biological depletion signals detected in recent logs. A 4-minute box breathing session will lower cortisol without depleting willpower.</span>
            ) : (
              <span>High habit consistency maintained ({streakStats.consistencyRate}%). Your attentional baseline is primed for a 90-minute Ultradian deep work cycle.</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!todayStatus?.isActive && onNavigateToMode && (
            <button
              onClick={() => onNavigateToMode('checkin')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-2xs cursor-pointer"
            >
              Log Vitality Check-In
            </button>
          )}
          {vitalitySummary.avgEnergy <= 45 && onStartBreathing && (
            <button
              onClick={onStartBreathing}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Wind size={12} />
              <span>Somatic Reset</span>
            </button>
          )}
          {todayStatus?.isActive && onNavigateToMode && (
            <button
              onClick={() => onNavigateToMode('focus')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Zap size={12} />
              <span>Deep Focus Block</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SUBCATEGORY NAVIGATION TABS                                */}
      {/* Segregates heavy dashboard sections to prevent cognitive overload*/}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-sand-200/90 shadow-2xs">
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
              Habits & Trends Subcategories
            </span>
            <span className="text-[10px] text-ink-400 hidden sm:inline">
              · Select one subcategory to view without visual clutter
            </span>
          </div>
          <div className="text-[10px] text-ink-400">
            Progressive Disclosure Active
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {/* Subcategory 1: Daily Habits & 30-Day Streaks */}
          <button
            onClick={() => setActiveSubcategory('habits')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeSubcategory === 'habits'
                ? 'bg-amber-500 text-white shadow-xs font-medium'
                : 'text-ink-600 hover:text-ink-900 hover:bg-sand-100/70'
            }`}
          >
            <Flame size={15} className={activeSubcategory === 'habits' ? 'text-amber-100' : 'text-amber-500'} />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Habits & Streaks</div>
              <div className={`text-[10px] truncate ${activeSubcategory === 'habits' ? 'text-amber-100' : 'text-ink-400'}`}>
                30d Heatmap · Daily
              </div>
            </div>
          </button>

          {/* Subcategory 2: Vitality & Mood Trends */}
          <button
            onClick={() => setActiveSubcategory('trends')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeSubcategory === 'trends'
                ? 'bg-emerald-600 text-white shadow-xs font-medium'
                : 'text-ink-600 hover:text-ink-900 hover:bg-sand-100/70'
            }`}
          >
            <TrendingUp size={15} className={activeSubcategory === 'trends' ? 'text-emerald-100' : 'text-emerald-600'} />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Vitality Trends</div>
              <div className={`text-[10px] truncate ${activeSubcategory === 'trends' ? 'text-emerald-100' : 'text-ink-400'}`}>
                7-Day Curve · Diurnal
              </div>
            </div>
          </button>

          {/* Subcategory 3: Cognitive & Psych Diagnostics */}
          <button
            onClick={() => setActiveSubcategory('psych')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeSubcategory === 'psych'
                ? 'bg-violet-600 text-white shadow-xs font-medium'
                : 'text-ink-600 hover:text-ink-900 hover:bg-sand-100/70'
            }`}
          >
            <Brain size={15} className={activeSubcategory === 'psych' ? 'text-violet-100' : 'text-violet-600'} />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Diagnostics & AI</div>
              <div className={`text-[10px] truncate ${activeSubcategory === 'psych' ? 'text-violet-100' : 'text-ink-400'}`}>
                Clinical Verdict · Risk
              </div>
            </div>
          </button>

          {/* Subcategory 4: Badges & Achievement Vault */}
          <button
            onClick={() => setActiveSubcategory('badges')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeSubcategory === 'badges'
                ? 'bg-orange-600 text-white shadow-xs font-medium'
                : 'text-ink-600 hover:text-ink-900 hover:bg-sand-100/70'
            }`}
          >
            <Award size={15} className={activeSubcategory === 'badges' ? 'text-orange-100' : 'text-orange-600'} />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Badge Vault</div>
              <div className={`text-[10px] truncate ${activeSubcategory === 'badges' ? 'text-orange-100' : 'text-ink-400'}`}>
                Deep Work Guru · Crowns
              </div>
            </div>
          </button>

          {/* Subcategory 5: Unified View (All-In-One with collapsible pillars) */}
          <button
            onClick={() => setActiveSubcategory('unified')}
            className={`col-span-2 sm:col-span-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeSubcategory === 'unified'
                ? 'bg-ink-900 text-white shadow-xs font-medium'
                : 'text-ink-600 hover:text-ink-900 hover:bg-sand-100/70'
            }`}
          >
            <Layers size={15} className={activeSubcategory === 'unified' ? 'text-sand-200' : 'text-ink-600'} />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Unified View</div>
              <div className={`text-[10px] truncate ${activeSubcategory === 'unified' ? 'text-sand-300' : 'text-ink-400'}`}>
                Collapsible Sections
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SUBCATEGORY CONTENT AREAS                                  */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {/* SUBCATEGORY A: HABITS & 30-DAY STREAKS */}
        {activeSubcategory === 'habits' && (
          <motion.div
            key="subcat-habits"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="bg-sand-50/70 rounded-2xl px-4 py-2.5 border border-sand-200 flex items-center justify-between text-xs text-ink-600">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-amber-500" />
                <span>Focused Subcategory: 30-Day Neuroplastic Habituation & Daily Action Checklists</span>
              </div>
              <span className="text-ink-400">Zero-distraction habit focus</span>
            </div>

            <ConsistencyHabitTracker
              onRefreshTrigger={onRefreshTrigger}
              onOpenArchiveForDate={onOpenArchiveForDate}
            />
          </motion.div>
        )}

        {/* SUBCATEGORY B: VITALITY & MOOD TRENDS */}
        {activeSubcategory === 'trends' && (
          <motion.div
            key="subcat-trends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="bg-sand-50/70 rounded-2xl px-4 py-2.5 border border-sand-200 flex items-center justify-between text-xs text-ink-600">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-600" />
                <span>Focused Subcategory: 7-Day Composed Recharts Analytics, Mood Correlations & Diurnal Peaks</span>
              </div>
              <span className="text-ink-400">Zero-distraction telemetry view</span>
            </div>

            <MoodEnergyTrend
              onRefreshTrigger={onRefreshTrigger}
              onOpenArchiveForDate={onOpenArchiveForDate}
            />
          </motion.div>
        )}

        {/* SUBCATEGORY C: COGNITIVE & PSYCH DIAGNOSTICS */}
        {activeSubcategory === 'psych' && (
          <motion.div
            key="subcat-psych"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="bg-sand-50/70 rounded-2xl px-4 py-2.5 border border-sand-200 flex items-center justify-between text-xs text-ink-600">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-violet-600" />
                <span>Focused Subcategory: Biopsychosocial Clinical Synthesis, Burnout Risk & Local/Cloud LLM Diagnostics</span>
              </div>
              <span className="text-ink-400">AI Diagnostic Console</span>
            </div>

            <PsychologicalAnalysis
              onStartBreathing={onStartBreathing}
              onRefreshTrigger={onRefreshTrigger}
              onOpenArchive={() => onOpenArchiveForDate && onOpenArchiveForDate(getTodayDateStr())}
            />
          </motion.div>
        )}

        {/* SUBCATEGORY D: BADGES & ACHIEVEMENT VAULT */}
        {activeSubcategory === 'badges' && (
          <motion.div
            key="subcat-badges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Vault Banner */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-sand-200/90 shadow-2xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-200/50">
                    <Award size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl md:text-2xl font-serif font-semibold text-ink-900 tracking-tight">
                        Neuroplastic Achievement & Badge Vault
                      </h3>
                      <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        Ultradian Rewards
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 font-light mt-0.5">
                      Rewards earned through unbroken 90-minute Ultradian deep work cycles and 30-day streak milestones.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80">
                    {unlockedAchievements.length} Focus Badges
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200/80">
                    {milestones.filter((m) => m.unlocked).length} / {milestones.length} Streak Crowns
                  </span>
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-sand-50/70 p-3 rounded-2xl border border-sand-200/70">
                {/* Status filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-ink-500 font-medium mr-1 flex items-center gap-1">
                    <Filter size={12} /> Status:
                  </span>
                  {(['all', 'unlocked', 'locked'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setBadgeStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium capitalize transition-all ${
                        badgeStatusFilter === status
                          ? 'bg-ink-900 text-white shadow-2xs'
                          : 'bg-white text-ink-600 hover:text-ink-900 border border-sand-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Rarity filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-ink-500 font-medium mr-1">Rarity:</span>
                  {(['all', 'mythic', 'emerald', 'gold', 'silver', 'bronze'] as const).map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => setBadgeRarityFilter(rarity)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all ${
                        badgeRarityFilter === rarity
                          ? 'bg-orange-600 text-white font-bold shadow-2xs'
                          : 'bg-white text-ink-600 hover:text-ink-900 border border-sand-200'
                      }`}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Ultradian Focus Achievements Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-500" />
                    Ultradian 90-Minute Focus Badges
                  </h4>
                  <span className="text-[11px] text-ink-400">Awarded automatically upon completing 90m timer cycle</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FOCUS_BADGE_CATALOGUE
                    .filter((template) => {
                      const isUnlocked = unlockedAchievements.some((a) => a.badgeId === template.badgeId);
                      if (badgeStatusFilter === 'unlocked' && !isUnlocked) return false;
                      if (badgeStatusFilter === 'locked' && isUnlocked) return false;
                      if (badgeRarityFilter !== 'all' && template.rarity !== badgeRarityFilter) return false;
                      return true;
                    })
                    .map((template) => {
                      const unlockedInstances = unlockedAchievements.filter((a) => a.badgeId === template.badgeId);
                      const isUnlocked = unlockedInstances.length > 0;
                      const latest = unlockedInstances[0];

                      return (
                        <div
                          key={template.badgeId}
                          className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                            isUnlocked
                              ? 'bg-gradient-to-b from-amber-50/50 via-white to-white border-amber-200/90 shadow-2xs hover:shadow-xs'
                              : 'bg-sand-50/40 border-sand-200 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-2xs ${
                                  isUnlocked ? 'bg-amber-500 text-white' : 'bg-sand-200 text-ink-400'
                                }`}>
                                  {template.badgeId === 'deep_work_guru' ? '👑' : '✨'}
                                </span>
                                <div>
                                  <h5 className="text-xs font-semibold text-ink-900">{template.badgeName}</h5>
                                  <span className="text-[10px] text-ink-400">{template.category}</span>
                                </div>
                              </div>

                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getRarityBadgeClasses(template.rarity)}`}>
                                {template.rarity}
                              </span>
                            </div>

                            <p className="text-xs text-ink-600 font-light leading-relaxed mb-3">
                              {template.description}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-sand-200/60 space-y-1.5">
                            <div className="text-[10px] text-ink-500 italic flex items-center gap-1">
                              <Info size={11} className="text-amber-600 shrink-0" />
                              <span>{template.neuroInsight}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-ink-400 pt-1">
                              {isUnlocked ? (
                                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 size={11} /> Unlocked ({unlockedInstances.length}x)
                                </span>
                              ) : (
                                <span className="text-sand-500 flex items-center gap-1">
                                  <Circle size={10} /> Locked (Complete 90m block)
                                </span>
                              )}
                              {latest && (
                                <span>{new Date(latest.earnedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 2. Neuroplastic Habituation Streak Crowns */}
              <div className="space-y-3 pt-6 border-t border-sand-200/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-orange-500" />
                    30-Day Neuro-Habituation Milestone Crowns
                  </h4>
                  <span className="text-[11px] text-ink-400">Awarded as streak days compound</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {milestones.map((m) => {
                    const isUnlocked = m.unlocked;
                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isUnlocked
                            ? 'bg-gradient-to-b from-orange-50/60 to-white border-orange-200 shadow-2xs'
                            : 'bg-sand-50/40 border-sand-200 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                                isUnlocked
                                  ? 'bg-orange-500 text-white shadow-2xs'
                                  : 'bg-sand-200 text-ink-400'
                              }`}
                            >
                              {m.days}d
                            </div>
                            {isUnlocked ? (
                              <span className="text-[10px] font-bold text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded-full border border-orange-200">
                                UNLOCKED
                              </span>
                            ) : (
                              <span className="text-[10px] text-ink-400">
                                {m.days - streakStats.currentStreak}d left
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-semibold text-ink-900">{m.title}</h5>
                          <p className="text-[11px] text-ink-500 font-light mt-1">
                            {m.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-sand-200/60 text-[10px] text-ink-500 italic">
                          "{m.psychologicalInsight}"
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBCATEGORY E: UNIFIED DEEP DIVE (POWER USER VIEW WITH COLLAPSIBLES) */}
        {activeSubcategory === 'unified' && (
          <motion.div
            key="subcat-unified"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="bg-sand-50 rounded-2xl p-3 border border-sand-200 flex items-center justify-between text-xs text-ink-600">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-ink-700" />
                <span>
                  All 4 subcategories displayed in one stream. Use the toggle buttons to collapse any subcategory to preserve focus.
                </span>
              </div>
              <button
                onClick={() => setActiveSubcategory('habits')}
                className="font-medium text-orange-700 hover:text-orange-900 underline"
              >
                Return to Single Subcategory
              </button>
            </div>

            {/* Sub-Pillar 1: Habits & Streaks */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sand-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Flame size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">
                      Subcategory 1: 30-Day Consistency Habits & Streak Heatmap
                    </h3>
                    <p className="text-[11px] text-ink-500 font-light">
                      Daily micro-commitments, streak velocity, and 30-day interactive calendar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('habits')}
                  className="p-1 rounded-lg hover:bg-sand-100 text-ink-500"
                >
                  {collapsedSections.habits ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              </div>

              {!collapsedSections.habits && (
                <ConsistencyHabitTracker
                  onRefreshTrigger={onRefreshTrigger}
                  onOpenArchiveForDate={onOpenArchiveForDate}
                />
              )}
            </div>

            {/* Sub-Pillar 2: Vitality Trends */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sand-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">
                      Subcategory 2: 7-Day Vitality & Mood Longitudinal Telemetry
                    </h3>
                    <p className="text-[11px] text-ink-500 font-light">
                      Recharts visual correlation between energy, emotion, and task completion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('trends')}
                  className="p-1 rounded-lg hover:bg-sand-100 text-ink-500"
                >
                  {collapsedSections.trends ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              </div>

              {!collapsedSections.trends && (
                <MoodEnergyTrend
                  onRefreshTrigger={onRefreshTrigger}
                  onOpenArchiveForDate={onOpenArchiveForDate}
                />
              )}
            </div>

            {/* Sub-Pillar 3: Psychological Analysis */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sand-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center">
                    <Brain size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">
                      Subcategory 3: Biopsychosocial Cognitive Diagnostics & AI Engine
                    </h3>
                    <p className="text-[11px] text-ink-500 font-light">
                      Clinical synthesis, burnout meters, and early-warning alerts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('psych')}
                  className="p-1 rounded-lg hover:bg-sand-100 text-ink-500"
                >
                  {collapsedSections.psych ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              </div>

              {!collapsedSections.psych && (
                <PsychologicalAnalysis
                  onStartBreathing={onStartBreathing}
                  onRefreshTrigger={onRefreshTrigger}
                  onOpenArchive={() => onOpenArchiveForDate && onOpenArchiveForDate(getTodayDateStr())}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
