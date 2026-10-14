import React, { useState, useEffect } from 'react';
import { Send, Trash2, Lightbulb, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService, getTodayDateStr } from '../utils/storage';
import { BrainDumpItem } from '../types/logs';

interface BrainDumpProps {
  onThoughtUpdated?: () => void;
}

export default function BrainDump({ onThoughtUpdated }: BrainDumpProps) {
  const [thoughts, setThoughts] = useState<BrainDumpItem[]>([]);
  const [newThought, setNewThought] = useState('');

  useEffect(() => {
    setThoughts(StorageService.getBrainDump());
  }, []);

  const updateThoughts = (updated: BrainDumpItem[]) => {
    setThoughts(updated);
    StorageService.saveBrainDump(updated);
    if (onThoughtUpdated) onThoughtUpdated();
  };

  const addThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) return;

    const newItem: BrainDumpItem = {
      id: `thought-${Date.now()}`,
      text: newThought.trim(),
      timestamp: Date.now(),
      date: getTodayDateStr(),
    };

    updateThoughts([newItem, ...thoughts]);
    setNewThought('');
  };

  const deleteThought = (id: string) => {
    updateThoughts(thoughts.filter((t) => t.id !== id));
  };

  const clearAll = () => {
    updateThoughts([]);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-amber-100/80 hover:border-amber-200 transition-all flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-200/80">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <Lightbulb size={14} className="text-amber-600" />
              Zeigarnik Brain Dump
            </span>
          </div>
          {thoughts.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-xl transition-colors font-medium"
            >
              Clear All ({thoughts.length})
            </button>
          )}
        </div>

        <p className="text-xs text-ink-600 mb-5 font-light">
          The Zeigarnik effect proves intrusive thoughts linger until captured. Unload mental loops here so your mind can let them rest.
        </p>

        <form onSubmit={addThought} className="mb-4 relative">
          <input
            type="text"
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            placeholder="Quick-capture an intrusive thought or loop..."
            className="w-full bg-sand-50/70 border border-sand-300 rounded-xl px-3.5 py-2.5 pr-11 text-xs focus:outline-none focus:border-amber-400 focus:bg-white text-ink-800 shadow-inner"
          />
          <button
            type="submit"
            disabled={!newThought.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg disabled:opacity-40 transition-all shadow-2xs"
          >
            <Send size={13} />
          </button>
        </form>

        <div className="max-h-56 overflow-y-auto pr-1 space-y-2.5">
          <AnimatePresence>
            {thoughts.map((thought) => (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-r from-amber-50/40 via-white to-sand-50/50 rounded-xl p-3 flex items-start gap-2.5 group border-l-3 border-l-amber-400 border border-sand-200/90 shadow-2xs"
              >
                <p className="flex-1 text-xs text-ink-800 break-words leading-relaxed">{thought.text}</p>
                <button
                  onClick={() => deleteThought(thought.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-ink-400 hover:text-rose-500 transition-all shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {thoughts.length === 0 && (
            <div className="text-center py-7 text-ink-500">
              <p className="text-xs italic text-ink-600">"Your mind is for having ideas, not holding them."</p>
              <p className="text-[11px] text-ink-400 mt-1 font-medium">- David Allen</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-sand-200/80 text-[11px] text-ink-500 flex items-center justify-between">
        <span>{thoughts.length} captured open loops</span>
        <span className="text-amber-700 font-medium">✓ Offline mind clearance</span>
      </div>
    </div>
  );
}
