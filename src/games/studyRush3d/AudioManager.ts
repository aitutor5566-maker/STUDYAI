/**
 * STUDY RUSH 3D — Web Audio Sound Synthesizer
 * Generates crisp, zero-dependency sound effects after explicit user interaction.
 */

export class StudyRushAudioManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.5;

  public unlock(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    gainScale = 0.28,
    delaySec = 0
  ): void {
    if (this.muted || this.volume <= 0 || !this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime + delaySec;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + durationSec);
    }

    const peak = Math.max(0.001, gainScale * this.volume);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  public playJump(): void {
    this.playTone(220, 440, 0.14, 'triangle', 0.2);
  }

  public playCollectResource(): void {
    this.playTone(523.25, 659.25, 0.09, 'sine', 0.25, 0);
    this.playTone(783.99, 1046.5, 0.12, 'sine', 0.22, 0.07);
  }

  public playMagicCast(): void {
    this.playTone(360, 720, 0.16, 'triangle', 0.22, 0);
    this.playTone(540, 280, 0.14, 'sine', 0.16, 0.05);
  }

  public playCorrectHit(): void {
    this.playTone(523.25, 523.25, 0.1, 'triangle', 0.28, 0);
    this.playTone(659.25, 659.25, 0.1, 'triangle', 0.28, 0.08);
    this.playTone(783.99, 1046.5, 0.22, 'sine', 0.32, 0.16);
  }

  public playWrongShield(): void {
    this.playTone(240, 170, 0.18, 'sawtooth', 0.15, 0);
    this.playTone(170, 130, 0.22, 'triangle', 0.16, 0.12);
  }

  public playWaveStart(): void {
    this.playTone(196, 293.66, 0.22, 'sawtooth', 0.16, 0);
    this.playTone(293.66, 392, 0.28, 'triangle', 0.22, 0.16);
  }

  public playNightFall(): void {
    this.playTone(293.66, 196, 0.35, 'sine', 0.22, 0);
    this.playTone(196, 146.83, 0.45, 'triangle', 0.18, 0.22);
  }

  public playBuildUpgrade(): void {
    this.playTone(392, 523.25, 0.11, 'square', 0.14, 0);
    this.playTone(523.25, 783.99, 0.16, 'triangle', 0.22, 0.09);
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, n * 1.01, 0.22, 'triangle', 0.26, idx * 0.11);
    });
  }
}
