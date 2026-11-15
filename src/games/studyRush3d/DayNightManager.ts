import * as THREE from 'three';
import { TimePhase } from './types';

export interface DayNightConfig {
  dayDurationSec: number;
  sunsetDurationSec: number;
  nightDurationSec: number;
  sunriseDurationSec: number;
}

export const DEFAULT_DAY_NIGHT_CONFIG: DayNightConfig = {
  dayDurationSec: 45,
  sunsetDurationSec: 12,
  nightDurationSec: 45,
  sunriseDurationSec: 10
};

export interface LightingSnapshot {
  phase: TimePhase;
  cycleProgress: number; // 0..1
  phaseProgress: number; // 0..1 within current phase
  skyColor: THREE.Color;
  fogColor: THREE.Color;
  sunIntensity: number;
  ambientIntensity: number;
  sunDirection: THREE.Vector3;
  sunColor: THREE.Color;
  torchMultiplier: number;
  starOpacity: number;
}

const SKY_DAY = new THREE.Color('#7DD3FC');
const SKY_SUNSET = new THREE.Color('#FB923C');
const SKY_NIGHT = new THREE.Color('#090D1F');
const SKY_SUNRISE = new THREE.Color('#FDBA74');

const SUN_DAY = new THREE.Color('#FFF7ED');
const SUN_SUNSET = new THREE.Color('#FF6A00');
const SUN_MOON = new THREE.Color('#818CF8');

export class DayNightManager {
  private elapsed = 0;
  private readonly totalCycleSec: number;
  private config: DayNightConfig;
  public paused = false;
  public nightCount = 0;
  private lastPhase: TimePhase = 'day';

  constructor(config: DayNightConfig = DEFAULT_DAY_NIGHT_CONFIG) {
    this.config = config;
    this.totalCycleSec =
      config.dayDurationSec +
      config.sunsetDurationSec +
      config.nightDurationSec +
      config.sunriseDurationSec;
  }

  public reset(): void {
    this.elapsed = 0;
    this.nightCount = 0;
    this.lastPhase = 'day';
  }

  public skipToNight(): { enteredNight: boolean } {
    const nightStart = this.config.dayDurationSec + this.config.sunsetDurationSec;
    this.elapsed = nightStart + 0.2;
    const prev = this.lastPhase;
    this.lastPhase = 'night';
    if (prev !== 'night') {
      this.nightCount += 1;
      return { enteredNight: true };
    }
    return { enteredNight: false };
  }

  public advance(dt: number): { phase: TimePhase; enteredNight: boolean; enteredSunrise: boolean } {
    if (!this.paused) {
      this.elapsed = (this.elapsed + dt) % this.totalCycleSec;
    }
    const snap = this.getSnapshot();
    let enteredNight = false;
    let enteredSunrise = false;

    if (snap.phase !== this.lastPhase) {
      if (snap.phase === 'night') {
        this.nightCount += 1;
        enteredNight = true;
      } else if (snap.phase === 'sunrise') {
        enteredSunrise = true;
      }
      this.lastPhase = snap.phase;
    }

    return { phase: snap.phase, enteredNight, enteredSunrise };
  }

  public getPhase(): TimePhase {
    const t = this.elapsed % this.totalCycleSec;
    const { dayDurationSec, sunsetDurationSec, nightDurationSec } = this.config;
    if (t < dayDurationSec) return 'day';
    if (t < dayDurationSec + sunsetDurationSec) return 'sunset';
    if (t < dayDurationSec + sunsetDurationSec + nightDurationSec) return 'night';
    return 'sunrise';
  }

  public getSnapshot(): LightingSnapshot {
    const t = this.elapsed % this.totalCycleSec;
    const { dayDurationSec, sunsetDurationSec, nightDurationSec, sunriseDurationSec } = this.config;
    const cycleProgress = t / this.totalCycleSec;

    let phase: TimePhase = 'day';
    let phaseProgress = 0;

    const skyColor = new THREE.Color();
    const sunColor = new THREE.Color();
    let sunIntensity = 1.6;
    let ambientIntensity = 0.75;
    let torchMultiplier = 0.25;
    let starOpacity = 0;

    if (t < dayDurationSec) {
      phase = 'day';
      phaseProgress = t / dayDurationSec;
      skyColor.copy(SKY_DAY);
      sunColor.copy(SUN_DAY);
      sunIntensity = 1.65;
      ambientIntensity = 0.8;
      torchMultiplier = 0.2;
      starOpacity = 0;
    } else if (t < dayDurationSec + sunsetDurationSec) {
      phase = 'sunset';
      phaseProgress = (t - dayDurationSec) / sunsetDurationSec;
      skyColor.copy(SKY_DAY).lerp(SKY_SUNSET, Math.min(1, phaseProgress * 1.4));
      if (phaseProgress > 0.55) {
        skyColor.lerp(SKY_NIGHT, (phaseProgress - 0.55) / 0.45);
      }
      sunColor.copy(SUN_DAY).lerp(SUN_SUNSET, phaseProgress);
      sunIntensity = THREE.MathUtils.lerp(1.5, 0.5, phaseProgress);
      ambientIntensity = THREE.MathUtils.lerp(0.75, 0.38, phaseProgress);
      torchMultiplier = THREE.MathUtils.lerp(0.3, 1.3, phaseProgress);
      starOpacity = THREE.MathUtils.lerp(0, 0.7, phaseProgress);
    } else if (t < dayDurationSec + sunsetDurationSec + nightDurationSec) {
      phase = 'night';
      phaseProgress = (t - dayDurationSec - sunsetDurationSec) / nightDurationSec;
      skyColor.copy(SKY_NIGHT);
      sunColor.copy(SUN_MOON);
      sunIntensity = 0.45;
      ambientIntensity = 0.34;
      torchMultiplier = 1.5;
      starOpacity = 0.95;
    } else {
      phase = 'sunrise';
      phaseProgress = (t - dayDurationSec - sunsetDurationSec - nightDurationSec) / sunriseDurationSec;
      skyColor.copy(SKY_NIGHT).lerp(SKY_SUNRISE, Math.min(1, phaseProgress * 1.3));
      if (phaseProgress > 0.5) {
        skyColor.lerp(SKY_DAY, (phaseProgress - 0.5) / 0.5);
      }
      sunColor.copy(SUN_SUNSET).lerp(SUN_DAY, phaseProgress);
      sunIntensity = THREE.MathUtils.lerp(0.5, 1.6, phaseProgress);
      ambientIntensity = THREE.MathUtils.lerp(0.36, 0.8, phaseProgress);
      torchMultiplier = THREE.MathUtils.lerp(1.4, 0.2, phaseProgress);
      starOpacity = THREE.MathUtils.lerp(0.85, 0, phaseProgress);
    }

    const angle = cycleProgress * Math.PI * 2;
    const sunDirection = new THREE.Vector3(
      Math.cos(angle) * 38,
      Math.max(8, Math.abs(Math.sin(angle)) * 42 + 6),
      Math.sin(angle) * 26
    );

    const fogColor = skyColor.clone();

    return {
      phase,
      cycleProgress,
      phaseProgress,
      skyColor,
      fogColor,
      sunIntensity,
      ambientIntensity,
      sunDirection,
      sunColor,
      torchMultiplier,
      starOpacity
    };
  }
}
