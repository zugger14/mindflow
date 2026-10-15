import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Layers, 
  Calendar, 
  Flame, 
  Zap, 
  Wind, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Volume2,
  Sun,
  Moon,
  Trash2
} from 'lucide-react';
import UltradianTimer from './components/UltradianTimer';
import TaskManager from './components/TaskManager';
import BrainDump from './components/BrainDump';
import CBTJournal from './components/CBTJournal';
import BoxBreathing from './components/BoxBreathing';
import EnergyTracker from './components/EnergyTracker';
import PsychologicalAnalysis from './components/PsychologicalAnalysis';
import MoodEnergyTrend from './components/MoodEnergyTrend';
import ConsistencyHabitTracker from './components/ConsistencyHabitTracker';
import HabitsAndTrendsHub from './components/HabitsAndTrendsHub';
import AmbientSoundscapes from './components/AmbientSoundscapes';
import UserAuthPill from './components/UserAuthPill';
import HistoryArchiveViewer from './components/HistoryArchiveViewer';
import CircadianGuideBanner, { AppIntentMode } from './components/CircadianGuideBanner';
import SyncPromptModal from './components/SyncPromptModal';
import ResetDataModal from './components/ResetDataModal';
import { AuthProvider, useAuth } from './context/AuthContext';

function DashboardContent() {
  const { user, userVersion } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [activeMode, setActiveMode] = useState<AppIntentMode>('focus');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveDate, setArchiveDate] = useState<string | undefined>(undefined);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncModalAction, setSyncModalAction] = useState('entry');
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mindflow_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('mindflow_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mindflow_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [userVersion]);

  // Collapsible sections for 'all' / Unified mode to prevent visual clutter
  const [collapsedPillars, setCollapsedPillars] = useState<{ [key: string]: boolean }>({
    deepWork: false,
    cognitive: false,
    insights: false,
  });

  const togglePillar = (key: string) => {
    setCollapsedPillars((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerStatsRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDataInput = (action: string) => {
    triggerStatsRefresh();
    if (!user) {
      setSyncModalAction(action);
      setSyncModalOpen(true);
    }
  };

  const handleStartBreathing = () => {
    setBreathingActive(true);
    if (activeMode !== 'reset' && activeMode !== 'all') {
      setActiveMode('reset');
    }
    setTimeout(() => {
      const element = document.getElementById('box-breathing-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 font-sans text-ink-800 relative selection:bg-emerald-100 selection:text-emerald-900">
      {/* App Header with Brand & Categorized Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-5"
      >
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-emerald-200/50">
              <Brain size={20} />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-ink-900">
                Mind<span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Flow</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sand-100 text-ink-700 px-2 py-0.5 rounded-full border border-sand-200">
                Cognitive Studio
              </span>
            </div>
          </div>
          <p className="text-xs md:text-sm text-ink-600 max-w-2xl font-light">
            Intent-driven wellness and productivity across 4 cognitive pillars. Starts clean—data saves automatically as you input, with optional Google Sign In for seamless cloud sync across all your devices.
          </p>
        </div>

        {/* Header Right Actions: Dark Mode + User Auth + Past Archive */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setIsDark((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl bg-white/90 backdrop-blur-md border border-sand-200/90 text-ink-700 hover:text-amber-600 hover:border-amber-300 shadow-2xs transition-all cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <>
                <Sun size={13} className="text-amber-500 animate-spin-slow" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* History Archive Button */}
          <button
            onClick={() => {
              setArchiveDate(undefined);
              setIsArchiveOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl bg-white/90 backdrop-blur-md border border-sand-200/90 text-ink-700 hover:text-emerald-800 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer"
            title="Browse past days' logs and run retrospective psychological analysis"
          >
            <Calendar size={13} className="text-emerald-600" />
            <span>Logs Archive</span>
          </button>

          {/* User Auth Pill (Firestore sync & status) */}
          <UserAuthPill />
        </div>
      </motion.header>

      {/* Main Workspace Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Circadian Guidance Routine Banner: Context-sensitive onboarding & recommendation */}
        <CircadianGuideBanner
          onSelectMode={(mode) => setActiveMode(mode)}
          onStartBreathing={handleStartBreathing}
        />

        {/* Primary Intent Mode Switcher (Categorized Hub) */}
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-3xl border border-sand-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 pt-1 pb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                Select Your Current Intent
              </span>
              <p className="text-xs text-ink-600 font-light">
                Switch modes to reduce split-attention effect and eliminate visual overwhelm.
              </p>
            </div>
            
            <div className="text-[11px] text-ink-400 hidden lg:block">
              Single-tasking protects prefrontal cortex energy
            </div>
          </div>

          {/* Segmented Control Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1 bg-sand-100/70 rounded-2xl border border-sand-200/60">
            {/* Mode 1: Deep Focus */}
            <button
              onClick={() => setActiveMode('focus')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeMode === 'focus'
                  ? 'bg-white text-ink-900 shadow-xs ring-1 ring-emerald-500/30'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-white/60'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeMode === 'focus' ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-200/60 text-ink-600'
              }`}>
                <Brain size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                  Deep Focus
                  {isTimerActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] text-ink-400 truncate">90m Timer · Sound</div>
              </div>
            </button>

            {/* Mode 2: Mind Reset & CBT */}
            <button
              onClick={() => setActiveMode('reset')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeMode === 'reset'
                  ? 'bg-white text-ink-900 shadow-xs ring-1 ring-violet-500/30'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-white/60'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeMode === 'reset' ? 'bg-violet-100 text-violet-800' : 'bg-sand-200/60 text-ink-600'
              }`}>
                <Wind size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">Mind Reset</div>
                <div className="text-[10px] text-ink-400 truncate">Brain Dump · CBT · Breath</div>
              </div>
            </button>

            {/* Mode 3: Energy Check-In */}
            <button
              onClick={() => setActiveMode('checkin')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeMode === 'checkin'
                  ? 'bg-white text-ink-900 shadow-xs ring-1 ring-amber-500/30'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-white/60'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeMode === 'checkin' ? 'bg-amber-100 text-amber-800' : 'bg-sand-200/60 text-ink-600'
              }`}>
                <Zap size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">Energy Pulse</div>
                <div className="text-[10px] text-ink-400 truncate">Daily Vitality · Chronotype</div>
              </div>
            </button>

            {/* Mode 4: Insights & Streaks */}
            <button
              onClick={() => setActiveMode('insights')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeMode === 'insights'
                  ? 'bg-white text-ink-900 shadow-xs ring-1 ring-orange-500/30'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-white/60'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeMode === 'insights' ? 'bg-orange-100 text-orange-800' : 'bg-sand-200/60 text-ink-600'
              }`}>
                <Flame size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">Habits & Trends</div>
                <div className="text-[10px] text-ink-400 truncate">4 Subcategories · Badges</div>
              </div>
            </button>

            {/* Mode 5: Full Studio / All */}
            <button
              onClick={() => setActiveMode('all')}
              className={`col-span-2 sm:col-span-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeMode === 'all'
                  ? 'bg-white text-ink-900 shadow-xs ring-1 ring-ink-500/30'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-white/60'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeMode === 'all' ? 'bg-ink-900 text-white' : 'bg-sand-200/60 text-ink-600'
              }`}>
                <Layers size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">Full Studio</div>
                <div className="text-[10px] text-ink-400 truncate">Collapsible Pillars</div>
              </div>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: DEEP FOCUS FLOW (Pillar I)                           */}
        {/* ------------------------------------------------------------- */}
        <AnimatePresence mode="wait">
          {activeMode === 'focus' && (
            <motion.div
              key="mode-focus"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Pillar context header */}
              <div className="flex items-center justify-between border-b border-sand-200/80 pb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
                  <span className="font-semibold text-emerald-800">Pillar I</span>
                  <span aria-hidden="true">·</span>
                  <span>Deep Work & Bio-Rhythm Flow</span>
                  <span aria-hidden="true">·</span>
                  <span>90-Minute Ultradian Cycles & Neuro-Acoustic Entrainment</span>
                </div>
                <button
                  onClick={() => setActiveMode('reset')}
                  className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1 hover:underline"
                >
                  <span>Feeling overwhelmed? Mind Reset</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Main Focus Grid: Ultradian Timer + Task Manager side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 min-h-[440px]">
                  <UltradianTimer
                    onSessionLogged={triggerStatsRefresh}
                    onTimerStateChange={(active, isBreak) => {
                      setIsTimerActive(active);
                      setIsBreakMode(isBreak);
                    }}
                  />
                </div>

                <div className="lg:col-span-7 min-h-[440px]">
                  <TaskManager
                    onTaskUpdated={() => handleDataInput('task')}
                    onOpenHistory={() => {
                      setArchiveDate(undefined);
                      setIsArchiveOpen(true);
                    }}
                  />
                </div>
              </div>

              {/* Ambient Soundscapes Companion */}
              <div>
                <AmbientSoundscapes
                  isTimerActive={isTimerActive}
                  isBreakMode={isBreakMode}
                />
              </div>

              {/* Contextual Bridge: Next Actions */}
              <div className="bg-sand-50/80 rounded-2xl p-4 border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-600">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-emerald-600 shrink-0" />
                  <span>
                    When your 90-minute block completes, your <strong>Focus Achievement Badge</strong> is automatically recorded in Firestore.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleStartBreathing}
                    className="font-medium text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Quick 2-min Breath Break
                  </button>
                  <span aria-hidden="true" className="text-sand-400">·</span>
                  <button
                    onClick={() => setActiveMode('reset')}
                    className="font-medium text-violet-700 hover:text-violet-900 underline"
                  >
                    Open Brain Dump
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 2: MIND RESET & CBT (Pillar II)                          */}
          {/* ------------------------------------------------------------- */}
          {activeMode === 'reset' && (
            <motion.div
              key="mode-reset"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Pillar context header */}
              <div className="flex items-center justify-between border-b border-sand-200/80 pb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
                  <span className="font-semibold text-violet-800">Pillar II</span>
                  <span aria-hidden="true">·</span>
                  <span>Cognitive Load & Emotional Regulation</span>
                  <span aria-hidden="true">·</span>
                  <span>Working Memory Clearing & Beckian CBT Reframing</span>
                </div>
                <button
                  onClick={() => setActiveMode('focus')}
                  className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1 hover:underline"
                >
                  <span>Ready to work? Deep Focus Mode</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* 3-Part Healing Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* 1. Brain Dump */}
                <div className="min-h-[460px]">
                  <BrainDump onThoughtUpdated={() => handleDataInput('brain dump thought')} />
                </div>

                {/* 2. CBT Thought Journal */}
                <div className="min-h-[460px]">
                  <CBTJournal onEntrySaved={() => handleDataInput('CBT thought reframe')} />
                </div>

                {/* 3. Box Breathing */}
                <div id="box-breathing-section" className="min-h-[460px]">
                  <BoxBreathing forceActive={breathingActive} />
                </div>
              </div>

              {/* Contextual Bridge */}
              <div className="bg-violet-50/70 rounded-2xl p-4 border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-violet-600 shrink-0" />
                  <span>
                    Offloaded mental clutter converts directly into tasks in your Deep Focus workspace.
                  </span>
                </div>
                <button
                  onClick={() => setActiveMode('focus')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-ink-900 text-white font-medium hover:bg-ink-800 transition-all shrink-0"
                >
                  <span>Return to Deep Focus</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 3: ENERGY & VITALITY CHECK-IN (Pillar III)               */}
          {/* ------------------------------------------------------------- */}
          {activeMode === 'checkin' && (
            <motion.div
              key="mode-checkin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Pillar context header */}
              <div className="flex items-center justify-between border-b border-sand-200/80 pb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
                  <span className="font-semibold text-amber-800">Pillar III</span>
                  <span aria-hidden="true">·</span>
                  <span>Biopsychosocial Telemetry</span>
                  <span aria-hidden="true">·</span>
                  <span>Diurnal Vitality, Chronotype & Contextual Factors</span>
                </div>
                <button
                  onClick={() => setActiveMode('insights')}
                  className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1 hover:underline"
                >
                  <span>View 7-Day Trend Analytics</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Energy Tracker & Companion Guidance Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8">
                  <EnergyTracker
                    onLogSaved={() => handleDataInput('energy check-in')}
                    onOpenArchive={() => {
                      setArchiveDate(undefined);
                      setIsArchiveOpen(true);
                    }}
                  />
                </div>

                <div className="lg:col-span-4 space-y-4">
                  {/* Circadian Chronotype Guide Card */}
                  <div className="bg-white/95 rounded-3xl p-6 border border-sand-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                      <Zap size={14} />
                      <span>Circadian Rhythm Tips</span>
                    </div>

                    <div className="space-y-3 text-xs text-ink-600 leading-relaxed font-light">
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                        <span className="font-semibold text-amber-900 block mb-0.5">Peak Energy (Score 7–10)</span>
                        Reserve this window for high-cognitive tasks, strategic planning, or your 90-minute Ultradian deep block.
                      </div>

                      <div className="p-3 rounded-xl bg-sand-50 border border-sand-200/70">
                        <span className="font-semibold text-ink-900 block mb-0.5">Moderate Vitality (Score 5–6)</span>
                        Ideal for operational tasks, administrative organization, or clearing the Brain Dump backlog.
                      </div>

                      <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100">
                        <span className="font-semibold text-violet-900 block mb-0.5">Low Vitality (Score 1–4)</span>
                        Honor biological fatigue. Switch to Box Breathing or restorative ambient soundscapes rather than forcing caffeine.
                      </div>
                    </div>

                    <div className="pt-2 border-t border-sand-200/70 flex flex-col gap-2">
                      <button
                        onClick={() => setActiveMode('focus')}
                        className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-ink-900 text-white hover:bg-ink-800 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Brain size={13} className="text-emerald-400" />
                        <span>Ready? Start Deep Focus Block</span>
                      </button>

                      <button
                        onClick={handleStartBreathing}
                        className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-sand-100 text-ink-700 hover:bg-sand-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Wind size={13} className="text-violet-600" />
                        <span>Somatic Box Breathing</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 4: INSIGHTS & HABIT STREAKS (Pillar IV - Subcategorized) */}
          {/* ------------------------------------------------------------- */}
          {activeMode === 'insights' && (
            <motion.div
              key="mode-insights"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <HabitsAndTrendsHub
                onRefreshTrigger={refreshTrigger}
                onOpenArchiveForDate={(dateStr) => {
                  setArchiveDate(dateStr);
                  setIsArchiveOpen(true);
                }}
                onStartBreathing={handleStartBreathing}
                onNavigateToMode={(mode) => setActiveMode(mode)}
              />
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 5: FULL STUDIO (Collapsible Functional Pillars)           */}
          {/* ------------------------------------------------------------- */}
          {activeMode === 'all' && (
            <motion.div
              key="mode-all"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              {/* Intro note about collapsible sections */}
              <div className="bg-sand-50 rounded-2xl p-3.5 border border-sand-200/90 flex items-center justify-between text-xs text-ink-600">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-ink-700" />
                  <span>
                    Unified view organized into 3 functional pillars. Use the toggle buttons to collapse any pillar you are not currently using.
                  </span>
                </div>
                <button
                  onClick={() => setActiveMode('focus')}
                  className="font-medium text-emerald-700 hover:text-emerald-900 underline shrink-0"
                >
                  Switch to Single-Intent Mode
                </button>
              </div>

              {/* Pillar 1 Collapsible: Deep Work & Soundscapes */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl border border-sand-200/80 p-5 md:p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-sand-200/70 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Brain size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-ink-900">
                        Pillar I: Deep Work & Bio-Rhythm Flow
                      </h2>
                      <p className="text-xs text-ink-500 font-light">
                        Ultradian 90m focus cycles, priority task execution, and ambient soundscapes
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePillar('deepWork')}
                    className="p-1.5 rounded-xl hover:bg-sand-100 text-ink-500 hover:text-ink-800 transition-colors"
                    aria-label={collapsedPillars.deepWork ? 'Expand Pillar I' : 'Collapse Pillar I'}
                  >
                    {collapsedPillars.deepWork ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                </div>

                {!collapsedPillars.deepWork && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-5 min-h-[380px]">
                        <UltradianTimer
                          onSessionLogged={triggerStatsRefresh}
                          onTimerStateChange={(active, isBreak) => {
                            setIsTimerActive(active);
                            setIsBreakMode(isBreak);
                          }}
                        />
                      </div>
                      <div className="lg:col-span-7 min-h-[380px]">
                        <TaskManager
                          onTaskUpdated={triggerStatsRefresh}
                          onOpenHistory={() => {
                            setArchiveDate(undefined);
                            setIsArchiveOpen(true);
                          }}
                        />
                      </div>
                    </div>

                    <AmbientSoundscapes
                      isTimerActive={isTimerActive}
                      isBreakMode={isBreakMode}
                    />
                  </div>
                )}
              </section>

              {/* Pillar 2 Collapsible: Cognitive Regulation & Somatics */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl border border-sand-200/80 p-5 md:p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-sand-200/70 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center">
                      <Wind size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-ink-900">
                        Pillar II: Cognitive Load & Somatic Healing
                      </h2>
                      <p className="text-xs text-ink-500 font-light">
                        Working memory brain dump, CBT thought reframing, and 4-4-4-4 box breathing
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePillar('cognitive')}
                    className="p-1.5 rounded-xl hover:bg-sand-100 text-ink-500 hover:text-ink-800 transition-colors"
                    aria-label={collapsedPillars.cognitive ? 'Expand Pillar II' : 'Collapse Pillar II'}
                  >
                    {collapsedPillars.cognitive ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                </div>

                {!collapsedPillars.cognitive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    <div className="min-h-[440px]">
                      <BrainDump onThoughtUpdated={triggerStatsRefresh} />
                    </div>
                    <div className="min-h-[440px]">
                      <CBTJournal onEntrySaved={triggerStatsRefresh} />
                    </div>
                    <div id="box-breathing-section" className="min-h-[440px]">
                      <BoxBreathing forceActive={breathingActive} />
                    </div>
                  </div>
                )}
              </section>

              {/* Pillar 3 Collapsible: Longitudinal Insights & Habits */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl border border-sand-200/80 p-5 md:p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-sand-200/70 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
                      <Flame size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-ink-900">
                        Pillar III: Biopsychosocial Analytics & 30-Day Habits
                      </h2>
                      <p className="text-xs text-ink-500 font-light">
                        Energy tracking, streak heat map, mood correlations, and psychological analysis
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePillar('insights')}
                    className="p-1.5 rounded-xl hover:bg-sand-100 text-ink-500 hover:text-ink-800 transition-colors"
                    aria-label={collapsedPillars.insights ? 'Expand Pillar III' : 'Collapse Pillar III'}
                  >
                    {collapsedPillars.insights ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                </div>

                {!collapsedPillars.insights && (
                  <div className="space-y-6">
                    <EnergyTracker
                      onLogSaved={triggerStatsRefresh}
                      onOpenArchive={() => {
                        setArchiveDate(undefined);
                        setIsArchiveOpen(true);
                      }}
                    />

                    <PsychologicalAnalysis
                      onStartBreathing={handleStartBreathing}
                      onRefreshTrigger={refreshTrigger}
                      onOpenArchive={() => {
                        setArchiveDate(undefined);
                        setIsArchiveOpen(true);
                      }}
                    />

                    <ConsistencyHabitTracker
                      onRefreshTrigger={refreshTrigger}
                      onOpenArchiveForDate={(dateStr) => {
                        setArchiveDate(dateStr);
                        setIsArchiveOpen(true);
                      }}
                    />

                    <MoodEnergyTrend
                      onRefreshTrigger={refreshTrigger}
                      onOpenArchiveForDate={(dateStr) => {
                        setArchiveDate(dateStr);
                        setIsArchiveOpen(true);
                      }}
                    />
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with Storage Info & Reset */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 pb-8 border-t border-sand-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>MindFlow Cognitive OS • Local Storage Active</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setResetModalOpen(true)}
            className="text-ink-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            title="Purge all local storage and reset dashboard"
          >
            <Trash2 size={13} />
            <span>Reset Local Storage</span>
          </button>
        </div>
      </footer>

      {/* Historical Log Archive & Retrospective Modal */}
      <HistoryArchiveViewer
        isOpen={isArchiveOpen}
        initialDate={archiveDate}
        onClose={() => {
          setIsArchiveOpen(false);
          setArchiveDate(undefined);
        }}
      />

      {/* Sync Prompt Dialogue for Guest Users */}
      <SyncPromptModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        actionName={syncModalAction}
      />

      {/* Delete Local Storage & Reset Modal */}
      <ResetDataModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
