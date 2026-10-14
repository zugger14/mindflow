import { useState, useEffect } from 'react';
import { Wind, Play, Square, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PHASES = [
  { text: 'Inhale', duration: 4000, color: 'from-cyan-400 to-emerald-400', glow: 'rgba(16, 185, 129, 0.4)', tip: 'Fill your lungs smoothly through the nose' },
  { text: 'Hold', duration: 4000, color: 'from-amber-400 to-orange-400', glow: 'rgba(245, 158, 11, 0.4)', tip: 'Rest with gentle stillness; don’t clamp' },
  { text: 'Exhale', duration: 4000, color: 'from-violet-400 to-rose-400', glow: 'rgba(168, 85, 247, 0.4)', tip: 'Release slowly and completely through the mouth' },
  { text: 'Hold', duration: 4000, color: 'from-indigo-400 to-purple-400', glow: 'rgba(99, 102, 241, 0.4)', tip: 'Empty stillness before the next wave' },
];

interface BoxBreathingProps {
  forceActive?: boolean;
}

export default function BoxBreathing({ forceActive }: BoxBreathingProps) {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (forceActive) {
      setIsActive(true);
    }
  }, [forceActive]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isActive) {
      timeout = setTimeout(() => {
        setPhaseIndex((prev) => (prev + 1) % 4);
      }, PHASES[phaseIndex].duration);
    } else {
      setPhaseIndex(0);
    }
    return () => clearTimeout(timeout);
  }, [isActive, phaseIndex]);

  const toggleBreathing = () => setIsActive(!isActive);

  const boxVariants = {
    0: { scale: 1.5, opacity: 1, borderRadius: '50%' },
    1: { scale: 1.5, opacity: 0.9, borderRadius: '35%' },
    2: { scale: 0.9, opacity: 1, borderRadius: '50%' },
    3: { scale: 0.9, opacity: 0.9, borderRadius: '35%' },
  };

  const currentPhase = PHASES[phaseIndex];

  return (
    <div id="box-breathing-section" className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-cyan-100/80 hover:border-cyan-200 transition-all flex flex-col items-center justify-between relative overflow-hidden h-full">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs">
            <Wind size={14} className="text-cyan-600" />
            Box Breathing (4-4-4-4)
          </span>
        </div>
        <span className="text-[11px] font-medium text-ink-500 bg-sand-100 px-2 py-0.5 rounded-full border border-sand-200">
          Vagus Nerve Reset
        </span>
      </div>

      {/* Radiant Breath Visualizer Sphere */}
      <div className="relative w-48 h-48 flex items-center justify-center my-3">
        {/* Outer ambient pulsing halo */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-1000"
          style={{
            background: isActive ? currentPhase.glow : 'transparent',
            filter: 'blur(28px)',
          }}
        />

        {/* Concentric dashed guidance rings */}
        <div className="absolute inset-0 border border-dashed border-cyan-200 rounded-full opacity-60" />
        <div className="absolute inset-4 border border-dashed border-sand-300 rounded-full opacity-40" />
        
        {/* Animated breathing core */}
        <motion.div
          className={`w-24 h-24 bg-gradient-to-tr ${
            isActive ? currentPhase.color : 'from-sand-200 to-sand-300'
          } shadow-lg flex items-center justify-center transition-colors`}
          animate={isActive ? phaseIndex.toString() : "2"}
          variants={boxVariants}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        
        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <span className="text-lg font-bold text-white tracking-wider drop-shadow-md">
                  {currentPhase.text}
                </span>
                <span className="block text-[10px] text-white/90 font-medium drop-shadow-xs">
                  4 seconds
                </span>
              </motion.div>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-semibold text-ink-600"
              >
                Ready
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4-Step Progress Indicator Dots */}
      <div className="flex items-center gap-2 mb-4">
        {PHASES.map((p, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              !isActive
                ? 'w-4 bg-sand-200'
                : idx === phaseIndex
                ? 'w-7 bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-xs'
                : 'w-3 bg-sand-300'
            }`}
          />
        ))}
      </div>

      <button 
        onClick={toggleBreathing}
        className={`px-7 py-2.5 rounded-full flex items-center gap-2 transition-all font-medium text-xs shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${
          isActive 
            ? 'bg-sand-100 text-ink-800 hover:bg-sand-200 border border-sand-200' 
            : 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white'
        }`}
      >
        {isActive ? (
          <>
            <Square size={13} className="fill-current" /> Stop Practice
          </>
        ) : (
          <>
            <Play size={13} className="fill-current" /> Start Box Breathing
          </>
        )}
      </button>

      <p className="text-[11px] text-ink-500 mt-3 text-center max-w-[230px] leading-relaxed">
        {isActive ? currentPhase.tip : 'Equal-ratio 4s breathing activates the parasympathetic rest-and-digest system.'}
      </p>
    </div>
  );
}
