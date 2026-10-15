import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldCheck, 
  Activity, 
  Lightbulb, 
  Compass, 
  Wind, 
  RefreshCw, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  Laptop,
  Settings2,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PsychologicalAnalysisResult, EnergyLog, CBTEntry, TaskItem, BrainDumpItem, FocusSession } from '../types/logs';
import { StorageService } from '../utils/storage';
import LocalLLMConfigModal from './LocalLLMConfigModal';

interface PsychologicalAnalysisProps {
  onStartBreathing?: () => void;
  onRefreshTrigger?: number;
  onOpenArchive?: () => void;
}

const LOCAL_STORAGE_ENGINE_KEY = 'mindflow_selected_engine';
const LOCAL_STORAGE_URL_KEY = 'mindflow_local_llm_url';
const LOCAL_STORAGE_MODEL_KEY = 'mindflow_local_llm_model';
const LOCAL_STORAGE_GEMINI_KEY = 'mindflow_gemini_api_key';

export default function PsychologicalAnalysis({ onStartBreathing, onRefreshTrigger, onOpenArchive }: PsychologicalAnalysisProps) {
  const [analysis, setAnalysis] = useState<PsychologicalAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceMeta, setSourceMeta] = useState<{ source?: string; modelUsed?: string; latencyMs?: number } | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Engine preferences
  const [selectedEngine, setSelectedEngine] = useState<'local' | 'cloud' | 'auto'>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_ENGINE_KEY) as any) || 'local';
  });
  const [localUrl, setLocalUrl] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_URL_KEY) || 'http://localhost:11434';
  });
  const [localModel, setLocalModel] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_MODEL_KEY) || 'qwen2.5:7b';
  });
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY) || '';
  });

  const [logStats, setLogStats] = useState({
    energyCount: 0,
    cbtCount: 0,
    taskCount: 0,
    brainDumpCount: 0,
    focusCount: 0,
  });

  // Save preferences
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ENGINE_KEY, selectedEngine);
    localStorage.setItem(LOCAL_STORAGE_URL_KEY, localUrl);
    localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, localModel);
    localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, geminiApiKey);
  }, [selectedEngine, localUrl, localModel, geminiApiKey]);

  const loadCurrentStats = () => {
    const energy = StorageService.getEnergyLogs();
    const cbt = StorageService.getCBTEntries();
    const tasks = StorageService.getTasks();
    const brainDump = StorageService.getBrainDump();
    const focus = StorageService.getFocusSessions();

    setLogStats({
      energyCount: energy.length,
      cbtCount: cbt.length,
      taskCount: tasks.filter((t) => t.completed).length,
      brainDumpCount: brainDump.length,
      focusCount: focus.length,
    });
  };

  useEffect(() => {
    const saved = StorageService.getSavedAnalysis();
    if (saved) {
      setAnalysis(saved);
    }
    loadCurrentStats();
  }, [onRefreshTrigger]);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    const energyLogs: EnergyLog[] = StorageService.getEnergyLogs();
    const cbtEntries: CBTEntry[] = StorageService.getCBTEntries();
    const tasks: TaskItem[] = StorageService.getTasks();
    const brainDumpThoughts: BrainDumpItem[] = StorageService.getBrainDump();
    const focusSessions: FocusSession[] = StorageService.getFocusSessions();

    try {
      const response = await fetch('/api/analyze-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          energyLogs,
          cbtEntries,
          completedTasks: tasks,
          brainDumpThoughts,
          focusSessions,
          engine: selectedEngine,
          localUrl,
          localModel,
          geminiApiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.quickHelp
            ? `${errorData.error} (${errorData.quickHelp})`
            : errorData.error || `Server responded with status ${response.status}`
        );
      }

      const data = await response.json();
      if (!data.success || !data.analysis) {
        throw new Error(data.error || 'Invalid analysis response');
      }

      const result: PsychologicalAnalysisResult = {
        ...data.analysis,
        id: `analysis-${Date.now()}`,
        generatedAt: Date.now(),
      };

      setAnalysis(result);
      setSourceMeta({
        source: data.source,
        modelUsed: data.modelUsed,
        latencyMs: data.latencyMs,
      });
      StorageService.saveAnalysis(result);
    } catch (err: any) {
      console.error('Failed to generate analysis:', err);
      setError(err?.message || 'Unable to connect to the analysis engine. Please verify local LLM server or connection.');
    } finally {
      setIsLoading(false);
      loadCurrentStats();
    }
  };

  const handleResetSampleData = () => {
    StorageService.resetToDefaultLogs();
    loadCurrentStats();
    runAnalysis();
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-sage-100 flex flex-col">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lavender-100 flex items-center justify-center text-lavender-600 shadow-sm">
            <BrainCircuit size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-light tracking-tight text-ink-900">
                Daily Psychological Analysis & Suggestions
              </h2>
              {/* Interactive Engine Switcher Pill */}
              <div className="inline-flex items-center p-0.5 rounded-full bg-sand-100 border border-sand-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedEngine('local')}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                    selectedEngine === 'local'
                      ? 'bg-white text-sage-900 shadow-xs border border-sage-300 font-semibold'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                  title="Run offline on Apple Silicon M4 Pro using Ollama"
                >
                  <Laptop size={12} className={selectedEngine === 'local' ? 'text-sage-600' : 'text-ink-400'} />
                  <span>Local LLM</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEngine('cloud')}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                    selectedEngine === 'cloud'
                      ? 'bg-white text-amber-900 shadow-xs border border-amber-300 font-semibold'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                  title="Run in Google Cloud using Gemini 2.5 Flash"
                >
                  <Sparkles size={12} className={selectedEngine === 'cloud' ? 'text-amber-500' : 'text-ink-400'} />
                  <span>Gemini</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEngine('auto')}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-all ${
                    selectedEngine === 'auto'
                      ? 'bg-white text-lavender-900 shadow-xs border border-lavender-300 font-semibold'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                  title="Auto mode: Try Local first, seamlessly fallback to Gemini"
                >
                  <Zap size={12} className={selectedEngine === 'auto' ? 'text-lavender-600' : 'text-ink-400'} />
                  <span>Auto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfigOpen(true)}
                  className="p-1 text-ink-400 hover:text-ink-800 rounded-full hover:bg-sand-200 transition-colors ml-0.5 mr-0.5"
                  title="Configure LLM & Gemini settings"
                >
                  <Settings2 size={12} />
                </button>
              </div>
            </div>
            <p className="text-xs md:text-sm text-ink-600 font-light mt-0.5">
              Synthesizes daily energy logs, CBT reframes, and focus blocks using {selectedEngine === 'local' ? `Local Ollama (${localModel})` : selectedEngine === 'cloud' ? 'Google Gemini (Cloud)' : 'Auto Local-to-Cloud'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenArchive && (
            <button
              onClick={onOpenArchive}
              className="px-3.5 py-2.5 bg-sand-50 hover:bg-sand-100 text-ink-700 rounded-xl border border-sand-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Browse past logged days and view or run retrospective analyses"
            >
              <Calendar size={14} className="text-emerald-600" />
              <span>Past Days Archive</span>
            </button>
          )}

          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-2.5 bg-sand-50 hover:bg-sand-100 text-ink-700 rounded-xl border border-sand-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Local LLM Settings & Hardware Guide"
          >
            <Laptop size={14} className="text-sage-600" />
            <span className="hidden md:inline">Local LLM Setup</span>
          </button>

          <button
            onClick={runAnalysis}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-ink-900 hover:bg-ink-800 disabled:bg-ink-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin text-sage-300" />
                Analyzing Logs...
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-sage-300" />
                {analysis ? 'Re-Analyze Logs' : 'Analyze Saved Logs'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Log data telemetry summary pill */}
      <div className="py-3 flex flex-wrap items-center justify-between text-xs text-ink-600 gap-2 bg-sand-50/60 -mx-6 md:-mx-8 px-6 md:px-8 border-b border-sage-100/60">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-ink-700">Analyzed Data Points:</span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-sand-200">
            📊 {logStats.energyCount} Energy Check-ins
          </span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-sand-200">
            📖 {logStats.cbtCount} CBT Entries
          </span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-sand-200">
            💡 {logStats.brainDumpCount} Brain Dumps
          </span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-sand-200">
            🎯 {logStats.taskCount} Completed Tasks
          </span>
        </div>

        <button
          onClick={handleResetSampleData}
          className="text-xs text-ink-500 hover:text-ink-800 underline underline-offset-2 transition-colors ml-auto"
          title="Restore sample clinical dataset for demonstration"
        >
          Reset Clinical Sample Logs
        </button>
      </div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-700" />
          <div className="flex-1">
            <p className="font-medium">Could not generate analysis</p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">{error}</p>
            {selectedEngine === 'local' && (
              <div className="mt-2 text-xs bg-white/70 p-2 rounded-lg border border-amber-300 font-mono text-ink-800">
                Tip: Run <code className="font-bold">ollama run {localModel}</code> in your Mac Terminal.
              </div>
            )}
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="text-xs bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Check Setup
          </button>
        </motion.div>
      )}

      {/* Loading state visualizer */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-sage-200 border-t-sage-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BrainCircuit size={24} className="text-lavender-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-medium text-ink-900">
              {selectedEngine === 'local' ? `Processing locally with ${localModel}...` : 'Synthesizing Cognitive & Physiological Trajectories...'}
            </h3>
            <p className="text-xs text-ink-500 max-w-sm">
              Cross-referencing your emotional trends, cognitive distortion markers, and ultradian work-rest balance on your hardware...
            </p>
          </div>
        </motion.div>
      )}

      {/* Content state */}
      {!isLoading && analysis && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-6 space-y-6"
        >
          {/* Top banner: Mindset state & Overall Summary */}
          <div className="bg-gradient-to-br from-sand-100/70 via-sage-50/50 to-lavender-50/60 rounded-2xl p-5 md:p-6 border border-sage-200/70">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-ink-500">
                  Current Psychological Climate
                </span>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-white text-ink-800 border border-sand-300 shadow-2xs">
                  {analysis.mindsetState}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-500">
                {sourceMeta?.source === 'local-llm' && (
                  <span className="bg-sage-100 text-sage-800 px-2 py-0.5 rounded-full font-mono text-[10px]">
                    🖥️ {sourceMeta.modelUsed || localModel} ({sourceMeta.latencyMs}ms)
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={13} />
                  <span>Updated {new Date(analysis.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <p className="text-base text-ink-800 leading-relaxed font-light">
              "{analysis.overallSummary}"
            </p>
          </div>

          {/* Grid: Distortion Insights & Energy Rhythm */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Cognitive Distortions & Antidotes */}
            <div className="bg-sand-50/80 rounded-2xl p-5 border border-sand-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-lavender-600" />
                  <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">
                    Cognitive Distortions & Reframing Antidotes
                  </h3>
                </div>
                <div className="space-y-3 mt-4">
                  {analysis.distortionInsights?.length > 0 ? (
                    analysis.distortionInsights.map((item, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-sand-200/90 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-lavender-600 bg-lavender-50 px-2 py-0.5 rounded-md">
                            {item.distortion}
                          </span>
                        </div>
                        <p className="text-xs text-ink-600 mb-2">
                          <strong className="text-ink-700">Trigger Context:</strong> {item.triggerContext}
                        </p>
                        <p className="text-xs text-sage-700 bg-sage-50/80 p-2 rounded-lg font-medium">
                          🌱 <strong className="text-sage-800">Antidote:</strong> {item.antidote}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-ink-500 italic">No acute distortions flagged in recent logs.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Energy & Rhythm Dynamics */}
            <div className="bg-sand-50/80 rounded-2xl p-5 border border-sand-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={18} className="text-sage-600" />
                  <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">
                    Energy & Ultradian Rhythm Dynamics
                  </h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-sand-200/90 shadow-2xs mt-4">
                  <p className="text-sm text-ink-700 leading-relaxed font-light">
                    {analysis.energyRhythmAnalysis}
                  </p>
                </div>
              </div>

              {/* Recommended somatic practice link */}
              <div className="mt-4 pt-3 border-t border-sand-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs text-ink-600">
                  <Wind size={15} className="text-sage-500" />
                  <span><strong>Somatic Rx:</strong> {analysis.recommendedBreathPattern}</span>
                </div>
                {onStartBreathing && (
                  <button
                    onClick={onStartBreathing}
                    className="text-xs px-3 py-1.5 bg-sage-500 hover:bg-sage-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    Start Box Breathing
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Daily Evidence-Based Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={20} className="text-sand-500" />
              <h3 className="text-base font-medium text-ink-900">
                Prescriptive Daily Suggestions
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.dailySuggestions?.map((sug, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4.5 border border-sage-100 hover:border-sage-300 transition-all flex flex-col justify-between shadow-2xs group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {sug.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-ink-900 mb-1.5 group-hover:text-ink-950 transition-colors">
                      {sug.title}
                    </h4>
                    <p className="text-xs text-ink-700 leading-relaxed mb-3">
                      {sug.actionableAdvice}
                    </p>
                  </div>
                  <div className="bg-sand-50 p-2.5 rounded-xl border border-sand-200/80">
                    <span className="text-[10px] font-medium text-ink-500 uppercase block mb-0.5">
                      Clinical Rationale
                    </span>
                    <p className="text-[11px] text-ink-600 italic">
                      {sug.rationale}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinically Grounded Mantra Banner */}
          {analysis.groundingMantra && (
            <div className="bg-lavender-50/70 border border-lavender-200 rounded-2xl p-4 md:p-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-lavender-200 flex items-center justify-center text-lavender-600 shrink-0">
                <Compass size={18} />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-lavender-600 block">
                  Grounding Anchor for Today
                </span>
                <p className="text-sm text-ink-800 font-medium italic mt-0.5">
                  "{analysis.groundingMantra}"
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty call to action if no analysis yet */}
      {!isLoading && !analysis && (
        <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-sand-100 flex items-center justify-center text-sand-500 mb-2">
            <Sparkles size={24} />
          </div>
          <h3 className="text-base font-medium text-ink-900">No Daily Analysis Generated Yet</h3>
          <p className="text-xs text-ink-600 max-w-md">
            Click the button above to run a psychological analysis on your saved logs using your local model ({localModel}) or cloud engine.
          </p>
          <button
            onClick={runAnalysis}
            className="mt-2 px-6 py-2.5 bg-ink-900 hover:bg-ink-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Generate Today's Psychological Analysis
          </button>
        </div>
      )}

      {/* Local LLM & Gemini Configuration Modal */}
      <LocalLLMConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        localUrl={localUrl}
        setLocalUrl={setLocalUrl}
        localModel={localModel}
        setLocalModel={setLocalModel}
        selectedEngine={selectedEngine}
        setSelectedEngine={setSelectedEngine}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
      />
    </div>
  );
}
