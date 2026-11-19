import * as THREE from 'three';
import { getPbrTextureSet, PbrMaterialKind } from '../engine/PbrTextureFactory';
import { createContactShadowMesh } from '../engine/VisualMasterpieceEngine';
import { EnemyType, OptionId, PlayerCustomization } from './types';

function makeBox(
  w: number,
  h: number,
  d: number,
  color: string | number,
  opts?: {
    emissive?: string | number;
    emissiveIntensity?: number;
    roughness?: number;
    metalness?: number;
    pbr?: PbrMaterialKind;
  }
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const pbrSet = opts?.pbr ? getPbrTextureSet(opts.pbr, 1, 1) : null;
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts?.roughness ?? 0.72,
    metalness: opts?.metalness ?? 0.12,
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

export interface VoxelPlayerRig {
  group: THREE.Group;
  bodyPivot: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cape: THREE.Mesh;
  staffOrb: THREE.Mesh;
  companionGroup: THREE.Group | null;
}

export function buildVoxelPlayer(customization: PlayerCustomization): VoxelPlayerRig {
  const group = new THREE.Group();
  group.add(createContactShadowMesh(0.75));
  const bodyPivot = new THREE.Group();
  group.add(bodyPivot);

  // Legs (pivot at hip y = 0.75)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.2, 0.75, 0);
  const leftLegMesh = makeBox(0.32, 0.75, 0.32, '#1E293B');
  leftLegMesh.position.y = -0.375;
  leftLeg.add(leftLegMesh);
  bodyPivot.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.2, 0.75, 0);
  const rightLegMesh = makeBox(0.32, 0.75, 0.32, '#1E293B');
  rightLegMesh.position.y = -0.375;
  rightLeg.add(rightLegMesh);
  bodyPivot.add(rightLeg);

  // Torso
  const torso = makeBox(0.76, 0.85, 0.42, customization.shirtColor);
  torso.position.y = 1.18;
  bodyPivot.add(torso);

  // Belt
  const belt = makeBox(0.78, 0.14, 0.44, '#3F2A1D');
  belt.position.y = 0.84;
  bodyPivot.add(belt);

  // Cape
  const cape = makeBox(0.68, 0.92, 0.08, customization.capeColor);
  cape.position.set(0, 1.1, -0.26);
  cape.rotation.x = 0.12;
  bodyPivot.add(cape);

  // Head
  const head = makeBox(0.62, 0.62, 0.62, customization.skinTone);
  head.position.y = 1.92;
  bodyPivot.add(head);

  // Eyes (facing +Z local forward)
  const leftEye = makeBox(0.1, 0.1, 0.05, '#111827');
  leftEye.position.set(-0.14, 1.94, 0.31);
  bodyPivot.add(leftEye);
  const rightEye = makeBox(0.1, 0.1, 0.05, '#111827');
  rightEye.position.set(0.14, 1.94, 0.31);
  bodyPivot.add(rightEye);

  // Hair cap
  const hairTop = makeBox(0.66, 0.16, 0.66, customization.hairColor);
  hairTop.position.set(0, 2.22, -0.02);
  bodyPivot.add(hairTop);

  // Hat options
  if (customization.hatStyle === 'wizard') {
    const brim = makeBox(0.95, 0.1, 0.95, '#312E81');
    brim.position.y = 2.3;
    bodyPivot.add(brim);
    const cone1 = makeBox(0.56, 0.36, 0.56, '#4338CA');
    cone1.position.y = 2.52;
    bodyPivot.add(cone1);
    const cone2 = makeBox(0.32, 0.32, 0.32, '#6366F1');
    cone2.position.y = 2.84;
    bodyPivot.add(cone2);
  } else if (customization.hatStyle === 'helmet') {
    const helm = makeBox(0.7, 0.32, 0.7, '#94A3B8', { metalness: 0.6, roughness: 0.35 });
    helm.position.y = 2.26;
    bodyPivot.add(helm);
    const crest = makeBox(0.14, 0.24, 0.44, '#FF6A00');
    crest.position.y = 2.48;
    bodyPivot.add(crest);
  } else if (customization.hatStyle === 'crown') {
    const crown = makeBox(0.68, 0.2, 0.68, '#FACC15', { metalness: 0.65, roughness: 0.3 });
    crown.position.y = 2.34;
    bodyPivot.add(crown);
  }

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.54, 1.54, 0);
  const leftArmMesh = makeBox(0.28, 0.76, 0.28, customization.shirtColor);
  leftArmMesh.position.y = -0.32;
  leftArm.add(leftArmMesh);
  bodyPivot.add(leftArm);

  // Right Arm + Arcane Knowledge Staff
  const rightArm = new THREE.Group();
  rightArm.position.set(0.54, 1.54, 0);
  const rightArmMesh = makeBox(0.28, 0.76, 0.28, customization.shirtColor);
  rightArmMesh.position.y = -0.32;
  rightArm.add(rightArmMesh);

  const staffRod = makeBox(0.1, 1.45, 0.1, '#78350F', { pbr: 'wood', roughness: 0.65 });
  staffRod.position.set(0, -0.25, 0.35);
  staffRod.rotation.x = Math.PI / 4;
  rightArm.add(staffRod);

  const staffOrb = makeBox(0.28, 0.28, 0.28, '#38BDF8', {
    emissive: '#0EA5E9',
    emissiveIntensity: 1.5,
    roughness: 0.15,
    metalness: 0.3
  });
  staffOrb.position.set(0, 0.28, 0.88);
  const staffGlow = new THREE.PointLight('#38BDF8', 0.9, 6.5);
  staffOrb.add(staffGlow);
  rightArm.add(staffOrb);
  bodyPivot.add(rightArm);

  // Floating Companion
  let companionGroup: THREE.Group | null = null;
  if (customization.companion !== 'none') {
    companionGroup = new THREE.Group();
    companionGroup.position.set(-1.15, 2.2, -0.35);
    if (customization.companion === 'owl') {
      const body = makeBox(0.36, 0.42, 0.34, '#D97706');
      const eyeL = makeBox(0.1, 0.1, 0.05, '#FEF08A', { emissive: '#FACC15', emissiveIntensity: 0.8 });
      eyeL.position.set(-0.09, 0.08, 0.18);
      const eyeR = eyeL.clone();
      eyeR.position.x = 0.09;
      companionGroup.add(body, eyeL, eyeR);
    } else if (customization.companion === 'fox') {
      const body = makeBox(0.4, 0.3, 0.48, '#EA580C');
      const earL = makeBox(0.1, 0.16, 0.1, '#7C2D12');
      earL.position.set(-0.12, 0.22, 0.14);
      const earR = earL.clone();
      earR.position.x = 0.12;
      companionGroup.add(body, earL, earR);
    } else {
      const body = makeBox(0.38, 0.38, 0.38, '#64748B');
      const core = makeBox(0.16, 0.16, 0.42, '#22D3EE', { emissive: '#06B6D4', emissiveIntensity: 1 });
      companionGroup.add(body, core);
    }
    group.add(companionGroup);
  }

  return {
    group,
    bodyPivot,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    cape,
    staffOrb,
    companionGroup
  };
}

export function buildVoxelVillager(shirtColor: string): { group: THREE.Group; indicator: THREE.Mesh } {
  const group = new THREE.Group();
  const legs = makeBox(0.56, 0.7, 0.34, '#334155');
  legs.position.y = 0.35;
  const torso = makeBox(0.7, 0.82, 0.4, shirtColor);
  torso.position.y = 1.1;
  const head = makeBox(0.58, 0.58, 0.58, '#EAB676');
  head.position.y = 1.82;
  const nose = makeBox(0.14, 0.2, 0.14, '#D99B58');
  nose.position.set(0, 1.76, 0.32);

  const indicator = makeBox(0.22, 0.22, 0.22, '#FACC15', {
    emissive: '#F59E0B',
    emissiveIntensity: 0.9
  });
  indicator.position.y = 2.55;

  group.add(legs, torso, head, nose, indicator);
  return { group, indicator };
}

export interface VoxelEnemyRig {
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  limbs: THREE.Mesh[];
}

export function buildVoxelEnemy(type: EnemyType): VoxelEnemyRig {
  const group = new THREE.Group();
  const limbs: THREE.Mesh[] = [];

  if (type === 'shadow_crawler') {
    const body = makeBox(0.95, 0.55, 1.1, '#1E1B4B');
    body.position.y = 0.65;
    const eyeL = makeBox(0.16, 0.14, 0.1, '#F43F5E', { emissive: '#E11D48', emissiveIntensity: 1.2 });
    eyeL.position.set(-0.22, 0.74, 0.55);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.22;
    group.add(body, eyeL, eyeR);

    for (let i = 0; i < 4; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const zOff = i < 2 ? 0.32 : -0.32;
      const leg = makeBox(0.22, 0.55, 0.22, '#312E81');
      leg.position.set(side * 0.58, 0.28, zOff);
      group.add(leg);
      limbs.push(leg);
    }
    return { group, coreMesh: body, limbs };
  }

  if (type === 'void_wisp') {
    const core = makeBox(0.72, 0.72, 0.72, '#581C87', {
      emissive: '#9333EA',
      emissiveIntensity: 0.85
    });
    core.position.y = 1.45;
    const shardL = makeBox(0.22, 0.48, 0.22, '#C084FC', { emissive: '#A855F7', emissiveIntensity: 1 });
    shardL.position.set(-0.68, 1.45, 0);
    const shardR = shardL.clone();
    shardR.position.x = 0.68;
    group.add(core, shardL, shardR);
    limbs.push(shardL, shardR);
    return { group, coreMesh: core, limbs };
  }

  // obsidian_golem
  const torso = makeBox(1.25, 1.35, 0.82, '#1F2937');
  torso.position.y = 1.45;
  const head = makeBox(0.75, 0.68, 0.72, '#111827');
  head.position.y = 2.45;
  const ember = makeBox(0.45, 0.45, 0.86, '#F97316', { emissive: '#EA580C', emissiveIntensity: 1.2 });
  ember.position.y = 1.5;
  const armL = makeBox(0.42, 1.15, 0.42, '#374151');
  armL.position.set(-0.88, 1.35, 0);
  const armR = armL.clone();
  armR.position.x = 0.88;
  group.add(torso, head, ember, armL, armR);
  limbs.push(armL, armR);
  return { group, coreMesh: ember, limbs };
}

export function buildVoxelTree(variant: 'oak' | 'pine' | 'dark'): THREE.Group {
  const g = new THREE.Group();
  const trunkColor = variant === 'dark' ? '#3B2314' : '#6B4226';
  const leafColor = variant === 'dark' ? '#1E3A2F' : variant === 'pine' ? '#166534' : '#22C55E';

  const trunk = makeBox(0.7, 2.8, 0.7, trunkColor);
  trunk.position.y = 1.4;
  g.add(trunk);

  if (variant === 'pine') {
    const c1 = makeBox(2.6, 1.2, 2.6, leafColor);
    c1.position.y = 3.0;
    const c2 = makeBox(1.9, 1.1, 1.9, leafColor);
    c2.position.y = 4.1;
    const c3 = makeBox(1.1, 0.9, 1.1, leafColor);
    c3.position.y = 5.0;
    g.add(c1, c2, c3);
  } else {
    const canopy1 = makeBox(2.6, 1.6, 2.6, leafColor);
    canopy1.position.y = 3.4;
    const canopy2 = makeBox(1.8, 1.0, 1.8, leafColor);
    canopy2.position.y = 4.5;
    g.add(canopy1, canopy2);
  }
  return g;
}

export function buildVillageHouse(roofColor = '#C2410C'): THREE.Group {
  const g = new THREE.Group();
  const base = makeBox(5.2, 0.5, 5.2, '#64748B');
  base.position.y = 0.25;
  const walls = makeBox(4.8, 3.0, 4.8, '#F5E6D3');
  walls.position.y = 2.0;
  const door = makeBox(1.1, 2.0, 0.2, '#78350F');
  door.position.set(0, 1.3, 2.42);
  const winL = makeBox(0.9, 0.9, 0.2, '#FEF08A', { emissive: '#F59E0B', emissiveIntensity: 0.5 });
  winL.position.set(-1.35, 2.1, 2.42);
  const winR = winL.clone();
  winR.position.x = 1.35;

  const roof1 = makeBox(5.6, 0.8, 5.6, roofColor);
  roof1.position.y = 3.8;
  const roof2 = makeBox(4.0, 0.8, 4.0, roofColor);
  roof2.position.y = 4.6;
  const roof3 = makeBox(2.2, 0.7, 2.2, roofColor);
  roof3.position.y = 5.3;

  g.add(base, walls, door, winL, winR, roof1, roof2, roof3);
  return g;
}

export function buildWatchtower(): THREE.Group {
  const g = new THREE.Group();
  const base = makeBox(2.6, 4.8, 2.6, '#475569');
  base.position.y = 2.4;
  const deck = makeBox(3.4, 0.5, 3.4, '#78350F');
  deck.position.y = 5.0;
  const crystal = makeBox(0.7, 0.9, 0.7, '#38BDF8', { emissive: '#0284C7', emissiveIntensity: 1.0 });
  crystal.position.y = 6.0;
  g.add(base, deck, crystal);
  return g;
}

export function buildCampfireWithLight(): { group: THREE.Group; light: THREE.PointLight; flame: THREE.Mesh } {
  const group = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const log = makeBox(1.4, 0.25, 0.28, '#5C3A21');
    log.position.y = 0.14;
    log.rotation.y = (i * Math.PI) / 4;
    group.add(log);
  }
  const flame = makeBox(0.55, 0.85, 0.55, '#FB923C', {
    emissive: '#FF6A00',
    emissiveIntensity: 1.5
  });
  flame.position.y = 0.65;
  group.add(flame);

  const light = new THREE.PointLight('#FF7A1A', 4.5, 22, 1.4);
  light.position.set(0, 1.5, 0);
  group.add(light);

  return { group, light, flame };
}

export function buildTorch(): { group: THREE.Group; light: THREE.PointLight } {
  const group = new THREE.Group();
  const post = makeBox(0.24, 2.2, 0.24, '#78350F');
  post.position.y = 1.1;
  const head = makeBox(0.36, 0.36, 0.36, '#FACC15', {
    emissive: '#F97316',
    emissiveIntensity: 1.4
  });
  head.position.y = 2.35;
  const light = new THREE.PointLight('#FB923C', 2.4, 15, 1.5);
  light.position.y = 2.6;
  group.add(post, head, light);
  return { group, light };
}

export function buildResourceNode(kind: 'wood' | 'stone' | 'crystal' | 'orb'): THREE.Group {
  const g = new THREE.Group();
  if (kind === 'wood') {
    const log1 = makeBox(0.9, 0.45, 0.45, '#92400E');
    log1.position.y = 0.25;
    const log2 = makeBox(0.45, 0.45, 0.9, '#78350F');
    log2.position.y = 0.65;
    g.add(log1, log2);
  } else if (kind === 'stone') {
    const b1 = makeBox(1.0, 0.7, 0.9, '#94A3B8');
    b1.position.y = 0.35;
    const b2 = makeBox(0.65, 0.55, 0.65, '#64748B');
    b2.position.set(0.2, 0.85, 0.1);
    g.add(b1, b2);
  } else if (kind === 'crystal') {
    const c1 = makeBox(0.45, 1.3, 0.45, '#22D3EE', { emissive: '#06B6D4', emissiveIntensity: 0.9 });
    c1.position.y = 0.65;
    const c2 = makeBox(0.35, 0.9, 0.35, '#A855F7', { emissive: '#9333EA', emissiveIntensity: 0.8 });
    c2.position.set(0.35, 0.45, 0.2);
    c2.rotation.z = -0.25;
    g.add(c1, c2);
  } else {
    const orb = makeBox(0.65, 0.65, 0.65, '#FACC15', { emissive: '#F59E0B', emissiveIntensity: 1.2 });
    orb.position.y = 1.0;
    g.add(orb);
  }
  return g;
}

export interface AnswerShrineRig {
  index: number;
  group: THREE.Group;
  crystal: THREE.Mesh;
  ring: THREE.Mesh;
  labelMesh: THREE.Mesh;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  optionId: OptionId;
  optionText: string;
}

export function buildAnswerShrine(index: number, accentHex: string): AnswerShrineRig {
  const group = new THREE.Group();

  // Articulated 3D Voxel Answer Character / Guardian (Legs, Tunic, Arms, Head, Staff Crystal, Feet Ring)
  const legL = makeBox(0.28, 0.75, 0.28, '#1E293B');
  legL.position.set(-0.18, 0.38, 0);
  const legR = makeBox(0.28, 0.75, 0.28, '#1E293B');
  legR.position.set(0.18, 0.38, 0);

  const torso = makeBox(0.72, 0.88, 0.42, accentHex);
  torso.position.y = 1.18;

  const armL = makeBox(0.24, 0.74, 0.24, '#334155');
  armL.position.set(-0.48, 1.18, 0);
  const armR = makeBox(0.24, 0.74, 0.24, '#334155');
  armR.position.set(0.48, 1.18, 0.12);

  const head = makeBox(0.56, 0.56, 0.56, '#EAB676');
  head.position.y = 1.92;

  const visor = makeBox(0.38, 0.1, 0.08, '#FFFFFF', {
    emissive: accentHex,
    emissiveIntensity: 0.9
  });
  visor.position.set(0, 1.94, 0.29);

  const staff = makeBox(0.1, 1.85, 0.1, '#78350F');
  staff.position.set(0.55, 1.05, 0.25);

  const crystal = makeBox(0.42, 0.42, 0.42, accentHex, {
    emissive: accentHex,
    emissiveIntensity: 1.1,
    roughness: 0.2
  });
  crystal.position.set(0.55, 2.08, 0.25);

  const ring = makeBox(1.5, 0.08, 1.5, '#FFFFFF', {
    emissive: accentHex,
    emissiveIntensity: 0.6
  });
  ring.position.y = 0.05;

  // Floating CanvasTexture label billboard above character
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const labelMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  const labelGeo = new THREE.PlaneGeometry(4.4, 1.65);
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 3.25;

  group.add(legL, legR, torso, armL, armR, head, visor, staff, crystal, ring, labelMesh);

  const rig: AnswerShrineRig = {
    index,
    group,
    crystal,
    ring,
    labelMesh,
    canvas,
    texture,
    optionId: 'A',
    optionText: '...'
  };
  updateShrineLabel(rig, 'A', 'Loading...', false);
  return rig;
}

export function updateShrineLabel(
  rig: AnswerShrineRig,
  optionId: OptionId,
  optionText: string,
  isTargeted: boolean
): void {
  rig.optionId = optionId;
  rig.optionText = optionText;

  const ctx = rig.canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, rig.canvas.width, rig.canvas.height);

  // Rounded pill card
  const w = rig.canvas.width;
  const h = rig.canvas.height;
  ctx.fillStyle = isTargeted ? 'rgba(255, 106, 0, 0.96)' : 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = isTargeted ? '#FEF08A' : '#38BDF8';
  ctx.lineWidth = isTargeted ? 8 : 5;

  ctx.beginPath();
  ctx.roundRect(10, 10, w - 20, h - 20, 26);
  ctx.fill();
  ctx.stroke();

  // Option badge circle
  ctx.fillStyle = isTargeted ? '#FFFFFF' : '#FF6A00';
  ctx.beginPath();
  ctx.arc(64, h / 2, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isTargeted ? '#FF6A00' : '#FFFFFF';
  ctx.font = 'bold 38px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(optionId, 64, h / 2 + 2);

  // Option text (wrapped up to 2 lines)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';

  const maxW = w - 132;
  const words = optionText.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const visibleLines = lines.slice(0, 2);
  if (lines.length > 2) {
    visibleLines[1] = visibleLines[1].slice(0, Math.max(3, visibleLines[1].length - 3)) + '...';
  }

  if (visibleLines.length === 1) {
    ctx.fillText(visibleLines[0], 116, h / 2 + 2);
  } else {
    ctx.fillText(visibleLines[0], 116, h / 2 - 20);
    ctx.fillText(visibleLines[1], 116, h / 2 + 22);
  }

  rig.texture.needsUpdate = true;
}
