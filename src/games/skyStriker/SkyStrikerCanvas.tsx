import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildFighterJet } from './AircraftModel';
import { buildSkyEnvironment } from './EnvironmentManager';
import { SkyStrikerAudioManager } from './AudioManager';
import {
  AIRCRAFT_SKINS,
  AircraftSkinId,
  CameraMode,
  GraphicsQuality,
  ProjectedTargetHud,
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

    const skin = AIRCRAFT_SKINS.find((s) => s.id === skinId) || AIRCRAFT_SKINS[0];
    const jet = buildFighterJet(skin);
    jet.root.position.set(0, 4, 0);
    scene.add(jet.root);

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
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ResizeObserver for genuine fullscreen & orientation handling
    const handleResize = () => {
      if (!container) return;
      const cw = container.clientWidth || window.innerWidth;
      const ch = container.clientHeight || window.innerHeight;
      if (cw <= 0 || ch <= 0) return;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch, false);
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

        const clampedX = Math.max(-1, Math.min(1, steerX));
        const clampedY = Math.max(-1, Math.min(1, steerY));

        // Arcade Flight Physics
        const targetVx = clampedX * 26;
        const targetVy = clampedY * 18;
        jetVel.x += (targetVx - jetVel.x) * Math.min(1, dt * 6.5);
        jetVel.y += (targetVy - jetVel.y) * Math.min(1, dt * 6.5);

        jetPos.x = Math.max(-24, Math.min(24, jetPos.x + jetVel.x * dt));
        jetPos.y = Math.max(-2, Math.min(16, jetPos.y + jetVel.y * dt));

        // Smooth banking & pitch
        const targetBank = -clampedX * 0.58;
        const targetPitch = clampedY * 0.34;
        bankAngle += (targetBank - bankAngle) * Math.min(1, dt * 7);
        pitchAngle += (targetPitch - pitchAngle) * Math.min(1, dt * 7);

        const targetSpeed = isBoosting ? 84 : 50;
        forwardSpeed += (targetSpeed - forwardSpeed) * Math.min(1, dt * 4);
        audioManager.setEnginePitch((forwardSpeed - 45) / 40, isBoosting);

        // Gentle atmospheric turbulence
        const turbY = reducedMotionRef.current ? 0 : Math.sin(now * 0.004) * 0.12;
        jet.root.position.set(jetPos.x, jetPos.y + turbY, jetPos.z);
        jet.root.rotation.set(pitchAngle, -clampedX * 0.12, bankAngle);

        // Animated control surfaces & twin exhaust glow
        jet.leftAileron.rotation.x = clampedX * 0.45;
        jet.rightAileron.rotation.x = -clampedX * 0.45;
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
          const bob = reducedMotionRef.current ? 0 : Math.sin(now * 0.0025 + idx * 1.4) * 0.8;
          t.group.position.set(t.basePos.x, t.basePos.y + bob, t.basePos.z);
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

        // Third-person rear chase camera
        const mode = cameraModeRef.current;
        const camFollowFactor = mode === 'reduced' ? 0.25 : mode === 'cinematic' ? 0.62 : 0.45;
        const camDistZ = isBoosting ? 14.6 : 13.2;
        const desiredCamX = jetPos.x * camFollowFactor;
        const desiredCamY = jetPos.y + (mode === 'cinematic' ? 3.8 : 4.2);
        camera.position.x += (desiredCamX - camera.position.x) * Math.min(1, dt * 6);
        camera.position.y += (desiredCamY - camera.position.y) * Math.min(1, dt * 6);
        camera.position.z += (camDistZ - camera.position.z) * Math.min(1, dt * 5);

        const lookTarget = new THREE.Vector3(jetPos.x * 0.65, jetPos.y + 1.2, -28);
        camera.lookAt(lookTarget);
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

          callbacksRef.current.onHudUpdate({
            speedKts: Math.round(forwardSpeed * 11),
            altitudeFt: Math.round(1200 + jetPos.y * 140),
            isBoosting,
            turbulenceActive: !reducedMotionRef.current,
            selectedTargetId,
            selectedAnswerId: targets.find((t) => t.targetId === selectedTargetId)?.answerId || null,
            lockProgress,
            isLocked: lockProgress >= 0.95,
            targets: projected
          });
        }
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
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
