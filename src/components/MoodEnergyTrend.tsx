import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Activity, CheckCircle2, ShieldAlert, Sparkles, Filter, Info, Zap, ArrowRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService } from '../utils/storage';
import { EnergyLog, TaskItem, CBTEntry, FocusSession } from '../types/logs';

interface MoodEnergyTrendProps {
  onRefreshTrigger?: number;
  onOpenArchiveForDate?: (dateStr: string) => void;
}

interface DayDataPoint {
  dateStr: string;
  displayDay: string;
  formattedDate: string;
  emotion: number;
  energy: number;
  tasksCompletedCount: number;
  completedTaskTitles: string[];
  cbtStressor?: string;
  cbtDistortions: string[];
  focusBlocks: number;
  note?: string;
}

export default function MoodEnergyTrend({ onRefreshTrigger, onOpenArchiveForDate }: MoodEnergyTrendProps) {
  const [viewMode, setViewMode] = useState<'all' | 'mood-tasks' | 'energy-tasks'>('all');
  const [selectedDay, setSelectedDay] = useState<DayDataPoint | null>(null);

  const trendData = useMemo(() => {
    const days: DayDataPoint[] = [];
    const energyLogs: EnergyLog[] = StorageService.getEnergyLogs();
    const tasks: TaskItem[] = StorageService.getTasks();
    const cbtEntries: CBTEntry[] = StorageService.getCBTEntries();
    const focusSessions: FocusSession[] = StorageService.getFocusSessions();

    const todayDate = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDay = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const log = energyLogs.find((l) => l.date === dateStr);
      const emotion = log ? log.emotion : 0;
      const energy = log ? log.energy : 0;
      const note = log?.note;

      const matchedTasks = tasks.filter((t) => {
        if (!t.completed || !t.completedAt) return false;
        const taskDate = new Date(t.completedAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      });

      const matchedCbt = cbtEntries.find((c) => c.date === dateStr);

      const matchedFocus = focusSessions.filter((s) => {
        const sessionDate = new Date(s.timestamp).toISOString().split('T')[0];
        return sessionDate === dateStr && s.type === 'focus';
      });

      days.push({
        dateStr,
        displayDay,
        formattedDate,
        emotion,
        energy,
        tasksCompletedCount: matchedTasks.length,
        completedTaskTitles: matchedTasks.map((t) => t.title),
        cbtStressor: matchedCbt?.stressor,
        cbtDistortions: matchedCbt?.distortions || [],
        focusBlocks: matchedFocus.length,
        note,
      });
    }

    return days;
  }, [onRefreshTrigger]);

  const correlationInsights = useMemo(() => {
    if (!trendData.length) return null;

    const loggedDays = trendData.filter((d) => d.emotion > 0 || d.energy > 0);
    const hasAnyLogs = loggedDays.length > 0;

    const daysWithTasks = loggedDays.filter((d) => d.tasksCompletedCount > 0);
    const daysWithoutTasks = loggedDays.filter((d) => d.tasksCompletedCount === 0);

    const avgMoodWithTasks = daysWithTasks.length
      ? Math.round(daysWithTasks.reduce((acc, d) => acc + d.emotion, 0) / daysWithTasks.length)
      : 0;
    const avgMoodWithoutTasks = daysWithoutTasks.length
      ? Math.round(daysWithoutTasks.reduce((acc, d) => acc + d.emotion, 0) / daysWithoutTasks.length)
      : 0;

    const moodDiff = avgMoodWithTasks - avgMoodWithoutTasks;
    const divergenceDay = loggedDays.find((d) => d.energy >= 60 && d.emotion <= 48);
    const peakMoodDay = hasAnyLogs ? [...loggedDays].sort((a, b) => b.emotion - a.emotion)[0] : null;

    return {
      hasAnyLogs,
      moodDiff,
      avgMoodWithTasks,
      avgMoodWithoutTasks,
      divergenceDay,
      peakMoodDay,
    };
  }, [trendData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DayDataPoint = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-sand-200 text-xs text-ink-800 space-y-2.5 max-w-xs z-50">
          <div className="flex items-center justify-between pb-1.5 border-b border-sand-200">
            <span className="font-bold text-ink-900">
              {data.displayDay} ({data.formattedDate})
            </span>
            <span className="text-[10px] text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full font-semibold border border-teal-200">
              {data.focusBlocks} Focus Blocks
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                Emotional State:
              </span>
              <span className="font-bold text-emerald-900">{data.emotion}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-purple-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
                Somatic Energy:
              </span>
              <span className="font-bold text-purple-900">{data.energy}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                Tasks Completed:
              </span>
              <span className="font-bold text-amber-900">{data.tasksCompletedCount}</span>
            </div>
          </div>

          {data.completedTaskTitles.length > 0 && (
            <div className="pt-2 border-t border-sand-200">
              <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider block mb-1">
                Completed Tasks:
              </span>
              <ul className="space-y-1 text-[11px] text-ink-700">
                {data.completedTaskTitles.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-emerald-500 mt-0.5 shrink-0 font-bold">✓</span>
                    <span className="line-clamp-1">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.cbtStressor && (
            <div className="pt-1.5 border-t border-sand-200">
              <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider block">
                CBT Stressor Flagged:
              </span>
              <p className="text-[11px] text-ink-600 italic line-clamp-2">"{data.cbtStressor}"</p>
            </div>
          )}

          {data.note && (
            <p className="text-[10px] text-ink-500 italic bg-sand-50 p-2 rounded-xl border border-sand-200">
              Note: {data.note}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-indigo-100/80 hover:border-indigo-200 transition-all flex flex-col justify-between">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-sand-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <TrendingUp size={18} />
            </div>
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-ink-900">
              7-Day Mood, Energy & Task Correlation
            </h2>
          </div>
          <p className="text-xs md:text-sm text-ink-600 font-light mt-1">
            Recharts visualization correlating task achievements with emotional resilience and somatic energy cycles.
          </p>
        </div>

        {/* View Mode Filters */}
        <div className="flex items-center gap-1.5 bg-sand-50/90 p-1.5 rounded-2xl border border-sand-200 self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              viewMode === 'all'
                ? 'bg-ink-900 text-white shadow-xs'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setViewMode('mood-tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              viewMode === 'mood-tasks'
                ? 'bg-emerald-100 text-emerald-800 shadow-xs border border-emerald-200'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Mood & Tasks
          </button>
          <button
            onClick={() => setViewMode('energy-tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              viewMode === 'energy-tasks'
                ? 'bg-purple-100 text-purple-800 shadow-xs border border-purple-200'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Energy & Tasks
          </button>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="h-72 md:h-80 w-full mb-6 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trendData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(e: any) => {
              if (e?.activePayload?.[0]?.payload) {
                setSelectedDay(e.activePayload[0].payload);
              }
            }}
          >
            <defs>
              {/* Luminous Vibrant Gradients */}
              <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="taskBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2dcd0" opacity={0.6} vertical={false} />
            <XAxis
              dataKey="displayDay"
              stroke="#6b6b6b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e2dcd0' }}
            />
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              stroke="#6b6b6b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 4]}
              stroke="#8f8f8f"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickCount={5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '-10px' }}
            />

            {/* Tasks Completed Bar (Y-Axis Right: 0-4 tasks) */}
            <Bar
              yAxisId="right"
              dataKey="tasksCompletedCount"
              name="Tasks Completed"
              fill="url(#taskBarGradient)"
              radius={[6, 6, 0, 0]}
              barSize={18}
            />

            {/* Emotional State Curve & Area */}
            {(viewMode === 'all' || viewMode === 'mood-tasks') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="emotion"
                name="Emotional State (%)"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#emotionGradient)"
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {/* Somatic Energy Curve & Area */}
            {(viewMode === 'all' || viewMode === 'energy-tasks') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="energy"
                name="Somatic Energy (%)"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#energyGradient)"
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Behavioral Correlation Insights Grid with Vibrant Cards */}
      {correlationInsights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 border-t border-sand-200/80">
          {/* Card 1: Task Completion vs Mood Correlation */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Task-Mood Lift
              </span>
            </div>
            {correlationInsights.hasAnyLogs ? (
              <p className="text-xs text-ink-800 leading-relaxed font-light">
                On days with completed priority tasks, your emotional state averaged{' '}
                <strong className="text-emerald-700 font-bold">{correlationInsights.avgMoodWithTasks}%</strong>, compared to{' '}
                <span className="text-ink-600 font-medium">{correlationInsights.avgMoodWithoutTasks}%</span> on low-completion days{' '}
                ({correlationInsights.moodDiff >= 0 ? `+${correlationInsights.moodDiff}%` : `${correlationInsights.moodDiff}%`}).
              </p>
            ) : (
              <p className="text-xs text-ink-800 leading-relaxed font-light">
                No logs recorded yet. Begin logging your daily energy and tasks to see how completed priorities lift emotional resonance.
              </p>
            )}
            <span className="text-[10px] text-emerald-700 font-medium mt-2 block">
              Cognitive closure reduces rumination and stimulates dopamine reward pathways.
            </span>
          </div>

          {/* Card 2: Energy & Mood Divergence */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-violet-50/40 border border-purple-200 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-purple-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Somatic Divergence
              </span>
            </div>
            {correlationInsights.divergenceDay ? (
              <p className="text-xs text-ink-800 leading-relaxed font-light">
                Detected disparity on <strong>{correlationInsights.divergenceDay.displayDay}</strong>: high energy (
                {correlationInsights.divergenceDay.energy}%) alongside subdued mood (
                {correlationInsights.divergenceDay.emotion}%).
              </p>
            ) : correlationInsights.hasAnyLogs ? (
              <p className="text-xs text-ink-800 leading-relaxed font-light">
                Energy levels and emotional valence are moving in harmonic synchrony across your logged days.
              </p>
            ) : (
              <p className="text-xs text-ink-800 leading-relaxed font-light">
                Awaiting check-in data. Will detect somatic disparity between high energy and subdued mood automatically.
              </p>
            )}
            <span className="text-[10px] text-purple-700 font-medium mt-2 block">
              High energy + low mood typically reflects performance tension rather than neurobiological fatigue.
            </span>
          </div>

          {/* Card 3: Optimum Focus & Recovery Peak */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Peak Grounding Day
              </span>
            </div>
            {correlationInsights.peakMoodDay ? (
              <p className="text-xs text-ink-800 leading-relaxed font-light">
                Highest emotional resonance occurred on{' '}
                <strong>{correlationInsights.peakMoodDay.displayDay}</strong> ({correlationInsights.peakMoodDay.emotion}
                %), paired with {correlationInsights.peakMoodDay.tasksCompletedCount} completed priority tasks.
              </p>
            ) : (
              <p className="text-xs text-ink-800 leading-relaxed font-light">
                Awaiting first check-in. Continue logging daily to detect your weekly optimal grounding peak.
              </p>
            )}
            <span className="text-[10px] text-amber-700 font-medium mt-2 block">
              Tip: Click any chart data point to inspect that day's complete cognitive snapshot.
            </span>
          </div>
        </div>
      )}

      {/* Day Details Drawer when clicked */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-sand-200/80 overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sand-100/80 via-white to-sand-100/80 border border-sand-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-ink-900">
                    Day Snapshot: {selectedDay.displayDay} ({selectedDay.formattedDate})
                  </h4>
                  <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-lg border border-sand-200 text-ink-700 font-semibold shadow-2xs">
                    Emotion: {selectedDay.emotion}% | Energy: {selectedDay.energy}%
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-600 mt-1 flex-wrap font-medium">
                  <span className="text-amber-800">🎯 {selectedDay.tasksCompletedCount} Tasks Completed</span>
                  <span className="text-teal-800">⏱️ {selectedDay.focusBlocks} Ultradian Focus Blocks</span>
                  {selectedDay.cbtStressor && <span className="text-purple-800">📖 1 CBT Stressor Addressed</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onOpenArchiveForDate && (
                  <button
                    onClick={() => onOpenArchiveForDate(selectedDay.dateStr)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
                  >
                    <Calendar size={12} className="text-emerald-400" />
                    <span>Inspect in Archive</span>
                    <ArrowRight size={12} />
                  </button>
                )}
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-xs text-ink-500 hover:text-ink-800 underline underline-offset-2 shrink-0 font-medium px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
