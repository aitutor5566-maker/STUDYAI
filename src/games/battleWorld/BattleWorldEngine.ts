import * as THREE from 'three';
import type {
  ArenaDefinition,
  BattleWorldStats,
  BiomeType,
  PlayerControlsInput
} from './types.ts';
import { ARENA_DEFINITIONS, VoxelArenaManager } from './VoxelArenaManager.ts';
import { VoxelCharacter } from './VoxelCharacter.ts';
import { VoxelMobManager } from './VoxelMobManager.ts';

export interface BattleWorldEngineCallbacks {
  onStatsUpdate: (stats: BattleWorldStats) => void;
  onWaveComplete: (completedWave: number, nextBiome: BiomeType) => void;
  onGameOver: (victory: boolean, stats: BattleWorldStats) => void;
  onOpenQuestionDialog?: () => void;
}

const BIOME_ORDER: BiomeType[] = ['grassland', 'desert', 'snow', 'castle', 'forest'];

export class BattleWorldEngine {
  private container: HTMLElement;
  private callbacks: BattleWorldEngineCallbacks;

  // Three.js Core
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;

  // Subsystems
  public arenaManager: VoxelArenaManager;
  public player: VoxelCharacter;
  public mobManager: VoxelMobManager;

  // Camera Orbit State
  public cameraAzimuth: number = 0; // Horizontal rotation
  public cameraElevation: number = 0.42; // Vertical pitch
  public cameraDistance: number = 6.8;

  // Gameplay State
  public currentWave: number = 1;
  public totalWaves: number = 5;
  public currentBiome: BiomeType = 'grassland';
  public score: number = 0;
  public knowledgeXP: number = 0;
  public comboStreak: number = 1;
  public questionsAnswered: number = 0;
  public correctAnswers: number = 0;
  public powerUpTimer: number = 0;
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isTransitioning: boolean = false;

  // Audio Context (Synthesized SFX)
  private audioCtx: AudioContext | null = null;

  // Input State
  public controlsInput: PlayerControlsInput = {
    moveForward: 0,
    moveRight: 0,
    jump: false,
    action: false,
    lookDeltaX: 0,
    lookDeltaY: 0
  };

  // Keyboard Event Handlers
  private keysDown: Record<string, boolean> = {};
  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;
  private onResizeBound: () => void;

  // Animation Loop
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(container: HTMLElement, callbacks: BattleWorldEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0xc8e6c9, 0.012);

    // 2. Camera
    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    this.camera.position.set(0, 4, 7);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfff8e1, 1.2);
    this.dirLight.position.set(12, 20, 10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 40;
    const d = 16;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    // 5. Initialize Subsystems
    this.arenaManager = new VoxelArenaManager();
    this.scene.add(this.arenaManager.arenaGroup);

    this.player = new VoxelCharacter();
    this.scene.add(this.player.group);

    this.mobManager = new VoxelMobManager(this.scene, this.arenaManager);

    // 6. Bind events
    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onKeyUpBound = this.handleKeyUp.bind(this);
    this.onResizeBound = this.handleResize.bind(this);

    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    window.addEventListener('resize', this.onResizeBound);

    // Initial Arena
    this.loadWave(1);
  }

  // --- Audio Synthesis Engine ---

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playSound(type: 'jump' | 'swing' | 'hit' | 'defeat' | 'correct' | 'wrong' | 'victory') {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'swing') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'defeat') {
        [392, 523, 659, 784].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.15, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.15);
        });
      } else if (type === 'correct') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.22, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.22);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'victory') {
        [523, 659, 784, 1046, 1318].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.3, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.35);
        });
      }
    } catch {
      // Audio autoplay policy catch
    }
  }

  // --- Wave & Arena Management ---

  public loadWave(waveNumber: number) {
    this.currentWave = Math.min(Math.max(1, waveNumber), this.totalWaves);
    this.currentBiome = BIOME_ORDER[this.currentWave - 1] || 'grassland';
    const def = ARENA_DEFINITIONS[this.currentBiome];

    // Build Arena Voxel geometry and update atmospheric lighting
    const colors = this.arenaManager.buildArena(this.currentBiome);
    this.scene.background = new THREE.Color(colors.skyColor);
    this.scene.fog = new THREE.FogExp2(colors.fogColor, colors.fogDensity);
    this.ambientLight.color.setHex(colors.ambientColor);
    this.dirLight.color.setHex(colors.sunColor);

    // Reset player position to arena center
    this.player.position.set(0, 0, 0);
    this.player.group.position.set(0, 0, 0);

    // Spawn Mobs
    this.mobManager.spawnWaveMobs(this.currentBiome, def.mobCount, !!def.bossWave);

    this.broadcastStats();
  }

  public nextWave() {
    if (this.currentWave < this.totalWaves) {
      const nextW = this.currentWave + 1;
      const nextB = BIOME_ORDER[nextW - 1];
      this.isTransitioning = true;
      this.playSound('defeat');

      setTimeout(() => {
        this.loadWave(nextW);
        this.isTransitioning = false;
        this.callbacks.onWaveComplete(this.currentWave - 1, nextB);
      }, 700);
    } else {
      // Game Complete! Victory!
      this.playSound('victory');
      this.callbacks.onGameOver(true, this.getStats());
    }
  }

  // --- Educational Answer Integration ---

  public onAnswerResult(isCorrect: boolean) {
    this.questionsAnswered++;
    if (isCorrect) {
      this.correctAnswers++;
      this.score += 150 * this.comboStreak;
      this.knowledgeXP += 100;
      this.comboStreak++;
      this.player.heal(30);
      this.powerUpTimer = 15; // 15s power-up
      this.playSound('correct');

      // Check if current wave mobs are defeated to advance
      if (this.mobManager.getAliveCount() === 0) {
        this.nextWave();
      }
    } else {
      this.comboStreak = 1;
      this.playSound('wrong');
    }
    this.broadcastStats();
  }

  // --- Controls & Inputs ---

  private handleKeyDown(e: KeyboardEvent) {
    this.keysDown[e.code] = true;

    if (e.code === 'KeyE') {
      this.triggerAttack();
    }
    if (e.code === 'Space') {
      this.player.jump();
      this.playSound('jump');
    }
    if (e.code === 'KeyQ' || e.code === 'Tab') {
      e.preventDefault();
      if (this.callbacks.onOpenQuestionDialog) {
        this.callbacks.onOpenQuestionDialog();
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keysDown[e.code] = false;
  }

  public triggerAttack() {
    if (!this.player.isSwinging) {
      this.player.triggerSwing();
      this.playSound('swing');

      const damage = this.powerUpTimer > 0 ? 35 : 22;
      const result = this.mobManager.checkPlayerAttack(
        this.player.position,
        this.player.rotationY,
        damage
      );

      if (result.hits > 0) {
        this.playSound('hit');
      }

      if (result.defeatedCount > 0) {
        this.score += result.defeatedCount * 60;
        this.knowledgeXP += result.xpEarned;
        this.broadcastStats();

        // If all mobs in wave are defeated, trigger wave completion!
        if (this.mobManager.getAliveCount() === 0) {
          setTimeout(() => {
            this.nextWave();
          }, 800);
        }
      }
    }
  }

  public rotateCamera(deltaAzimuth: number, deltaElevation: number) {
    this.cameraAzimuth -= deltaAzimuth;
    this.cameraElevation = Math.max(0.12, Math.min(1.2, this.cameraElevation + deltaElevation));
  }

  // --- Main Game Loop ---

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.loop);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!this.isPaused && !this.isTransitioning) {
      this.update(delta);
    }
    this.render();
  };

  private update(delta: number) {
    // 1. Process Movement Inputs (Keyboard + Virtual Joystick)
    let moveF = this.controlsInput.moveForward;
    let moveR = this.controlsInput.moveRight;

    if (this.keysDown['KeyW'] || this.keysDown['ArrowUp']) moveF += 1;
    if (this.keysDown['KeyS'] || this.keysDown['ArrowDown']) moveF -= 1;
    if (this.keysDown['KeyA'] || this.keysDown['ArrowLeft']) moveR -= 1;
    if (this.keysDown['KeyD'] || this.keysDown['ArrowRight']) moveR += 1;

    // Normalize
    const inputLen = Math.hypot(moveF, moveR);
    const isMoving = inputLen > 0.1;

    if (isMoving) {
      const normF = moveF / inputLen;
      const normR = moveR / inputLen;

      // Calculate movement angle in world space relative to camera azimuth
      // Forward vector based on cameraAzimuth:
      // forward: (sin(azimuth), cos(azimuth))
      const sinA = Math.sin(this.cameraAzimuth);
      const cosA = Math.cos(this.cameraAzimuth);

      const worldDirX = normR * cosA + normF * sinA;
      const worldDirZ = -normR * sinA + normF * cosA;

      const speed = this.powerUpTimer > 0 ? 7.2 : 5.0;
      const nextX = this.player.position.x + worldDirX * speed * delta;
      const nextZ = this.player.position.z + worldDirZ * speed * delta;

      // Clamp to arena boundary and resolve obstacle colliders
      const clamped = this.arenaManager.clampPositionToBounds(nextX, nextZ, 0.5);
      this.player.position.x = clamped.x;
      this.player.position.z = clamped.z;

      // Player faces movement direction
      this.player.targetRotationY = Math.atan2(worldDirX, worldDirZ);
    }

    // Power-up countdown
    if (this.powerUpTimer > 0) {
      this.powerUpTimer = Math.max(0, this.powerUpTimer - delta);
    }

    // 2. Update Player
    this.player.update(delta, isMoving);

    // 3. Update Mobs
    this.mobManager.update(delta, this.player.position, (dmg) => {
      this.player.takeDamage(dmg);
      this.playSound('hit');
      this.broadcastStats();

      if (this.player.health <= 0) {
        this.callbacks.onGameOver(false, this.getStats());
      }
    });

    // 4. Update Camera position (Smooth third person follow)
    const camX =
      this.player.position.x -
      Math.sin(this.cameraAzimuth) * Math.cos(this.cameraElevation) * this.cameraDistance;
    const camY =
      this.player.position.y +
      Math.sin(this.cameraElevation) * this.cameraDistance +
      1.5;
    const camZ =
      this.player.position.z -
      Math.cos(this.cameraAzimuth) * Math.cos(this.cameraElevation) * this.cameraDistance;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(
      this.player.position.x,
      this.player.position.y + 1.2,
      this.player.position.z
    );
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public getStats(): BattleWorldStats {
    return {
      score: this.score,
      knowledgeXP: this.knowledgeXP,
      wave: this.currentWave,
      totalWaves: this.totalWaves,
      currentArena: this.currentBiome,
      playerHealth: this.player.health,
      maxHealth: this.player.maxHealth,
      comboStreak: this.comboStreak,
      mobsRemaining: this.mobManager.getAliveCount(),
      totalMobsInWave: ARENA_DEFINITIONS[this.currentBiome].mobCount,
      questionsAnswered: this.questionsAnswered,
      correctAnswers: this.correctAnswers,
      powerUpActive: this.powerUpTimer > 0,
      powerUpTimeLeft: Math.round(this.powerUpTimer)
    };
  }

  private broadcastStats() {
    this.callbacks.onStatsUpdate(this.getStats());
  }

  public dispose() {
    this.stop();
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    window.removeEventListener('resize', this.onResizeBound);

    this.arenaManager.dispose();
    this.player.dispose();
    this.mobManager.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
    }
  }
}
