import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  AdaptivePostProcessingPipeline,
  AtmosphericParticleSystem,
  buildAtmosphericEnvMap,
  CinematicCameraController,
  createAnimatedWaterSurface,
  createAtmosphericSkyDome,
  createVolumetricCloudLayer,
  disposeThreeScene
} from '../engine/VisualMasterpieceEngine';
import { WarOfWordsAudioManager } from './AudioManager';
import { selectThreeTargets, validateWarOfWordsAnswer } from './questionBank';
import {
  AnswerOutcome,
  GraphicsQuality,
  OptionId,
  WarriorCustomization,
  WarWordQuestion,
  WorldId
} from './types';
import {
  AnswerSentinelRig,
  buildAnswerSentinel,
  buildShadowWarrior,
  buildWorldEnvironment,
  updateSentinelLabel
} from './WarriorModels';

export interface WarHudSnapshot {
  selectedTargetIndex: number | null;
  selectedOptionId: OptionId | null;
  selectedOptionText: string | null;
  inAttackRange: boolean;
  playerX: number;
  targets: Array<{ index: number; id: OptionId; text: string; x: number }>;
  objectiveDistanceMeters?: number;
  objectiveLabel?: string;
  nearbyNpcPrompt?: string | null;
  activeNpcDialogue?: { name: string; role: string; dialogue: string } | null;
}

export interface WarOfWordsCanvasProps {
  paused: boolean;
  worldId: WorldId;
  quality: GraphicsQuality;
  customization: WarriorCustomization;
  currentQuestion: WarWordQuestion;
  audioManager: WarOfWordsAudioManager;
  attackSignal: number;
  selectNearestSignal: number;
  specialSignal: number;
  dodgeSignal?: number;
  guardSignal?: number;
  mobileInputRef: React.MutableRefObject<{
    moveX: number;
    moveY?: number;
    jump: boolean;
    dodge?: boolean;
    guard?: boolean;
  }>;
  onHudUpdate: (hud: WarHudSnapshot) => void;
  onAnswerEvaluated: (outcome: AnswerOutcome) => void;
  onSpecialPulse: () => void;
  onPauseRequested: () => void;
}

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

const TARGET_POSITIONS_X = [4, 13, 22];

export const WarOfWordsCanvas: React.FC<WarOfWordsCanvasProps> = ({
  paused,
  worldId,
  quality,
  customization,
  currentQuestion,
  audioManager,
  attackSignal,
  selectNearestSignal,
  specialSignal,
  dodgeSignal = 0,
  guardSignal = 0,
  mobileInputRef,
  onHudUpdate,
  onAnswerEvaluated,
  onSpecialPulse,
  onPauseRequested
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const questionRef = useRef(currentQuestion);
  questionRef.current = currentQuestion;

  const callbacksRef = useRef({
    onHudUpdate,
    onAnswerEvaluated,
    onSpecialPulse,
    onPauseRequested
  });
  callbacksRef.current = {
    onHudUpdate,
    onAnswerEvaluated,
    onSpecialPulse,
    onPauseRequested
  };

  const sentinelsRef = useRef<AnswerSentinelRig[]>([]);
  const evaluatedIdsRef = useRef<Set<string>>(new Set());
  const triggerAttackRef = useRef<(() => void) | null>(null);
  const triggerSelectNearestRef = useRef<(() => void) | null>(null);
  const triggerSpecialRef = useRef<(() => void) | null>(null);
  const triggerDodgeRef = useRef<(() => void) | null>(null);
  const triggerGuardRef = useRef<(() => void) | null>(null);
  const resetPlayerForQuestionRef = useRef<(() => void) | null>(null);

  // Sync new question options onto the 3 Answer Sentinels & randomize enemy Z/X offsets
  useEffect(() => {
    const sentinels = sentinelsRef.current;
    if (sentinels.length !== 3) return;
    const chosen = selectThreeTargets(currentQuestion);
    const shuffledSlots = [...TARGET_POSITIONS_X].sort(() => Math.random() - 0.5);
    sentinels.forEach((rig, idx) => {
      const opt = chosen[idx] || { id: 'A' as OptionId, text: '...' };
      rig.group.visible = true;
      rig.group.scale.setScalar(1);
      rig.group.position.x = shuffledSlots[idx];
      rig.group.position.z = (idx - 1) * 1.1;
      updateSentinelLabel(rig, opt.id, opt.text, false);
    });
    resetPlayerForQuestionRef.current?.();
  }, [currentQuestion]);

  useEffect(() => {
    if (attackSignal > 0) triggerAttackRef.current?.();
  }, [attackSignal]);

  useEffect(() => {
    if (selectNearestSignal > 0) triggerSelectNearestRef.current?.();
  }, [selectNearestSignal]);

  useEffect(() => {
    if (specialSignal > 0) triggerSpecialRef.current?.();
  }, [specialSignal]);

  useEffect(() => {
    if (dodgeSignal > 0) triggerDodgeRef.current?.();
  }, [dodgeSignal]);

  useEffect(() => {
    if (guardSignal > 0) triggerGuardRef.current?.();
  }, [guardSignal]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.2, 160);
    camera.position.set(-4, 4.2, 13.5);

    const renderer = new THREE.WebGLRenderer({ antialias: quality !== 'low', powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    const maxDpr = quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    renderer.shadowMap.enabled = quality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const env = buildWorldEnvironment(scene, worldId, quality);
    scene.background = new THREE.Color(env.skyColor);
    scene.fog = new THREE.FogExp2(env.fogColor, 0.02);

    // AAA Visual Masterpiece Engine: IBL Environment + Sky Dome + Bloom + Arcane Embers + Cinematic Camera
    const envTexture = buildAtmosphericEnvMap(renderer, env.skyColor, env.fogColor, '#020617');
    scene.environment = envTexture;

    const skyDome = createAtmosphericSkyDome({
      radius: 140,
      topColor: env.skyColor,
      horizonColor: env.fogColor,
      bottomColor: '#020617',
      sunColor: '#E0F2FE',
      sunDirection: new THREE.Vector3(0.35, 0.4, -0.85),
      starIntensity: 0.75
    });
    scene.add(skyDome.mesh);

    const postPipeline = new AdaptivePostProcessingPipeline(
      renderer,
      scene,
      camera,
      w,
      h,
      quality,
      { strength: 0.45, radius: 0.55, threshold: 0.76 }
    );

    const arcaneParticles = new AtmosphericParticleSystem({
      count: quality === 'low' ? 40 : 120,
      bounds: { x: 42, y: 12, z: 18 },
      center: new THREE.Vector3(8, 5, -2),
      color: customization.glowColor,
      size: 0.32,
      opacity: 0.72,
      driftVel: new THREE.Vector3(0.18, 0.38, 0.08)
    });
    scene.add(arcaneParticles.points);

    const moonWater = createAnimatedWaterSurface({
      width: 90,
      depth: 18,
      segments: quality === 'low' ? 16 : 32,
      deepColor: 0x0f172a,
      shallowColor: 0x1d4ed8,
      skyColor: env.skyColor,
      waveHeight: 0.09,
      opacity: 0.85
    });
    moonWater.mesh.position.set(8, -0.32, -11);
    scene.add(moonWater.mesh);

    const cloudLayer = createVolumetricCloudLayer({
      count: quality === 'low' ? 5 : 11,
      spreadX: 90,
      spreadZ: 45,
      altitude: 18,
      tintColor: 0xcbd5e1,
      windSpeed: 1.1
    });
    cloudLayer.group.position.z = -18;
    scene.add(cloudLayer.group);

    const camController = new CinematicCameraController(48, 1.3);

    // Cinematic Blue Moonlight + Ambient
    const ambient = new THREE.HemisphereLight('#93C5FD', '#0F172A', 0.72);
    scene.add(ambient);

    const moonLight = new THREE.DirectionalLight('#BAE6FD', 1.55);
    moonLight.position.set(12, 22, 12);
    moonLight.castShadow = quality !== 'low';
    const shadowSize = quality === 'high' ? 1024 : 512;
    moonLight.shadow.mapSize.width = shadowSize;
    moonLight.shadow.mapSize.height = shadowSize;
    moonLight.shadow.camera.left = -28;
    moonLight.shadow.camera.right = 28;
    moonLight.shadow.camera.top = 18;
    moonLight.shadow.camera.bottom = -12;
    scene.add(moonLight);

    // Build Shadow Warrior
    const warrior = buildShadowWarrior(customization);
    warrior.root.position.set(-7, 0, 0);
    scene.add(warrior.root);

    // Build 3 Answer Sentinels
    const sentinels = TARGET_POSITIONS_X.map((tx, idx) => {
      const rig = buildAnswerSentinel(idx);
      rig.group.position.set(tx, 0, 0);
      scene.add(rig.group);
      return rig;
    });
    sentinelsRef.current = sentinels;

    // Initial options setup
    const initOpts = selectThreeTargets(questionRef.current);
    sentinels.forEach((rig, idx) => {
      const opt = initOpts[idx];
      if (opt) updateSentinelLabel(rig, opt.id, opt.text, false);
    });

    // Gameplay Physics & Animation State (Full 3D Directional Movement: X, Y, Z)
    let playerX = -7;
    let playerY = 0;
    let playerZ = 0;
    let velX = 0;
    let velY = 0;
    let velZ = 0;
    let facingAngle = 0; // radians (0 = +X, PI = -X, PI/2 = -Z, -PI/2 = +Z)
    let facing = 1; // 1 = right (+X), -1 = left (-X)
    let isGrounded = true;
    let selectedTargetIdx: number | null = null;
    let attackAnimTimer = 0;
    let blockedAnimTimer = 0;
    let dodgeTimer = 0;
    let guardTimer = 0;
    let camOrbitYaw = 0;
    let isDraggingCam = false;
    let lastMouseX = 0;
    let activeTouchId: number | null = null;
    let lastTouchX = 0;
    let walkPhase = 0;
    let footstepTimer = 0;
    let hudTimer = 0;
    const particles: Particle[] = [];
    const keys: Record<string, boolean> = {};

    const guardBubble = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 18, 14),
      new THREE.MeshBasicMaterial({
        color: customization.glowColor,
        transparent: true,
        opacity: 0.28,
        wireframe: true
      })
    );
    guardBubble.position.y = 1.1;
    guardBubble.visible = false;
    warrior.root.add(guardBubble);

    // 3D Floating Direction Arrow above player pointing toward next Word Challenge
    const waypointArrowGroup = new THREE.Group();
    const arrowMat = new THREE.MeshStandardMaterial({
      color: '#FACC15',
      emissive: '#F59E0B',
      emissiveIntensity: 1.4,
      roughness: 0.2
    });
    const arrowShaft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.65), arrowMat);
    arrowShaft.position.z = -0.15;
    const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 6), arrowMat);
    arrowHead.rotation.x = Math.PI / 2;
    arrowHead.position.z = 0.35;
    waypointArrowGroup.add(arrowShaft, arrowHead);
    waypointArrowGroup.position.set(-7, 2.95, 0);
    scene.add(waypointArrowGroup);

    let activeNpcDialogue: { name: string; role: string; dialogue: string } | null = null;
    let npcDialogueTimer = 0;

    const spawnBurst = (origin: THREE.Vector3, colorHex: string, count: number) => {
      const actualCount = quality === 'low' ? Math.ceil(count / 2) : count;
      const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      for (let i = 0; i < actualCount; i++) {
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(origin);
        scene.add(m);
        particles.push({
          mesh: m,
          vel: new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 6 + 1.5, (Math.random() - 0.5) * 6),
          life: 0,
          maxLife: 0.55 + Math.random() * 0.3
        });
      }
    };

    const getNearestSentinel = (): { index: number; dist: number } => {
      let bestIdx = 0;
      let bestDist = Infinity;
      sentinels.forEach((s, idx) => {
        if (!s.group.visible) return;
        const d = Math.hypot(s.group.position.x - playerX, s.group.position.z - playerZ);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });
      return { index: bestIdx, dist: bestDist };
    };

    const selectTarget = (idx: number | null) => {
      if (idx !== selectedTargetIdx) {
        selectedTargetIdx = idx;
        sentinels.forEach((rig, i) => {
          updateSentinelLabel(rig, rig.optionId, rig.optionText, i === selectedTargetIdx);
        });
        if (idx !== null) {
          audioManager.playTargetSelect();
        }
      }
    };

    resetPlayerForQuestionRef.current = () => {
      playerX = -7;
      playerY = 0;
      velX = 0;
      velY = 0;
      facing = 1;
      selectTarget(null);
    };

    triggerSelectNearestRef.current = () => {
      if (pausedRef.current) return;
      audioManager.unlock();
      for (const npc of env.npcs) {
        if (Math.hypot(npc.group.position.x - playerX, npc.group.position.z - playerZ) <= 3.6) {
          audioManager.playTargetSelect();
          activeNpcDialogue = { name: npc.name, role: npc.role, dialogue: npc.dialogue };
          npcDialogueTimer = 6.5;
          spawnBurst(npc.group.position.clone().add(new THREE.Vector3(0, 1.8, 0)), '#FACC15', 8);
          return;
        }
      }
      const nearest = getNearestSentinel();
      if (nearest.dist <= 6.5) {
        selectTarget(nearest.index);
      }
    };

    triggerSpecialRef.current = () => {
      if (pausedRef.current) return;
      audioManager.unlock();
      audioManager.playMagicAttack();
      spawnBurst(new THREE.Vector3(playerX, playerY + 1.4, playerZ), customization.glowColor, 14);
      callbacksRef.current.onSpecialPulse();
    };

    triggerDodgeRef.current = () => {
      if (pausedRef.current || dodgeTimer > 0) return;
      audioManager.unlock();
      audioManager.playJump();
      dodgeTimer = 0.28;
      velX = facing * 15.5;
      spawnBurst(new THREE.Vector3(playerX, playerY + 0.9, playerZ), '#A855F7', 10);
    };

    triggerGuardRef.current = () => {
      if (pausedRef.current) return;
      audioManager.unlock();
      audioManager.playShieldBlock();
      guardTimer = 1.8;
      spawnBurst(new THREE.Vector3(playerX, playerY + 1.1, playerZ), customization.glowColor, 8);
    };

    triggerAttackRef.current = () => {
      if (pausedRef.current) return;
      audioManager.unlock();

      const nearest = getNearestSentinel();
      const targetIdx = selectedTargetIdx !== null ? selectedTargetIdx : nearest.index;
      const targetSentinel = sentinels[targetIdx];
      if (!targetSentinel || !targetSentinel.group.visible) return;

      const dist = Math.abs(targetSentinel.group.position.x - playerX);
      if (dist > 3.9) {
        // Must approach within attack range!
        selectTarget(targetIdx);
        return;
      }

      const q = questionRef.current;
      const validation = validateWarOfWordsAnswer(q, targetSentinel.optionId, evaluatedIdsRef.current);
      if (!validation.accepted) return; // Duplicate-attack guard

      attackAnimTimer = 0.42;
      audioManager.playMagicAttack();
      camController.addShake(0.38);

      const impactPos = targetSentinel.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));

      if (validation.isCorrect) {
        audioManager.playCorrectAnswer();
        spawnBurst(impactPos, customization.glowColor, 20);
        targetSentinel.group.visible = false;
      } else {
        blockedAnimTimer = 0.45;
        velX = -facing * 6;
        audioManager.playShieldBlock();
        spawnBurst(impactPos, '#F59E0B', 14);
      }

      callbacksRef.current.onAnswerEvaluated({
        questionId: q.id,
        selectedOptionId: targetSentinel.optionId,
        correctOptionId: q.correctOptionId,
        isCorrect: validation.isCorrect,
        pointsAwarded: validation.pointsAwarded,
        question: q
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'Escape') {
        callbacksRef.current.onPauseRequested();
        return;
      }
      if (pausedRef.current) return;
      audioManager.unlock();

      if (e.code === 'Space' && isGrounded) {
        velY = 10.6;
        isGrounded = false;
        audioManager.playJump();
      }
      if (e.code === 'KeyE') {
        triggerSelectNearestRef.current?.();
      }
      if (e.code === 'KeyQ') {
        triggerSpecialRef.current?.();
      }
      if (e.code === 'KeyC') {
        triggerDodgeRef.current?.();
      }
      if (e.code === 'KeyR') {
        triggerGuardRef.current?.();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (pausedRef.current) return;
      if (e.button === 0) {
        isDraggingCam = true;
        lastMouseX = e.clientX;
        triggerAttackRef.current?.();
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingCam || pausedRef.current) return;
      const dx = e.clientX - lastMouseX;
      lastMouseX = e.clientX;
      camOrbitYaw = THREE.MathUtils.clamp(camOrbitYaw - dx * 0.004, -0.65, 0.65);
    };
    const onMouseUp = () => {
      isDraggingCam = false;
    };
    const onTouchStart = (e: TouchEvent) => {
      if (pausedRef.current) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX > window.innerWidth * 0.35 && activeTouchId === null) {
          activeTouchId = t.identifier;
          lastTouchX = t.clientX;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (pausedRef.current || activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === activeTouchId) {
          const dx = t.clientX - lastTouchX;
          lastTouchX = t.clientX;
          camOrbitYaw = THREE.MathUtils.clamp(camOrbitYaw - dx * 0.005, -0.65, 0.65);
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          activeTouchId = null;
        }
      }
    };

    const clearInputs = () => {
      Object.keys(keys).forEach((k) => {
        keys[k] = false;
      });
    };

    const handleResize = () => {
      if (!container) return;
      const cw = container.clientWidth || window.innerWidth;
      const ch = container.clientHeight || window.innerHeight;
      if (cw <= 0 || ch <= 0) return;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      postPipeline.resize(cw, ch);
    };

    const onFullscreenOrBlur = () => {
      clearInputs();
      handleResize();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearInputs);
    document.addEventListener('visibilitychange', clearInputs);
    document.addEventListener('fullscreenchange', onFullscreenOrBlur);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: true });
    renderer.domElement.addEventListener('touchcancel', onTouchEnd, { passive: true });

    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    let animId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!pausedRef.current) {
        // 1. Full 3D Directional Movement (X and Z) with Smooth Acceleration & Deceleration
        let inputX = 0;
        let inputZ = 0;
        if (keys['KeyD'] || keys['ArrowRight']) inputX += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) inputX -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) inputZ += 1;
        if (keys['KeyW'] || keys['ArrowUp']) inputZ -= 1;
        if (Math.abs(mobileInputRef.current.moveX) > 0.1) {
          inputX += mobileInputRef.current.moveX;
        }
        if (mobileInputRef.current.moveY && Math.abs(mobileInputRef.current.moveY) > 0.1) {
          inputZ += mobileInputRef.current.moveY;
        }
        if (mobileInputRef.current.jump && isGrounded) {
          velY = 10.6;
          isGrounded = false;
          mobileInputRef.current.jump = false;
          audioManager.playJump();
        }
        if (mobileInputRef.current.dodge) {
          mobileInputRef.current.dodge = false;
          triggerDodgeRef.current?.();
        }
        if (mobileInputRef.current.guard) {
          mobileInputRef.current.guard = false;
          triggerGuardRef.current?.();
        }

        if (dodgeTimer > 0) dodgeTimer -= dt;
        if (guardTimer > 0) {
          guardTimer -= dt;
          guardBubble.visible = true;
          guardBubble.rotation.y += dt * 2.2;
        } else {
          guardBubble.visible = false;
        }

        const sprinting = keys['ShiftLeft'] || keys['ShiftRight'] || dodgeTimer > 0;
        const maxSpeed = dodgeTimer > 0 ? 15.5 : sprinting ? 11.2 : 7.8;
        const targetVelX = THREE.MathUtils.clamp(inputX, -1, 1) * maxSpeed;
        const targetVelZ = THREE.MathUtils.clamp(inputZ, -1, 1) * (maxSpeed * 0.8);
        const accel = Math.abs(targetVelX) > 0.1 || Math.abs(targetVelZ) > 0.1 ? 38 : 28;
        if (dodgeTimer <= 0) {
          velX = THREE.MathUtils.lerp(velX, targetVelX, 1 - Math.exp(-accel * dt));
        }
        velZ = THREE.MathUtils.lerp(velZ, targetVelZ, 1 - Math.exp(-accel * dt));

        let nextX = THREE.MathUtils.clamp(playerX + velX * dt, -14, 30);
        const nextZ = THREE.MathUtils.clamp(playerZ + velZ * dt, -3.2, 3.2);

        // Prevent passing through Sentinel cores (soft separation)
        for (const s of sentinels) {
          if (!s.group.visible) continue;
          const dx = nextX - s.group.position.x;
          const dz = nextZ - s.group.position.z;
          if (Math.hypot(dx, dz) < 0.95 && playerY < 2.2) {
            nextX = s.group.position.x + (dx >= 0 ? 0.95 : -0.95);
          }
        }
        playerX = nextX;
        playerZ = nextZ;

        if (Math.abs(inputX) > 0.1 || Math.abs(inputZ) > 0.1) {
          facing = inputX >= 0 ? 1 : -1;
          const targetRot = Math.atan2(-inputZ, inputX);
          let diff = targetRot - facingAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          facingAngle += diff * Math.min(1, dt * 14);
        }

        // 2. Vertical Gravity & Platform Collision
        const prevY = playerY;
        velY -= 25 * dt;
        playerY += velY * dt;

        let landed = false;
        // Raised stone platforms
        for (const plat of env.platforms) {
          if (
            playerX >= plat.minX - 0.3 &&
            playerX <= plat.maxX + 0.3 &&
            prevY >= plat.topY - 0.15 &&
            playerY <= plat.topY &&
            velY <= 0
          ) {
            playerY = plat.topY;
            velY = 0;
            landed = true;
            break;
          }
        }
        // Ground plane
        if (playerY <= 0) {
          playerY = 0;
          velY = 0;
          landed = true;
        }
        if (landed && !isGrounded) {
          audioManager.playLand();
        }
        isGrounded = landed;

        // 3. Warrior Model Transform & Event-Driven Animations
        warrior.root.position.set(playerX, playerY, playerZ);
        warrior.root.rotation.y = facingAngle;

        const speedAbs = Math.hypot(velX, velZ);
        if (speedAbs > 0.6 && isGrounded) {
          walkPhase += dt * (sprinting ? 14 : 9.5);
          footstepTimer -= dt;
          if (footstepTimer <= 0) {
            footstepTimer = sprinting ? 0.24 : 0.36;
            audioManager.playFootstep();
          }
        } else {
          walkPhase = 0;
        }

        const swing = speedAbs > 0.6 && isGrounded ? Math.sin(walkPhase) * 0.72 : 0;
        warrior.leftLeg.rotation.z = swing;
        warrior.rightLeg.rotation.z = -swing;
        warrior.leftArm.rotation.z = -swing * 0.7;

        if (attackAnimTimer > 0) {
          attackAnimTimer -= dt;
          warrior.rightArm.rotation.z = 1.45;
          warrior.bodyPivot.rotation.z = -0.18;
        } else if (blockedAnimTimer > 0) {
          blockedAnimTimer -= dt;
          warrior.bodyPivot.rotation.z = 0.2;
        } else {
          warrior.rightArm.rotation.z = swing * 0.7;
          warrior.bodyPivot.rotation.z = !isGrounded ? -0.08 : 0;
        }
        warrior.cloak.rotation.z = -0.18 - Math.min(0.45, speedAbs * 0.04);

        // 4. Sentinels Idle Bob & Proximity Auto-Highlight
        const nearest = getNearestSentinel();
        if (nearest.dist <= 3.9) {
          selectTarget(nearest.index);
        } else if (selectedTargetIdx !== null && Math.abs(sentinels[selectedTargetIdx].group.position.x - playerX) > 6.5) {
          selectTarget(null);
        }

        sentinels.forEach((s, idx) => {
          const tSec = now * 0.0018 + idx * 1.6;
          const baseX = TARGET_POSITIONS_X[idx];
          const dToPlayer = Math.hypot(s.group.position.x - playerX, s.group.position.z - playerZ);
          if (idx === 0) {
            s.group.position.x = baseX + Math.sin(tSec) * 1.3;
            s.group.position.z = Math.cos(tSec * 0.9) * 1.1;
            s.group.position.y = Math.abs(Math.sin(tSec * 2.5)) * 0.08;
          } else if (idx === 1) {
            s.group.position.x = baseX + Math.cos(tSec * 0.8) * 0.9;
            s.group.position.z = Math.sin(tSec * 1.1) * 1.25;
            s.group.position.y = Math.abs(Math.sin(tSec * 2.2)) * 0.1;
          } else {
            s.group.position.x = baseX + Math.cos(tSec) * 1.25;
            s.group.position.z = -Math.sin(tSec * 0.85) * 1.1;
            s.group.position.y = Math.abs(Math.cos(tSec * 2.4)) * 0.09;
          }
          // Articulated enemy limb stride & defensive guard stance when player approaches
          const enemyWalkSwing = Math.sin(tSec * 3.8) * 0.48;
          s.leftLeg.rotation.z = enemyWalkSwing;
          s.rightLeg.rotation.z = -enemyWalkSwing;
          if (dToPlayer < 6.0) {
            s.leftArm.rotation.z = 0.85;
            s.rightArm.rotation.z = 0.85;
          } else {
            s.leftArm.rotation.z = 0.35 - enemyWalkSwing * 0.4;
            s.rightArm.rotation.z = 0.35 + enemyWalkSwing * 0.4;
          }
          s.ring.rotation.z += dt * (idx === selectedTargetIdx ? 2.2 : 0.6);
        });

        // Friendly Guide / Librarian NPC patrol & indicator bob
        env.npcs.forEach((npc, idx) => {
          const walkA = now * 0.0011 + idx * 2.1;
          npc.group.position.x = npc.position.x + Math.sin(walkA) * 1.1;
          npc.group.rotation.y = Math.cos(walkA) >= 0 ? Math.PI / 2 : -Math.PI / 2;
          npc.indicator.rotation.y += dt * 2.0;
          npc.indicator.position.y = 2.52 + Math.sin(now * 0.004 + idx) * 0.12;
        });

        if (npcDialogueTimer > 0) {
          npcDialogueTimer -= dt;
          if (npcDialogueTimer <= 0) {
            activeNpcDialogue = null;
          }
        }

        // Update 3D Direction Arrow above player pointing toward nearest/selected Word Challenge Sentinel
        const activeTargetSentinel =
          selectedTargetIdx !== null && sentinels[selectedTargetIdx]
            ? sentinels[selectedTargetIdx]
            : sentinels[nearest.index];
        const objPos = activeTargetSentinel ? activeTargetSentinel.group.position : new THREE.Vector3(4, 0, 0);
        waypointArrowGroup.position.set(
          playerX,
          playerY + 2.95 + Math.sin(now * 0.0045) * 0.12,
          playerZ
        );
        waypointArrowGroup.lookAt(objPos.x, waypointArrowGroup.position.y, objPos.z);

        // 5. Torch Flicker & Particles
        env.torchLights.forEach((tl, i) => {
          tl.intensity = 2.2 + Math.sin(now * 0.01 + i * 2) * 0.35;
        });

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life += dt;
          if (p.life >= p.maxLife) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
          } else {
            p.vel.y -= 12 * dt;
            p.mesh.position.addScaledVector(p.vel, dt);
            p.mesh.scale.setScalar(Math.max(0.05, 1 - p.life / p.maxLife));
          }
        }

        // 6. Smooth Side-Follow Cinematic Camera + Atmospheric Particles
        skyDome.update({ time: now * 0.001 });
        moonWater.update(now * 0.001);
        cloudLayer.update(dt);
        arcaneParticles.update(dt, now * 0.001, new THREE.Vector3(playerX, playerY + 4, 0));

        const targetCamX = playerX + facing * 3.2 + Math.sin(camOrbitYaw) * 4.5;
        const targetCamY = Math.max(3.8, playerY + 3.6);
        const targetCamZ = playerZ + 13.5 * Math.cos(camOrbitYaw);
        camController.update(
          camera,
          new THREE.Vector3(targetCamX, targetCamY, targetCamZ),
          new THREE.Vector3(playerX + facing * 1.2, playerY + 1.8, playerZ),
          dt,
          6.5,
          9.0
        );

        // 7. Throttled HUD Sync
        hudTimer += dt;
        if (hudTimer >= 0.08) {
          hudTimer = 0;
          const sel = selectedTargetIdx !== null ? sentinels[selectedTargetIdx] : null;
          const inRange = sel ? Math.abs(sel.group.position.x - playerX) <= 3.9 : false;
          let nearbyNpcPrompt: string | null = null;
          for (const npc of env.npcs) {
            if (Math.hypot(npc.group.position.x - playerX, npc.group.position.z - playerZ) <= 3.6) {
              nearbyNpcPrompt = `Press [E] or SELECT to talk to ${npc.name} (${npc.role})`;
              break;
            }
          }
          const objDist = Math.round(Math.hypot(objPos.x - playerX, objPos.z - playerZ));
          callbacksRef.current.onHudUpdate({
            selectedTargetIndex: selectedTargetIdx,
            selectedOptionId: sel ? sel.optionId : null,
            selectedOptionText: sel ? sel.optionText : null,
            inAttackRange: inRange,
            playerX,
            targets: sentinels.map((s, idx) => ({
              index: idx,
              id: s.optionId,
              text: s.optionText,
              x: s.group.position.x
            })),
            objectiveDistanceMeters: objDist,
            objectiveLabel: activeTargetSentinel
              ? `Word Sentinel ${activeTargetSentinel.optionId}: "${activeTargetSentinel.optionText}" (${objDist}m)`
              : `Next Word Challenge (${objDist}m)`,
            nearbyNpcPrompt,
            activeNpcDialogue
          });
        }
      }

      postPipeline.render(dt);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearInputs);
      document.removeEventListener('visibilitychange', clearInputs);
      document.removeEventListener('fullscreenchange', onFullscreenOrBlur);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.domElement.removeEventListener('touchcancel', onTouchEnd);
      disposeThreeScene(scene, renderer, postPipeline, envTexture);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      sentinelsRef.current = [];
    };
  }, [worldId, quality, customization, audioManager, mobileInputRef]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    />
  );
};
