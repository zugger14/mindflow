import { useState, useEffect } from 'react';
import { Activity, Battery, Smile, Frown, Meh, Zap, Moon, Calendar, Plus, History, Sun, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService } from '../utils/storage';
import { EnergyLog } from '../types/logs';

interface EnergyTrackerProps {
  onLogSaved?: () => void;
  onOpenArchive?: () => void;
}

export default function EnergyTracker({ onLogSaved, onOpenArchive }: EnergyTrackerProps) {
  const [energy, setEnergy] = useState(55);
  const [emotion, setEmotion] = useState(60);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [isLoggedToday, setIsLoggedToday] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedLogs = StorageService.getEnergyLogs();
    setLogs(savedLogs);

    const today = new Date().toISOString().split('T')[0];
    const loggedToday = savedLogs.some(
      (l) => l.date === today || Date.now() - l.timestamp < 12 * 60 * 60 * 1000
    );
    setIsLoggedToday(loggedToday);
  }, []);

  const handleLog = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: EnergyLog = {
      id: `energy-${Date.now()}`,
      date: todayStr,
      timestamp: Date.now(),
      emotion,
      energy,
      note: note.trim() || undefined,
    };

    const updated = [newLog, ...logs.filter((l) => l.date !== todayStr)];
    setLogs(updated);
    StorageService.saveEnergyLogs(updated);
    setIsLoggedToday(true);
    setNote('');

    if (onLogSaved) {
      onLogSaved();
    }
  };

  const getEmotionBadge = (val: number) => {
    if (val < 35) {
      return {
        label: 'Low / Stressed',
        color: 'bg-rose-100 text-rose-800 border-rose-200',
        icon: <Frown size={18} className="text-rose-500" />,
      };
    }
    if (val < 65) {
      return {
        label: 'Balanced / Neutral',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <Meh size={18} className="text-amber-500" />,
      };
    }
    return {
      label: 'Grounded / Joyful',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Smile size={18} className="text-emerald-500" />,
    };
  };

  const getEnergyBadge = (val: number) => {
    if (val < 35) {
      return {
        label: 'Depleted',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <Moon size={18} className="text-purple-500" />,
      };
    }
    if (val < 65) {
      return {
        label: 'Moderate Stamina',
        color: 'bg-teal-100 text-teal-800 border-teal-200',
        icon: <Battery size={18} className="text-teal-500" />,
      };
    }
    return {
      label: 'Vibrant Flow',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Zap size={18} className="text-amber-500" />,
    };
  };

  const emotionBadge = getEmotionBadge(emotion);
  const energyBadge = getEnergyBadge(energy);
  const recentLogs = [...logs].slice(0, 6).reverse();

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-amber-100/80 hover:border-amber-200 transition-all flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-200/80">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <Activity size={14} className="text-amber-600" />
              Somatic & Mood Tracker
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs flex items-center gap-1 text-ink-600 hover:text-ink-900 transition-colors bg-sand-50 hover:bg-sand-100 px-3 py-1.5 rounded-xl border border-sand-200 shadow-2xs font-medium"
          >
            <History size={13} />
            <span>{showHistory ? 'Sliders' : 'Logs History'}</span>
          </button>
        </div>

        <p className="text-xs text-ink-600 mb-6 font-light">
          Daily logging fuels your psychological analysis and correlates task achievements with nervous system resilience.
        </p>

        {showHistory ? (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {onOpenArchive && (
              <div className="pb-1.5 flex justify-end">
                <button
                  onClick={onOpenArchive}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 underline underline-offset-2"
                >
                  <Calendar size={12} />
                  <span>Open Full Calendar Archive</span>
                </button>
              </div>
            )}
            {logs.length === 0 ? (
              <p className="text-xs text-ink-500 italic text-center py-6">No saved logs yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-gradient-to-r from-sand-50 to-white rounded-2xl text-xs flex items-center justify-between border border-sand-200/90 shadow-2xs">
                  <div>
                    <span className="font-semibold text-ink-800">{log.date}</span>
                    {log.note && <p className="text-ink-500 text-[11px] mt-0.5 line-clamp-1 italic">"{log.note}"</p>}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-semibold text-[11px]">
                      😊 {log.emotion}%
                    </span>
                    <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 font-semibold text-[11px]">
                      ⚡ {log.energy}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Emotion Slider with vibrant reactive pill */}
            <div className="space-y-2.5 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-3.5 rounded-2xl border border-emerald-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-950">Emotional Valence</span>
                <div className={`flex items-center gap-1.5 font-medium px-2.5 py-0.5 rounded-full border text-[11px] ${emotionBadge.color}`}>
                  {emotionBadge.icon}
                  <span>{emotionBadge.label} ({emotion}%)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={emotion}
                onChange={(e) => setEmotion(Number(e.target.value))}
                className="w-full h-2 bg-sand-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-ink-500 font-medium">
                <span>Stressed / Foggy</span>
                <span>Neutral</span>
                <span>Calm & Grounded</span>
              </div>
            </div>

            {/* Energy Slider with vibrant reactive pill */}
            <div className="space-y-2.5 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 p-3.5 rounded-2xl border border-purple-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-purple-950">Somatic Energy Level</span>
                <div className={`flex items-center gap-1.5 font-medium px-2.5 py-0.5 rounded-full border text-[11px] ${energyBadge.color}`}>
                  {energyBadge.icon}
                  <span>{energyBadge.label} ({energy}%)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-sand-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-ink-500 font-medium">
                <span>Depleted</span>
                <span>Functional</span>
                <span>Vibrant & High Focus</span>
              </div>
            </div>

            {/* Reflection Note */}
            <div>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional bodily or emotional note (e.g. relaxed after lunch)..."
                className="w-full text-xs bg-sand-50/80 border border-sand-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 text-ink-800"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-sand-200/80">
        {!showHistory && (
          <button
            onClick={handleLog}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all font-medium text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] mb-4"
          >
            <Plus size={15} />
            {isLoggedToday ? 'Update Today’s State Log' : 'Save State Log'}
          </button>
        )}

        {/* Visual history bar chart with vibrant dual colors */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-ink-500">
            <span>Recent Trajectory</span>
            <span className="text-emerald-700 font-semibold">{logs.length} logged days</span>
          </div>
          <div className="h-16 flex items-end justify-between gap-2 border-b border-sand-200 pb-1.5 pt-2">
            {recentLogs.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex gap-1 items-end justify-center h-12">
                  <div
                    className="w-2 rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400 shadow-2xs transition-all"
                    style={{ height: `${Math.max(item.emotion, 12)}%` }}
                    title={`Emotion: ${item.emotion}%`}
                  />
                  <div
                    className="w-2 rounded-t-md bg-gradient-to-t from-purple-500 to-violet-400 shadow-2xs transition-all"
                    style={{ height: `${Math.max(item.energy, 12)}%` }}
                    title={`Energy: ${item.energy}%`}
                  />
                </div>
                <span className="text-[10px] text-ink-500 font-medium">
                  {item.date ? item.date.slice(-5) : `${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-ink-600 pt-1 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Emotion
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Energy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
