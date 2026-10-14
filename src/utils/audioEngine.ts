// Web Audio API procedural soundscape synthesizer
// Pure client-side synthesis: zero external audio assets, zero CORS, infinite seamless loops

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: Map<string, { gain: GainNode; stop: () => void }> = new Map();
  private masterGain: GainNode | null = null;
  private masterVolume: number = 0.7;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setSoundVolume(id: string, vol: number) {
    const item = this.activeNodes.get(id);
    if (item && this.ctx) {
      item.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public isPlaying(id: string): boolean {
    return this.activeNodes.has(id);
  }

  public stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch (e) {
        // ignore
      }
    });
    this.activeNodes.clear();
  }

  public stopSound(id: string) {
    const item = this.activeNodes.get(id);
    if (item) {
      try {
        item.stop();
      } catch (e) {
        // ignore
      }
      this.activeNodes.delete(id);
    }
  }

  public startSound(id: string, initialVolume = 0.5): boolean {
    this.initContext();
    if (!this.ctx || !this.masterGain) return false;

    // Stop if already running
    if (this.activeNodes.has(id)) {
      this.stopSound(id);
    }

    const soundGain = this.ctx.createGain();
    soundGain.gain.setValueAtTime(0, this.ctx.currentTime);
    soundGain.gain.linearRampToValueAtTime(initialVolume, this.ctx.currentTime + 1.2); // Smooth fade-in
    soundGain.connect(this.masterGain);

    let stopFn: () => void = () => {};

    switch (id) {
      case 'rain':
        stopFn = this.createRainSynthesizer(soundGain);
        break;
      case 'forest':
        stopFn = this.createForestSynthesizer(soundGain);
        break;
      case 'brown-noise':
        stopFn = this.createBrownNoiseSynthesizer(soundGain);
        break;
      case 'ocean':
        stopFn = this.createOceanSynthesizer(soundGain);
        break;
      case 'crickets':
        stopFn = this.createCricketsSynthesizer(soundGain);
        break;
      case 'alpha-waves':
        stopFn = this.createAlphaWaveSynthesizer(soundGain);
        break;
      default:
        return false;
    }

    this.activeNodes.set(id, {
      gain: soundGain,
      stop: () => {
        if (this.ctx) {
          soundGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
          setTimeout(() => {
            stopFn();
            soundGain.disconnect();
          }, 900);
        } else {
          stopFn();
        }
      },
    });

    return true;
  }

  // 1. Rain Synthesizer
  private createRainSynthesizer(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Resonant lowpass for rain body
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1000, this.ctx.currentTime);

    // Highpass to remove muddy sub-bass
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, this.ctx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(dest);
    whiteNoise.start();

    return () => {
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
      } catch (e) {}
    };
  }

  // 2. Forest Breeze & Birds Synthesizer
  private createForestSynthesizer(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    // Gentle rustling wind buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // LFO for slow wind gust modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);

    windSource.connect(windFilter);
    windFilter.connect(dest);

    lfo.start();
    windSource.start();

    // Occasional subtle procedural bird tweet
    let isRunning = true;
    const scheduleBird = () => {
      if (!isRunning || !this.ctx) return;
      const delay = 4000 + Math.random() * 6000;
      setTimeout(() => {
        if (!isRunning || !this.ctx) return;
        try {
          const birdOsc = this.ctx.createOscillator();
          const birdGain = this.ctx.createGain();
          const now = this.ctx.currentTime;
          const baseFreq = 2200 + Math.random() * 600;

          birdOsc.frequency.setValueAtTime(baseFreq, now);
          birdOsc.frequency.exponentialRampToValueAtTime(baseFreq + 700, now + 0.1);
          birdOsc.frequency.exponentialRampToValueAtTime(baseFreq - 300, now + 0.25);

          birdGain.gain.setValueAtTime(0, now);
          birdGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
          birdGain.gain.linearRampToValueAtTime(0, now + 0.28);

          birdOsc.connect(birdGain);
          birdGain.connect(dest);

          birdOsc.start(now);
          birdOsc.stop(now + 0.3);
        } catch (e) {}
        scheduleBird();
      }, delay);
    };
    scheduleBird();

    return () => {
      isRunning = false;
      try {
        windSource.stop();
        lfo.stop();
        windSource.disconnect();
      } catch (e) {}
    };
  }

  // 3. Deep Brown Noise Synthesizer (ADHD & Deep Focus)
  private createBrownNoiseSynthesizer(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.8;
    }

    const brownSource = this.ctx.createBufferSource();
    brownSource.buffer = noiseBuffer;
    brownSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    brownSource.connect(filter);
    filter.connect(dest);
    brownSource.start();

    return () => {
      try {
        brownSource.stop();
        brownSource.disconnect();
      } catch (e) {}
    };
  }

  // 4. Ocean Waves Synthesizer
  private createOceanSynthesizer(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.05;
      b1 = 0.985 * b1 + white * 0.12;
      b2 = 0.950 * b2 + white * 0.25;
      output[i] = (b0 + b1 + b2) * 0.22;
    }

    const oceanNoise = this.ctx.createBufferSource();
    oceanNoise.buffer = noiseBuffer;
    oceanNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    // LFO for wave rolling in and out (~12 seconds per wave)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const waveVolume = this.ctx.createGain();
    const volLfo = this.ctx.createOscillator();
    volLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const volLfoGain = this.ctx.createGain();
    volLfoGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    volLfo.connect(volLfoGain);
    volLfoGain.connect(waveVolume.gain);

    oceanNoise.connect(filter);
    filter.connect(waveVolume);
    waveVolume.connect(dest);

    lfo.start();
    volLfo.start();
    oceanNoise.start();

    return () => {
      try {
        oceanNoise.stop();
        lfo.stop();
        volLfo.stop();
      } catch (e) {}
    };
  }

  // 5. Evening Crickets Synthesizer
  private createCricketsSynthesizer(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4500, this.ctx.currentTime);

    // Tremolo LFO for rhythmic chirping
    const tremolo = this.ctx.createOscillator();
    tremolo.type = 'sawtooth';
    tremolo.frequency.setValueAtTime(32, this.ctx.currentTime);

    const tremoloGain = this.ctx.createGain();
    tremoloGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    tremolo.connect(tremoloGain);

    const cricketGain = this.ctx.createGain();
    cricketGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    tremoloGain.connect(cricketGain.gain);

    // Slow envelope LFO (chirp bursts)
    const burstLfo = this.ctx.createOscillator();
    burstLfo.frequency.setValueAtTime(2.5, this.ctx.currentTime);
    const burstGain = this.ctx.createGain();
    burstGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    burstLfo.connect(burstGain);
    burstGain.connect(cricketGain.gain);

    osc.connect(cricketGain);
    cricketGain.connect(dest);

    osc.start();
    tremolo.start();
    burstLfo.start();

    return () => {
      try {
        osc.stop();
        tremolo.stop();
        burstLfo.stop();
      } catch (e) {}
    };
  }

  // 6. Alpha Wave Brainwave Drone (432 Hz Base + 10 Hz Binaural Beat)
  private createAlphaWaveSynthesizer(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const baseFreq = 216; // Warm sub-harmonic of 432 Hz

    // Left channel carrier
    const leftOsc = this.ctx.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    // Right channel carrier (10 Hz beat for Alpha brainwaves: calm focus)
    const rightOsc = this.ctx.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.setValueAtTime(baseFreq + 10, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    leftOsc.connect(filter);
    rightOsc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    leftOsc.start();
    rightOsc.start();

    return () => {
      try {
        leftOsc.stop();
        rightOsc.stop();
      } catch (e) {}
    };
  }

  public playAchievementChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        noteGain.gain.setValueAtTime(0, now + idx * 0.1);
        noteGain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 1.1);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain!);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.1);
      });
    } catch (e) {
      console.warn('Could not play achievement chime', e);
    }
  }
}

export const audioService = new SoundscapeEngine();
