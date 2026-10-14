import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  BookOpen, 
  CheckCircle2, 
  Radio, 
  Sparkles, 
  BrainCircuit, 
  RefreshCw, 
  Clock, 
  Lightbulb, 
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService, getTodayDateStr } from '../utils/storage';
import { DayArchiveSnapshot, PsychologicalAnalysisResult } from '../types/logs';

interface HistoryArchiveViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  onSelectDateToDashboard?: (dateStr: string) => void;
}

export default function HistoryArchiveViewer({
  isOpen,
  onClose,
  initialDate,
  onSelectDateToDashboard,
}: HistoryArchiveViewerProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || getTodayDateStr());
  const [snapshot, setSnapshot] = useState<DayArchiveSnapshot | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dayAnalysis, setDayAnalysis] = useState<PsychologicalAnalysisResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      const dates = StorageService.getAllHistoryDates();
      setAvailableDates(dates);
      if (initialDate) {
        setSelectedDate(initialDate);
      } else if (dates.length > 0 && !dates.includes(selectedDate)) {
        setSelectedDate(dates[0]);
      }
    }
  }, [isOpen, initialDate]);

  useEffect(() => {
    if (selectedDate) {
      const snap = StorageService.getDaySnapshot(selectedDate);
      setSnapshot(snap);
      setDayAnalysis(snap.analysis || null);
    }
  }, [selectedDate]);

  const runDayRetrospective = async () => {
    if (!snapshot) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energyLogs: snapshot.energyLog ? [snapshot.energyLog] : [],
          cbtEntries: snapshot.cbtEntries,
          completedTasks: snapshot.completedTasks,
          brainDumpThoughts: snapshot.brainDumps,
          focusSessions: snapshot.focusSessions,
          targetDate: selectedDate,
          isRetrospective: true,
          engine: localStorage.getItem('mindflow_selected_engine') || 'cloud',
          localUrl: localStorage.getItem('mindflow_local_llm_url') || undefined,
          localModel: localStorage.getItem('mindflow_local_llm_model') || undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        const result: PsychologicalAnalysisResult = {
          ...data.analysis,
          id: `analysis-${selectedDate}`,
          generatedAt: Date.now(),
          targetDate: selectedDate,
          isRetrospective: true,
        };
        setDayAnalysis(result);
        StorageService.saveDateAnalysis(selectedDate, result);
      }
    } catch (e) {
      console.error('Retrospective analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const isToday = selectedDate === getTodayDateStr();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-ink-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="bg-white rounded-3xl max-w-4xl w-full p-5 md:p-8 shadow-2xl border border-sand-200 max-h-[92vh] overflow-y-auto flex flex-col justify-between"
      >
        {/* Modal Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-sand-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xs">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-xl font-medium tracking-tight text-ink-900">
                  Historical Log Archive & Retrospective
                </h3>
                <p className="text-xs text-ink-500 font-light mt-0.5">
                  Browse old logs by date, see past entries, and run retrospective psychological analyses.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-ink-400 hover:text-ink-800 rounded-full hover:bg-sand-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Date Selector Carousel & Direct Calendar Picker */}
          <div className="py-4 border-b border-sand-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink-700">Select Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDate(e.target.value);
                  }}
                  className="text-xs bg-sand-50 border border-sand-300 rounded-xl px-2.5 py-1 text-ink-800 font-medium focus:outline-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedDate(getTodayDateStr())}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    selectedDate === getTodayDateStr()
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-sand-100 hover:bg-sand-200 text-ink-700'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                    setSelectedDate(y);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg font-medium bg-sand-100 hover:bg-sand-200 text-ink-700 transition-colors"
                >
                  Yesterday
                </button>
                <span className="text-[11px] text-ink-400 ml-1">
                  ({availableDates.length} logged days)
                </span>
              </div>
            </div>

            {/* Quick horizontal scroll carousel for recorded dates */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {availableDates.map((dateStr) => {
                const isSelected = dateStr === selectedDate;
                const isTodayDate = dateStr === getTodayDateStr();
                const snap = StorageService.getDaySnapshot(dateStr);

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-medium transition-all shrink-0 flex flex-col items-center min-w-[90px] border ${
                      isSelected
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-sm scale-105'
                        : 'bg-sand-50/80 hover:bg-sand-100 text-ink-700 border-sand-200'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">
                      {isTodayDate ? 'Today' : dateStr.slice(5)}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-ink-500'}`}>
                      {new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                      {snap.energyLog && <span>😊 {snap.energyLog.emotion}%</span>}
                      {snap.completedTasks.length > 0 && <span>🎯 {snap.completedTasks.length}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Rollover Rule Explanation Badge */}
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2">
              <span className="shrink-0 text-emerald-600 font-bold">💡 Daily Lifecycle:</span>
              <span>
                Each new calendar day starts fresh and blank for your daily tasks, energy check-in, and focus blocks. Everything you record stays permanently preserved under its date!
              </span>
            </div>
          </div>

          {/* Selected Date Summary & Retrospective Trigger */}
          {snapshot && (
            <div className="pt-5 space-y-6">
              {/* Day Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-sand-50/60 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-ink-900">
                      {snapshot.formattedDate} — {snapshot.displayDay}
                    </h4>
                    <span className="text-[11px] bg-white text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      {isToday ? "Today's Active Session" : 'Archived Day Record'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-600 font-light mt-0.5">
                    {snapshot.energyLog ? `Logged emotion at ${snapshot.energyLog.emotion}% and energy at ${snapshot.energyLog.energy}%.` : 'No energy slider check-in on this date.'}
                  </p>
                </div>

                {/* Retrospective Analysis Action */}
                {(() => {
                  const hasAnyData = Boolean(
                    snapshot.energyLog ||
                    snapshot.completedTasks.length > 0 ||
                    snapshot.cbtEntries.length > 0 ||
                    snapshot.focusSessions.length > 0 ||
                    snapshot.brainDumps.length > 0
                  );

                  return (
                    <button
                      onClick={runDayRetrospective}
                      disabled={isAnalyzing || !hasAnyData}
                      className="flex items-center gap-2 px-4 py-2 bg-ink-900 hover:bg-ink-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw size={13} className="animate-spin text-emerald-400" />
                          Analyzing {snapshot.formattedDate}...
                        </>
                      ) : !hasAnyData ? (
                        <>
                          <BrainCircuit size={14} className="text-sand-400" />
                          <span>No logs on this date to analyze</span>
                        </>
                      ) : (
                        <>
                          <BrainCircuit size={14} className="text-emerald-400" />
                          {dayAnalysis ? 'Re-Analyze This Day' : `Analyze ${snapshot.formattedDate}`}
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>

              {/* Day Retrospective Analysis Box (If generated) */}
              <AnimatePresence>
                {dayAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-sand-50 border border-purple-200 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-600" />
                        <h5 className="text-sm font-semibold text-purple-950">
                          Retrospective Psychological Takeaways ({snapshot.formattedDate})
                        </h5>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium border border-purple-200">
                        {dayAnalysis.mindsetState}
                      </span>
                    </div>

                    <p className="text-xs text-ink-800 leading-relaxed font-light italic bg-white p-3.5 rounded-xl border border-purple-100">
                      "{dayAnalysis.overallSummary}"
                    </p>

                    {dayAnalysis.distortionInsights?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold uppercase text-purple-700 tracking-wider block">
                          Distortions & Antidotes Identified That Day:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {dayAnalysis.distortionInsights.map((d, i) => (
                            <div key={i} className="p-2.5 bg-white rounded-xl border border-sand-200 text-xs">
                              <span className="font-semibold text-purple-700">{d.distortion}</span>
                              <p className="text-[11px] text-ink-600 mt-0.5">🌱 {d.antidote}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dayAnalysis.groundingMantra && (
                      <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-900 font-medium italic">
                        Anchor: "{dayAnalysis.groundingMantra}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data Breakdown Grid for the Selected Day */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Emotion & Energy State */}
                <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-emerald-600" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                      Emotion & Energy Log
                    </h5>
                  </div>
                  {snapshot.energyLog ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-sand-200">
                        <span className="text-ink-600 font-medium">Emotional Valence:</span>
                        <span className="font-bold text-emerald-700">{snapshot.energyLog.emotion}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-sand-200">
                        <span className="text-ink-600 font-medium">Somatic Energy:</span>
                        <span className="font-bold text-purple-700">{snapshot.energyLog.energy}%</span>
                      </div>
                      {snapshot.energyLog.note && (
                        <p className="text-xs text-ink-600 italic bg-white p-2.5 rounded-xl border border-sand-200">
                          "{snapshot.energyLog.note}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-400 italic py-3 text-center">No slider entry saved on this date.</p>
                  )}
                </div>

                {/* 2. Tasks Completed That Day */}
                <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-teal-600" />
                      <h5 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                        Tasks Completed ({snapshot.completedTasks.length})
                      </h5>
                    </div>
                  </div>
                  {snapshot.completedTasks.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {snapshot.completedTasks.map((t) => (
                        <div key={t.id} className="p-2.5 bg-white rounded-xl border border-sand-200 text-xs flex items-start gap-2">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span className="text-ink-800 font-medium">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-400 italic py-3 text-center">No tasks completed on this date.</p>
                  )}
                </div>

                {/* 3. CBT Reflections That Day */}
                <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-purple-600" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                      CBT Restructuring ({snapshot.cbtEntries.length})
                    </h5>
                  </div>
                  {snapshot.cbtEntries.length > 0 ? (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {snapshot.cbtEntries.map((c) => (
                        <div key={c.id} className="p-3 bg-white rounded-xl border border-sand-200 text-xs space-y-1">
                          <p className="text-ink-600 italic">"{c.stressor}"</p>
                          <p className="text-emerald-800 font-medium bg-emerald-50 p-1.5 rounded-lg">
                            🌱 {c.reframe}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-400 italic py-3 text-center">No CBT thoughts logged on this date.</p>
                  )}
                </div>

                {/* 4. Focus Sessions & Brain Dumps */}
                <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-ink-800">
                      Ultradian Focus ({snapshot.focusSessions.length} Blocks)
                    </h5>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-sand-200 flex items-center justify-between">
                      <span className="text-ink-600 font-medium">90m Focus Blocks Logged:</span>
                      <span className="font-bold text-amber-700">{snapshot.focusSessions.length}</span>
                    </div>
                    {snapshot.brainDumps.length > 0 && (
                      <div className="bg-white p-2.5 rounded-xl border border-sand-200">
                        <span className="text-ink-600 font-semibold block mb-1">
                          Brain Dump Loops ({snapshot.brainDumps.length}):
                        </span>
                        <ul className="space-y-0.5 text-[11px] text-ink-700">
                          {snapshot.brainDumps.map((b) => (
                            <li key={b.id} className="truncate">• {b.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-5 mt-4 border-t border-sand-200 flex items-center justify-between">
          <span className="text-xs text-ink-500">
            {availableDates.length} historical logged days in archive
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            Close Archive
          </button>
        </div>
      </motion.div>
    </div>
  );
}
