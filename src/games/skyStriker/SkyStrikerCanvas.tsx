import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  AdaptivePostProcessingPipeline,
  AtmosphericParticleSystem,
  buildAtmosphericEnvMap,
  CinematicCameraController,
  disposeThreeScene
} from '../engine/VisualMasterpieceEngine';
import { buildEnemyInterceptorJet, buildFighterJet } from './AircraftModel';
import { EnergyCombatSystem } from '../engine/CombatAndTargetsEngine';
import { buildSkyEnvironment } from './EnvironmentManager';
import { SkyStrikerAudioManager } from './AudioManager';
import {
  AIRCRAFT_SKINS,
  AircraftSkinId,
  CameraMode,
  GraphicsQuality,
  ProjectedTargetHud,
  RadarBlip,
  SkyStrikerHudSnapshot,
  SkyStrikerQuestion,
  WorldId
} from './types';

export interface SkyStrikerMobileInput {
  moveX: number; // -1..1
  moveY: number; // -1..1 (positive = climb)
  boost: boolean;
}

export interface SkyStrikerCanvasProps {
  paused: boolean;
  worldId: WorldId;
  quality: GraphicsQuality;
  cameraMode: CameraMode;
  skinId: AircraftSkinId;
  reducedMotion: boolean;
  currentQuestion: SkyStrikerQuestion;
  audioManager: SkyStrikerAudioManager;
  selectTargetSignal: number;
  pulseSignal: number;
  selectedOptionOverride: string | null; // optional direct answerId selection
  mobileInputRef: React.MutableRefObject<SkyStrikerMobileInput>;
  onHudUpdate: (snapshot: SkyStrikerHudSnapshot) => void;
  onAnswerEvaluated: (answerId: string) => void;
  onPauseRequested: () => void;
}

interface TargetEntity {
  targetId: string;
  answerId: string;
  label: 'A' | 'B' | 'C';
  text: string;
  group: THREE.Group;
  outerRing: THREE.Mesh;
  innerRing: THREE.Mesh;
  coreSphere: THREE.Mesh;
  shieldMesh: THREE.Mesh;
  basePos: THREE.Vector3;
  validationState: 'idle' | 'correct' | 'incorrect';
}

export const SkyStrikerCanvas: React.FC<SkyStrikerCanvasProps> = ({
  paused,
  worldId,
  quality,
  cameraMode,
  skinId,
  reducedMotion,
  currentQuestion,
  audioManager,
  selectTargetSignal,
  pulseSignal,
  selectedOptionOverride,
  mobileInputRef,
  onHudUpdate,
  onAnswerEvaluated,
  onPauseRequested
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const questionRef = useRef(currentQuestion);
  questionRef.current = currentQuestion;

  const callbacksRef = useRef({ onHudUpdate, onAnswerEvaluated, onPauseRequested });
  callbacksRef.current = { onHudUpdate, onAnswerEvaluated, onPauseRequested };

  // Signal triggers
  const triggerSelectRef = useRef<() => void>(() => {});
  const triggerPulseRef = useRef<() => void>(() => {});
  const overrideSelectRef = useRef<(answerId: string) => void>(() => {});

  useEffect(() => {
    if (selectTargetSignal > 0) triggerSelectRef.current();
  }, [selectTargetSignal]);

  useEffect(() => {
    if (pulseSignal > 0) triggerPulseRef.current();
  }, [pulseSignal]);

  useEffect(() => {
    if (selectedOptionOverride) overrideSelectRef.current(selectedOptionOverride);
  }, [selectedOptionOverride]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, w / Math.max(1, h), 0.2, 650);
    camera.position.set(0, 5.2, 13.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: quality !== 'low',
      powerPreference: 'high-performance'
    });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1.5));
    renderer.shadowMap.enabled = quality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const env = buildSkyEnvironment(scene, worldId, quality);

    // AAA Visual Masterpiece Engine: IBL Sky Reflections + Bloom + Slipstream Particles + Dynamic FOV Camera
    const envTexture = buildAtmosphericEnvMap(
      renderer,
      worldId === 'future_city' ? '#090D24' : worldId === 'coastal_sunset' ? '#FB923C' : '#38BDF8',
      worldId === 'desert_storm' || worldId === 'coastal_sunset' ? '#FDBA74' : '#BAE6FD',
      '#0F172A'
    );
    scene.environment = envTexture;

    const postPipeline = new AdaptivePostProcessingPipeline(
      renderer,
      scene,
      camera,
      w,
      h,
      quality,
      { strength: 0.44, radius: 0.56, threshold: 0.78 }
    );

    const slipstreamParticles = new AtmosphericParticleSystem({
      count: quality === 'low' ? 45 : 130,
      bounds: { x: 44, y: 20, z: 68 },
      center: new THREE.Vector3(0, 6, -24),
      color: '#E0F2FE',
      size: 0.3,
      opacity: 0.55,
      driftVel: new THREE.Vector3(0, 0, 26)
    });
    scene.add(slipstreamParticles.points);

    const camController = new CinematicCameraController(58, 1.2);

    const skin = AIRCRAFT_SKINS.find((s) => s.id === skinId) || AIRCRAFT_SKINS[0];
    const jet = buildFighterJet(skin);
    jet.root.position.set(0, 4, 0);
    scene.add(jet.root);

    const jetShieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.8, 18, 14),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.25,
        wireframe: true
      })
    );
    jetShieldMesh.visible = false;
    jet.root.add(jetShieldMesh);

    const combatSystem = new EnergyCombatSystem(100);
    const enemySquadron = [0, 1, 2].map((idx) => {
      const rig = buildEnemyInterceptorJet(idx);
      rig.root.scale.setScalar(0.88);
      rig.root.position.set((idx - 1) * 22, 9 + idx * 2, -55 - idx * 14);
      scene.add(rig.root);
      return {
        id: `enemy-jet-${idx}`,
        rig,
        phase: idx * 2.1,
        attackCooldown: 2.2 + idx * 1.1,
        baseX: (idx - 1) * 19,
        baseY: 8 + idx * 2.2,
        baseZ: -52 - idx * 12
      };
    });

    // Three Holographic Answer Targets
    const targetGroupRoot = new THREE.Group();
    scene.add(targetGroupRoot);
    let targets: TargetEntity[] = [];

    // Energy Pulse Beam & Particle Burst Group
    const effectsGroup = new THREE.Group();
    scene.add(effectsGroup);

    const particles: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3; life: number }> = [];
    let activeBeam: { mesh: THREE.Mesh; life: number } | null = null;

    // Flight & Lock-On State
    const jetPos = new THREE.Vector3(0, 4, 0);
    const jetVel = new THREE.Vector2(0, 0);
    let bankAngle = 0;
    let pitchAngle = 0;
    let forwardSpeed = 48;
    let selectedTargetId: string | null = null;
    let lockProgress = 0;
    let evaluatedQuestionId: string | null = null;
    let lockSoundPlayed = false;

    const spawnTargetsForQuestion = (q: SkyStrikerQuestion) => {
      targetGroupRoot.clear();
      targets = [];
      selectedTargetId = null;
      lockProgress = 0;
      lockSoundPlayed = false;
      evaluatedQuestionId = null;

      // Arrange 3 targets ahead of aircraft (Left, Center, Right) with subtle depth variation
      const xOffsets = [-16.5, 0, 16.5];
      const yOffsets = [4.5 + (Math.random() - 0.5) * 3, 6.0 + (Math.random() - 0.5) * 3, 4.5 + (Math.random() - 0.5) * 3];
      const zOffsets = [-46 - Math.random() * 6, -50 - Math.random() * 6, -46 - Math.random() * 6];

      q.options.slice(0, 3).forEach((opt, idx) => {
        const tg = new THREE.Group();
        const pos = new THREE.Vector3(xOffsets[idx], yOffsets[idx], zOffsets[idx]);
        tg.position.copy(pos);

        // Uniform cyan holographic appearance (never leaks correct answer!)
        const outerRing = new THREE.Mesh(
          new THREE.TorusGeometry(3.1, 0.16, 12, 36),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.9 })
        );
        tg.add(outerRing);

        const innerRing = new THREE.Mesh(
          new THREE.TorusGeometry(2.25, 0.1, 10, 30),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
        );
        tg.add(innerRing);

        const coreSphere = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.15, 1),
          new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x0891b2,
            emissiveIntensity: 0.85,
            metalness: 0.3,
            roughness: 0.2,
            transparent: true,
            opacity: 0.85
          })
        );
        tg.add(coreSphere);

        // Harmless energy shield (revealed only on incorrect evaluation)
        const shieldMesh = new THREE.Mesh(
          new THREE.SphereGeometry(3.4, 20, 16),
          new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            wireframe: true,
            transparent: true,
            opacity: 0.0
          })
        );
        tg.add(shieldMesh);

        targetGroupRoot.add(tg);
        targets.push({
          targetId: `target-${q.questionId}-${idx}`,
          answerId: opt.answerId,
          label: opt.label,
          text: opt.text,
          group: tg,
          outerRing,
          innerRing,
          coreSphere,
          shieldMesh,
          basePos: pos.clone(),
          validationState: 'idle'
        });
      });

      // Pre-select center target so keyboard/touch players can always cycle or fire immediately
      if (targets[1]) {
        selectedTargetId = targets[1].targetId;
      }
    };

    spawnTargetsForQuestion(questionRef.current);

    const spawnBurst = (origin: THREE.Vector3, colorHex: number) => {
      const count = quality === 'low' ? 14 : 28;
      for (let i = 0; i < count; i++) {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 6, 6),
          new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1 })
        );
        p.position.copy(origin);
        effectsGroup.add(p);
        particles.push({
          mesh: p,
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 24,
            (Math.random() - 0.5) * 24,
            (Math.random() - 0.5) * 24
          ),
          life: 0.85
        });
      }
    };

    const fireEnergyPulse = () => {
      if (pausedRef.current) return;
      const q = questionRef.current;
      if (evaluatedQuestionId === q.questionId) return; // Single evaluation guard

      const target = targets.find((t) => t.targetId === selectedTargetId) || targets[0];
      if (!target) return;

      evaluatedQuestionId = q.questionId;
      audioManager.playEnergyPulse();

      // Fictional cyan energy pulse beam from aircraft nose to target
      const start = jetPos.clone().add(new THREE.Vector3(0, 0, -2.5));
      const end = target.group.position.clone();
      const dist = start.distanceTo(end);
      const beamGeo = new THREE.CylinderGeometry(0.18, 0.28, dist, 10);
      beamGeo.rotateX(Math.PI / 2);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.95 });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.copy(start).lerp(end, 0.5);
      beamMesh.lookAt(end);
      effectsGroup.add(beamMesh);

      if (activeBeam) effectsGroup.remove(activeBeam.mesh);
      activeBeam = { mesh: beamMesh, life: 0.35 };
      camController.addShake(0.32);

      const isCorrect = target.answerId === q.correctAnswerId;
      if (isCorrect) {
        target.validationState = 'correct';
        (target.outerRing.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
        (target.coreSphere.material as THREE.MeshStandardMaterial).color.setHex(0x34d399);
        spawnBurst(target.group.position, 0x34d399);
      } else {
        target.validationState = 'incorrect';
        (target.shieldMesh.material as THREE.MeshBasicMaterial).opacity = 0.65;
        (target.outerRing.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
      }

      callbacksRef.current.onAnswerEvaluated(target.answerId);
    };

    const cycleTargetSelection = () => {
      if (targets.length === 0) return;
      const idx = targets.findIndex((t) => t.targetId === selectedTargetId);
      const next = targets[(idx + 1) % targets.length];
      selectedTargetId = next.targetId;
      lockProgress = 0.65;
      lockSoundPlayed = false;
    };

    triggerSelectRef.current = cycleTargetSelection;
    triggerPulseRef.current = fireEnergyPulse;
    overrideSelectRef.current = (answerId: string) => {
      const found = targets.find((t) => t.answerId === answerId);
      if (found) {
        selectedTargetId = found.targetId;
        lockProgress = 1;
      }
    };

    // Keyboard Input Tracking
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      keys[code] = true;
      if (code === 'Escape') {
        e.preventDefault();
        callbacksRef.current.onPauseRequested();
      } else if (code === 'KeyE') {
        e.preventDefault();
        cycleTargetSelection();
      } else if (code === 'Space') {
        e.preventDefault();
        fireEnergyPulse();
      } else if (code === 'KeyC') {
        e.preventDefault();
        const dirX = keys['KeyA'] || keys['ArrowLeft'] ? -1 : 1;
        combatSystem.triggerDodge(new THREE.Vector3(dirX, 0, 0));
      } else if (code === 'KeyR') {
        e.preventDefault();
        combatSystem.activateShield(2.6);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Free-look camera mouse drag + double-click reset
    let freeLookYaw = 0;
    let freeLookPitch = 0;
    let draggingLook = false;
    let lastLookX = 0;
    let lastLookY = 0;
    const onMouseDown = (e: MouseEvent) => {
      if (pausedRef.current) return;
      draggingLook = true;
      lastLookX = e.clientX;
      lastLookY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingLook || pausedRef.current) return;
      freeLookYaw = THREE.MathUtils.clamp(freeLookYaw - (e.clientX - lastLookX) * 0.004, -0.85, 0.85);
      freeLookPitch = THREE.MathUtils.clamp(freeLookPitch + (e.clientY - lastLookY) * 0.003, -0.35, 0.45);
      lastLookX = e.clientX;
      lastLookY = e.clientY;
    };
    const onMouseUp = () => {
      draggingLook = false;
    };
    const onDblClick = () => {
      freeLookYaw = 0;
      freeLookPitch = 0;
    };
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('dblclick', onDblClick);

    // ResizeObserver for genuine fullscreen & orientation handling
    const handleResize = () => {
      if (!container) return;
      const cw = container.clientWidth || window.innerWidth;
      const ch = container.clientHeight || window.innerHeight;
      if (cw <= 0 || ch <= 0) return;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      postPipeline.resize(cw, ch);
    };
    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let lastQuestionId = questionRef.current.questionId;
    let lastTime = performance.now();
    let hudTimer = 0;
    let rafId = 0;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Detect question change
      if (questionRef.current.questionId !== lastQuestionId) {
        lastQuestionId = questionRef.current.questionId;
        spawnTargetsForQuestion(questionRef.current);
      }

      if (!pausedRef.current) {
        const mob = mobileInputRef.current;
        const steerX =
          (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) -
          (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0) +
          mob.moveX;
        const steerY =
          (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) -
          (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0) +
          mob.moveY;
        const isBoosting = Boolean(keys['ShiftLeft'] || keys['ShiftRight'] || mob.boost);
        const isBraking = Boolean(keys['ControlLeft'] || keys['ControlRight']);
        const yawInput = (keys['KeyQ'] ? 1 : 0) - (keys['KeyE'] ? 1 : 0);

        const clampedX = Math.max(-1, Math.min(1, steerX - yawInput * 0.4));
        const clampedY = Math.max(-1, Math.min(1, steerY));

        // Smooth Flight Physics (Acceleration, Deceleration & Banking)
        const targetVx = clampedX * 26;
        const targetVy = clampedY * 18;
        jetVel.x += (targetVx - jetVel.x) * Math.min(1, dt * 6.5);
        jetVel.y += (targetVy - jetVel.y) * Math.min(1, dt * 6.5);

        jetPos.x = Math.max(-44, Math.min(44, jetPos.x + jetVel.x * dt));
        jetPos.y = Math.max(-4, Math.min(24, jetPos.y + jetVel.y * dt));

        // Smooth banking & pitch
        const targetBank = -clampedX * 0.58 + (combatSystem.dodgeActive ? Math.PI * 2 * (combatSystem.dodgeRemaining / 0.28) : 0);
        const targetPitch = clampedY * 0.34;
        bankAngle += (targetBank - bankAngle) * Math.min(1, dt * 7);
        pitchAngle += (targetPitch - pitchAngle) * Math.min(1, dt * 7);

        if (combatSystem.dodgeActive) {
          jetPos.x = Math.max(-44, Math.min(44, jetPos.x + combatSystem.dodgeDirection.x * 22 * dt));
        }
        jetShieldMesh.visible = combatSystem.shieldActive;
        if (combatSystem.shieldActive) {
          jetShieldMesh.rotation.y += dt * 2.5;
        }

        // Update Enemy Squadron AI (patrol, bank, track player, launch telegraphed energy orbs)
        const elapsedSec = now * 0.001;
        for (const enemy of enemySquadron) {
          const tPhase = elapsedSec * 0.65 + enemy.phase;
          const targetEx = THREE.MathUtils.lerp(enemy.baseX + Math.sin(tPhase) * 14, jetPos.x * 0.65, 0.28);
          const targetEy = enemy.baseY + Math.cos(tPhase * 1.3) * 3.5;
          const dx = targetEx - enemy.rig.root.position.x;
          enemy.rig.root.position.x += dx * Math.min(1, dt * 1.8);
          enemy.rig.root.position.y += (targetEy - enemy.rig.root.position.y) * Math.min(1, dt * 1.8);
          enemy.rig.root.position.z = enemy.baseZ + Math.sin(tPhase * 0.7) * 8;
          enemy.rig.root.rotation.z = THREE.MathUtils.clamp(-dx * 0.08, -0.55, 0.55);
          enemy.rig.root.rotation.y = Math.PI; // facing player

          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 3.6 + Math.random() * 1.4;
            const orbOrigin = enemy.rig.root.position.clone().add(new THREE.Vector3(0, 0, 3.5));
            const orbDir = jetPos.clone().sub(orbOrigin);
            const orbMesh = new THREE.Mesh(
              new THREE.SphereGeometry(0.55, 10, 10),
              new THREE.MeshBasicMaterial({ color: 0xef4444 })
            );
            effectsGroup.add(orbMesh);
            combatSystem.spawnProjectile({
              owner: 'enemy',
              origin: orbOrigin,
              direction: orbDir,
              speed: 26,
              radius: 0.75,
              ttl: 3.2,
              damage: 10,
              mesh: orbMesh
            });
          }
        }

        const combatStep = combatSystem.step(dt, jetPos, 1.85);
        for (const em of combatStep.expiredMeshes) {
          effectsGroup.remove(em);
        }
        if (combatStep.playerDamaged > 0) {
          camController.addShake(0.35);
          if (combatSystem.playerHp <= 0) {
            combatSystem.reset(100);
          }
        }

        const targetSpeed = isBoosting ? 84 : isBraking ? 30 : 50;
        forwardSpeed += (targetSpeed - forwardSpeed) * Math.min(1, dt * 4);
        audioManager.setEnginePitch((forwardSpeed - 30) / 55, isBoosting);

        // Gentle atmospheric turbulence
        const turbY = reducedMotionRef.current ? 0 : Math.sin(now * 0.004) * 0.12;
        jet.root.position.set(jetPos.x, jetPos.y + turbY, jetPos.z);
        jet.root.rotation.set(pitchAngle, -clampedX * 0.12, bankAngle);

        // Animated control surfaces, landing gear retraction, wingtip strobes & twin exhaust glow
        jet.leftAileron.rotation.x = clampedX * 0.45;
        jet.rightAileron.rotation.x = -clampedX * 0.45;
        const gearTarget = jetPos.y < 1.2 ? 1 : 0.001;
        jet.landingGearGroup.scale.y += (gearTarget - jet.landingGearGroup.scale.y) * Math.min(1, dt * 5);
        jet.landingGearGroup.visible = jet.landingGearGroup.scale.y > 0.05;
        const strobeOn = Math.floor(now / 420) % 2 === 0;
        jet.portStrobe.visible = strobeOn;
        jet.starboardStrobe.visible = strobeOn;
        const exhaustScale = isBoosting ? 1.75 + Math.sin(now * 0.04) * 0.25 : 0.95 + Math.sin(now * 0.03) * 0.1;
        jet.leftExhaust.scale.set(1, 1, exhaustScale);
        jet.rightExhaust.scale.set(1, 1, exhaustScale);
        jet.exhaustLight.intensity = isBoosting ? 3.8 : 2.0;

        // Scroll 3D world environment
        env.update(dt, forwardSpeed);

        // Animate holographic targets & find closest aligned target for lock-on
        let closestDist = Infinity;
        let closestTarget: TargetEntity | null = null;

        targets.forEach((t, idx) => {
          const tSec = now * 0.0018 + idx * 1.4;
          let ox = 0;
          let oy = 0;
          if (!reducedMotionRef.current) {
            if (idx === 0) {
              ox = Math.sin(tSec) * 1.6;
            } else if (idx === 1) {
              oy = Math.sin(tSec * 1.15) * 1.25;
            } else {
              ox = Math.sin(tSec) * 1.3;
              oy = Math.sin(tSec * 2) * 0.75;
            }
          }
          t.group.position.set(t.basePos.x + ox, t.basePos.y + oy, t.basePos.z);
          t.outerRing.rotation.z += dt * 1.1;
          t.innerRing.rotation.z -= dt * 1.6;
          t.coreSphere.rotation.y += dt * 1.4;

          // Alignment distance on X-Y plane
          const dx = t.group.position.x - jetPos.x;
          const dy = t.group.position.y - jetPos.y;
          const alignDist = Math.hypot(dx, dy);
          if (alignDist < closestDist) {
            closestDist = alignDist;
            closestTarget = t;
          }
        });

        // Auto-select target when aircraft steers close to it
        if (closestTarget && closestDist < 11.5) {
          if (selectedTargetId !== (closestTarget as TargetEntity).targetId) {
            selectedTargetId = (closestTarget as TargetEntity).targetId;
            lockProgress = 0.35;
            lockSoundPlayed = false;
          }
        }

        // Advance lock-on progress
        if (selectedTargetId) {
          lockProgress = Math.min(1, lockProgress + dt * 1.35);
          if (lockProgress >= 1 && !lockSoundPlayed) {
            lockSoundPlayed = true;
            audioManager.playTargetLock();
          }
        }

        // Highlight selected target ring scale
        targets.forEach((t) => {
          const isSel = t.targetId === selectedTargetId;
          const targetScale = isSel ? 1.18 + Math.sin(now * 0.008) * 0.05 : 1.0;
          t.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), dt * 8);
        });

        // Third-person rear chase camera with Dynamic FOV boost & slipstream particles
        slipstreamParticles.update(dt * (isBoosting ? 1.8 : 1.0), now * 0.001, new THREE.Vector3(jetPos.x, jetPos.y + 1, -24));

        const mode = cameraModeRef.current;
        const camFollowFactor = mode === 'reduced' ? 0.25 : mode === 'cinematic' ? 0.62 : 0.45;
        const camDistZ = isBoosting ? 14.6 : 13.2;
        let desiredCamPos = new THREE.Vector3(
          jetPos.x * camFollowFactor + Math.sin(freeLookYaw) * 9,
          jetPos.y + (mode === 'cinematic' ? 3.8 : 4.2) + freeLookPitch * 6,
          camDistZ * Math.cos(freeLookYaw * 0.4)
        );
        let lookTarget = new THREE.Vector3(
          jetPos.x * 0.65 - Math.sin(freeLookYaw) * 14,
          jetPos.y + 1.2 - freeLookPitch * 8,
          -28
        );

        if (mode === 'cockpit') {
          desiredCamPos = new THREE.Vector3(jetPos.x, jetPos.y + 0.85, jetPos.z - 1.35);
          lookTarget = new THREE.Vector3(jetPos.x * 0.9, jetPos.y + 0.6, -40);
        } else if (mode === 'side') {
          desiredCamPos = new THREE.Vector3(jetPos.x + 11.5, jetPos.y + 2.2, jetPos.z + 2.5);
          lookTarget = new THREE.Vector3(jetPos.x, jetPos.y + 0.4, jetPos.z - 4);
        }

        if (isBoosting && !reducedMotionRef.current) {
          camController.setTargetFov(66);
        } else {
          camController.resetFov();
        }

        camController.update(
          camera,
          desiredCamPos,
          lookTarget,
          dt,
          mode === 'cockpit' ? 16 : 6.5,
          mode === 'cockpit' ? 16 : 8.5
        );
        if (mode === 'cinematic' && !reducedMotionRef.current) {
          camera.rotation.z = bankAngle * 0.14;
        }

        // Update beam & particles
        if (activeBeam) {
          activeBeam.life -= dt;
          (activeBeam.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, activeBeam.life / 0.35);
          if (activeBeam.life <= 0) {
            effectsGroup.remove(activeBeam.mesh);
            activeBeam = null;
          }
        }
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt;
          p.mesh.position.addScaledVector(p.vel, dt);
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.life / 0.85);
          if (p.life <= 0) {
            effectsGroup.remove(p.mesh);
            particles.splice(i, 1);
          }
        }

        // Throttle HUD projection updates (~30fps)
        hudTimer += dt;
        if (hudTimer >= 0.033) {
          hudTimer = 0;
          const cw = container.clientWidth || window.innerWidth;
          const ch = container.clientHeight || window.innerHeight;
          const projected: ProjectedTargetHud[] = targets.map((t) => {
            const worldP = t.group.position.clone();
            worldP.y += 3.9;
            worldP.project(camera);
            const isSel = t.targetId === selectedTargetId;
            return {
              targetId: t.targetId,
              answerId: t.answerId,
              label: t.label,
              text: t.text,
              screenX: (worldP.x * 0.5 + 0.5) * cw,
              screenY: (-worldP.y * 0.5 + 0.5) * ch,
              visible: worldP.z < 1,
              distance: Math.round(jetPos.distanceTo(t.group.position)),
              isSelected: isSel,
              lockProgress: isSel ? lockProgress : 0,
              isLocked: isSel && lockProgress >= 0.95,
              validationState: t.validationState
            };
          });

          const radarBlips: RadarBlip[] = [
            ...enemySquadron.map((e) => ({
              id: e.id,
              kind: 'enemy' as const,
              relX: THREE.MathUtils.clamp((e.rig.root.position.x - jetPos.x) / 45, -1, 1),
              relZ: THREE.MathUtils.clamp((e.rig.root.position.z - jetPos.z) / 80, -1, 1)
            })),
            ...targets.map((t) => ({
              id: t.targetId,
              kind: 'target' as const,
              relX: THREE.MathUtils.clamp((t.group.position.x - jetPos.x) / 45, -1, 1),
              relZ: THREE.MathUtils.clamp((t.group.position.z - jetPos.z) / 80, -1, 1)
            }))
          ];

          callbacksRef.current.onHudUpdate({
            speedKts: Math.round(forwardSpeed * 11),
            altitudeFt: Math.round(1200 + jetPos.y * 140),
            isBoosting,
            turbulenceActive: !reducedMotionRef.current,
            selectedTargetId,
            selectedAnswerId: targets.find((t) => t.targetId === selectedTargetId)?.answerId || null,
            lockProgress,
            isLocked: lockProgress >= 0.95,
            targets: projected,
            playerHp: combatSystem.playerHp,
            shieldActive: combatSystem.shieldActive,
            dodgeReady: combatSystem.dodgeCooldown <= 0,
            radarBlips
          });
        }
      }

      postPipeline.render(dt);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('dblclick', onDblClick);
      disposeThreeScene(scene, renderer, postPipeline, envTexture);
    };
  }, [worldId, quality, skinId, audioManager, mobileInputRef]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    />
  );
};
