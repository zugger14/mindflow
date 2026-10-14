import { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CloudRain, 
  Trees, 
  Waves, 
  Radio, 
  Moon, 
  Sparkles,
  Sliders,
  Flame,
  Coffee,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioService } from '../utils/audioEngine';

export interface SoundscapeItem {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  colorFrom: string;
  colorTo: string;
  badgeBg: string;
  textColor: string;
  accentBar: string;
  defaultVol: number;
}

export const SOUNDSCAPES: SoundscapeItem[] = [
  {
    id: 'rain',
    name: 'Soft Rainfall',
    subtitle: 'Pink noise droplets on glass',
    icon: CloudRain,
    colorFrom: 'from-sky-50',
    colorTo: 'to-blue-100/60',
    badgeBg: 'bg-sky-100 text-sky-700 border-sky-200',
    textColor: 'text-sky-700',
    accentBar: 'bg-sky-500',
    defaultVol: 0.5,
  },
  {
    id: 'forest',
    name: 'Forest Sanctuary',
    subtitle: 'Rustling leaves & distant birds',
    icon: Trees,
    colorFrom: 'from-emerald-50',
    colorTo: 'to-teal-100/60',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    textColor: 'text-emerald-700',
    accentBar: 'bg-emerald-500',
    defaultVol: 0.5,
  },
  {
    id: 'brown-noise',
    name: 'Deep Brown Noise',
    subtitle: 'Speech-masking focus rumble',
    icon: Radio,
    colorFrom: 'from-amber-50',
    colorTo: 'to-orange-100/60',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    textColor: 'text-amber-700',
    accentBar: 'bg-amber-500',
    defaultVol: 0.55,
  },
  {
    id: 'ocean',
    name: 'Ocean Swell',
    subtitle: 'Rhythmic rolling shoreline',
    icon: Waves,
    colorFrom: 'from-cyan-50',
    colorTo: 'to-teal-100/70',
    badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    textColor: 'text-cyan-700',
    accentBar: 'bg-cyan-500',
    defaultVol: 0.45,
  },
  {
    id: 'crickets',
    name: 'Summer Twilight',
    subtitle: 'Warm breeze & meadow crickets',
    icon: Moon,
    colorFrom: 'from-purple-50',
    colorTo: 'to-violet-100/60',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    textColor: 'text-purple-700',
    accentBar: 'bg-purple-500',
    defaultVol: 0.4,
  },
  {
    id: 'alpha-waves',
    name: 'Alpha Focus Tone',
    subtitle: '432 Hz drone + 10 Hz beat',
    icon: Sparkles,
    colorFrom: 'from-indigo-50',
    colorTo: 'to-rose-100/50',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    textColor: 'text-indigo-700',
    accentBar: 'bg-indigo-500',
    defaultVol: 0.35,
  },
];

interface AmbientSoundscapesProps {
  isTimerActive?: boolean;
  isBreakMode?: boolean;
}

export default function AmbientSoundscapes({
  isTimerActive = false,
  isBreakMode = false,
}: AmbientSoundscapesProps) {
  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SOUNDSCAPES.forEach((s) => {
      initial[s.id] = s.defaultVol;
    });
    return initial;
  });
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [syncWithTimer, setSyncWithTimer] = useState(true);

  // Sync with Ultradian Timer focus/break states
  useEffect(() => {
    if (!syncWithTimer) return;

    if (isTimerActive && !isBreakMode) {
      const anyActive = Object.values(activeSounds).some(Boolean);
      if (!anyActive) {
        audioService.startSound('rain', volumes['rain'] || 0.5);
        setActiveSounds((prev) => ({ ...prev, rain: true }));
      }
    } else if (isBreakMode || !isTimerActive) {
      if (isBreakMode) {
        audioService.stopAll();
        setActiveSounds({});
      }
    }
  }, [isTimerActive, isBreakMode, syncWithTimer]);

  const toggleSound = (id: string) => {
    const isCurrentlyActive = !!activeSounds[id];
    if (isCurrentlyActive) {
      audioService.stopSound(id);
      setActiveSounds((prev) => ({ ...prev, [id]: false }));
    } else {
      audioService.startSound(id, volumes[id] || 0.5);
      setActiveSounds((prev) => ({ ...prev, [id]: true }));
    }
  };

  const handleVolumeChange = (id: string, val: number) => {
    setVolumes((prev) => ({ ...prev, [id]: val }));
    audioService.setSoundVolume(id, val);
  };

  const handleMasterVolume = (val: number) => {
    setMasterVolume(val);
    if (!isMuted) {
      audioService.setMasterVolume(val);
    }
  };

  const toggleMasterMute = () => {
    if (isMuted) {
      audioService.setMasterVolume(masterVolume);
      setIsMuted(false);
    } else {
      audioService.setMasterVolume(0);
      setIsMuted(true);
    }
  };

  const applyPreset = (presetSounds: string[]) => {
    audioService.stopAll();
    const nextActive: Record<string, boolean> = {};
    presetSounds.forEach((id) => {
      audioService.startSound(id, volumes[id] || 0.5);
      nextActive[id] = true;
    });
    setActiveSounds(nextActive);
  };

  const stopAll = () => {
    audioService.stopAll();
    setActiveSounds({});
  };

  const activeCount = Object.values(activeSounds).filter(Boolean).length;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100/80 hover:border-emerald-200 transition-all flex flex-col justify-between h-full">
      {/* Header with vibrant badges and master controls */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-sand-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles size={17} />
              </div>
              <h2 className="text-xl font-medium text-ink-900 tracking-tight">Ambient Soundscapes</h2>
              {activeCount > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {activeCount} Active Track{activeCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-[11px] text-ink-500 bg-sand-100 px-2.5 py-0.5 rounded-full font-medium">
                  Ready to stream
                </span>
              )}
            </div>
            <p className="text-xs text-ink-600 mt-1 font-light">
              Calming, procedural audio backgrounds to sustain flow during 90-minute focus blocks.
            </p>
          </div>

          {/* Master volume & Quick action buttons */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto bg-sand-50/80 p-1.5 rounded-2xl border border-sand-200/90 shadow-2xs">
            {activeCount > 0 && (
              <button
                onClick={stopAll}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors px-2.5 py-1 rounded-xl font-medium"
              >
                Mute All
              </button>
            )}
            <button
              onClick={toggleMasterMute}
              className={`p-2 rounded-xl transition-all ${
                isMuted
                  ? 'bg-amber-100 text-amber-800 shadow-inner'
                  : 'bg-white text-ink-700 hover:bg-sand-100 shadow-2xs border border-sand-200'
              }`}
              title={isMuted ? 'Unmute' : 'Mute Master Audio'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => handleMasterVolume(Number(e.target.value))}
              className="w-18 sm:w-24 h-1.5 bg-sand-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              title="Master Volume"
            />
          </div>
        </div>

        {/* Quick Mix Presets Bar */}
        <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mr-1">
              Quick Blends:
            </span>
            <button
              onClick={() => applyPreset(['rain', 'brown-noise'])}
              className="px-2.5 py-1 bg-gradient-to-r from-sky-50 to-amber-50 hover:from-sky-100 hover:to-amber-100 text-ink-800 rounded-xl text-xs font-medium border border-sand-200 shadow-2xs transition-all flex items-center gap-1"
            >
              🌧️ Deep Study (Rain + Brown)
            </button>
            <button
              onClick={() => applyPreset(['forest', 'crickets'])}
              className="px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-purple-50 hover:from-emerald-100 hover:to-purple-100 text-ink-800 rounded-xl text-xs font-medium border border-sand-200 shadow-2xs transition-all flex items-center gap-1"
            >
              🌲 Nature Twilight
            </button>
            <button
              onClick={() => applyPreset(['ocean', 'alpha-waves'])}
              className="px-2.5 py-1 bg-gradient-to-r from-cyan-50 to-indigo-50 hover:from-cyan-100 hover:to-indigo-100 text-ink-800 rounded-xl text-xs font-medium border border-sand-200 shadow-2xs transition-all flex items-center gap-1"
            >
              🌊 Flow Waves (Ocean + Alpha)
            </button>
          </div>

          {/* Ultradian Timer Sync Toggle */}
          <div className="flex items-center gap-2 text-xs bg-emerald-50/70 border border-emerald-200/80 px-3 py-1 rounded-xl">
            <input
              type="checkbox"
              id="syncTimer"
              checked={syncWithTimer}
              onChange={(e) => setSyncWithTimer(e.target.checked)}
              className="rounded accent-emerald-600 cursor-pointer w-3.5 h-3.5"
            />
            <label htmlFor="syncTimer" className="text-emerald-900 cursor-pointer font-medium select-none text-[11px]">
              Auto-sync with 90m Focus Blocks
            </label>
          </div>
        </div>

        {/* Sound Grid with Vibrant Light Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SOUNDSCAPES.map((sound) => {
            const Icon = sound.icon;
            const isPlaying = !!activeSounds[sound.id];
            const currentVol = volumes[sound.id] ?? sound.defaultVol;

            return (
              <div
                key={sound.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden group ${
                  isPlaying
                    ? `bg-gradient-to-br ${sound.colorFrom} ${sound.colorTo} border-emerald-300 shadow-md ring-1 ring-emerald-300/40`
                    : 'bg-white hover:bg-sand-50/70 border-sand-200/90 hover:border-sand-300 shadow-2xs'
                }`}
              >
                {/* Luminous top border accent when playing */}
                {isPlaying && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${sound.accentBar}`} />
                )}

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 ${sound.badgeBg}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-ink-900">{sound.name}</h4>
                      <p className="text-[10px] text-ink-500 line-clamp-1">{sound.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSound(sound.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 shadow-2xs ${
                      isPlaying
                        ? 'bg-ink-900 text-white hover:scale-105'
                        : 'bg-sand-100 hover:bg-sand-200 text-ink-700 border border-sand-300'
                    }`}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                  </button>
                </div>

                {/* Sound Equalizer Visualizer & Volume */}
                <div className="pt-2.5 border-t border-sand-200/60 flex items-center justify-between gap-2">
                  {isPlaying ? (
                    <div className="flex items-end gap-1 h-3.5">
                      <span className={`w-1 rounded-full animate-bounce [animation-delay:0ms] h-3 ${sound.accentBar}`} />
                      <span className={`w-1 rounded-full animate-bounce [animation-delay:150ms] h-4 ${sound.accentBar}`} />
                      <span className={`w-1 rounded-full animate-bounce [animation-delay:300ms] h-2 ${sound.accentBar}`} />
                      <span className={`w-1 rounded-full animate-bounce [animation-delay:75ms] h-3.5 ${sound.accentBar}`} />
                    </div>
                  ) : (
                    <span className="text-[10px] text-ink-400 font-medium">Silent</span>
                  )}

                  <div className="flex items-center gap-1.5 flex-1 max-w-[110px] ml-auto">
                    <Sliders size={11} className="text-ink-400" />
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={currentVol}
                      disabled={!isPlaying}
                      onChange={(e) => handleVolumeChange(sound.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-sand-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-sand-200/80 flex items-center justify-between text-[11px] text-ink-500">
        <span>Mix unlimited simultaneous sound layers</span>
        <span>Synthesized in real-time with Web Audio API</span>
      </div>
    </div>
  );
}
