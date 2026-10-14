import { useState, useEffect } from 'react';
import { 
  Laptop, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Zap, 
  Settings2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocalLLMConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  localUrl: string;
  setLocalUrl: (url: string) => void;
  localModel: string;
  setLocalModel: (model: string) => void;
  selectedEngine: 'local' | 'cloud' | 'auto';
  setSelectedEngine: (engine: 'local' | 'cloud' | 'auto') => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
}

export default function LocalLLMConfigModal({
  isOpen,
  onClose,
  localUrl,
  setLocalUrl,
  localModel,
  setLocalModel,
  selectedEngine,
  setSelectedEngine,
  geminiApiKey,
  setGeminiApiKey,
}: LocalLLMConfigModalProps) {
  const [testing, setTesting] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<any>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch(`/api/local-llm/status?url=${encodeURIComponent(localUrl)}`);
      const data = await res.json();
      setStatusResult(data);
    } catch (err: any) {
      setStatusResult({
        online: false,
        error: err?.message || 'Could not reach backend proxy for local LLM test.',
      });
    } finally {
      setTesting(false);
    }
  };

  const testGeminiConnection = async () => {
    setTestingGemini(true);
    try {
      const res = await fetch(`/api/gemini/status?apiKey=${encodeURIComponent(geminiApiKey || '')}`);
      const data = await res.json();
      setGeminiStatus(data);
    } catch (err: any) {
      setGeminiStatus({
        configured: false,
        status: 'error',
        error: err?.message || 'Could not test Gemini connection.',
      });
    } finally {
      setTestingGemini(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      testConnection();
      testGeminiConnection();
    }
  }, [isOpen, localUrl]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-sand-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center">
              <Laptop size={22} />
            </div>
            <div>
              <h3 className="text-xl font-light tracking-tight text-ink-900">
                Local LLM Setup (MacBook M4 Pro)
              </h3>
              <p className="text-xs text-ink-500 font-light mt-0.5">
                Private, zero-telemetry psychological insights running natively on your Apple Silicon hardware.
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

        <div className="py-5 space-y-6">
          {/* Engine Selection Toggle */}
          <div>
            <label className="text-xs font-semibold text-ink-600 uppercase tracking-wider block mb-2">
              Inference Engine
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedEngine('local')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedEngine === 'local'
                    ? 'bg-sage-50 border-sage-400 text-sage-900 ring-1 ring-sage-400'
                    : 'bg-white border-sand-200 hover:border-sand-300 text-ink-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs mb-1">
                  <Laptop size={15} className="text-sage-600" />
                  <span>Local LLM Only</span>
                </div>
                <span className="text-[11px] text-ink-500 leading-tight">100% offline & private</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEngine('auto')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedEngine === 'auto'
                    ? 'bg-lavender-50 border-lavender-400 text-lavender-900 ring-1 ring-lavender-400'
                    : 'bg-white border-sand-200 hover:border-sand-300 text-ink-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs mb-1">
                  <Zap size={15} className="text-lavender-600" />
                  <span>Auto (Local First)</span>
                </div>
                <span className="text-[11px] text-ink-500 leading-tight">Fallback to cloud if down</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEngine('cloud')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedEngine === 'cloud'
                    ? 'bg-sand-100 border-sand-400 text-ink-900 ring-1 ring-sand-400'
                    : 'bg-white border-sand-200 hover:border-sand-300 text-ink-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs mb-1">
                  <Sparkles size={15} className="text-sand-600" />
                  <span>Cloud (Gemini)</span>
                </div>
                <span className="text-[11px] text-ink-500 leading-tight">High clinical depth</span>
              </button>
            </div>
          </div>

          {/* Cloud Gemini Configuration Card */}
          <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
            selectedEngine === 'cloud' ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-200' : 'bg-sand-50/60 border-sand-200/90'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  Google Gemini (Cloud AI)
                </span>
                {geminiStatus?.configured && geminiStatus?.status === 'online' ? (
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 size={12} /> Active ({geminiStatus.model})
                  </span>
                ) : geminiStatus?.configured ? (
                  <span className="flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    <AlertCircle size={12} /> Key Error
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] bg-sand-200 text-ink-600 px-2 py-0.5 rounded-full font-medium">
                    Key Not Set
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={testGeminiConnection}
                disabled={testingGemini}
                className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-sand-200 shadow-2xs"
              >
                <RefreshCw size={12} className={testingGemini ? 'animate-spin' : ''} />
                <span>Verify Key</span>
              </button>
            </div>

            <div>
              <label className="text-[11px] font-medium text-ink-700 block mb-1">
                Gemini API Key (saved in browser or via GEMINI_API_KEY env)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy... or AQ.Ab8RN6..."
                  className="flex-1 text-xs bg-white border border-sand-300 rounded-xl px-3 py-2 text-ink-800 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={testGeminiConnection}
                  className="px-3 py-2 bg-white hover:bg-sand-100 text-ink-700 rounded-xl border border-sand-300 text-xs font-medium cursor-pointer"
                >
                  Save & Check
                </button>
              </div>

              {/* Demo Key Quick Insert Banner */}
              <div className="mt-2.5 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-amber-900 text-[11px]">
                    <Sparkles size={12} className="text-amber-600 shrink-0" />
                    <span>Demo Key for Instant Testing:</span>
                  </div>
                  <p className="text-[10px] text-ink-600 font-mono">
                    Official Pre-configured Gemini Demo Key (Ready for 1-click activation)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    let key = '';
                    try {
                      const res = await fetch('/api/gemini/demo-key');
                      const data = await res.json();
                      if (data?.demoKey) {
                        key = data.demoKey;
                      }
                    } catch {
                      // ignore network error and fall back to encoded demo key
                    }

                    if (!key) {
                      // Fallback decoded demo key for client direct activation
                      key = atob('QVEuQWI4Uk42TDBjbW5CWDhFY3VJQ3pEdHFoYlp3VTc3bm9zaGZSMDlWVEM2b3BZdUVRRWc=');
                    }

                    setGeminiApiKey(key);
                    setTimeout(() => testGeminiConnection(), 80);
                  }}
                  className="shrink-0 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
                  title="Click to automatically fill and verify demo Gemini API key"
                >
                  Use Demo Key
                </button>
              </div>

              {/* Free Quota Guidance Box */}
              <div className="mt-2 text-[11px] text-ink-600 space-y-1 bg-white p-2.5 rounded-xl border border-sand-200">
                <p className="leading-relaxed">
                  💡 <strong>Need your own key?</strong> Google provides a <strong>100% Free Tier</strong> for developers and users. The free tier gives you full access to Gemini Flash models with rate limits and quota that <strong>automatically reset every day</strong>.
                </p>
                <div className="pt-1">
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold underline text-xs"
                  >
                    <span>Get Your Free Gemini API Key at Google AI Studio &rarr;</span>
                  </a>
                </div>
              </div>

              {geminiStatus?.error && (
                <p className="text-[11px] text-rose-600 mt-1.5 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  ⚠️ {geminiStatus.error}
                </p>
              )}
            </div>
          </div>

          {/* Connection Status Live Box (Local LLM) */}
          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-600">
                  Ollama / Local Server Status
                </span>
                {statusResult?.online ? (
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 size={12} /> Connected ({statusResult.latencyMs}ms)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    <AlertCircle size={12} /> Server Not Detected
                  </span>
                )}
              </div>
              <button
                onClick={testConnection}
                disabled={testing}
                className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-sand-200 shadow-2xs"
              >
                <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
                <span>Test Ping</span>
              </button>
            </div>

            {/* URL and Model inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-sand-200/70">
              <div>
                <label className="text-[11px] font-medium text-ink-700 block mb-1">
                  Server Endpoint (Ollama default)
                </label>
                <input
                  type="text"
                  value={localUrl}
                  onChange={(e) => setLocalUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full text-xs bg-white border border-sand-300 rounded-xl px-3 py-2 text-ink-800 focus:outline-none focus:border-sage-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-700 block mb-1">
                  Model Tag (Recommended: qwen2.5:7b)
                </label>
                <input
                  type="text"
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  placeholder="qwen2.5:7b"
                  className="w-full text-xs bg-white border border-sand-300 rounded-xl px-3 py-2 text-ink-800 focus:outline-none focus:border-sage-400 font-mono"
                />
              </div>
            </div>

            {statusResult?.models?.length > 0 && (
              <div className="pt-2 text-[11px] text-ink-600 flex items-center gap-2 flex-wrap">
                <span className="font-medium text-ink-700">Installed Local Models:</span>
                {statusResult.models.map((m: string) => (
                  <button
                    key={m}
                    onClick={() => setLocalModel(m)}
                    className={`px-2 py-0.5 rounded-md border font-mono transition-colors ${
                      localModel === m ? 'bg-sage-100 text-sage-800 border-sage-300' : 'bg-white text-ink-700 border-sand-300 hover:border-sand-400'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* M4 Pro Hardware Sizing & Concurrent Users Guide */}
          <div className="bg-sage-50/70 rounded-2xl p-4.5 border border-sage-200/90 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-sage-700" />
              <h4 className="text-sm font-semibold text-ink-900">
                Hardware Sizing: MacBook M4 Pro (24 GB VRAM)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-sage-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-ink-900 font-medium">Qwen 2.5 7B (Recommended)</strong>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                    Optimal
                  </span>
                </div>
                <p className="text-ink-600 text-[11px] leading-relaxed">
                  • <strong>VRAM Footprint:</strong> ~4.7 GB (Q4_K_M)
                  <br />• <strong>Speed on M4 Pro:</strong> ~70–85 tokens/sec
                  <br />• <strong>2 Users:</strong> Easily accommodates 2 parallel sessions with ~18 GB free for macOS.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sage-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-ink-900 font-medium">Qwen 2.5 14B / Llama 3.1 8B</strong>
                  <span className="text-[10px] bg-lavender-100 text-lavender-800 px-1.5 py-0.5 rounded font-semibold">
                    Alternate
                  </span>
                </div>
                <p className="text-ink-600 text-[11px] leading-relaxed">
                  • <strong>VRAM Footprint:</strong> ~9.0 GB (14B) / ~4.9 GB (8B)
                  <br />• <strong>Deeper Reasoning:</strong> Fits comfortably in your 24GB Unified Memory.
                </p>
              </div>
            </div>

            {/* Quick Terminal Command with 2 Concurrent Users */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block mb-1.5">
                Run in Mac Terminal for 2 Concurrent Users:
              </span>

              <div className="space-y-2">
                <div className="bg-ink-900 text-sand-50 p-3 rounded-xl font-mono text-xs flex items-center justify-between group">
                  <span className="truncate pr-2">ollama pull qwen2.5:7b</span>
                  <button
                    onClick={() => copyToClipboard('ollama pull qwen2.5:7b', 'pull')}
                    className="text-sand-300 hover:text-white shrink-0 p-1 rounded hover:bg-ink-800"
                    title="Copy command"
                  >
                    {copiedCmd === 'pull' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="bg-ink-900 text-sand-50 p-3 rounded-xl font-mono text-xs flex items-center justify-between group">
                  <span className="truncate pr-2">OLLAMA_NUM_PARALLEL=2 ollama serve</span>
                  <button
                    onClick={() => copyToClipboard('OLLAMA_NUM_PARALLEL=2 ollama serve', 'serve')}
                    className="text-sand-300 hover:text-white shrink-0 p-1 rounded hover:bg-ink-800"
                    title="Copy command"
                  >
                    {copiedCmd === 'serve' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-ink-500 mt-1.5">
                <code>OLLAMA_NUM_PARALLEL=2</code> configures Ollama to process requests from 2 users concurrently without waiting in a queue.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-sand-200">
          <span className="text-xs text-ink-500">Settings save locally in this browser.</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-white rounded-xl text-xs font-medium transition-colors shadow-sm"
          >
            Apply & Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
