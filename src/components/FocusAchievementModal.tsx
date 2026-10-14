import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Brain, 
  Zap, 
  Award, 
  Sparkles, 
  Coffee, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Cloud, 
  Clock, 
  Flame, 
  ChevronRight,
  Trophy,
  Volume2
} from 'lucide-react';
import { FocusAchievement, BadgeRarity } from '../types/logs';
import { FOCUS_BADGE_CATALOGUE, StorageService } from '../utils/storage';
import { audioService } from '../utils/audioEngine';

interface FocusAchievementModalProps {
  achievement: FocusAchievement | null;
  isOpen: boolean;
  onClose: () => void;
  onStartBreak?: () => void;
  isCloudSynced?: boolean;
}

export default function FocusAchievementModal({
  achievement,
  isOpen,
  onClose,
  onStartBreak,
  isCloudSynced = false,
}: FocusAchievementModalProps) {
  const [activeTab, setActiveTab] = useState<'unlock' | 'vault'>('unlock');
  const [soundPlayed, setSoundPlayed] = useState(false);

  // Play gentle celebratory chime when opening with an achievement
  useEffect(() => {
    if (isOpen && achievement && !soundPlayed) {
      audioService.playAchievementChime();
      setSoundPlayed(true);
    }
    if (!isOpen) {
      setSoundPlayed(false);
      setActiveTab('unlock');
    }
  }, [isOpen, achievement]);

  if (!isOpen || !achievement) return null;

  const allAchievements = StorageService.getFocusAchievements();
  const earnedBadgeIds = new Set(allAchievements.map((a) => a.badgeId));

  const getBadgeIcon = (iconName: string, size = 32, className = '') => {
    switch (iconName.toLowerCase()) {
      case 'crown':
        return <Crown size={size} className={className} />;
      case 'brain':
        return <Brain size={size} className={className} />;
      case 'zap':
        return <Zap size={size} className={className} />;
      case 'award':
      case 'trophy':
        return <Award size={size} className={className} />;
      case 'coffee':
        return <Coffee size={size} className={className} />;
      case 'sparkles':
      default:
        return <Sparkles size={size} className={className} />;
    }
  };

  const getRarityConfig = (rarity: BadgeRarity = 'gold') => {
    switch (rarity) {
      case 'mythic':
        return {
          label: 'Mythic Achievement',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
          gradientBg: 'from-purple-500 via-indigo-600 to-pink-500',
          glowColor: 'rgba(168, 85, 247, 0.4)',
          textColor: 'text-purple-600',
          accentRing: 'ring-purple-400/40',
        };
      case 'emerald':
        return {
          label: 'Master Tier',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          gradientBg: 'from-emerald-500 via-teal-600 to-cyan-500',
          glowColor: 'rgba(16, 185, 129, 0.4)',
          textColor: 'text-emerald-600',
          accentRing: 'ring-emerald-400/40',
        };
      case 'silver':
        return {
          label: 'Silver Honors',
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
          gradientBg: 'from-slate-400 via-zinc-500 to-slate-600',
          glowColor: 'rgba(148, 163, 184, 0.4)',
          textColor: 'text-slate-600',
          accentRing: 'ring-slate-400/40',
        };
      case 'bronze':
        return {
          label: 'Initiate Badge',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
          gradientBg: 'from-amber-600 via-orange-500 to-amber-700',
          glowColor: 'rgba(217, 119, 6, 0.4)',
          textColor: 'text-amber-700',
          accentRing: 'ring-amber-400/40',
        };
      case 'gold':
      default:
        return {
          label: 'Gold Milestone',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          gradientBg: 'from-amber-400 via-yellow-500 to-orange-500',
          glowColor: 'rgba(245, 158, 11, 0.45)',
          textColor: 'text-amber-600',
          accentRing: 'ring-amber-400/50',
        };
    }
  };

  const rarityInfo = getRarityConfig(achievement.rarity);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Soft Dimmed & Blurred Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink-950/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sand-200/90 overflow-hidden z-10 my-auto"
        >
          {/* Radiant Top Glow Bar */}
          <div className={`h-2.5 w-full bg-gradient-to-r ${rarityInfo.gradientBg}`} />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-ink-600 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Audio Chime Replay Trigger in Header */}
          <button
            onClick={() => audioService.playAchievementChime()}
            title="Replay achievement fanfare"
            className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-ink-600 flex items-center justify-center transition-colors"
          >
            <Volume2 size={16} />
          </button>

          {/* Navigation Sub-Tabs */}
          <div className="pt-6 px-6 flex justify-center">
            <div className="inline-flex p-1 bg-sand-100/90 rounded-2xl border border-sand-200/80">
              <button
                onClick={() => setActiveTab('unlock')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'unlock'
                    ? 'bg-white text-ink-900 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <Sparkles size={13} className="text-amber-500" />
                Focus Reward
              </button>
              <button
                onClick={() => setActiveTab('vault')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'vault'
                    ? 'bg-white text-ink-900 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <Trophy size={13} className="text-emerald-600" />
                All Badges ({allAchievements.length})
              </button>
            </div>
          </div>

          {activeTab === 'unlock' ? (
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              {/* Confetti & Particle Celebration Aura */}
              <div className="relative mb-6 flex items-center justify-center">
                {/* Floating ambient radial bloom */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.35, 0.6, 0.35]
                  }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="absolute w-40 h-40 rounded-full filter blur-2xl"
                  style={{ backgroundColor: rarityInfo.glowColor }}
                />

                {/* Rotating decorative accent ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                  className={`w-32 h-32 rounded-full border-2 border-dashed border-sand-300 flex items-center justify-center`}
                />

                {/* Large Medallion Badge Container */}
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.1 }}
                  className={`absolute w-24 h-24 rounded-2xl bg-gradient-to-tr ${rarityInfo.gradientBg} flex items-center justify-center text-white shadow-xl ring-8 ${rarityInfo.accentRing}`}
                >
                  {getBadgeIcon(achievement.icon, 44, 'text-white drop-shadow-md')}
                </motion.div>

                {/* Sparkle Badges floating around */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute -top-1 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md"
                >
                  <Sparkles size={14} />
                </motion.div>
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                  className="absolute -bottom-1 -left-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md"
                >
                  <Crown size={14} />
                </motion.div>
              </div>

              {/* Rarity & Celebration Tag */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${rarityInfo.badgeClass}`}>
                  ✨ 90-Min Ultradian Block Complete
                </span>
                <span className="text-[11px] font-semibold text-ink-600 bg-sand-100 px-2.5 py-1 rounded-full border border-sand-200">
                  {rarityInfo.label}
                </span>
              </div>

              {/* Badge Title Headline */}
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl sm:text-3xl font-serif font-semibold text-ink-900 tracking-tight mt-1 mb-2"
              >
                {achievement.badgeName}
              </motion.h3>

              {/* Encouraging Psychological Description */}
              <p className="text-sm text-ink-700 leading-relaxed max-w-sm mb-4">
                {achievement.description}
              </p>

              {/* Neurobiological Validation Card */}
              <div className="w-full bg-sand-50/90 rounded-2xl p-4 border border-sand-200/90 text-left mb-6 relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-sand-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <Brain size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        Ultradian BRAC Neuro-Insight
                      </span>
                    </div>
                    <p className="text-xs text-ink-700 leading-relaxed">
                      {achievement.neuroInsight}
                    </p>
                  </div>
                </div>
              </div>

              {/* Block Statistics Pill Strip */}
              <div className="w-full grid grid-cols-3 gap-2.5 mb-6 text-center">
                <div className="bg-sand-100/70 p-2.5 rounded-xl border border-sand-200">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-ink-600 mb-0.5">
                    <Clock size={12} className="text-emerald-600" /> Focus Time
                  </div>
                  <div className="text-sm font-semibold text-ink-900 font-mono">90 Mins</div>
                </div>

                <div className="bg-sand-100/70 p-2.5 rounded-xl border border-sand-200">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-ink-600 mb-0.5">
                    <Flame size={12} className="text-amber-500" /> Today's Blocks
                  </div>
                  <div className="text-sm font-semibold text-ink-900">
                    #{achievement.completedBlocksCount || 1} Done
                  </div>
                </div>

                <div className="bg-sand-100/70 p-2.5 rounded-xl border border-sand-200">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-ink-600 mb-0.5">
                    <Cloud size={12} className="text-sky-600" /> Firestore
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> Stored
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row gap-3">
                {onStartBreak && (
                  <button
                    onClick={() => {
                      onStartBreak();
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Coffee size={16} />
                    Start 20-Min Restorative Break
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="py-3 px-5 rounded-2xl bg-sand-100 hover:bg-sand-200 text-ink-800 font-medium text-sm border border-sand-200 transition-colors"
                >
                  Awesome, Close
                </button>
              </div>
            </div>
          ) : (
            /* Badge Trophy Vault Screen */
            <div className="p-6 max-h-[460px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-serif font-semibold text-lg text-ink-900">Focus Badge Vault</h4>
                  <p className="text-xs text-ink-600">Badges earned from completing 90-min Ultradian blocks</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={13} />
                  {isCloudSynced ? 'Synced to Cloud' : 'Stored in Firestore'}
                </div>
              </div>

              <div className="space-y-3">
                {FOCUS_BADGE_CATALOGUE.map((badge) => {
                  const isUnlocked = earnedBadgeIds.has(badge.badgeId);
                  const earnedInstance = allAchievements.find((a) => a.badgeId === badge.badgeId);
                  const bRarity = getRarityConfig(badge.rarity);

                  return (
                    <div
                      key={badge.badgeId}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                        isUnlocked
                          ? 'bg-white border-sand-200/90 shadow-2xs hover:border-amber-300'
                          : 'bg-sand-50/60 border-sand-200/50 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          isUnlocked
                            ? `bg-gradient-to-tr ${bRarity.gradientBg} text-white`
                            : 'bg-sand-200 text-ink-400'
                        }`}
                      >
                        {getBadgeIcon(badge.icon, 22)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-sm text-ink-900 truncate">
                            {badge.badgeName}
                          </h5>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bRarity.badgeClass}`}>
                            {badge.category}
                          </span>
                        </div>
                        <p className="text-xs text-ink-600 line-clamp-1 mt-0.5">
                          {badge.description}
                        </p>
                        {isUnlocked && earnedInstance && (
                          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                            <CheckCircle2 size={12} />
                            Earned {new Date(earnedInstance.earnedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-sand-200 flex justify-end">
                <button
                  onClick={() => setActiveTab('unlock')}
                  className="text-xs font-semibold text-ink-700 hover:text-ink-900 flex items-center gap-1"
                >
                  Back to Achievement <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
