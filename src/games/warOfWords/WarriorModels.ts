import * as THREE from 'three';
import { getPbrTextureSet, PbrMaterialKind } from '../engine/PbrTextureFactory';
import { createContactShadowMesh, createVolumetricLightShafts } from '../engine/VisualMasterpieceEngine';
import { GraphicsQuality, OptionId, WarriorCustomization, WorldId } from './types';

function makeMesh(
  geo: THREE.BufferGeometry,
  color: string | number,
  opts?: {
    emissive?: string | number;
    emissiveIntensity?: number;
    roughness?: number;
    metalness?: number;
    pbr?: PbrMaterialKind;
    repeat?: number;
  }
): THREE.Mesh {
  const pbrSet = opts?.pbr && typeof document !== 'undefined'
    ? getPbrTextureSet(opts.pbr, opts.repeat ?? 1, opts.repeat ?? 1)
    : null;
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts?.roughness ?? 0.6,
    metalness: opts?.metalness ?? 0.22,
    emissive: opts?.emissive ?? 0x000000,
    emissiveIntensity: opts?.emissiveIntensity ?? 0,
    normalMap: pbrSet?.normalMap ?? null,
    roughnessMap: pbrSet?.roughnessMap ?? null,
    normalScale: pbrSet ? new THREE.Vector2(0.55, 0.55) : undefined
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export interface ShadowWarriorRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cloak: THREE.Mesh;
  blade: THREE.Mesh;
}

export function buildShadowWarrior(custom: WarriorCustomization): ShadowWarriorRig {
  const root = new THREE.Group();
  root.add(createContactShadowMesh(0.8));
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(0, 0.8, -0.18);
  const legL = makeMesh(new THREE.BoxGeometry(0.32, 0.8, 0.28), custom.armorColor, { metalness: 0.4 });
  legL.position.y = -0.4;
  leftLeg.add(legL);
  bodyPivot.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0, 0.8, 0.18);
  const legR = makeMesh(new THREE.BoxGeometry(0.32, 0.8, 0.28), custom.armorColor, { metalness: 0.4 });
  legR.position.y = -0.4;
  rightLeg.add(legR);
  bodyPivot.add(rightLeg);

  // Armored Torso
  const torso = makeMesh(new THREE.BoxGeometry(0.54, 0.92, 0.72), custom.armorColor, { metalness: 0.45 });
  torso.position.y = 1.26;
  bodyPivot.add(torso);

  // Arcane Core Emblem on chest
  const chestCore = makeMesh(new THREE.OctahedronGeometry(0.16, 0), custom.glowColor, {
    emissive: custom.glowColor,
    emissiveIntensity: 1.3
  });
  chestCore.position.set(0.26, 1.35, 0);
  bodyPivot.add(chestCore);

  // Flowing Cloak (trails behind along -X when facing +X)
  const cloak = makeMesh(new THREE.BoxGeometry(0.14, 1.15, 0.78), custom.cloakColor, { roughness: 0.85 });
  cloak.position.set(-0.34, 1.12, 0);
  cloak.rotation.z = -0.18;
  bodyPivot.add(cloak);

  // Head + Helm Style
  const head = makeMesh(new THREE.BoxGeometry(0.46, 0.48, 0.46), '#0F172A');
  head.position.y = 1.98;
  bodyPivot.add(head);

  // Glowing Visor Eyes (facing +X)
  const visor = makeMesh(new THREE.BoxGeometry(0.08, 0.1, 0.34), custom.glowColor, {
    emissive: custom.glowColor,
    emissiveIntensity: 1.6
  });
  visor.position.set(0.22, 2.0, 0);
  bodyPivot.add(visor);

  if (custom.helmStyle === 'hood') {
    const hood = makeMesh(new THREE.ConeGeometry(0.44, 0.56, 4), custom.cloakColor);
    hood.position.set(-0.04, 2.28, 0);
    hood.rotation.y = Math.PI / 4;
    hood.rotation.z = 0.22;
    bodyPivot.add(hood);
  } else if (custom.helmStyle === 'horned') {
    const hornL = makeMesh(new THREE.ConeGeometry(0.09, 0.42, 6), custom.glowColor, {
      emissive: custom.glowColor,
      emissiveIntensity: 0.8
    });
    hornL.position.set(0.05, 2.34, -0.22);
    hornL.rotation.x = -0.35;
    const hornR = hornL.clone();
    hornR.position.z = 0.22;
    hornR.rotation.x = 0.35;
    bodyPivot.add(hornL, hornR);
  } else {
    const crest = makeMesh(new THREE.BoxGeometry(0.46, 0.26, 0.1), custom.glowColor, {
      emissive: custom.glowColor,
      emissiveIntensity: 0.9
    });
    crest.position.set(-0.04, 2.34, 0);
    bodyPivot.add(crest);
  }

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(0, 1.62, -0.46);
  const armL = makeMesh(new THREE.BoxGeometry(0.26, 0.72, 0.24), custom.armorColor);
  armL.position.y = -0.3;
  leftArm.add(armL);
  bodyPivot.add(leftArm);

  // Right Arm + Cyan Arcane Runeblade
  const rightArm = new THREE.Group();
  rightArm.position.set(0, 1.62, 0.46);
  const armR = makeMesh(new THREE.BoxGeometry(0.26, 0.72, 0.24), custom.armorColor);
  armR.position.y = -0.3;
  rightArm.add(armR);

  const hilt = makeMesh(new THREE.BoxGeometry(0.32, 0.1, 0.1), '#94A3B8', { metalness: 0.78, pbr: 'metal' });
  hilt.position.set(0.24, -0.58, 0);
  const blade = makeMesh(new THREE.BoxGeometry(1.24, 0.12, 0.06), custom.glowColor, {
    emissive: custom.glowColor,
    emissiveIntensity: 1.65,
    roughness: 0.15,
    metalness: 0.5
  });
  blade.position.set(0.88, -0.58, 0);
  const bladeLight = new THREE.PointLight(custom.glowColor, 0.85, 5.5);
  blade.add(bladeLight);
  rightArm.add(hilt, blade);
  bodyPivot.add(rightArm);

  return { root, bodyPivot, leftArm, rightArm, leftLeg, rightLeg, cloak, blade };
}

export interface AnswerSentinelRig {
  index: number;
  group: THREE.Group;
  body: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  ring: THREE.Mesh;
  labelMesh: THREE.Mesh;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  optionId: OptionId;
  optionText: string;
}

/**
 * Builds 3 articulated 3D Enemy Shadow Ninja Characters representing Answer Options A, B, and C.
 */
export function buildAnswerSentinel(index: number): AnswerSentinelRig {
  const group = new THREE.Group();
  group.add(createContactShadowMesh(1.05));

  const outfits = [
    { armor: '#1E293B', cloak: '#7F1D1D', accent: '#EF4444' },
    { armor: '#1E293B', cloak: '#064E3B', accent: '#10B981' },
    { armor: '#1E293B', cloak: '#1E3A8A', accent: '#38BDF8' }
  ];
  const outfit = outfits[index % outfits.length];

  const ringMat = new THREE.MeshBasicMaterial({
    color: outfit.accent,
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.32, 24), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;

  // Articulated Enemy Shadow Ninja (Legs, Torso, Cloak, Hooded Head, Glowing Visor, Arms & Twin Blades)
  const legL = makeMesh(new THREE.BoxGeometry(0.28, 0.78, 0.28), outfit.armor, { metalness: 0.35 });
  legL.position.set(0, 0.39, -0.16);
  const legR = makeMesh(new THREE.BoxGeometry(0.28, 0.78, 0.28), outfit.armor, { metalness: 0.35 });
  legR.position.set(0, 0.39, 0.16);

  const body = makeMesh(new THREE.BoxGeometry(0.54, 0.9, 0.68), outfit.armor, {
    emissive: outfit.cloak,
    emissiveIntensity: 0.28,
    metalness: 0.42
  });
  body.position.y = 1.24;

  const cloak = makeMesh(new THREE.BoxGeometry(0.14, 1.08, 0.72), outfit.cloak, { roughness: 0.85 });
  cloak.position.set(0.32, 1.1, 0);
  cloak.rotation.z = 0.18;

  const head = makeMesh(new THREE.BoxGeometry(0.44, 0.46, 0.44), '#0F172A');
  head.position.y = 1.95;

  const visor = makeMesh(new THREE.BoxGeometry(0.08, 0.09, 0.32), outfit.accent, {
    emissive: outfit.accent,
    emissiveIntensity: 1.5
  });
  visor.position.set(-0.22, 1.97, 0);

  const hood = makeMesh(new THREE.ConeGeometry(0.42, 0.52, 4), outfit.cloak);
  hood.position.set(0.04, 2.24, 0);
  hood.rotation.y = Math.PI / 4;
  hood.rotation.z = -0.2;

  const armL = makeMesh(new THREE.BoxGeometry(0.24, 0.68, 0.24), outfit.armor);
  armL.position.set(-0.1, 1.32, -0.44);
  armL.rotation.z = 0.35;
  const armR = makeMesh(new THREE.BoxGeometry(0.24, 0.68, 0.24), outfit.armor);
  armR.position.set(-0.1, 1.32, 0.44);
  armR.rotation.z = 0.35;

  const daggerL = makeMesh(new THREE.BoxGeometry(0.75, 0.06, 0.05), outfit.accent, {
    emissive: outfit.accent,
    emissiveIntensity: 0.9
  });
  daggerL.position.set(-0.48, 1.15, -0.44);
  const daggerR = daggerL.clone();
  daggerR.position.z = 0.44;

  // Floating CanvasTexture label above enemy ninja
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 176;
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.45),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
  );
  labelMesh.position.y = 3.35;

  group.add(ring, legL, legR, body, cloak, head, visor, hood, armL, armR, daggerL, daggerR, labelMesh);

  const rig: AnswerSentinelRig = {
    index,
    group,
    body,
    leftLeg: legL,
    rightLeg: legR,
    leftArm: armL,
    rightArm: armR,
    ring,
    labelMesh,
    canvas,
    texture,
    optionId: 'A',
    optionText: '...'
  };
  updateSentinelLabel(rig, 'A', '...', false);
  return rig;
}

export function updateSentinelLabel(
  rig: AnswerSentinelRig,
  optionId: OptionId,
  optionText: string,
  isSelected: boolean
): void {
  rig.optionId = optionId;
  rig.optionText = optionText;

  const mat = rig.ring.material as THREE.MeshBasicMaterial;
  mat.opacity = isSelected ? 0.95 : 0.3;
  mat.color.set(isSelected ? '#22D3EE' : '#64748B');

  const ctx = rig.canvas.getContext('2d');
  if (!ctx) return;

  const w = rig.canvas.width;
  const h = rig.canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = isSelected ? 'rgba(8, 51, 68, 0.95)' : 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = isSelected ? '#22D3EE' : '#64748B';
  ctx.lineWidth = isSelected ? 7 : 4;

  ctx.beginPath();
  ctx.roundRect(10, 10, w - 20, h - 20, 24);
  ctx.fill();
  ctx.stroke();

  // Option badge
  ctx.fillStyle = isSelected ? '#22D3EE' : '#334155';
  ctx.beginPath();
  ctx.arc(58, h / 2, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isSelected ? '#082F49' : '#F8FAFC';
  ctx.font = 'bold 34px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(optionId, 58, h / 2 + 2);

  // Word text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const maxW = w - 120;
  const words = optionText.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const wd of words) {
    const test = cur ? `${cur} ${wd}` : wd;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = wd;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);

  const vis = lines.slice(0, 2);
  if (vis.length === 1) {
    ctx.fillText(vis[0], 106, h / 2 + 2);
  } else {
    ctx.fillText(vis[0], 106, h / 2 - 18);
    ctx.fillText(vis[1], 106, h / 2 + 20);
  }

  rig.texture.needsUpdate = true;
}

export interface PlatformBox {
  minX: number;
  maxX: number;
  topY: number;
  bottomY: number;
}

export interface VocabularyNpcEntity {
  id: string;
  name: string;
  role: string;
  dialogue: string;
  position: THREE.Vector3;
  group: THREE.Group;
  indicator: THREE.Mesh;
}

export interface WorldEnvironmentResult {
  root: THREE.Group;
  platforms: PlatformBox[];
  torchLights: THREE.PointLight[];
  npcs: VocabularyNpcEntity[];
  skyColor: string;
  fogColor: string;
}

export function buildWorldEnvironment(
  scene: THREE.Scene,
  worldId: WorldId,
  quality: GraphicsQuality
): WorldEnvironmentResult {
  const root = new THREE.Group();
  const platforms: PlatformBox[] = [];
  const torchLights: THREE.PointLight[] = [];
  const npcs: VocabularyNpcEntity[] = [];

  const themes: Record<WorldId, { sky: string; fog: string; ground: string; stone: string; accent: string }> = {
    moonlight_valley: { sky: '#070D1F', fog: '#0B1736', ground: '#10241E', stone: '#334155', accent: '#22D3EE' },
    shadow_forest: { sky: '#061412', fog: '#0A241E', ground: '#0B2E1E', stone: '#3F2E21', accent: '#34D399' },
    ancient_kingdom: { sky: '#140F26', fog: '#21193D', ground: '#1E293B', stone: '#475569', accent: '#F59E0B' },
    crystal_caverns: { sky: '#060F24', fog: '#0B1D40', ground: '#172554', stone: '#1E3A8A', accent: '#38BDF8' },
    sky_of_knowledge: { sky: '#0C0A24', fog: '#1E1B4B', ground: '#312E81', stone: '#4338CA', accent: '#A855F7' },
    training_arena: { sky: '#1A110B', fog: '#2E1E12', ground: '#3B2818', stone: '#78350F', accent: '#FB923C' }
  };
  const theme = themes[worldId];

  // Main Ground Path (x: -22 to +44) with PBR stone/earth normal map
  const ground = makeMesh(new THREE.BoxGeometry(72, 2, 12), theme.ground, { roughness: 0.88, pbr: 'grass', repeat: 8 });
  ground.position.set(11, -1, 0);
  root.add(ground);

  // Ancient Stone Bridge / Walkway inlay with PBR stone
  const bridge = makeMesh(new THREE.BoxGeometry(68, 0.2, 4.4), theme.stone, { roughness: 0.72, metalness: 0.18, pbr: 'stone', repeat: 10 });
  bridge.position.set(11, 0.02, 0);
  root.add(bridge);

  if (quality !== 'low') {
    const shafts = createVolumetricLightShafts(
      [
        { x: -3, y: 11, z: -4, rotZ: -0.22, scale: 0.9 },
        { x: 9, y: 12, z: -5, rotZ: -0.18, scale: 1.0 },
        { x: 21, y: 11, z: -4, rotZ: -0.24, scale: 0.9 }
      ],
      theme.accent,
      0.06
    );
    root.add(shafts);
  }

  // Raised Stone Platforms along the 2.5D path (for jumping & platforming)
  const platformSpecs: Array<{ x: number; y: number; w: number }> = [
    { x: -2, y: 1.8, w: 4.5 },
    { x: 6, y: 2.6, w: 4.2 },
    { x: 14, y: 1.9, w: 4.5 },
    { x: 22, y: 2.8, w: 4.5 }
  ];
  for (const ps of platformSpecs) {
    const plat = makeMesh(new THREE.BoxGeometry(ps.w, 0.45, 3.2), theme.stone);
    plat.position.set(ps.x, ps.y - 0.225, 0);
    root.add(plat);
    platforms.push({
      minX: ps.x - ps.w / 2,
      maxX: ps.x + ps.w / 2,
      topY: ps.y,
      bottomY: ps.y - 0.45
    });
  }

  // Giant Glowing Moon in Parallax Background
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(6.5, quality === 'low' ? 14 : 24, quality === 'low' ? 14 : 24),
    new THREE.MeshBasicMaterial({ color: '#E0F2FE' })
  );
  moon.position.set(16, 15, -36);
  root.add(moon);

  // Distant Mountain Silhouettes
  const mountainMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.95 });
  for (let i = -3; i <= 5; i++) {
    const h = 10 + (Math.abs(i * 3) % 7);
    const m = new THREE.Mesh(new THREE.ConeGeometry(8, h, 5), mountainMat);
    m.position.set(i * 11, h / 2 - 2, -24 - (Math.abs(i) % 2) * 5);
    root.add(m);
  }

  // Ruined Pillars & Warm Orange Torches
  const pillarX = [-10, 0, 10, 20, 30];
  for (const px of pillarX) {
    const pillar = makeMesh(new THREE.BoxGeometry(1.1, 4.2, 1.1), theme.stone);
    pillar.position.set(px, 2.1, -3.4);
    root.add(pillar);

    const flame = makeMesh(new THREE.BoxGeometry(0.36, 0.48, 0.36), '#FB923C', {
      emissive: '#FF6A00',
      emissiveIntensity: 1.6
    });
    flame.position.set(px, 4.45, -3.4);
    root.add(flame);

    if (quality !== 'low') {
      const ptLight = new THREE.PointLight('#FF7A1A', 2.4, 14, 1.5);
      ptLight.position.set(px, 4.6, -2.8);
      root.add(ptLight);
      torchLights.push(ptLight);
    }
  }

  // Area-Specific 3D Landmarks (1. Moonlit Forest, 2. Ancient Temple, 3. Mountain Path, 4. Crystal Cave, 5. Castle Library)
  if (worldId === 'moonlight_valley' || worldId === 'shadow_forest') {
    for (const tx of [-12, -4, 8, 17, 26]) {
      const trunk = makeMesh(new THREE.CylinderGeometry(0.32, 0.45, 3.8, 8), '#451A03');
      trunk.position.set(tx, 1.9, -4.4);
      const canopy = makeMesh(new THREE.DodecahedronGeometry(2.2, 1), '#065F46');
      canopy.position.set(tx, 4.4, -4.4);
      root.add(trunk, canopy);
    }
  } else if (worldId === 'ancient_kingdom') {
    // Ancient Temple stone gateways & carved doors
    for (const gx of [1, 18]) {
      const gateL = makeMesh(new THREE.BoxGeometry(0.8, 4.8, 0.8), '#64748B');
      gateL.position.set(gx - 2.2, 2.4, -3.2);
      const gateR = gateL.clone();
      gateR.position.x = gx + 2.2;
      const lintel = makeMesh(new THREE.BoxGeometry(5.6, 0.7, 1.0), '#F59E0B');
      lintel.position.set(gx, 4.9, -3.2);
      root.add(gateL, gateR, lintel);
    }
  } else if (worldId === 'crystal_caverns') {
    // Crystal Cave glowing crystal clusters
    for (const cx of [-6, 3, 12, 21, 28]) {
      const crystal = makeMesh(new THREE.OctahedronGeometry(1.1, 0), '#38BDF8', {
        emissive: '#0284C7',
        emissiveIntensity: 1.4
      });
      crystal.position.set(cx, 1.2, -3.8);
      root.add(crystal);
    }
  } else if (worldId === 'sky_of_knowledge') {
    // Castle Library bookshelves & floating glowing word scrolls
    for (const bx of [-5, 7, 19]) {
      const shelf = makeMesh(new THREE.BoxGeometry(3.2, 3.8, 0.8), '#78350F');
      shelf.position.set(bx, 1.9, -4.1);
      const scroll = makeMesh(new THREE.CylinderGeometry(0.18, 0.18, 0.85, 10), '#FDE047', {
        emissive: '#F59E0B',
        emissiveIntensity: 1.2
      });
      scroll.rotation.z = Math.PI / 3;
      scroll.position.set(bx, 4.3, -3.5);
      root.add(shelf, scroll);
    }
  }

  // Friendly Guides, Librarians & Explorer NPCs with distinct outfits and vocabulary clues
  const npcSpecs = [
    {
      id: 'npc-librarian-elena',
      name: 'Librarian Elena',
      role: 'Castle Lexicon Keeper',
      dialogue: 'Look at the context clue and prefix/root of the word! Press [Q] anytime for an Arcane Vocabulary Insight.',
      robeColor: '#7C3AED',
      x: -3.5,
      z: -2.2
    },
    {
      id: 'npc-explorer-kenji',
      name: 'Scout Kenji',
      role: 'Moonlit Forest & Temple Guide',
      dialogue: 'Follow the golden 3D Direction Arrow above you! Approach the enemy sentinel carrying the matching word and strike.',
      robeColor: '#0D9488',
      x: 9.5,
      z: -2.2
    },
    {
      id: 'npc-sage-alaric',
      name: 'Chronicler Alaric',
      role: 'Crystal Cave Etymologist',
      dialogue: 'Every word you master unlocks its pronunciation, syllables, part of speech, synonyms, and a memory tip!',
      robeColor: '#D97706',
      x: 18.5,
      z: -2.2
    }
  ];

  for (const ns of npcSpecs) {
    const npcGroup = new THREE.Group();
    npcGroup.position.set(ns.x, 0, ns.z);
    const legs = makeMesh(new THREE.BoxGeometry(0.46, 0.72, 0.32), '#1E293B');
    legs.position.y = 0.36;
    const robe = makeMesh(new THREE.BoxGeometry(0.62, 0.86, 0.42), ns.robeColor);
    robe.position.y = 1.15;
    const head = makeMesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), '#F1C27D');
    head.position.y = 1.84;
    const indicator = makeMesh(new THREE.OctahedronGeometry(0.2, 0), '#FACC15', {
      emissive: '#F59E0B',
      emissiveIntensity: 1.35
    });
    indicator.position.y = 2.52;
    npcGroup.add(legs, robe, head, indicator);
    root.add(npcGroup);
    npcs.push({
      id: ns.id,
      name: ns.name,
      role: ns.role,
      dialogue: ns.dialogue,
      position: new THREE.Vector3(ns.x, 0, ns.z),
      group: npcGroup,
      indicator
    });
  }

  scene.add(root);

  return {
    root,
    platforms,
    torchLights,
    npcs,
    skyColor: theme.sky,
    fogColor: theme.fog
  };
}
