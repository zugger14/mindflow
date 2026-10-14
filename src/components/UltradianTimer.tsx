import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, FastForward, Sparkles, Volume2, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { StorageService } from '../utils/storage';
import { FocusSession, FocusAchievement } from '../types/logs';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import FocusAchievementModal from './FocusAchievementModal';

interface UltradianTimerProps {
  onSessionLogged?: () => void;
  onTimerStateChange?: (isActive: boolean, isBreak: boolean) => void;
}

export default function UltradianTimer({ onSessionLogged, onTimerStateChange }: UltradianTimerProps) {
  const { user, isCloudSynced } = useAuth();

  // 90 mins focus = 5400s, 20 mins break = 1200s
  const FOCUS_TIME = 90 * 60;
  const BREAK_TIME = 20 * 60;

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);

  // Focus Achievement Pop-up State
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<FocusAchievement | null>(null);
  const [totalBadgesCount, setTotalBadgesCount] = useState(0);

  useEffect(() => {
    const sessions = StorageService.getFocusSessions();
    const today = new Date().toISOString().split('T')[0];
    const todayCount = sessions.filter(
      (s) => new Date(s.timestamp).toISOString().split('T')[0] === today && s.type === 'focus'
    ).length;
    setSessionsCompletedToday(todayCount);
    setTotalBadgesCount(StorageService.getFocusAchievements().length);
  }, []);

  useEffect(() => {
    if (onTimerStateChange) {
      onTimerStateChange(isActive, isBreak);
    }
  }, [isActive, isBreak]);

  const recordSession = (type: 'focus' | 'break') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: FocusSession = {
      id: `session-${Date.now()}`,
      type,
      durationMinutes: type === 'focus' ? 90 : 20,
      timestamp: Date.now(),
      date: todayStr,
    };
    const current = StorageService.getFocusSessions();
    const updated = [newSession, ...current];
    StorageService.saveFocusSessions(updated);

    if (type === 'focus') {
      const nextCount = sessionsCompletedToday + 1;
      setSessionsCompletedToday(nextCount);

      // Award Focus Achievement Badge (e.g., 'Deep Work Guru')
      const { achievement } = StorageService.awardFocusAchievementOnBlockCompletion(nextCount);
      setCurrentAchievement(achievement);
      setAchievementModalOpen(true);
      setTotalBadgesCount(StorageService.getFocusAchievements().length);

      // Store in Firestore when user is authenticated
      if (user?.uid) {
        FirestoreService.saveFocusSession(user.uid, newSession);
        FirestoreService.saveFocusAchievement(user.uid, achievement);
      }
    } else {
      if (user?.uid) {
        FirestoreService.saveFocusSession(user.uid, newSession);
      }
    }

    if (onSessionLogged) {
      onSessionLogged();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        recordSession('focus');
        setIsBreak(true);
        setTimeLeft(BREAK_TIME);
      } else {
        recordSession('break');
        setIsBreak(false);
        setTimeLeft(FOCUS_TIME);
      }
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? BREAK_TIME : FOCUS_TIME);
  };

  const simulateBlockCompletion = () => {
    if (!isBreak) {
      recordSession('focus');
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
      setIsActive(false);
    } else {
      recordSession('break');
      setIsBreak(false);
      setTimeLeft(FOCUS_TIME);
      setIsActive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100
    : ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100/80 hover:border-emerald-200 transition-all flex flex-col items-center justify-between relative overflow-hidden h-full group">
      {/* Luminous Top Progress Glow Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-sand-100">
        <motion.div
          className={`h-full transition-all ${
            isBreak
              ? 'bg-gradient-to-r from-violet-400 via-purple-400 to-rose-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Header Badge */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isBreak ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200 shadow-2xs">
              <Coffee size={14} className="text-violet-600" />
              Restorative Break (20 min)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
              <Brain size={14} className="text-emerald-600" />
              Deep Focus Block (90 min)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const badges = StorageService.getFocusAchievements();
              if (badges.length > 0) {
                setCurrentAchievement(badges[0]);
              }
              setAchievementModalOpen(true);
            }}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs transition-all hover:scale-105"
            title="View Focus Achievements & Badges"
          >
            <Trophy size={12} className="text-amber-600" />
            <span>{totalBadgesCount} Badges</span>
          </button>

          <span className="text-[11px] font-semibold bg-sand-100 text-ink-700 px-2 py-0.5 rounded-full border border-sand-200">
            ✨ {sessionsCompletedToday} blocks today
          </span>
        </div>
      </div>

      {/* Center Digital Clock with Ambient Radiant Background */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Soft Radial Ambient Aura */}
        <div
          className={`absolute w-44 h-44 rounded-full filter blur-2xl opacity-25 transition-colors ${
            isActive
              ? isBreak
                ? 'bg-violet-400'
                : 'bg-emerald-400'
              : 'bg-sand-300'
          }`}
        />

        <div className="relative text-6xl md:text-7xl font-light tracking-tight text-ink-900 font-mono select-none drop-shadow-xs">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Tactile Vibrant Control Buttons */}
      <div className="flex items-center gap-3.5 z-10">
        <button
          onClick={toggleTimer}
          aria-label={isActive ? 'Pause' : 'Start'}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 ${
            isBreak
              ? 'bg-gradient-to-tr from-violet-600 to-purple-500 shadow-purple-200'
              : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 shadow-emerald-200'
          }`}
        >
          {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>

        <button
          onClick={resetTimer}
          aria-label="Reset Timer"
          className="w-11 h-11 rounded-full flex items-center justify-center text-ink-600 bg-sand-100 hover:bg-sand-200 border border-sand-200 transition-all hover:scale-105"
          title="Reset timer"
        >
          <RotateCcw size={17} />
        </button>

        <button
          onClick={simulateBlockCompletion}
          className="w-11 h-11 rounded-full flex items-center justify-center text-ink-500 bg-white hover:bg-sand-100 border border-sand-200 shadow-2xs transition-all hover:scale-105"
          title="Fast-forward & log block"
        >
          <FastForward size={16} />
        </button>
      </div>

      <p className="text-[11px] text-ink-500 mt-5 text-center max-w-[250px] leading-relaxed">
        {isBreak
          ? 'Step away from screens. Hydrate, stretch, or do gentle box breathing.'
          : 'Kleitman’s Basic Rest-Activity Cycle (BRAC): single-task deeply without cognitive switching.'}
      </p>

      {/* Focus Achievement Celebration Pop-up Modal */}
      <FocusAchievementModal
        achievement={currentAchievement}
        isOpen={achievementModalOpen}
        onClose={() => setAchievementModalOpen(false)}
        isCloudSynced={isCloudSynced}
        onStartBreak={() => {
          setIsBreak(true);
          setTimeLeft(BREAK_TIME);
          setIsActive(true);
        }}
      />
    </div>
  );
}
