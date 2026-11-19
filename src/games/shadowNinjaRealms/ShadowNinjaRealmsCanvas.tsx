import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  AdaptivePostProcessingPipeline,
  buildAtmosphericEnvMap,
  CinematicCameraController,
  disposeThreeScene
} from '../engine/VisualMasterpieceEngine';
import {
  EnergyCombatSystem,
  MovingAnswerTargetSystem,
  TargetMovementPattern
} from '../engine/CombatAndTargetsEngine';
import { ShadowNinjaRealmsAudio } from './AudioEngine';
import {
  animateHeroRig,
  buildFantasyGuardianRig,
  buildNinjaCharacterRig,
  buildVoxelHeroRig,
  FantasyEnemyRig
} from './CharacterRigBuilder';
import { validateRealmsAnswer } from './questionBank';
import { buildSkyAndCloudSystem } from './SkyAndCloudEngine';
import {
  AdventureMode,
  GraphicsTier,
  LiveRealmsHud,
  MinecraftBiomeId,
  NinjaCharacterId,
  NinjaRealmId,
  OptionId,
  PlacedBlockKind,
  RealmsAnswerOutcome,
  RealmsQuestion,
  VoxelCharacterId,
  WeatherType
} from './types';
import { buildRealmsWorld, BuiltRealmsWorld, updateRealmsShrineLabel } from './WorldsBuilder';

export interface MobileRealmsInput {
  moveX: number;
  moveY: number;
  jump: boolean;
  interact: boolean;
  ability: boolean;
  buildBlock: boolean;
}

export interface ShadowNinjaRealmsCanvasProps {
  paused: boolean;
  mode: AdventureMode;
  graphicsTier: GraphicsTier;
  weather: WeatherType;
  ninjaCharacter: NinjaCharacterId;
  voxelCharacter: VoxelCharacterId;
  ninjaRealm: NinjaRealmId;
  minecraftBiome: MinecraftBiomeId;
  selectedBlockKind: PlacedBlockKind;
  currentQuestion: RealmsQuestion;
  audio: ShadowNinjaRealmsAudio;
  quickCastSignal: { index: number; seq: number } | null;
  abilitySignal: number;
  buildSignal: number;
  mobileInputRef: React.MutableRefObject<MobileRealmsInput>;
  onHudUpdate: (hud: LiveRealmsHud) => void;
  onAnswerEvaluated: (outcome: RealmsAnswerOutcome) => void;
  onItemCollected: (kind: 'wood' | 'stone' | 'crystal' | 'scroll') => void;
  onBlockPlaced: (kind: PlacedBlockKind) => void;
  onEnemyBanished: () => void;
  onPlayerHit: (damage: number) => void;
  onPortalSwitch?: () => void;
  onPauseRequested: () => void;
}

interface EnemyEntity {
  rig: FantasyEnemyRig;
  hp: number;
  speed: number;
  cooldown: number;
  stunTimer: number;
}

interface BurstSpark {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

function collidesXZ(x: number, z: number, radius: number, world: BuiltRealmsWorld): boolean {
  for (const b of world.colliders) {
    if (x + radius > b.minX && x - radius < b.maxX && z + radius > b.minZ && z - radius < b.maxZ) {
      return true;
    }
  }
  return false;
}

export const ShadowNinjaRealmsCanvas: React.FC<ShadowNinjaRealmsCanvasProps> = ({
  paused,
  mode,
  graphicsTier,
  weather,
  ninjaCharacter,
  voxelCharacter,
  ninjaRealm,
  minecraftBiome,
  selectedBlockKind,
  currentQuestion,
  audio,
  quickCastSignal,
  abilitySignal,
  buildSignal,
  mobileInputRef,
  onHudUpdate,
  onAnswerEvaluated,
  onItemCollected,
  onBlockPlaced,
  onEnemyBanished,
  onPlayerHit,
  onPortalSwitch,
  onPauseRequested
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const weatherRef = useRef(weather);
  weatherRef.current = weather;
  const questionRef = useRef(currentQuestion);
  questionRef.current = currentQuestion;
  const blockKindRef = useRef(selectedBlockKind);
  blockKindRef.current = selectedBlockKind;

  const callbacksRef = useRef({
    onHudUpdate,
    onAnswerEvaluated,
    onItemCollected,
    onBlockPlaced,
    onEnemyBanished,
    onPlayerHit,
    onPortalSwitch,
    onPauseRequested
  });
  callbacksRef.current = {
    onHudUpdate,
    onAnswerEvaluated,
    onItemCollected,
    onBlockPlaced,
    onEnemyBanished,
    onPlayerHit,
    onPortalSwitch,
    onPauseRequested
  };

  const worldRef = useRef<BuiltRealmsWorld | null>(null);
  const answeredIdsRef = useRef<Set<string>>(new Set());
  const castShrineRef = useRef<((idx: number) => void) | null>(null);
  const abilityFnRef = useRef<(() => void) | null>(null);
  const buildFnRef = useRef<(() => void) | null>(null);
  const shrineOptsRef = useRef<Array<{ index: number; id: OptionId; text: string }>>([]);
  const movingTargetsRef = useRef<MovingAnswerTargetSystem | null>(null);

  const syncMovingTargets = (q: RealmsQuestion) => {
    const sys = movingTargetsRef.current;
    if (!sys) return;
    const patterns: TargetMovementPattern[] = ['horizontal', 'vertical', 'curved', 'patrol'];
    const basePositions = [
      new THREE.Vector3(-8.5, 2.8, -4.5),
      new THREE.Vector3(0, 3.4, -7.5),
      new THREE.Vector3(8.5, 2.8, -4.5),
      new THREE.Vector3(0, 4.0, 2.5)
    ];
    sys.setTargets(
      q.options.slice(0, 4).map((o, idx) => ({
        answerId: o.id,
        label: o.id,
        text: o.text,
        basePosition: basePositions[idx % basePositions.length],
        pattern: patterns[idx % patterns.length],
        amplitude: 2.2,
        speed: 1.15 + idx * 0.15,
        phaseOffset: idx * 1.4
      }))
    );
  };

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    const opts = currentQuestion.options.slice(0, 3);
    shrineOptsRef.current = opts.map((o, idx) => ({ index: idx, id: o.id, text: o.text }));
    world.shrines.forEach((rig, idx) => {
      const opt = opts[idx] || { id: 'A' as OptionId, text: '...' };
      updateRealmsShrineLabel(rig, opt.id, opt.text, false);
    });
    syncMovingTargets(currentQuestion);
  }, [currentQuestion]);

  useEffect(() => {
    if (quickCastSignal && castShrineRef.current) {
      castShrineRef.current(quickCastSignal.index);
    }
  }, [quickCastSignal]);

  useEffect(() => {
    if (abilitySignal > 0) abilityFnRef.current?.();
  }, [abilitySignal]);

  useEffect(() => {
    if (buildSignal > 0) buildFnRef.current?.();
  }, [buildSignal]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xbae6fd, 0.0085);

    const camera = new THREE.PerspectiveCamera(60, w / Math.max(1, h), 0.2, 320);

    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsTier !== 'low',
      powerPreference: 'high-performance'
    });
    renderer.setSize(w, h, false);
    const maxDpr = graphicsTier === 'ultra' ? 2 : graphicsTier === 'high' ? 1.75 : graphicsTier === 'medium' ? 1.3 : 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.shadowMap.enabled = graphicsTier !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const envTexture = buildAtmosphericEnvMap(renderer, '#38BDF8', '#E0F2FE', '#0F172A');
    scene.environment = envTexture;

    const pipelineTier = graphicsTier === 'ultra' ? 'high' : graphicsTier;
    const postPipeline = new AdaptivePostProcessingPipeline(renderer, scene, camera, w, h, pipelineTier, {
      strength: graphicsTier === 'ultra' ? 0.48 : 0.36,
      radius: 0.55,
      threshold: 0.78
    });

    const skyWeather = buildSkyAndCloudSystem(scene, graphicsTier, weatherRef.current);
    const world = buildRealmsWorld(scene, { mode, ninjaRealm, minecraftBiome, tier: graphicsTier });
    worldRef.current = world;

    const initOpts = questionRef.current.options.slice(0, 3);
    shrineOptsRef.current = initOpts.map((o, idx) => ({ index: idx, id: o.id, text: o.text }));
    world.shrines.forEach((rig, idx) => {
      const opt = initOpts[idx];
      if (opt) updateRealmsShrineLabel(rig, opt.id, opt.text, false);
    });

    const hero =
      mode === 'minecraft_realms'
        ? buildVoxelHeroRig(voxelCharacter)
        : buildNinjaCharacterRig(ninjaCharacter);
    hero.root.position.set(0, 0, 8);
    scene.add(hero.root);

    const shieldBubble = new THREE.Mesh(
      new THREE.SphereGeometry(1.35, 18, 14),
      new THREE.MeshBasicMaterial({
        color: '#38BDF8',
        transparent: true,
        opacity: 0.28,
        wireframe: true
      })
    );
    shieldBubble.position.y = 1.1;
    shieldBubble.visible = false;
    hero.root.add(shieldBubble);

    // 3D Floating Navigation Waypoint Arrow above/in front of player pointing to next objective
    const waypointArrowGroup = new THREE.Group();
    const arrowMat = new THREE.MeshStandardMaterial({
      color: '#FACC15',
      emissive: '#F59E0B',
      emissiveIntensity: 1.35,
      roughness: 0.2,
      metalness: 0.4
    });
    const arrowShaft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.65), arrowMat);
    arrowShaft.position.z = -0.15;
    const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 6), arrowMat);
    arrowHead.rotation.x = Math.PI / 2;
    arrowHead.position.z = 0.35;
    waypointArrowGroup.add(arrowShaft, arrowHead);
    waypointArrowGroup.position.set(0, 2.75, 8);
    scene.add(waypointArrowGroup);

    const discoveredZonesSet = new Set<string>(['Green Forest']);
    let activeNpcDialogue: { name: string; role: string; clue: string } | null = null;
    let npcDialogueTimer = 0;

    const combatSystem = new EnergyCombatSystem(100);
    const movingTargetSys = new MovingAnswerTargetSystem();
    movingTargetsRef.current = movingTargetSys;
    scene.add(movingTargetSys.root);
    syncMovingTargets(questionRef.current);

    const fireEnergyBolt = () => {
      if (pausedRef.current) return;
      audio.unlock();
      const aimDir = new THREE.Vector3();
      camera.getWorldDirection(aimDir);
      aimDir.normalize();
      const origin = playerPos.clone().add(new THREE.Vector3(0, 1.35, 0)).addScaledVector(aimDir, 1.1);
      const boltMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 10, 10),
        new THREE.MeshBasicMaterial({ color: '#38BDF8' })
      );
      scene.add(boltMesh);
      combatSystem.spawnProjectile({
        owner: 'player',
        origin,
        direction: aimDir,
        speed: 34,
        radius: 0.5,
        mesh: boltMesh
      });
      spawnSparks(origin, '#38BDF8', 4);
    };

    const enemies: EnemyEntity[] = [];
    const spawnEnemy = (x: number, z: number) => {
      const rig = buildFantasyGuardianRig(mode === 'minecraft_realms');
      rig.group.position.set(x, 0, z);
      scene.add(rig.group);
      enemies.push({ rig, hp: 2, speed: 2.35, cooldown: 1.5, stunTimer: 0 });
    };
    spawnEnemy(-14, -14);
    spawnEnemy(14, -14);
    spawnEnemy(0, -26);

    const sparks: BurstSpark[] = [];
    const spawnSparks = (origin: THREE.Vector3, colorHex: string, count: number) => {
      const geo = new THREE.OctahedronGeometry(0.16, 0);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(origin);
        scene.add(m);
        sparks.push({
          mesh: m,
          vel: new THREE.Vector3((Math.random() - 0.5) * 9, Math.random() * 6 + 2, (Math.random() - 0.5) * 9),
          life: 0,
          maxLife: 0.65
        });
      }
    };

    const camController = new CinematicCameraController(60, 1.45);
    const playerPos = new THREE.Vector3(0, 0, 8);
    let velY = 0;
    let isGrounded = true;
    let camYaw = 0;
    let camPitch = 0.25;
    let camDist = 8.2;
    let walkPhase = 0;
    let footstepTimer = 0;
    let attackTimer = 0;
    let targetedShrineIdx: number | null = null;
    let hudTimer = 0;
    let fpsSmoothed = 60;
    let isDragging = false;
    let lastPX = 0;
    let lastPY = 0;
    const keys: Record<string, boolean> = {};

    const castAtShrine = (idx: number) => {
      if (pausedRef.current) return;
      const shrine = world.shrines[idx];
      if (!shrine) return;
      audio.unlock();
      attackTimer = 0.36;
      const q = questionRef.current;
      const res = validateRealmsAnswer(q, shrine.optionId, answeredIdsRef.current);
      if (!res.accepted) return;

      if (res.isCorrect) {
        audio.playCorrect();
        camController.addShake(0.35);
        spawnSparks(shrine.position.clone().add(new THREE.Vector3(0, 2, 0)), '#22D3EE', 18);
      } else {
        audio.playWrong();
        camController.addShake(0.2);
        spawnSparks(shrine.position.clone().add(new THREE.Vector3(0, 2, 0)), '#F97316', 10);
      }
      callbacksRef.current.onAnswerEvaluated({
        accepted: res.accepted,
        isCorrect: res.isCorrect,
        question: q,
        chosenOptionId: shrine.optionId
      });
    };
    castShrineRef.current = castAtShrine;

    const triggerAbility = () => {
      if (pausedRef.current) return;
      audio.unlock();
      audio.playNinjaAbility();
      attackTimer = 0.38;
      camController.addShake(0.28);
      spawnSparks(playerPos.clone().add(new THREE.Vector3(0, 1.3, 0)), '#38BDF8', 16);

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.rig.group.position.distanceTo(playerPos) < 7.5) {
          e.hp -= 1;
          e.stunTimer = 2.0;
          spawnSparks(e.rig.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), '#FACC15', 10);
          if (e.hp <= 0) {
            scene.remove(e.rig.group);
            enemies.splice(i, 1);
            callbacksRef.current.onEnemyBanished();
            setTimeout(() => {
              if (worldRef.current === world) {
                spawnEnemy((Math.random() - 0.5) * 32, -22 - Math.random() * 14);
              }
            }, 6000);
          }
        }
      }
    };
    abilityFnRef.current = triggerAbility;

    const triggerBuildBlock = () => {
      if (pausedRef.current || mode !== 'minecraft_realms') return;
      audio.unlock();
      audio.playBlockPlace();
      const forward = new THREE.Vector3(Math.sin(hero.root.rotation.y), 0, Math.cos(hero.root.rotation.y));
      const bx = playerPos.x + forward.x * 2.4;
      const bz = playerPos.z + forward.z * 2.4;
      const kind = blockKindRef.current;
      world.placeVoxelBlock(kind, bx, playerPos.y + 0.75, bz);
      spawnSparks(new THREE.Vector3(bx, playerPos.y + 1, bz), '#38BDF8', 8);
      callbacksRef.current.onBlockPlaced(kind);
    };
    buildFnRef.current = triggerBuildBlock;

    const triggerInteract = () => {
      if (pausedRef.current) return;
      audio.unlock();
      for (const c of world.collectibles) {
        if (!c.collected && c.position.distanceTo(playerPos) < 3.4) {
          c.collected = true;
          c.mesh.visible = false;
          c.respawnTimer = 14;
          audio.playCollect();
          spawnSparks(c.position.clone().add(new THREE.Vector3(0, 1, 0)), '#FACC15', 10);
          callbacksRef.current.onItemCollected(c.kind);
          return;
        }
      }
      for (const npc of world.npcs) {
        if (npc.group.position.distanceTo(playerPos) < 3.8) {
          audio.playCollect();
          activeNpcDialogue = { name: npc.name, role: npc.role, clue: npc.clue };
          npcDialogueTimer = 6.5;
          spawnSparks(npc.group.position.clone().add(new THREE.Vector3(0, 1.8, 0)), '#38BDF8', 8);
          return;
        }
      }
      if (world.portalPos.distanceTo(playerPos) < 3.6) {
        audio.playNinjaAbility();
        callbacksRef.current.onPortalSwitch?.();
        return;
      }
      if (targetedShrineIdx !== null) {
        castAtShrine(targetedShrineIdx);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'Escape') {
        e.preventDefault();
        callbacksRef.current.onPauseRequested();
      } else if (e.code === 'Space' && isGrounded && !pausedRef.current) {
        e.preventDefault();
        velY = 9.4;
        isGrounded = false;
        audio.unlock();
        audio.playJump();
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        triggerInteract();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        triggerAbility();
      } else if (e.code === 'KeyB') {
        e.preventDefault();
        triggerBuildBlock();
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        fireEnergyBolt();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        const dodgeDir = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
        if (combatSystem.triggerDodge(dodgeDir)) {
          spawnSparks(playerPos.clone().add(new THREE.Vector3(0, 0.8, 0)), '#A855F7', 6);
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        combatSystem.activateShield(2.5);
      } else if (e.code === 'Digit1') castAtShrine(0);
      else if (e.code === 'Digit2') castAtShrine(1);
      else if (e.code === 'Digit3') castAtShrine(2);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    const onMouseDown = (e: MouseEvent) => {
      if (pausedRef.current) return;
      audio.unlock();
      isDragging = true;
      lastPX = e.clientX;
      lastPY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (pausedRef.current || !isDragging) return;
      const dx = e.clientX - lastPX;
      const dy = e.clientY - lastPY;
      lastPX = e.clientX;
      lastPY = e.clientY;
      camYaw -= dx * 0.0045;
      camPitch = THREE.MathUtils.clamp(camPitch + dy * 0.0035, 0.06, 0.78);
    };
    const onWheel = (e: WheelEvent) => {
      camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.006, 5.2, 13.5);
    };

    // Mobile right-side touch drag for smooth independent 3D camera rotation
    let activeLookTouchId: number | null = null;
    let lastTouchX = 0;
    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (pausedRef.current) return;
      audio.unlock();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX > window.innerWidth * 0.36 && activeLookTouchId === null) {
          activeLookTouchId = t.identifier;
          lastTouchX = t.clientX;
          lastTouchY = t.clientY;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (pausedRef.current || activeLookTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === activeLookTouchId) {
          const dx = t.clientX - lastTouchX;
          const dy = t.clientY - lastTouchY;
          lastTouchX = t.clientX;
          lastTouchY = t.clientY;
          camYaw -= dx * 0.0055;
          camPitch = THREE.MathUtils.clamp(camPitch + dy * 0.0042, 0.06, 0.78);
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeLookTouchId) {
          activeLookTouchId = null;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: true });
    renderer.domElement.addEventListener('touchcancel', onTouchEnd, { passive: true });

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

    audio.startAmbience(mode === 'minecraft_realms');

    let rafId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const elapsed = now * 0.001;
      fpsSmoothed = THREE.MathUtils.lerp(fpsSmoothed, 1 / dt, 0.08);

      if (!pausedRef.current) {
        const skyState = skyWeather.update(dt, elapsed, playerPos, weatherRef.current);
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.setHex(skyState.fogColor);
          scene.fog.density = skyState.fogDensity;
        }
        world.updateWater?.(elapsed);
        if (world.waterNormalMap) {
          world.waterNormalMap.offset.x = (elapsed * 0.03) % 1;
          world.waterNormalMap.offset.y = (elapsed * 0.022) % 1;
        }
        world.lanternLights.forEach((l, idx) => {
          l.intensity = 1.35 + Math.sin(elapsed * 7 + idx) * 0.18;
        });
        world.portalRing.rotation.z = elapsed * 1.8;
        world.floatingIslands.forEach((isl, idx) => {
          isl.position.y += Math.sin(elapsed * 0.8 + idx) * 0.008;
        });
        world.birds.forEach((b) => {
          const ang = elapsed * b.speed + b.phase;
          const bx = Math.cos(ang) * b.radius;
          const bz = Math.sin(ang) * b.radius - 12;
          b.group.position.set(bx, b.baseY + Math.sin(elapsed * 1.4 + b.phase) * 0.8, bz);
          b.group.rotation.y = -ang;
          const flap = Math.sin(elapsed * 9 + b.phase) * 0.35;
          if (b.group.children[0]) b.group.children[0].rotation.z = flap;
          if (b.group.children[1]) b.group.children[1].rotation.z = -flap;
        });

        let moveF = 0;
        let moveR = 0;
        if (keys['KeyW'] || keys['ArrowUp']) moveF += 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveF -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveR += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveR -= 1;

        if (Math.abs(mobileInputRef.current.moveX) > 0.08 || Math.abs(mobileInputRef.current.moveY) > 0.08) {
          moveR += mobileInputRef.current.moveX;
          moveF -= mobileInputRef.current.moveY;
        }
        if (mobileInputRef.current.jump && isGrounded) {
          velY = 9.4;
          isGrounded = false;
          mobileInputRef.current.jump = false;
          audio.playJump();
        }
        if (mobileInputRef.current.interact) {
          mobileInputRef.current.interact = false;
          triggerInteract();
        }
        if (mobileInputRef.current.ability) {
          mobileInputRef.current.ability = false;
          triggerAbility();
        }
        if (mobileInputRef.current.buildBlock) {
          mobileInputRef.current.buildBlock = false;
          triggerBuildBlock();
        }

        const isSprint = keys['ShiftLeft'] || keys['ShiftRight'];
        const moveSpeed = isSprint ? 11.4 : 7.8;
        const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
        const rgt = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));
        const moveVec = new THREE.Vector3().addScaledVector(fwd, moveF).addScaledVector(rgt, moveR);
        const len = moveVec.length();

        if (len > 0.05) {
          moveVec.normalize();
          const nx = THREE.MathUtils.clamp(playerPos.x + moveVec.x * moveSpeed * dt, -52, 52);
          const nz = THREE.MathUtils.clamp(playerPos.z + moveVec.z * moveSpeed * dt, -52, 52);
          if (!collidesXZ(nx, playerPos.z, 0.52, world)) playerPos.x = nx;
          if (!collidesXZ(playerPos.x, nz, 0.52, world)) playerPos.z = nz;

          const targetRot = Math.atan2(moveVec.x, moveVec.z);
          let diff = targetRot - hero.root.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          hero.root.rotation.y += diff * Math.min(1, dt * 12);

          walkPhase += dt * (isSprint ? 15 : 10.5);
          footstepTimer -= dt;
          if (isGrounded && footstepTimer <= 0) {
            footstepTimer = isSprint ? 0.24 : 0.34;
            audio.playFootstep();
          }
        }

        velY -= 24 * dt;
        playerPos.y += velY * dt;
        const floorY = Math.abs(playerPos.x) < 3.4 && playerPos.z > -23.5 && playerPos.z < -12.5 ? 0.34 : 0;
        if (playerPos.y <= floorY) {
          playerPos.y = floorY;
          velY = 0;
          isGrounded = true;
        }
        hero.root.position.copy(playerPos);

        if (attackTimer > 0) attackTimer -= dt;
        animateHeroRig(hero, {
          speed: len > 0.05 ? moveSpeed : 0,
          isGrounded,
          attackTimer,
          walkPhase,
          elapsed,
          dt
        });

        let bestIdx: number | null = null;
        let bestDist = 5.4;
        world.shrines.forEach((s, idx) => {
          // Answer character patrols its territory and turns toward player when nearby
          const patrolAngle = elapsed * 0.9 + idx * 2.1;
          const px = s.position.x + Math.cos(patrolAngle) * 1.45;
          const pz = s.position.z + Math.sin(patrolAngle) * 1.45;
          s.group.position.set(px, Math.abs(Math.sin(elapsed * 4 + idx)) * 0.08, pz);
          const d = s.group.position.distanceTo(playerPos);
          if (d < 9.5) {
            s.group.lookAt(playerPos.x, s.group.position.y, playerPos.z);
          } else {
            s.group.rotation.y = -patrolAngle;
          }
          s.crystal.rotation.y += dt * 1.8;
          s.labelMesh.lookAt(camera.position.x, s.labelMesh.position.y, camera.position.z);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = idx;
          }
        });
        if (bestIdx !== targetedShrineIdx) {
          targetedShrineIdx = bestIdx;
          world.shrines.forEach((s, idx) => {
            updateRealmsShrineLabel(s, s.optionId, s.optionText, idx === targetedShrineIdx);
          });
        }

        for (const c of world.collectibles) {
          if (c.collected) {
            c.respawnTimer -= dt;
            if (c.respawnTimer <= 0) {
              c.collected = false;
              c.mesh.visible = true;
            }
          } else {
            c.mesh.rotation.y += dt * 1.3;
          }
        }

        // Friendly NPC patrol & indicator animation
        world.npcs.forEach((npc, idx) => {
          const walkA = elapsed * 0.65 + idx * 2.2;
          npc.group.position.set(
            npc.position.x + Math.cos(walkA) * 1.1,
            0,
            npc.position.z + Math.sin(walkA) * 1.1
          );
          if (npc.group.position.distanceTo(playerPos) < 6.5) {
            npc.group.lookAt(playerPos.x, 0, playerPos.z);
          } else {
            npc.group.rotation.y = -walkA;
          }
          npc.indicator.rotation.y += dt * 2.1;
          npc.indicator.position.y = 2.55 + Math.sin(elapsed * 4 + idx) * 0.12;
        });

        if (npcDialogueTimer > 0) {
          npcDialogueTimer -= dt;
          if (npcDialogueTimer <= 0) {
            activeNpcDialogue = null;
          }
        }

        // Update 3D Waypoint Arrow above player pointing to nearest Answer Character
        let nearestShrine = world.shrines[0];
        let minShrineDist = Infinity;
        for (const s of world.shrines) {
          const d = s.group.position.distanceTo(playerPos);
          if (d < minShrineDist) {
            minShrineDist = d;
            nearestShrine = s;
          }
        }
        const targetShrine =
          targetedShrineIdx !== null && world.shrines[targetedShrineIdx]
            ? world.shrines[targetedShrineIdx]
            : nearestShrine;
        const objPos = targetShrine ? targetShrine.group.position : new THREE.Vector3(0, 0, -8);
        waypointArrowGroup.position.set(
          playerPos.x,
          playerPos.y + 2.85 + Math.sin(elapsed * 4.5) * 0.12,
          playerPos.z
        );
        waypointArrowGroup.lookAt(objPos.x, waypointArrowGroup.position.y, objPos.z);

        if (combatSystem.dodgeActive) {
          const dnx = THREE.MathUtils.clamp(playerPos.x + combatSystem.dodgeDirection.x * 16 * dt, -52, 52);
          const dnz = THREE.MathUtils.clamp(playerPos.z + combatSystem.dodgeDirection.z * 16 * dt, -52, 52);
          if (!collidesXZ(dnx, playerPos.z, 0.52, world)) playerPos.x = dnx;
          if (!collidesXZ(playerPos.x, dnz, 0.52, world)) playerPos.z = dnz;
        }
        shieldBubble.visible = combatSystem.shieldActive;
        if (combatSystem.shieldActive) {
          shieldBubble.rotation.y += dt * 2.4;
        }

        movingTargetSys.update(elapsed, 1.0);
        const combatStep = combatSystem.step(dt, playerPos, 0.75, movingTargetSys);
        for (const em of combatStep.expiredMeshes) {
          scene.remove(em);
        }
        if (combatStep.hitTarget) {
          const hitId = combatStep.hitTarget.config.answerId as OptionId;
          const outcome = validateRealmsAnswer(questionRef.current, hitId);
          spawnSparks(combatStep.hitTarget.position, outcome.isCorrect ? '#22C55E' : '#F97316', 14);
          if (outcome.isCorrect) audio.playCorrect();
          else audio.playWrong();
          callbacksRef.current.onAnswerEvaluated(outcome);
        }
        if (combatStep.playerDamaged > 0) {
          camController.addShake(0.32);
          callbacksRef.current.onPlayerHit(combatStep.playerDamaged);
        } else if (combatStep.absorbedByShield) {
          spawnSparks(playerPos.clone().add(new THREE.Vector3(0, 1.1, 0)), '#38BDF8', 8);
        }

        for (const e of enemies) {
          e.core.rotation.y += dt * 2.5;
          if (e.stunTimer > 0) {
            e.stunTimer -= dt;
            continue;
          }
          const dist = e.rig.group.position.distanceTo(playerPos);
          if (dist < 16 && dist > 5.5) {
            const dir = playerPos.clone().sub(e.rig.group.position);
            dir.y = 0;
            dir.normalize();
            e.rig.group.position.addScaledVector(dir, e.speed * dt);
            e.rig.group.lookAt(playerPos.x, 0, playerPos.z);

            e.cooldown -= dt;
            if (e.cooldown <= 0) {
              e.cooldown = 2.6;
              const orbOrigin = e.rig.group.position.clone().add(new THREE.Vector3(0, 1.2, 0));
              const orbDir = playerPos.clone().add(new THREE.Vector3(0, 1.0, 0)).sub(orbOrigin);
              const orbMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.26, 8, 8),
                new THREE.MeshBasicMaterial({ color: '#EF4444' })
              );
              scene.add(orbMesh);
              combatSystem.spawnProjectile({
                owner: 'enemy',
                origin: orbOrigin,
                direction: orbDir,
                speed: 14,
                radius: 0.38,
                damage: 8,
                mesh: orbMesh
              });
            }
          } else if (dist <= 5.5 && dist > 1.8) {
            const dir = playerPos.clone().sub(e.rig.group.position);
            dir.y = 0;
            dir.normalize();
            e.rig.group.position.addScaledVector(dir, e.speed * dt);
            e.rig.group.lookAt(playerPos.x, 0, playerPos.z);
          } else if (dist <= 1.8) {
            e.cooldown -= dt;
            if (e.cooldown <= 0) {
              e.cooldown = 2.0;
              camController.addShake(0.32);
              callbacksRef.current.onPlayerHit(10);
            }
          }
        }

        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.life += dt;
          if (sp.life >= sp.maxLife) {
            scene.remove(sp.mesh);
            sparks.splice(i, 1);
          } else {
            sp.vel.y -= 13 * dt;
            sp.mesh.position.addScaledVector(sp.vel, dt);
            sp.mesh.scale.setScalar(Math.max(0.05, 1 - sp.life / sp.maxLife));
          }
        }

        const desiredCam = new THREE.Vector3(
          playerPos.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist,
          Math.max(1.2, playerPos.y + Math.sin(camPitch) * camDist + 2.1),
          playerPos.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist
        );
        const lookAt = playerPos.clone().add(new THREE.Vector3(0, 1.75, 0));
        camController.update(camera, desiredCam, lookAt, dt, 10.5, 12.5);

        hudTimer += dt;
        if (hudTimer >= 0.1) {
          hudTimer = 0;
          const currentZone = world.getZoneName(playerPos.x, playerPos.z);
          discoveredZonesSet.add(currentZone);

          let nearbyPrompt: string | null = null;
          for (const c of world.collectibles) {
            if (!c.collected && c.position.distanceTo(playerPos) < 3.4) {
              nearbyPrompt = `Press [E] to collect ${c.kind.toUpperCase()}`;
              break;
            }
          }
          if (!nearbyPrompt) {
            for (const npc of world.npcs) {
              if (npc.group.position.distanceTo(playerPos) < 3.8) {
                nearbyPrompt = `Press [E] to talk to ${npc.name} (${npc.role})`;
                break;
              }
            }
          }
          if (!nearbyPrompt && world.portalPos.distanceTo(playerPos) < 3.6) {
            nearbyPrompt = `Press [E] to enter Realm Portal (${mode === 'shadow_ninja' ? 'Minecraft Realms' : 'Shadow Ninja'})`;
          }
          if (!nearbyPrompt && targetedShrineIdx !== null) {
            const s = world.shrines[targetedShrineIdx];
            nearbyPrompt = `Press [E] to interact with Answer Guardian ${s.optionId}: ${s.optionText}`;
          }

          const objDist = Math.round(objPos.distanceTo(playerPos));
          const objBearing = Math.round(
            (Math.atan2(objPos.x - playerPos.x, -(objPos.z - playerPos.z)) * 180) / Math.PI
          );
          const objLabel = targetShrine
            ? `Answer Guardian ${targetShrine.optionId} (${objDist}m)`
            : `Next Objective (${objDist}m)`;

          callbacksRef.current.onHudUpdate({
            mode,
            zoneName: currentZone,
            weather: weatherRef.current,
            timeOfDayLabel: skyState.timeLabel,
            nearbyPrompt,
            targetedShrineIndex: targetedShrineIdx,
            targetedOptionId: targetedShrineIdx !== null ? world.shrines[targetedShrineIdx].optionId : null,
            shrineOptions: shrineOptsRef.current,
            activeEnemiesCount: enemies.length,
            fpsEstimate: Math.round(fpsSmoothed),
            playerX: Math.round(playerPos.x * 10) / 10,
            playerZ: Math.round(playerPos.z * 10) / 10,
            objectiveDistanceMeters: objDist,
            objectiveBearingDeg: objBearing,
            objectiveLabel: objLabel,
            discoveredZones: Array.from(discoveredZonesSet),
            npcDialogue: activeNpcDialogue
          });
        }
      }

      postPipeline.render(dt);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      audio.stopAmbience();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.domElement.removeEventListener('touchcancel', onTouchEnd);
      disposeThreeScene(scene, renderer, postPipeline, envTexture);
      worldRef.current = null;
    };
  }, [mode, graphicsTier, ninjaCharacter, voxelCharacter, ninjaRealm, minecraftBiome, audio, mobileInputRef]);

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
