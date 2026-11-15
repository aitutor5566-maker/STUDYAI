import { DEFAULT_SKY_AUDIO, SkyStrikerAudioSettings } from './types';

export class SkyStrikerAudioManager {
  private ctx: AudioContext | null = null;
  private settings: SkyStrikerAudioSettings = { ...DEFAULT_SKY_AUDIO };
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  unlock(): void {
    this.ensureContext();
  }

  updateSettings(next: SkyStrikerAudioSettings): void {
    this.settings = { ...next };
    if (this.engineGain && this.ctx) {
      const vol = this.settings.muted ? 0 : this.settings.masterVolume * this.settings.musicVolume * 0.08;
      this.engineGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.08);
    }
  }

  startEngineAmbience(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.engineOsc) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 68;
    filter.type = 'lowpass';
    filter.frequency.value = 190;

    const vol = this.settings.muted ? 0 : this.settings.masterVolume * this.settings.musicVolume * 0.07;
    gain.gain.value = vol;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    this.engineOsc = osc;
    this.engineGain = gain;
  }

  setEnginePitch(speedFactor: number, isBoosting: boolean): void {
    if (!this.engineOsc || !this.ctx) return;
    const targetFreq = 64 + speedFactor * 36 + (isBoosting ? 24 : 0);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  stopEngineAmbience(): void {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // ignore
      }
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.16
  ): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);

    const vol = Math.max(0.001, this.settings.masterVolume * this.settings.sfxVolume * gainLevel);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playTargetLock(): void {
    this.playTone(740, 1080, 0.11, 'triangle', 0.12);
  }

  playBoost(): void {
    this.playTone(140, 290, 0.28, 'sawtooth', 0.1);
  }

  playEnergyPulse(): void {
    this.playTone(520, 1280, 0.22, 'sine', 0.18);
  }

  playCorrect(): void {
    this.playTone(523.25, 659.25, 0.14, 'triangle', 0.2);
    setTimeout(() => this.playTone(659.25, 1046.5, 0.24, 'triangle', 0.2), 90);
  }

  playIncorrect(): void {
    this.playTone(260, 175, 0.28, 'sine', 0.18);
  }

  playLevelComplete(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, n * 1.02, 0.24, 'triangle', 0.18), idx * 110);
    });
  }
}
