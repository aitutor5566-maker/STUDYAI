import { AudioSettings, DEFAULT_AUDIO_SETTINGS } from './types';

export class WarOfWordsAudioManager {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
  private musicOsc1: OscillatorNode | null = null;
  private musicOsc2: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;

  public unlock(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        this.ctx = new Ctx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public updateSettings(next: AudioSettings): void {
    this.settings = { ...next };
    if (this.musicGain && this.ctx) {
      const target = this.settings.muted
        ? 0
        : this.settings.masterVolume * this.settings.musicVolume * 0.08;
      this.musicGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public startAmbience(): void {
    this.unlock();
    if (!this.ctx || this.musicOsc1) return;

    const gain = this.ctx.createGain();
    const level = this.settings.muted
      ? 0
      : this.settings.masterVolume * this.settings.musicVolume * 0.08;
    gain.gain.setValueAtTime(level, this.ctx.currentTime);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    this.musicOsc1 = osc1;
    this.musicOsc2 = osc2;
    this.musicGain = gain;
  }

  public stopAmbience(): void {
    try {
      this.musicOsc1?.stop();
      this.musicOsc2?.stop();
    } catch {
      // Ignore already stopped oscillators
    }
    this.musicOsc1 = null;
    this.musicOsc2 = null;
    this.musicGain = null;
  }

  private playSfx(
    f1: number,
    f2: number,
    dur: number,
    type: OscillatorType = 'sine',
    scale = 0.25,
    delay = 0
  ): void {
    if (this.settings.muted || !this.ctx || this.ctx.state !== 'running') return;
    const vol = this.settings.masterVolume * this.settings.sfxVolume * scale;
    if (vol <= 0.001) return;

    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(f1, t);
    if (f2 !== f1) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(25, f2), t + dur);
    }

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  public playFootstep(): void {
    this.playSfx(120, 70, 0.05, 'triangle', 0.09);
  }

  public playJump(): void {
    this.playSfx(210, 460, 0.14, 'triangle', 0.2);
  }

  public playLand(): void {
    this.playSfx(135, 65, 0.08, 'sine', 0.16);
  }

  public playTargetSelect(): void {
    this.playSfx(587.33, 783.99, 0.09, 'sine', 0.18);
  }

  public playMagicAttack(): void {
    this.playSfx(420, 880, 0.16, 'triangle', 0.22, 0);
    this.playSfx(660, 320, 0.15, 'sine', 0.16, 0.05);
  }

  public playCorrectAnswer(): void {
    this.playSfx(523.25, 523.25, 0.1, 'triangle', 0.26, 0);
    this.playSfx(659.25, 659.25, 0.1, 'triangle', 0.26, 0.08);
    this.playSfx(783.99, 1046.5, 0.22, 'sine', 0.3, 0.16);
  }

  public playShieldBlock(): void {
    this.playSfx(240, 140, 0.22, 'sawtooth', 0.14, 0);
    this.playSfx(180, 120, 0.2, 'triangle', 0.14, 0.1);
  }

  public playLevelComplete(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => this.playSfx(n, n, 0.22, 'triangle', 0.24, idx * 0.11));
  }

  public pronounceWord(word: string): void {
    if (this.settings.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-US';
      utter.rate = 0.92;
      utter.volume = Math.min(1, this.settings.masterVolume);
      window.speechSynthesis.speak(utter);
    } catch {
      // Speech synthesis not supported in this browser environment
    }
  }
}
