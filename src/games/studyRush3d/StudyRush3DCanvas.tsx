import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  AdaptivePostProcessingPipeline,
  AtmosphericParticleSystem,
  buildAtmosphericEnvMap,
  CinematicCameraController,
  createAtmosphericSkyDome,
  disposeThreeScene
} from '../engine/VisualMasterpieceEngine';
import { StudyRushAudioManager } from './AudioManager';
import { DayNightManager } from './DayNightManager';
import { selectArenaOptions, validateStudyRushAnswer } from './questionBank';
import {
  AnswerOutcomeEvent,
  EnemyType,
  OptionId,
  PlayerCustomization,
  ResourceInventory,
  StudyRushQuestion,
  TimePhase,
  VillageUpgradeState,
  WorldZone
} from './types';
import { buildVoxelEnemy, buildVoxelPlayer, updateShrineLabel, VoxelEnemyRig } from './VoxelModels';
import {
  buildStudyRushWorld,
  ColliderBox,
  getZoneAtPosition,
  syncVillageUpgradeMeshes,
  WorldHandles
} from './WorldManager';

export interface LiveHudSnapshot {
  phase: TimePhase;
  nightWave: number;
  zone: WorldZone;
  targetedShrineIndex: number | null;
  targetedOptionId: OptionId | null;
  nearbyPrompt: string | null;
  activeEnemiesCount: number;
  shrineOptions: Array<{ index: number; id: OptionId; text: string }>;
}

export interface StudyRush3DCanvasProps {
  paused: boolean;
  customization: PlayerCustomization;
  currentQuestion: StudyRushQuestion;
  villageUpgrades: VillageUpgradeState;
  audioManager: StudyRushAudioManager;
  quickCastSignal: { index: number; seq: number } | null;
  skipToNightSignal: number;
  mobileInputRef: React.MutableRefObject<{
    moveX: number;
    moveY: number;
    jump: boolean;
    interact: boolean;
  }>;
  onHudUpdate: (hud: LiveHudSnapshot) => void;
  onAnswerSubmitted: (event: AnswerOutcomeEvent) => void;
  onResourceCollected: (delta: Partial<ResourceInventory>, label: string) => void;
  onVillagerTip: (speaker: string, message: string) => void;
  onVillageDamaged: (damage: number) => void;
  onPlayerDamaged: (damage: number) => void;
  onNightSurvived: (nightNumber: number) => void;
  onPauseRequested: () => void;
}

interface ActiveEnemy {
  id: string;
  type: EnemyType;
  rig: VoxelEnemyRig;
  hp: number;
  maxHp: number;
  speed: number;
  state: 'approaching' | 'attacking_gate' | 'stunned';
  stunTimer: number;
  attackCooldown: number;
}

interface MagicProjectile {
  mesh: THREE.Mesh;
  start: THREE.Vector3;
  target: THREE.Vector3;
  progress: number;
  duration: number;
  onArrive: () => void;
}

interface BurstParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

function collidesWithBoxes(x: number, z: number, radius: number, boxes: ColliderBox[]): boolean {
  for (const b of boxes) {
    if (
      x + radius > b.minX &&
      x - radius < b.maxX &&
      z + radius > b.minZ &&
      z - radius < b.maxZ
    ) {
      return true;
    }
  }
  return false;
}

export const StudyRush3DCanvas: React.FC<StudyRush3DCanvasProps> = ({
  paused,
  customization,
  currentQuestion,
  villageUpgrades,
  audioManager,
  quickCastSignal,
  skipToNightSignal,
  mobileInputRef,
  onHudUpdate,
  onAnswerSubmitted,
  onResourceCollected,
  onVillagerTip,
  onVillageDamaged,
  onPlayerDamaged,
  onNightSurvived,
  onPauseRequested
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Latest props refs for the RAF loop without tearing down WebGL context
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const questionRef = useRef(currentQuestion);
  questionRef.current = currentQuestion;

  const upgradesRef = useRef(villageUpgrades);
  upgradesRef.current = villageUpgrades;

  const callbacksRef = useRef({
    onHudUpdate,
    onAnswerSubmitted,
    onResourceCollected,
    onVillagerTip,
    onVillageDamaged,
    onPlayerDamaged,
    onNightSurvived,
    onPauseRequested
  });
  callbacksRef.current = {
    onHudUpdate,
    onAnswerSubmitted,
    onResourceCollected,
    onVillagerTip,
    onVillageDamaged,
    onPlayerDamaged,
    onNightSurvived,
    onPauseRequested
  };

  // Internal triggers shared between React prop effects and RAF loop
  const worldRef = useRef<WorldHandles | null>(null);
  const dayNightRef = useRef<DayNightManager>(new DayNightManager());
  const castShrineFnRef = useRef<((shrineIndex: number) => void) | null>(null);
  const shrineOptionsRef = useRef<Array<{ index: number; id: OptionId; text: string }>>([]);

  // Sync Village Upgrades visually whenever upgrades change
  useEffect(() => {
    if (worldRef.current) {
      syncVillageUpgradeMeshes(worldRef.current, villageUpgrades);
    }
  }, [villageUpgrades]);

  // Sync Question options onto the 3 Answer Shrines whenever currentQuestion changes
  useEffect(() => {
    if (!worldRef.current) return;
    const chosen = selectArenaOptions(currentQuestion);
    const mapped = chosen.map((opt, idx) => ({
      index: idx,
      id: opt.id,
      text: opt.text
    }));
    shrineOptionsRef.current = mapped;

    worldRef.current.answerShrines.forEach((rig, idx) => {
      const opt = mapped[idx] || { id: 'A' as OptionId, text: 'Option' };
      updateShrineLabel(rig, opt.id, opt.text, false);
    });
  }, [currentQuestion]);

  // Handle quick-cast signals (buttons 1/2/3 in HUD)
  useEffect(() => {
    if (quickCastSignal && castShrineFnRef.current) {
      castShrineFnRef.current(quickCastSignal.index);
    }
  }, [quickCastSignal]);

  // Handle Skip-to-Night button
  useEffect(() => {
    if (skipToNightSignal > 0) {
      const res = dayNightRef.current.skipToNight();
      if (res.enteredNight) {
        audioManager.unlock();
        audioManager.playNightFall();
      }
    }
  }, [skipToNightSignal, audioManager]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#7DD3FC');
    scene.fog = new THREE.FogExp2('#7DD3FC', 0.011);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(62, width / height, 0.2, 180);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // AAA Visual Masterpiece Engine: IBL Environment + Sky Dome + Bloom + Particles + Cinematic Camera
    const envTexture = buildAtmosphericEnvMap(renderer, '#38BDF8', '#E0F2FE', '#1E293B');
    scene.environment = envTexture;

    const skyDome = createAtmosphericSkyDome({
      radius: 170,
      topColor: '#0284C7',
      horizonColor: '#BAE6FD',
      bottomColor: '#1E293B',
      sunColor: '#FFFBEB',
      starIntensity: 0
    });
    scene.add(skyDome.mesh);

    const postPipeline = new AdaptivePostProcessingPipeline(
      renderer,
      scene,
      camera,
      width,
      height,
      'high',
      { strength: 0.36, radius: 0.52, threshold: 0.82 }
    );

    const atmosphericParticles = new AtmosphericParticleSystem({
      count: 140,
      bounds: { x: 48, y: 12, z: 48 },
      color: '#FDE68A',
      size: 0.34,
      opacity: 0.45,
      driftVel: new THREE.Vector3(0.22, 0.25, 0.14)
    });
    scene.add(atmosphericParticles.points);

    const camController = new CinematicCameraController(62, 1.5);

    // Lighting
    const ambientLight = new THREE.HemisphereLight('#E0F2FE', '#334155', 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#FFF7ED', 1.6);
    sunLight.position.set(22, 34, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 110;
    const d = 38;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // World & Player
    const world = buildStudyRushWorld(scene);
    worldRef.current = world;
    syncVillageUpgradeMeshes(world, upgradesRef.current);

    // Initialize initial shrines
    const initialOptions = selectArenaOptions(questionRef.current).map((opt, idx) => ({
      index: idx,
      id: opt.id,
      text: opt.text
    }));
    shrineOptionsRef.current = initialOptions;
    world.answerShrines.forEach((rig, idx) => {
      const opt = initialOptions[idx];
      if (opt) updateShrineLabel(rig, opt.id, opt.text, false);
    });

    const playerRig = buildVoxelPlayer(customization);
    playerRig.group.position.set(0, 0, 11);
    scene.add(playerRig.group);

    // Dynamic entities
    const enemies: ActiveEnemy[] = [];
    const projectiles: MagicProjectile[] = [];
    const particles: BurstParticle[] = [];

    // Player physics & camera state
    const playerPos = new THREE.Vector3(0, 0, 11);
    let velocityY = 0;
    let isGrounded = true;
    let cameraYaw = 0; // 0 looks toward -Z (into the plaza & shrines)
    let cameraPitch = 0.24;
    let attackAnimTimer = 0;
    let walkPhase = 0;
    let isDraggingLook = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let targetedShrineIdx: number | null = null;
    let lastAnswerTime = 0;
    let lastSpawnNight = 0;
    let towerFireCooldown = 0;
    let hudSyncTimer = 0;

    const keys: Record<string, boolean> = {};

    const spawnParticles = (origin: THREE.Vector3, colorHex: string, count: number) => {
      const geo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(origin);
        scene.add(m);
        particles.push({
          mesh: m,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 9,
            Math.random() * 6 + 2,
            (Math.random() - 0.5) * 9
          ),
          life: 0,
          maxLife: 0.55 + Math.random() * 0.35
        });
      }
    };

    const spawnWaveEnemies = (waveNum: number) => {
      const count = Math.min(7, 2 + waveNum);
      const spawnPoints = [
        new THREE.Vector3(-26, 0, -6),
        new THREE.Vector3(-26, 0, 8),
        new THREE.Vector3(0, 0, -28),
        new THREE.Vector3(26, 0, -5),
        new THREE.Vector3(26, 0, 7)
      ];

      for (let i = 0; i < count; i++) {
        const type: EnemyType =
          waveNum >= 3 && i === 0
            ? 'obsidian_golem'
            : i % 2 === 0
              ? 'shadow_crawler'
              : 'void_wisp';
        const rig = buildVoxelEnemy(type);
        const sp = spawnPoints[i % spawnPoints.length].clone();
        sp.x += (Math.random() - 0.5) * 4;
        sp.z += (Math.random() - 0.5) * 4;
        rig.group.position.copy(sp);
        scene.add(rig.group);

        const maxHp = type === 'obsidian_golem' ? 120 : type === 'void_wisp' ? 50 : 65;
        enemies.push({
          id: `enemy-${Date.now()}-${i}`,
          type,
          rig,
          hp: maxHp,
          maxHp,
          speed: type === 'obsidian_golem' ? 2.1 : type === 'void_wisp' ? 3.5 : 3.0,
          state: 'approaching',
          stunTimer: 0,
          attackCooldown: 0
        });
      }
    };

    const castAtShrine = (shrineIdx: number) => {
      if (pausedRef.current) return;
      const now = performance.now();
      if (now - lastAnswerTime < 650) return;
      lastAnswerTime = now;

      const shrine = world.answerShrines[shrineIdx];
      const q = questionRef.current;
      if (!shrine || !q) return;

      audioManager.unlock();
      audioManager.playMagicCast();
      attackAnimTimer = 0.38;

      const chosenId = shrine.optionId;
      const isCorrect = validateStudyRushAnswer(q, chosenId);

      // Launch glowing magic projectile from staff toward shrine
      const start = playerPos.clone().add(new THREE.Vector3(0, 1.8, 0));
      const target = shrine.group.position.clone().add(new THREE.Vector3(0, 1.9, 0));
      const projMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.42, 0.42),
        new THREE.MeshBasicMaterial({ color: isCorrect ? '#FACC15' : '#38BDF8' })
      );
      projMesh.position.copy(start);
      scene.add(projMesh);

      projectiles.push({
        mesh: projMesh,
        start,
        target,
        progress: 0,
        duration: 0.24,
        onArrive: () => {
          if (isCorrect) {
            audioManager.playCorrectHit();
            spawnParticles(target, '#FACC15', 16);

            // Damage or defeat nearest active enemy!
            let damageDealt = 75 + upgradesRef.current.libraryLevel * 15;
            if (enemies.length > 0) {
              enemies.sort(
                (a, b) =>
                  a.rig.group.position.distanceTo(playerPos) -
                  b.rig.group.position.distanceTo(playerPos)
              );
              const targetEnemy = enemies[0];
              targetEnemy.hp -= damageDealt;
              targetEnemy.state = 'stunned';
              targetEnemy.stunTimer = 1.2;
              spawnParticles(targetEnemy.rig.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), '#FF6A00', 14);
              if (targetEnemy.hp <= 0) {
                scene.remove(targetEnemy.rig.group);
                enemies.shift();
              }
            }

            callbacksRef.current.onAnswerSubmitted({
              questionId: q.id,
              selectedOptionId: chosenId,
              correctOptionId: q.correctOptionId,
              isCorrect: true,
              topic: q.topic,
              subject: q.subject,
              explanation: q.explanation,
              damageDealt,
              pointsEarned: 120
            });
          } else {
            // Harmless Knowledge Shield absorb effect
            audioManager.playWrongShield();
            spawnParticles(target, '#38BDF8', 12);
            callbacksRef.current.onAnswerSubmitted({
              questionId: q.id,
              selectedOptionId: chosenId,
              correctOptionId: q.correctOptionId,
              isCorrect: false,
              topic: q.topic,
              subject: q.subject,
              explanation: q.explanation,
              damageDealt: 0,
              pointsEarned: 0
            });
          }
        }
      });
    };

    castShrineFnRef.current = castAtShrine;

    const triggerInteract = () => {
      if (pausedRef.current) return;
      audioManager.unlock();

      // 1. Check nearby resource nodes
      for (const res of world.resources) {
        if (!res.collected && res.position.distanceTo(playerPos) < 3.4) {
          res.collected = true;
          res.mesh.visible = false;
          res.respawnTimer = 25;
          audioManager.playCollectResource();
          spawnParticles(res.position.clone().add(new THREE.Vector3(0, 0.8, 0)), '#4ADE80', 10);

          if (res.kind === 'wood') callbacksRef.current.onResourceCollected({ wood: 2 }, '+2 Wood');
          if (res.kind === 'stone') callbacksRef.current.onResourceCollected({ stone: 2 }, '+2 Stone');
          if (res.kind === 'crystal') callbacksRef.current.onResourceCollected({ crystal: 1 }, '+1 Crystal');
          if (res.kind === 'orb') callbacksRef.current.onResourceCollected({ knowledgeOrbs: 1 }, '+1 Knowledge Orb');
          return;
        }
      }

      // 2. Check nearby villagers
      for (const v of world.villagers) {
        if (v.position.distanceTo(playerPos) < 4.2) {
          audioManager.playCollectResource();
          callbacksRef.current.onVillagerTip(`${v.name} (${v.role})`, v.tip);
          return;
        }
      }

      // 3. Check if standing right next to an Answer Shrine
      for (let i = 0; i < world.answerShrines.length; i++) {
        if (world.answerShrines[i].group.position.distanceTo(playerPos) < 4.2) {
          castAtShrine(i);
          return;
        }
      }
    };

    // Input Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'Escape') {
        callbacksRef.current.onPauseRequested();
        return;
      }
      if (pausedRef.current) return;
      audioManager.unlock();

      if (e.code === 'Space' && isGrounded) {
        velocityY = 9.2;
        isGrounded = false;
        audioManager.playJump();
      }
      if (e.code === 'KeyE') {
        triggerInteract();
      }
      if (e.code === 'Digit1') castAtShrine(0);
      if (e.code === 'Digit2') castAtShrine(1);
      if (e.code === 'Digit3') castAtShrine(2);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (pausedRef.current) return;
      audioManager.unlock();

      if (e.button === 0) {
        if (targetedShrineIdx !== null) {
          castAtShrine(targetedShrineIdx);
        } else {
          isDraggingLook = true;
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;
        }
      }
    };

    const onMouseUp = () => {
      isDraggingLook = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (pausedRef.current) return;
      if (document.pointerLockElement === renderer.domElement) {
        cameraYaw -= e.movementX * 0.0026;
        cameraPitch = THREE.MathUtils.clamp(cameraPitch + e.movementY * 0.0022, 0.05, 0.78);
      } else if (isDraggingLook) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        cameraYaw -= dx * 0.0045;
        cameraPitch = THREE.MathUtils.clamp(cameraPitch + dy * 0.0035, 0.05, 0.78);
      }
    };

    const onDoubleClick = () => {
      if (pausedRef.current) return;
      renderer.domElement.requestPointerLock?.();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      postPipeline.resize(w, h);
    });
    resizeObserver.observe(container);

    // Main Delta-Time Animation Loop
    let animId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!pausedRef.current) {
        // 1. Day/Night Lighting Cycle
        const cycleEvent = dayNightRef.current.advance(dt);
        const snap = dayNightRef.current.getSnapshot();

        scene.background = snap.skyColor;
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.copy(snap.fogColor);
        }
        sunLight.intensity = snap.sunIntensity;
        sunLight.color.copy(snap.sunColor);
        sunLight.position.copy(snap.sunDirection);
        ambientLight.intensity = snap.ambientIntensity;
        (world.stars.material as THREE.PointsMaterial).opacity = snap.starOpacity;
        skyDome.update({
          topColor: snap.phase === 'night' ? '#020617' : snap.phase === 'sunset' ? '#7C2D12' : '#0284C7',
          horizonColor: snap.skyColor,
          bottomColor: '#0F172A',
          sunDirection: snap.sunDirection,
          starIntensity: snap.starOpacity,
          time: now * 0.001
        });
        atmosphericParticles.setOpacity(snap.phase === 'night' ? 0.85 : 0.35);
        atmosphericParticles.update(dt, now * 0.001, playerPos);
        if (world.waterNormalMap) {
          world.waterNormalMap.offset.x = (now * 0.00004) % 1;
          world.waterNormalMap.offset.y = (now * 0.00003) % 1;
        }
        world.torchLights.forEach((tl, idx) => {
          const flicker = 0.92 + Math.sin(now * 0.009 + idx) * 0.08;
          tl.intensity = 2.6 * snap.torchMultiplier * flicker;
        });
        world.campfire.flame.scale.y = 0.85 + Math.sin(now * 0.014) * 0.18;

        if (cycleEvent.enteredNight && dayNightRef.current.nightCount > lastSpawnNight) {
          lastSpawnNight = dayNightRef.current.nightCount;
          audioManager.playWaveStart();
          camController.addShake(0.45);
          spawnWaveEnemies(lastSpawnNight);
        }

        if (cycleEvent.enteredSunrise) {
          // Sunrise clears remaining weak shadow creatures & rewards Night Survived!
          while (enemies.length > 0) {
            const rem = enemies.pop()!;
            spawnParticles(rem.rig.group.position.clone().add(new THREE.Vector3(0, 1, 0)), '#FACC15', 8);
            scene.remove(rem.rig.group);
          }
          audioManager.playVictory();
          callbacksRef.current.onNightSurvived(Math.max(1, dayNightRef.current.nightCount));
        }

        // 2. Player Movement & Physics
        let moveForward = 0;
        let moveRight = 0;
        if (keys['KeyW'] || keys['ArrowUp']) moveForward += 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveForward -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveRight += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveRight -= 1;

        // Merge mobile virtual joystick input
        if (Math.abs(mobileInputRef.current.moveX) > 0.08 || Math.abs(mobileInputRef.current.moveY) > 0.08) {
          moveRight += mobileInputRef.current.moveX;
          moveForward -= mobileInputRef.current.moveY;
        }
        if (mobileInputRef.current.jump && isGrounded) {
          velocityY = 9.2;
          isGrounded = false;
          mobileInputRef.current.jump = false;
          audioManager.playJump();
        }
        if (mobileInputRef.current.interact) {
          mobileInputRef.current.interact = false;
          triggerInteract();
        }

        const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
        const moveSpeed = isSprinting ? 11.5 : 7.6;

        const forwardVec = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
        const rightVec = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
        const moveDir = new THREE.Vector3()
          .addScaledVector(forwardVec, moveForward)
          .addScaledVector(rightVec, moveRight);

        const isMoving = moveDir.lengthSq() > 0.01;
        if (isMoving) {
          moveDir.normalize();
          const nextX = THREE.MathUtils.clamp(playerPos.x + moveDir.x * moveSpeed * dt, -54, 54);
          const nextZ = THREE.MathUtils.clamp(playerPos.z + moveDir.z * moveSpeed * dt, -54, 54);

          if (!collidesWithBoxes(nextX, playerPos.z, 0.55, world.colliders)) {
            playerPos.x = nextX;
          }
          if (!collidesWithBoxes(playerPos.x, nextZ, 0.55, world.colliders)) {
            playerPos.z = nextZ;
          }

          const targetAngle = Math.atan2(moveDir.x, moveDir.z);
          playerRig.group.rotation.y = targetAngle;
          walkPhase += dt * (isSprinting ? 13 : 9);
        } else {
          walkPhase = 0;
        }

        // Gravity
        velocityY -= 24 * dt;
        playerPos.y += velocityY * dt;
        if (playerPos.y <= 0) {
          playerPos.y = 0;
          velocityY = 0;
          isGrounded = true;
        }
        playerRig.group.position.copy(playerPos);

        // Animate Voxel Player Limbs & Companion
        const swing = isMoving ? Math.sin(walkPhase) * 0.65 : 0;
        playerRig.leftLeg.rotation.x = swing;
        playerRig.rightLeg.rotation.x = -swing;
        playerRig.leftArm.rotation.x = -swing * 0.8;

        if (attackAnimTimer > 0) {
          attackAnimTimer -= dt;
          playerRig.rightArm.rotation.x = -1.35;
        } else {
          playerRig.rightArm.rotation.x = swing * 0.8;
        }
        playerRig.cape.rotation.x = 0.14 + (isMoving ? 0.25 + Math.abs(swing) * 0.2 : Math.sin(now * 0.003) * 0.05);
        if (playerRig.companionGroup) {
          playerRig.companionGroup.position.y = 2.2 + Math.sin(now * 0.005) * 0.18;
        }

        // 3. Answer Shrine Animations & Aim Lock-On Detection
        const camForward = new THREE.Vector3();
        camera.getWorldDirection(camForward);

        let bestShrineIdx: number | null = null;
        let bestDot = 0.91; // ~24 deg cone

        world.answerShrines.forEach((shrine, idx) => {
          shrine.crystal.rotation.y += dt * 1.4;
          shrine.crystal.position.y = 1.85 + Math.sin(now * 0.0035 + idx) * 0.18;
          shrine.labelMesh.lookAt(camera.position);

          const toShrine = shrine.group.position
            .clone()
            .add(new THREE.Vector3(0, 2.0, 0))
            .sub(camera.position)
            .normalize();
          const dot = camForward.dot(toShrine);
          const dist = shrine.group.position.distanceTo(playerPos);

          if ((dot > bestDot && dist < 34) || dist < 3.4) {
            bestDot = Math.max(bestDot, dot);
            bestShrineIdx = idx;
          }
        });

        if (bestShrineIdx !== targetedShrineIdx) {
          targetedShrineIdx = bestShrineIdx;
          world.answerShrines.forEach((rig, idx) => {
            updateShrineLabel(rig, rig.optionId, rig.optionText, idx === targetedShrineIdx);
          });
        }

        // 4. Resource Respawn & Bobbing
        for (const res of world.resources) {
          if (res.collected) {
            res.respawnTimer -= dt;
            if (res.respawnTimer <= 0) {
              res.collected = false;
              res.mesh.visible = true;
            }
          } else {
            res.mesh.rotation.y += dt * 0.9;
          }
        }

        // 5. Villager idle indicator bobbing
        for (const v of world.villagers) {
          v.indicator.position.y = 2.55 + Math.sin(now * 0.004) * 0.15;
          v.indicator.rotation.y += dt * 1.6;
        }

        // 6. Enemy AI State Machine + Watchtower Auto-Defense
        if (upgradesRef.current.towerLevel > 0 && enemies.length > 0) {
          towerFireCooldown -= dt;
          if (towerFireCooldown <= 0) {
            towerFireCooldown = Math.max(1.8, 4.2 - upgradesRef.current.towerLevel * 0.6);
            const targetE = enemies[0];
            targetE.hp -= 18 * upgradesRef.current.towerLevel;
            spawnParticles(targetE.rig.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), '#38BDF8', 6);
            if (targetE.hp <= 0) {
              scene.remove(targetE.rig.group);
              enemies.shift();
            }
          }
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          const pos = e.rig.group.position;

          if (e.state === 'stunned') {
            e.stunTimer -= dt;
            if (e.stunTimer <= 0) e.state = 'approaching';
            continue;
          }

          // Target either player (if close) or Village Center (0,0,0)
          const distToPlayer = pos.distanceTo(playerPos);
          const targetGoal = distToPlayer < 10 ? playerPos : new THREE.Vector3(0, 0, 2);
          const dir = targetGoal.clone().sub(pos);
          dir.y = 0;
          const dist = dir.length();

          if (dist > 2.2) {
            e.state = 'approaching';
            dir.normalize();
            pos.addScaledVector(dir, e.speed * dt);
            e.rig.group.lookAt(targetGoal.x, 0, targetGoal.z);
          } else {
            e.state = 'attacking_gate';
            e.attackCooldown -= dt;
            if (e.attackCooldown <= 0) {
              e.attackCooldown = 2.2;
              if (distToPlayer < 2.8) {
                callbacksRef.current.onPlayerDamaged(8);
              } else {
                const wallReduction = Math.min(0.6, upgradesRef.current.wallLevel * 0.15);
                callbacksRef.current.onVillageDamaged(Math.round(10 * (1 - wallReduction)));
              }
            }
          }
        }

        // 7. Update Magic Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i];
          p.progress += dt / p.duration;
          if (p.progress >= 1) {
            scene.remove(p.mesh);
            p.onArrive();
            projectiles.splice(i, 1);
          } else {
            p.mesh.position.lerpVectors(p.start, p.target, p.progress);
            p.mesh.rotation.x += dt * 12;
            p.mesh.rotation.y += dt * 12;
          }
        }

        // 8. Update Burst Particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const pt = particles[i];
          pt.life += dt;
          if (pt.life >= pt.maxLife) {
            scene.remove(pt.mesh);
            particles.splice(i, 1);
          } else {
            pt.velocity.y -= 14 * dt;
            pt.mesh.position.addScaledVector(pt.velocity, dt);
            const scale = 1 - pt.life / pt.maxLife;
            pt.mesh.scale.setScalar(Math.max(0.05, scale));
          }
        }

        // 9. Third-Person Over-the-Shoulder Camera with Bounds Clamping
        const camDist = 7.4;
        const shoulderOffset = new THREE.Vector3(Math.cos(cameraYaw) * 0.9, 0, -Math.sin(cameraYaw) * 0.9);
        const camOffset = new THREE.Vector3(
          Math.sin(cameraYaw) * Math.cos(cameraPitch) * camDist,
          Math.sin(cameraPitch) * camDist + 2.3,
          Math.cos(cameraYaw) * Math.cos(cameraPitch) * camDist
        );
        const desiredCamPos = playerPos.clone().add(shoulderOffset).add(camOffset);
        desiredCamPos.y = Math.max(1.2, desiredCamPos.y);
        desiredCamPos.x = THREE.MathUtils.clamp(desiredCamPos.x, -56, 56);
        desiredCamPos.z = THREE.MathUtils.clamp(desiredCamPos.z, -56, 56);

        const lookAtTarget = playerPos.clone().add(new THREE.Vector3(0, 1.9, 0)).add(shoulderOffset.multiplyScalar(0.5));
        camController.update(camera, desiredCamPos, lookAtTarget, dt, 11.5, 13.0);

        // 10. Throttled HUD Sync (~10Hz)
        hudSyncTimer += dt;
        if (hudSyncTimer >= 0.1) {
          hudSyncTimer = 0;

          let nearbyPrompt: string | null = null;
          for (const res of world.resources) {
            if (!res.collected && res.position.distanceTo(playerPos) < 3.4) {
              nearbyPrompt = `Press [E] to gather ${res.kind.toUpperCase()}`;
              break;
            }
          }
          if (!nearbyPrompt) {
            for (const v of world.villagers) {
              if (v.position.distanceTo(playerPos) < 4.2) {
                nearbyPrompt = `Press [E] to talk to ${v.name}`;
                break;
              }
            }
          }

          const targetedOpt =
            targetedShrineIdx !== null && world.answerShrines[targetedShrineIdx]
              ? world.answerShrines[targetedShrineIdx].optionId
              : null;

          callbacksRef.current.onHudUpdate({
            phase: snap.phase,
            nightWave: Math.max(1, dayNightRef.current.nightCount || 1),
            zone: getZoneAtPosition(playerPos.x, playerPos.z),
            targetedShrineIndex: targetedShrineIdx,
            targetedOptionId: targetedOpt,
            nearbyPrompt,
            activeEnemiesCount: enemies.length,
            shrineOptions: shrineOptionsRef.current
          });
        }
      }

      postPipeline.render(dt);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      disposeThreeScene(scene, renderer, postPipeline, envTexture);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      worldRef.current = null;
    };
  }, [customization, audioManager, mobileInputRef]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: paused ? 'default' : 'crosshair',
        touchAction: 'none'
      }}
    />
  );
};
