export class ShadowNinjaRealmsAudio {
  private ctx: AudioContext | null = null;
  private musicVolume = 0.4;
  private sfxVolume = 0.7;
  private musicTimer: number | null = null;
  private noteIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
  }

  public setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  public startAmbience(isVoxelMode: boolean): void {
    this.stopAmbience();
    if (typeof window === 'undefined') return;
    const scale = isVoxelMode
      ? [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]
      : [220.0, 261.63, 293.66, 329.63, 392.0, 440.0];
    this.musicTimer = window.setInterval(() => {
      if (this.musicVolume <= 0.01) return;
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;
      const freq = scale[(this.noteIndex++ * 2 + 1) % scale.length];
      this.playTone(freq, 'sine', 0.95, 0.045 * this.musicVolume);
    }, 1450);
  }

  public stopAmbience(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainLevel: number, slideTo?: number): void {
    const ctx = this.ensureContext();
    if (!ctx || gainLevel <= 0.001) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playFootstep(): void {
    this.playTone(115, 'triangle', 0.055, 0.06 * this.sfxVolume, 72);
  }

  public playJump(): void {
    this.playTone(240, 'sine', 0.16, 0.14 * this.sfxVolume, 460);
  }

  public playCollect(): void {
    this.playTone(587.33, 'triangle', 0.12, 0.16 * this.sfxVolume, 880);
  }

  public playBlockPlace(): void {
    this.playTone(180, 'square', 0.09, 0.11 * this.sfxVolume, 120);
  }

  public playNinjaAbility(): void {
    this.playTone(640, 'sawtooth', 0.22, 0.12 * this.sfxVolume, 220);
  }

  public playCorrect(): void {
    this.playTone(523.25, 'triangle', 0.16, 0.18 * this.sfxVolume);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.18, 0.18 * this.sfxVolume), 90);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.26, 0.2 * this.sfxVolume), 180);
  }

  public playWrong(): void {
    this.playTone(210, 'sawtooth', 0.22, 0.15 * this.sfxVolume, 130);
  }

  public dispose(): void {
    this.stopAmbience();
  }
}
