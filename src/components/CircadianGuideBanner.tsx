import { useState, useMemo } from 'react';
import { Sun, CloudSun, Sunset, Moon, ArrowRight, X, ChevronDown, ChevronUp, Wind, Brain, Flame, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type AppIntentMode = 'focus' | 'reset' | 'checkin' | 'insights' | 'all';

interface CircadianGuideBannerProps {
  onSelectMode: (mode: AppIntentMode) => void;
  onStartBreathing: () => void;
}

export default function CircadianGuideBanner({ onSelectMode, onStartBreathing }: CircadianGuideBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const circadianState = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        period: 'Morning Intention',
        timeWindow: '05:00 – 11:59',
        icon: Sun,
        themeBg: 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent',
        borderColor: 'border-amber-200/80',
        iconColor: 'text-amber-600',
        headline: 'Align circadian energy and set primary intentions',
        description: 'Morning cortisol peaks naturally. Check in your baseline energy, pick your high-leverage tasks, and begin your first 90-minute focus cycle.',
        primaryAction: {
          label: 'Quick Energy Check-In',
          mode: 'checkin' as AppIntentMode,
          icon: Zap,
        },
        secondaryAction: {
          label: 'Launch Deep Focus',
          mode: 'focus' as AppIntentMode,
          icon: Brain,
        },
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        period: 'Peak Ultradian Focus',
        timeWindow: '12:00 – 17:59',
        icon: CloudSun,
        themeBg: 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent',
        borderColor: 'border-emerald-200/80',
        iconColor: 'text-emerald-600',
        headline: 'Optimal window for uninterrupted deep work',
        description: 'Your prefrontal cortex operates best in rhythmic 90-minute Ultradian blocks separated by 20-minute restorative breaks. Avoid multitasking.',
        primaryAction: {
          label: 'Enter Deep Focus Mode',
          mode: 'focus' as AppIntentMode,
          icon: Brain,
        },
        secondaryAction: {
          label: 'Clear Head (Brain Dump)',
          mode: 'reset' as AppIntentMode,
          icon: Wind,
        },
      };
    } else if (hour >= 18 && hour < 23) {
      return {
        period: 'Evening Decompression',
        timeWindow: '18:00 – 22:59',
        icon: Sunset,
        themeBg: 'bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent',
        borderColor: 'border-purple-200/80',
        iconColor: 'text-purple-600',
        headline: 'Offload cognitive load and review habit streaks',
        description: 'Time to wind down working memory. Challenge cognitive distortions in CBT, review your 30-day streak, and celebrate today’s momentum.',
        primaryAction: {
          label: 'Mind Reset & CBT Journal',
          mode: 'reset' as AppIntentMode,
          icon: Wind,
        },
        secondaryAction: {
          label: 'Review 30-Day Streak',
          mode: 'insights' as AppIntentMode,
          icon: Flame,
        },
      };
    } else {
      return {
        period: 'Nocturnal Recovery & Parasympathetic Downregulation',
        timeWindow: '23:00 – 04:59',
        icon: Moon,
        themeBg: 'bg-gradient-to-r from-indigo-500/10 via-slate-500/5 to-transparent',
        borderColor: 'border-indigo-200/80',
        iconColor: 'text-indigo-600',
        headline: 'Stimulate the vagus nerve and prepare for restorative sleep',
        description: 'Screen stimulation suppresses melatonin. Engage in 4-4-4-4 box breathing to lower sympathetic arousal and ease into natural sleep rhythms.',
        primaryAction: {
          label: 'Start 2-min Box Breathing',
          action: 'breathing',
          icon: Wind,
        },
        secondaryAction: {
          label: 'Ambient Sleep Soundscape',
          mode: 'focus' as AppIntentMode,
          icon: Moon,
        },
      };
    }
  }, []);

  if (isDismissed) return null;

  const Icon = circadianState.icon;
  const PrimaryActionIcon = circadianState.primaryAction.icon;
  const SecondaryActionIcon = circadianState.secondaryAction.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative rounded-2xl border ${circadianState.borderColor} bg-white/95 backdrop-blur-md shadow-xs overflow-hidden transition-all`}
    >
      <div className={`p-4 md:p-5 ${circadianState.themeBg}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-2xs border border-sand-200/80 ${circadianState.iconColor}`}>
              <Icon size={18} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 mb-0.5">
                <span className="uppercase tracking-wider text-[11px] font-bold text-ink-800">
                  {circadianState.period}
                </span>
                <span aria-hidden="true" className="text-sand-400">·</span>
                <span className="text-ink-500 text-[11px] font-mono">{circadianState.timeWindow}</span>
                <span aria-hidden="true" className="text-sand-400">·</span>
                <span className="text-[11px] text-emerald-700 font-medium">Circadian Guide</span>
              </div>

              <h2 className="text-sm md:text-base font-semibold text-ink-900 leading-snug">
                {circadianState.headline}
              </h2>

              <AnimatePresence>
                {isExpanded && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs md:text-sm text-ink-600 font-light mt-1 max-w-3xl leading-relaxed"
                  >
                    {circadianState.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-sand-100/70 transition-colors"
              title={isExpanded ? 'Collapse advice' : 'Expand advice'}
              aria-label={isExpanded ? 'Collapse advice' : 'Expand advice'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-sand-100/70 transition-colors"
              title="Dismiss for this session"
              aria-label="Dismiss guide"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Action recommendations buttons */}
        <div className="mt-3.5 pt-3 border-t border-sand-200/60 flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-ink-500">Recommended action:</span>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                if ('action' in circadianState.primaryAction && circadianState.primaryAction.action === 'breathing') {
                  onStartBreathing();
                } else if ('mode' in circadianState.primaryAction) {
                  onSelectMode(circadianState.primaryAction.mode);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
            >
              <PrimaryActionIcon size={13} className="text-emerald-400" />
              <span>{circadianState.primaryAction.label}</span>
              <ArrowRight size={12} className="text-sand-300 ml-0.5" />
            </button>

            {/* Secondary Action Button */}
            {circadianState.secondaryAction && (
              <button
                onClick={() => {
                  onSelectMode(circadianState.secondaryAction.mode);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sand-50 border border-sand-300/80 text-ink-700 text-xs font-semibold shadow-2xs hover:border-sand-400 transition-all"
              >
                <SecondaryActionIcon size={13} className="text-ink-500" />
                <span>{circadianState.secondaryAction.label}</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-ink-400 hidden sm:block">
            Prevents cognitive overload · Focus on 1 intent at a time
          </div>
        </div>
      </div>
    </motion.div>
  );
}
