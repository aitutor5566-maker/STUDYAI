import * as THREE from 'three';
import { getPbrTextureSet } from '../engine/PbrTextureFactory';
import { createContactShadowMesh } from '../engine/VisualMasterpieceEngine';
import { NINJA_CHARACTERS, NinjaCharacterId, VOXEL_CHARACTERS, VoxelCharacterId } from './types';

export interface ArticulatedHeroRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  scarf: THREE.Mesh;
  weaponLight: THREE.PointLight;
}

export function buildNinjaCharacterRig(characterId: NinjaCharacterId): ArticulatedHeroRig {
  const cfg = NINJA_CHARACTERS.find((c) => c.id === characterId) || NINJA_CHARACTERS[0];
  const root = new THREE.Group();
  root.add(createContactShadowMesh(0.8));

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const fabricPbr = typeof document !== 'undefined' ? getPbrTextureSet('fabric', 2, 2) : null;
  const metalPbr = typeof document !== 'undefined' ? getPbrTextureSet('metal', 1, 1) : null;

  const cloakMat = new THREE.MeshStandardMaterial({
    color: cfg.cloakHex,
    roughness: 0.78,
    metalness: 0.12,
    normalMap: fabricPbr?.normalMap ?? null,
    roughnessMap: fabricPbr?.roughnessMap ?? null
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: cfg.armorHex,
    roughness: 0.35,
    metalness: 0.68,
    normalMap: metalPbr?.normalMap ?? null,
    roughnessMap: metalPbr?.roughnessMap ?? null
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: cfg.accentHex,
    emissive: cfg.accentHex,
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.5
  });

  const skinMat = new THREE.MeshStandardMaterial({ color: '#E2B49A', roughness: 0.7 });

  const makeLeg = (x: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(x, 0.85, 0);
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.45, 10), cloakMat);
    thigh.position.y = -0.22;
    thigh.castShadow = true;
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.42, 10), armorMat);
    shin.position.y = -0.62;
    shin.castShadow = true;
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.34), armorMat);
    boot.position.set(0, -0.8, 0.05);
    boot.castShadow = true;
    legPivot.add(thigh, shin, boot);
    return legPivot;
  };

  const leftLeg = makeLeg(-0.18);
  const rightLeg = makeLeg(0.18);
  bodyPivot.add(leftLeg, rightLeg);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.86, 12), cloakMat);
  torso.position.y = 1.28;
  torso.castShadow = true;
  bodyPivot.add(torso);

  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.38), armorMat);
  chestPlate.position.set(0, 1.42, 0.02);
  chestPlate.castShadow = true;
  bodyPivot.add(chestPlate);

  const chestEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), accentMat);
  chestEmblem.position.set(0, 1.45, 0.22);
  bodyPivot.add(chestEmblem);

  const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.96, 0.06), accentMat);
  scarf.position.set(0, 1.38, -0.24);
  scarf.rotation.x = 0.24;
  scarf.castShadow = true;
  bodyPivot.add(scarf);

  const scabbard = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 1.35, 8), armorMat);
  scabbard.position.set(-0.08, 1.42, -0.22);
  scabbard.rotation.z = -0.65;
  scabbard.castShadow = true;
  bodyPivot.add(scabbard);

  const head = new THREE.Group();
  head.position.set(0, 1.96, 0);
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 14), cloakMat);
  cranium.castShadow = true;
  const faceBand = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.13, 0.28), skinMat);
  faceBand.position.set(0, 0.02, 0.14);
  const headband = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.09, 16), accentMat);
  headband.position.y = 0.12;
  const eyeMat = new THREE.MeshBasicMaterial({ color: cfg.accentHex });
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.04), eyeMat);
  eyeL.position.set(-0.09, 0.03, 0.27);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.09;
  head.add(cranium, faceBand, headband, eyeL, eyeR);
  bodyPivot.add(head);

  const makeArm = (x: number) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(x, 1.62, 0);
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), armorMat);
    pauldron.scale.set(1.1, 0.85, 1.1);
    pauldron.castShadow = true;
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.62, 10), cloakMat);
    sleeve.position.y = -0.32;
    sleeve.castShadow = true;
    const gauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.24, 0.16), armorMat);
    gauntlet.position.y = -0.56;
    armPivot.add(pauldron, sleeve, gauntlet);
    return armPivot;
  };

  const leftArm = makeArm(-0.42);
  const rightArm = makeArm(0.42);

  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8), armorMat);
  hilt.rotation.x = Math.PI / 2;
  hilt.position.set(0, -0.62, 0.12);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 1.15), accentMat);
  blade.position.set(0, -0.62, 0.78);
  const weaponLight = new THREE.PointLight(cfg.accentHex, 0.85, 5.5);
  blade.add(weaponLight);
  rightArm.add(hilt, blade);

  bodyPivot.add(leftArm, rightArm);

  return { root, bodyPivot, head, leftArm, rightArm, leftLeg, rightLeg, scarf, weaponLight };
}

export function buildVoxelHeroRig(characterId: VoxelCharacterId): ArticulatedHeroRig {
  const cfg = VOXEL_CHARACTERS.find((c) => c.id === characterId) || VOXEL_CHARACTERS[0];
  const root = new THREE.Group();
  root.add(createContactShadowMesh(0.78));

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const fabricPbr = typeof document !== 'undefined' ? getPbrTextureSet('fabric', 1, 1) : null;
  const makeVoxelBox = (w: number, h: number, d: number, color: string, emissive?: string) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: emissive ? 0.22 : 0.72,
      metalness: emissive ? 0.35 : 0.12,
      emissive: emissive ?? 0x000000,
      emissiveIntensity: emissive ? 1.25 : 0,
      normalMap: emissive ? null : (fabricPbr?.normalMap ?? null)
    });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.19, 0.76, 0);
  const legL = makeVoxelBox(0.32, 0.76, 0.32, cfg.pantsHex);
  legL.position.y = -0.38;
  leftLeg.add(legL);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.19, 0.76, 0);
  const legR = makeVoxelBox(0.32, 0.76, 0.32, cfg.pantsHex);
  legR.position.y = -0.38;
  rightLeg.add(legR);

  const torso = makeVoxelBox(0.74, 0.86, 0.42, cfg.shirtHex);
  torso.position.y = 1.2;

  const scarf = makeVoxelBox(0.62, 0.86, 0.08, cfg.accentHex);
  scarf.position.set(0, 1.16, -0.25);
  scarf.rotation.x = 0.14;

  const head = new THREE.Group();
  head.position.set(0, 1.92, 0);
  const headBox = makeVoxelBox(0.6, 0.6, 0.6, '#F1C27D');
  const hair = makeVoxelBox(0.64, 0.18, 0.64, '#3F2A1D');
  hair.position.set(0, 0.28, -0.02);
  const eyeL = makeVoxelBox(0.1, 0.1, 0.05, '#0F172A');
  eyeL.position.set(-0.14, 0.04, 0.3);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.14;
  head.add(headBox, hair, eyeL, eyeR);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.52, 1.54, 0);
  const armL = makeVoxelBox(0.28, 0.74, 0.28, cfg.shirtHex);
  armL.position.y = -0.32;
  leftArm.add(armL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.52, 1.54, 0);
  const armR = makeVoxelBox(0.28, 0.74, 0.28, cfg.shirtHex);
  armR.position.y = -0.32;
  const pickHandle = makeVoxelBox(0.08, 0.92, 0.08, '#78350F');
  pickHandle.position.set(0, -0.58, 0.34);
  pickHandle.rotation.x = Math.PI / 3;
  const pickHead = makeVoxelBox(0.54, 0.12, 0.14, cfg.accentHex, cfg.accentHex);
  pickHead.position.set(0, -0.36, 0.72);
  const weaponLight = new THREE.PointLight(cfg.accentHex, 0.7, 5);
  pickHead.add(weaponLight);
  rightArm.add(armR, pickHandle, pickHead);

  bodyPivot.add(leftLeg, rightLeg, torso, scarf, head, leftArm, rightArm);

  return { root, bodyPivot, head, leftArm, rightArm, leftLeg, rightLeg, scarf, weaponLight };
}

export function animateHeroRig(
  rig: ArticulatedHeroRig,
  opts: {
    speed: number;
    isGrounded: boolean;
    attackTimer: number;
    walkPhase: number;
    elapsed: number;
    dt: number;
  }
): void {
  const { speed, isGrounded, attackTimer, walkPhase, elapsed, dt } = opts;
  const damp = 1 - Math.exp(-14 * dt);

  if (attackTimer > 0) {
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -1.9, damp);
    rig.bodyPivot.rotation.y = THREE.MathUtils.lerp(rig.bodyPivot.rotation.y, -0.32, damp);
  } else if (!isGrounded) {
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0.45, damp);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, -0.35, damp);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -0.75, damp);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -0.65, damp);
    rig.scarf.rotation.x = THREE.MathUtils.lerp(rig.scarf.rotation.x, 0.72, damp);
  } else if (speed > 0.35) {
    const amp = Math.min(0.85, speed * 0.085);
    rig.leftLeg.rotation.x = Math.sin(walkPhase) * amp;
    rig.rightLeg.rotation.x = -Math.sin(walkPhase) * amp;
    rig.leftArm.rotation.x = -Math.sin(walkPhase) * amp * 0.85;
    rig.rightArm.rotation.x = Math.sin(walkPhase) * amp * 0.75;
    rig.bodyPivot.position.y = Math.abs(Math.sin(walkPhase)) * 0.09;
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0.12, damp);
    rig.bodyPivot.rotation.y = THREE.MathUtils.lerp(rig.bodyPivot.rotation.y, 0, damp);
    rig.scarf.rotation.x = 0.45 + Math.sin(elapsed * 9) * 0.14;
  } else {
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0, damp);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0, damp);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, Math.sin(elapsed * 2) * 0.05, damp);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -Math.sin(elapsed * 2) * 0.05, damp);
    rig.bodyPivot.position.y = Math.sin(elapsed * 2.4) * 0.03;
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0, damp);
    rig.bodyPivot.rotation.y = THREE.MathUtils.lerp(rig.bodyPivot.rotation.y, 0, damp);
    rig.scarf.rotation.x = 0.22 + Math.sin(elapsed * 3.1) * 0.06;
  }
}

export interface FantasyEnemyRig {
  group: THREE.Group;
  core: THREE.Mesh;
}

export function buildFantasyGuardianRig(isVoxelMode: boolean): FantasyEnemyRig {
  const group = new THREE.Group();
  group.add(createContactShadowMesh(0.82));

  const mat = new THREE.MeshStandardMaterial({
    color: isVoxelMode ? '#15803D' : '#312E81',
    roughness: 0.62,
    metalness: 0.28
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: isVoxelMode ? '#4ADE80' : '#F43F5E',
    emissive: isVoxelMode ? '#22C55E' : '#E11D48',
    emissiveIntensity: 1.5
  });

  const body = new THREE.Mesh(
    isVoxelMode ? new THREE.BoxGeometry(0.9, 1.5, 0.7) : new THREE.CylinderGeometry(0.45, 0.52, 1.5, 10),
    mat
  );
  body.position.y = 0.85;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.58, 0.64), mat);
  head.position.y = 1.85;
  head.castShadow = true;
  group.add(head);

  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), glowMat);
  eyeL.position.set(-0.15, 1.9, 0.32);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.15;
  group.add(eyeL, eyeR);

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), glowMat);
  core.position.set(0, 1.1, 0.38);
  group.add(core);

  return { group, core };
}
