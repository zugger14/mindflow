import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, ChevronLeft, History, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService } from '../utils/storage';
import { CBTEntry } from '../types/logs';

const DISTORTIONS = [
  { id: 'all-or-nothing', label: 'All-or-Nothing Thinking', desc: 'Absolute black-and-white framing.', color: 'border-rose-200 bg-rose-50/70 text-rose-800' },
  { id: 'catastrophizing', label: 'Catastrophizing', desc: 'Anticipating worst-case outcomes.', color: 'border-amber-200 bg-amber-50/70 text-amber-800' },
  { id: 'mind-reading', label: 'Mind Reading', desc: 'Assuming others think negatively of you.', color: 'border-violet-200 bg-violet-50/70 text-violet-800' },
  { id: 'fortune-telling', label: 'Fortune Telling', desc: 'Predicting doom as a foregone fact.', color: 'border-sky-200 bg-sky-50/70 text-sky-800' },
  { id: 'should-statements', label: '"Should" Statements', desc: 'Rigid, punitive perfectionistic rules.', color: 'border-emerald-200 bg-emerald-50/70 text-emerald-800' },
  { id: 'personalization', label: 'Personalization', desc: 'Taking blame for uncontrollable events.', color: 'border-indigo-200 bg-indigo-50/70 text-indigo-800' },
];

interface CBTJournalProps {
  onEntrySaved?: () => void;
}

export default function CBTJournal({ onEntrySaved }: CBTJournalProps) {
  const [step, setStep] = useState(1);
  const [stressor, setStressor] = useState('');
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
  const [reframe, setReframe] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [entries, setEntries] = useState<CBTEntry[]>([]);

  useEffect(() => {
    setEntries(StorageService.getCBTEntries());
  }, []);

  const toggleDistortion = (label: string) => {
    setSelectedDistortions((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  };

  const handleNext = () => {
    if (step === 1 && stressor.trim()) setStep(2);
    else if (step === 2 && selectedDistortions.length > 0) setStep(3);
    else if (step === 3 && reframe.trim()) {
      saveEntry();
    }
  };

  const saveEntry = () => {
    const newEntry: CBTEntry = {
      id: `cbt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      stressor: stressor.trim(),
      distortions: selectedDistortions,
      reframe: reframe.trim(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    StorageService.saveCBTEntries(updated);
    setIsComplete(true);

    if (onEntrySaved) {
      onEntrySaved();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetJournal = () => {
    setStep(1);
    setStressor('');
    setSelectedDistortions([]);
    setReframe('');
    setIsComplete(false);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-purple-100/80 hover:border-purple-200 transition-all h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-200/80">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
              <BookOpen size={14} className="text-purple-600" />
              CBT Cognitive Restructuring
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs flex items-center gap-1 text-ink-600 hover:text-ink-900 transition-colors bg-sand-50 hover:bg-sand-100 px-3 py-1.5 rounded-xl border border-sand-200 shadow-2xs font-medium"
          >
            <History size={13} />
            <span>{showHistory ? 'Check-in' : `History (${entries.length})`}</span>
          </button>
        </div>

        <p className="text-xs text-ink-600 mb-5 font-light">
          Break the cycle of automatic negative thoughts. Identify cognitive distortions to rewire mental patterns.
        </p>

        {showHistory ? (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {entries.length === 0 ? (
              <p className="text-xs text-ink-500 italic text-center py-8">No CBT entries recorded yet.</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="p-4 bg-gradient-to-r from-purple-50/30 to-sand-50/50 rounded-2xl border border-purple-100 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-ink-500">
                    <span className="font-medium text-ink-700">{entry.date}</span>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {entry.distortions?.map((d, i) => (
                        <span key={i} className="bg-purple-100/80 text-purple-800 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-purple-200">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider block">Automatic Stressor</span>
                    <p className="text-xs text-ink-700 italic">"{entry.stressor}"</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block mb-0.5">
                      🌱 Compassionate Reframe
                    </span>
                    <p className="text-xs text-emerald-900 font-medium leading-relaxed">"{entry.reframe}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key="journal-flow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Step indicator bar */}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all ${
                          i === step
                            ? 'w-8 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-xs'
                            : i < step
                            ? 'w-6 bg-purple-200'
                            : 'w-4 bg-sand-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-purple-700 font-semibold">Step {step} of 3</span>
                </div>

                {step === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <label className="text-xs font-semibold text-ink-900 block">
                      1. What situation or automatic thought is stressing you?
                    </label>
                    <textarea
                      value={stressor}
                      onChange={(e) => setStressor(e.target.value)}
                      placeholder="e.g., 'I made a mistake in the slide deck and now my manager will think I am incompetent...'"
                      className="w-full h-28 bg-sand-50/70 border border-sand-300 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-400 focus:bg-white resize-none text-ink-800 leading-relaxed shadow-inner"
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <label className="text-xs font-semibold text-ink-900 block">
                      2. Tag the cognitive distortion(s) in play:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {DISTORTIONS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDistortion(d.label)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            selectedDistortions.includes(d.label)
                              ? `${d.color} ring-1 ring-purple-400 font-medium shadow-xs`
                              : 'bg-white border-sand-200 hover:border-purple-200 text-ink-700'
                          }`}
                        >
                          <div className="font-semibold text-xs">{d.label}</div>
                          <div className="text-[10px] text-ink-500 leading-tight mt-0.5">{d.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="bg-sand-50 p-2.5 rounded-xl border border-sand-200 text-xs">
                      <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider block">Automatic Thought</span>
                      <p className="text-ink-700 italic line-clamp-2">"{stressor}"</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink-900 block mb-1">
                        3. Formulate an objective, compassionate reframe:
                      </label>
                      <textarea
                        value={reframe}
                        onChange={(e) => setReframe(e.target.value)}
                        placeholder="e.g., 'One minor error does not invalidate my contribution. Mistakes are standard iterations in complex work.'"
                        className="w-full h-24 bg-white border border-sand-300 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-400 resize-none text-ink-800 leading-relaxed shadow-inner"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="journal-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center justify-center text-center space-y-3"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-2xl border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-base font-semibold text-ink-900">Thought Reframed & Integrated</h3>
                <p className="text-xs text-ink-600 max-w-xs font-light">
                  This reframe has been stored in your cognitive log and directly enhances today's psychological analysis.
                </p>
                <button
                  onClick={resetJournal}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all text-xs font-medium shadow-sm"
                >
                  Log Another Stressor
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {!showHistory && !isComplete && (
        <div className="flex justify-between items-center mt-5 pt-3 border-t border-sand-200/80">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-ink-600 hover:text-ink-900 disabled:opacity-0 transition-colors font-medium"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && !stressor.trim()) ||
              (step === 2 && selectedDistortions.length === 0) ||
              (step === 3 && !reframe.trim())
            }
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-40 transition-all text-xs font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            {step === 3 ? 'Save Reframe' : 'Continue'} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
