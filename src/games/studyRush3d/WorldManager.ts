import * as THREE from 'three';
import { getPbrTextureSet } from '../engine/PbrTextureFactory';
import {
  createAnimatedWaterSurface,
  createVolumetricCloudLayer,
  createVolumetricLightShafts
} from '../engine/VisualMasterpieceEngine';
import {
  AnswerShrineRig,
  buildAnswerShrine,
  buildCampfireWithLight,
  buildResourceNode,
  buildTorch,
  buildVillageHouse,
  buildVoxelTree,
  buildVoxelVillager,
  buildWatchtower
} from './VoxelModels';
import { VillageUpgradeState, WorldZone } from './types';

export interface ColliderBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WorldResourceEntity {
  id: string;
  kind: 'wood' | 'stone' | 'crystal' | 'orb';
  mesh: THREE.Group;
  position: THREE.Vector3;
  collected: boolean;
  respawnTimer: number;
}

export interface WorldVillagerEntity {
  id: string;
  name: string;
  role: string;
  tip: string;
  group: THREE.Group;
  indicator: THREE.Mesh;
  position: THREE.Vector3;
}

export interface WorldHandles {
  root: THREE.Group;
  colliders: ColliderBox[];
  answerShrines: AnswerShrineRig[];
  resources: WorldResourceEntity[];
  villagers: WorldVillagerEntity[];
  torchLights: THREE.PointLight[];
  campfire: { light: THREE.PointLight; flame: THREE.Mesh };
  stars: THREE.Points;
  wallGroup: THREE.Group;
  towerGroup: THREE.Group;
  lanternGroup: THREE.Group;
  libraryGroup: THREE.Group;
  waterNormalMap?: THREE.Texture;
  volumetricShafts?: THREE.Group;
  updateAtmosphere?: (elapsedSeconds: number, dt: number) => void;
}

function addBoxCollider(colliders: ColliderBox[], cx: number, cz: number, halfW: number, halfD: number): void {
  colliders.push({
    minX: cx - halfW,
    maxX: cx + halfW,
    minZ: cz - halfD,
    maxZ: cz + halfD
  });
}

export function getZoneAtPosition(x: number, z: number): WorldZone {
  if (x < -22) return 'dark_forest';
  if (z < -24) return 'crystal_cave';
  if (x > 22) return 'ancient_castle';
  if (z > 22) return 'science_kingdom';
  return 'village';
}

function createVoxelTileTexture(baseHex: string, accentHex: string, repeat: number): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = accentHex;
  for (let y = 0; y < 64; y += 16) {
    for (let x = 0; x < 64; x += 16) {
      if (((x + y) / 16) % 2 === 0) {
        ctx.fillRect(x + 1, y + 1, 14, 14);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

export interface StudyRushLevelTheme {
  level: number;
  name: string;
  groundKind: 'grass' | 'stone' | 'sand' | 'snow';
  groundColor: string;
  plazaColor: string;
  skyTop: string;
  skyHorizon: string;
}

export function getStudyRushLevelTheme(levelNum = 1): StudyRushLevelTheme {
  const idx = ((Math.max(1, levelNum) - 1) % 5) + 1;
  switch (idx) {
    case 2:
      return {
        level: levelNum,
        name: 'Physics Laboratory',
        groundKind: 'stone',
        groundColor: '#64748B',
        plazaColor: '#94A3B8',
        skyTop: '#0369A1',
        skyHorizon: '#BAE6FD'
      };
    case 3:
      return {
        level: levelNum,
        name: 'Nature Kingdom',
        groundKind: 'grass',
        groundColor: '#34D399',
        plazaColor: '#D6D3D1',
        skyTop: '#047857',
        skyHorizon: '#A7F3D0'
      };
    case 4:
      return {
        level: levelNum,
        name: 'Mathematics Oasis',
        groundKind: 'sand',
        groundColor: '#EAB308',
        plazaColor: '#FDE68A',
        skyTop: '#B45309',
        skyHorizon: '#FDE68A'
      };
    case 5:
      return {
        level: levelNum,
        name: 'Frost Learning Citadel',
        groundKind: 'snow',
        groundColor: '#E2E8F0',
        plazaColor: '#CBD5E1',
        skyTop: '#1E3A8A',
        skyHorizon: '#E0F2FE'
      };
    default:
      return {
        level: levelNum,
        name: 'Science Village',
        groundKind: 'grass',
        groundColor: '#86EFAC',
        plazaColor: '#E2E8F0',
        skyTop: '#0284C7',
        skyHorizon: '#BAE6FD'
      };
  }
}

export function buildStudyRushWorld(scene: THREE.Scene, levelNum = 1): WorldHandles {
  const theme = getStudyRushLevelTheme(levelNum);
  const root = new THREE.Group();
  const colliders: ColliderBox[] = [];
  const torchLights: THREE.PointLight[] = [];
  const resources: WorldResourceEntity[] = [];
  const villagers: WorldVillagerEntity[] = [];

  // 1. Voxel Ground Terrain with level-themed procedural PBR textures
  const grassPbr = typeof document !== 'undefined' ? getPbrTextureSet(theme.groundKind, 28, 28) : null;
  const groundGeo = new THREE.BoxGeometry(120, 1, 120);
  const groundMat = new THREE.MeshStandardMaterial({
    color: theme.groundColor,
    map: grassPbr?.map ?? undefined,
    normalMap: grassPbr?.normalMap ?? undefined,
    roughnessMap: grassPbr?.roughnessMap ?? undefined,
    aoMap: grassPbr?.aoMap ?? undefined,
    aoMapIntensity: 0.4,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughness: 0.9
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  root.add(ground);

  // Village Cobblestone Plaza with PBR stone normal/roughness
  const stonePbr = typeof document !== 'undefined' ? getPbrTextureSet('stone', 10, 10) : null;
  const plazaGeo = new THREE.BoxGeometry(34, 0.14, 34);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: theme.plazaColor,
    map: stonePbr?.map ?? undefined,
    normalMap: stonePbr?.normalMap ?? undefined,
    roughnessMap: stonePbr?.roughnessMap ?? undefined,
    aoMap: stonePbr?.aoMap ?? undefined,
    normalScale: new THREE.Vector2(0.65, 0.65),
    roughness: 0.82
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(0, 0.02, 0);
  plaza.receiveShadow = true;
  root.add(plaza);

  // Reflective Knowledge Fountain Pool + Instanced Meadow Grass
  let waterNormalMap: THREE.Texture | undefined;
  let volumetricShafts: THREE.Group | undefined;
  let updateWater: ((t: number) => void) | undefined;
  let updateClouds: ((dt: number) => void) | undefined;
  if (typeof document !== 'undefined') {
    const waterPbr = getPbrTextureSet('water', 3, 3);
    waterNormalMap = waterPbr.normalMap;
    const poolBasin = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.5, 0.35, 24),
      new THREE.MeshStandardMaterial({
        color: '#64748B',
        normalMap: stonePbr?.normalMap ?? undefined,
        aoMap: stonePbr?.aoMap ?? undefined,
        roughness: 0.75
      })
    );
    poolBasin.position.set(0, 0.16, 4.5);
    poolBasin.receiveShadow = true;
    poolBasin.castShadow = true;
    root.add(poolBasin);

    const animWater = createAnimatedWaterSurface({
      width: 5.2,
      depth: 5.2,
      segments: 20,
      deepColor: 0x0284c7,
      shallowColor: 0x38bdf8,
      skyColor: 0xe0f2fe,
      waveHeight: 0.05
    });
    animWater.mesh.position.set(0, 0.36, 4.5);
    root.add(animWater.mesh);
    updateWater = animWater.update;

    const clouds = createVolumetricCloudLayer({
      count: 10,
      spreadX: 130,
      spreadZ: 130,
      altitude: 34,
      windSpeed: 1.4
    });
    root.add(clouds.group);
    updateClouds = clouds.update;

    // InstancedMesh grass tufts outside the cobblestone plaza (single draw call)
    const tuftGeo = new THREE.ConeGeometry(0.14, 0.55, 5);
    tuftGeo.translate(0, 0.275, 0);
    const tuftMat = new THREE.MeshStandardMaterial({ color: '#22C55E', roughness: 0.88 });
    const tuftCount = 240;
    const grassInstances = new THREE.InstancedMesh(tuftGeo, tuftMat, tuftCount);
    const dummy = new THREE.Object3D();
    let placed = 0;
    for (let i = 0; i < 420 && placed < tuftCount; i++) {
      const gx = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 44;
      const gz = (Math.cos(i * 78.233) * 24634.6345 % 1) * 44;
      if (Math.abs(gx) < 18 && Math.abs(gz) < 18) continue;
      dummy.position.set(gx, 0.02, gz);
      dummy.rotation.y = (i * 1.7) % (Math.PI * 2);
      const s = 0.7 + ((i * 7) % 10) * 0.06;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      grassInstances.setMatrixAt(placed, dummy.matrix);
      placed++;
    }
    grassInstances.count = placed;
    grassInstances.instanceMatrix.needsUpdate = true;
    root.add(grassInstances);

    volumetricShafts = createVolumetricLightShafts(
      [
        { x: -7, y: 12, z: -7, rotZ: -0.2, scale: 0.9 },
        { x: 0, y: 13, z: -9, rotZ: -0.15, scale: 1.05 },
        { x: 7, y: 12, z: -7, rotZ: -0.22, scale: 0.9 }
      ],
      '#BAE6FD',
      0.065
    );
    root.add(volumetricShafts);
  }

  // Dark Forest Mossy Floor (West: x < -22)
  const forestFloor = new THREE.Mesh(
    new THREE.BoxGeometry(36, 0.12, 90),
    new THREE.MeshStandardMaterial({ color: '#14532D', roughness: 0.95 })
  );
  forestFloor.position.set(-40, 0.01, 0);
  forestFloor.receiveShadow = true;
  root.add(forestFloor);

  // Crystal Cave Floor (North: z < -24)
  const caveFloor = new THREE.Mesh(
    new THREE.BoxGeometry(56, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.88 })
  );
  caveFloor.position.set(0, 0.01, -40);
  caveFloor.receiveShadow = true;
  root.add(caveFloor);

  // Ancient Castle Floor (East: x > 22)
  const castleFloor = new THREE.Mesh(
    new THREE.BoxGeometry(34, 0.12, 46),
    new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.88 })
  );
  castleFloor.position.set(39, 0.01, 0);
  castleFloor.receiveShadow = true;
  root.add(castleFloor);

  // Science Kingdom Floor (South: z > 22)
  const scienceFloor = new THREE.Mesh(
    new THREE.BoxGeometry(44, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: '#E0F2FE', roughness: 0.78 })
  );
  scienceFloor.position.set(0, 0.01, 38);
  scienceFloor.receiveShadow = true;
  root.add(scienceFloor);

  // 2. Central Campfire
  const campfire = buildCampfireWithLight();
  campfire.group.position.set(0, 0, 2);
  root.add(campfire.group);
  torchLights.push(campfire.light);

  // 3. Village Houses
  const housePositions: Array<{ x: number; z: number; rot: number; roof: string }> = [
    { x: -12, z: 10, rot: Math.PI / 4, roof: '#EA580C' },
    { x: 12, z: 10, rot: -Math.PI / 4, roof: '#2563EB' },
    { x: -13, z: -3, rot: Math.PI / 2, roof: '#D97706' }
  ];
  for (const hp of housePositions) {
    const house = buildVillageHouse(hp.roof);
    house.position.set(hp.x, 0, hp.z);
    house.rotation.y = hp.rot;
    root.add(house);
    addBoxCollider(colliders, hp.x, hp.z, 2.7, 2.7);
  }

  // 4. Upgradeable Village Structures (Walls, Watchtowers, Lanterns, Study Library)
  const wallGroup = new THREE.Group();
  const towerGroup = new THREE.Group();
  const lanternGroup = new THREE.Group();
  const libraryGroup = new THREE.Group();
  root.add(wallGroup, towerGroup, lanternGroup, libraryGroup);

  // Initial torches around plaza
  const torchCoords = [
    [-7, 6],
    [7, 6],
    [-11, -11],
    [11, -11]
  ];
  for (const [tx, tz] of torchCoords) {
    const t = buildTorch();
    t.group.position.set(tx, 0, tz);
    root.add(t.group);
    torchLights.push(t.light);
  }

  // 5. Three Answer Shrines in Northern Plaza Arena
  const shrineColors = ['#3B82F6', '#10B981', '#A855F7'];
  const shrinePositions = [
    new THREE.Vector3(-7.5, 0, -9.5),
    new THREE.Vector3(0, 0, -11.5),
    new THREE.Vector3(7.5, 0, -9.5)
  ];
  const answerShrines = shrinePositions.map((pos, idx) => {
    const rig = buildAnswerShrine(idx, shrineColors[idx]);
    rig.group.position.copy(pos);
    root.add(rig.group);
    return rig;
  });

  // 6. Friendly NPC Villagers
  const villagerDefs = [
    {
      id: 'v-aria',
      name: 'Scholar Aria',
      role: 'Quest Master',
      shirt: '#FF6A00',
      pos: new THREE.Vector3(-4.2, 0, 5.5),
      tip: 'Aim at the glowing Answer Shrines and Left-Click (or press 1, 2, 3) to cast Knowledge Bolts!'
    },
    {
      id: 'v-brock',
      name: 'Blacksmith Brock',
      role: 'Defense Builder',
      shirt: '#475569',
      pos: new THREE.Vector3(5.2, 0, 5.2),
      tip: 'Gather Wood & Stone in the Forest and Cave, then press E near me or open Build Upgrades!'
    },
    {
      id: 'v-lin',
      name: 'Sage Lin',
      role: 'Science Guide',
      shirt: '#0EA5E9',
      pos: new THREE.Vector3(10.5, 0, -2.5),
      tip: 'Night brings Shadow Crawlers & Void Wisps. Every correct answer blasts them back!'
    }
  ];
  for (const vd of villagerDefs) {
    const rig = buildVoxelVillager(vd.shirt);
    rig.group.position.copy(vd.pos);
    rig.group.lookAt(0, 0, 0);
    root.add(rig.group);
    villagers.push({
      id: vd.id,
      name: vd.name,
      role: vd.role,
      tip: vd.tip,
      group: rig.group,
      indicator: rig.indicator,
      position: vd.pos
    });
  }

  // 7. Dark Forest Trees
  const treeCoords: Array<[number, number, 'oak' | 'pine' | 'dark']> = [
    [-26, -12, 'dark'],
    [-31, -4, 'pine'],
    [-28, 6, 'dark'],
    [-34, 14, 'pine'],
    [-25, 18, 'oak'],
    [-38, -16, 'dark'],
    [-42, 4, 'dark'],
    [-36, -24, 'pine'],
    [25, 18, 'oak'],
    [-18, 26, 'oak'],
    [18, -22, 'pine']
  ];
  for (const [tx, tz, variant] of treeCoords) {
    const tree = buildVoxelTree(variant);
    tree.position.set(tx, 0, tz);
    root.add(tree);
    addBoxCollider(colliders, tx, tz, 0.8, 0.8);
  }

  // 8. Crystal Cave Archway (North z = -34)
  const archMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.9 });
  const pillarL = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 3), archMat);
  pillarL.position.set(-6, 3, -34);
  pillarL.castShadow = true;
  const pillarR = pillarL.clone();
  pillarR.position.set(6, 3, -34);
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(15, 2.2, 3.2), archMat);
  archTop.position.set(0, 6.8, -34);
  archTop.castShadow = true;
  root.add(pillarL, pillarR, archTop);
  addBoxCollider(colliders, -6, -34, 1.5, 1.5);
  addBoxCollider(colliders, 6, -34, 1.5, 1.5);

  // 9. Ancient Castle Ruins (East x = 35)
  const castleMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.85 });
  const towerE1 = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 4), castleMat);
  towerE1.position.set(36, 4, -7);
  towerE1.castShadow = true;
  const towerE2 = towerE1.clone();
  towerE2.position.set(36, 4, 7);
  const wallE = new THREE.Mesh(new THREE.BoxGeometry(2, 4.5, 10), castleMat);
  wallE.position.set(37, 2.25, 0);
  wallE.castShadow = true;
  root.add(towerE1, towerE2, wallE);
  addBoxCollider(colliders, 36, -7, 2.0, 2.0);
  addBoxCollider(colliders, 36, 7, 2.0, 2.0);
  addBoxCollider(colliders, 37, 0, 1.0, 5.0);

  // 10. Science Kingdom Observatory (South z = 36)
  const obsBase = new THREE.Mesh(
    new THREE.BoxGeometry(7, 4, 7),
    new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.6 })
  );
  obsBase.position.set(0, 2, 36);
  obsBase.castShadow = true;
  const obsDome = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 2.5, 5.5),
    new THREE.MeshStandardMaterial({ color: '#FF6A00', roughness: 0.4, metalness: 0.25 })
  );
  obsDome.position.set(0, 5.2, 36);
  obsDome.castShadow = true;
  root.add(obsBase, obsDome);
  addBoxCollider(colliders, 0, 36, 3.6, 3.6);

  // 11. Collectible Resources across Zones
  const resourceSpawns: Array<{ kind: 'wood' | 'stone' | 'crystal' | 'orb'; x: number; z: number }> = [
    { kind: 'wood', x: -25, z: -2 },
    { kind: 'wood', x: -29, z: 9 },
    { kind: 'wood', x: -23, z: 12 },
    { kind: 'stone', x: -10, z: -28 },
    { kind: 'stone', x: 10, z: -28 },
    { kind: 'crystal', x: 0, z: -40 },
    { kind: 'crystal', x: -5, z: -42 },
    { kind: 'crystal', x: 6, z: -41 },
    { kind: 'orb', x: 28, z: -3 },
    { kind: 'orb', x: 30, z: 5 },
    { kind: 'orb', x: -6, z: 29 },
    { kind: 'orb', x: 6, z: 29 }
  ];

  resourceSpawns.forEach((sp, idx) => {
    const mesh = buildResourceNode(sp.kind);
    mesh.position.set(sp.x, 0, sp.z);
    root.add(mesh);
    resources.push({
      id: `res-${idx}`,
      kind: sp.kind,
      mesh,
      position: new THREE.Vector3(sp.x, 0, sp.z),
      collected: false,
      respawnTimer: 0
    });
  });

  // 12. Starfield Dome for Night Sky
  const starGeo = new THREE.BufferGeometry();
  const starPositions: number[] = [];
  for (let i = 0; i < 350; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45;
    const r = 85;
    starPositions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) + 10,
      r * Math.sin(phi) * Math.sin(theta)
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: '#FFFFFF', size: 0.7, transparent: true, opacity: 0 });
  const stars = new THREE.Points(starGeo, starMat);
  root.add(stars);

  scene.add(root);

  return {
    root,
    colliders,
    answerShrines,
    resources,
    villagers,
    torchLights,
    campfire,
    stars,
    wallGroup,
    towerGroup,
    lanternGroup,
    libraryGroup,
    waterNormalMap,
    volumetricShafts,
    updateAtmosphere: (elapsedSeconds: number, dt: number) => {
      updateWater?.(elapsedSeconds);
      updateClouds?.(dt);
    }
  };
}

export function syncVillageUpgradeMeshes(handles: WorldHandles, upgrades: VillageUpgradeState): void {
  // Rebuild upgradeable groups cleanly when level changes
  const clearGroup = (g: THREE.Group) => {
    while (g.children.length > 0) {
      g.remove(g.children[0]);
    }
  };

  clearGroup(handles.wallGroup);
  if (upgrades.wallLevel > 0) {
    const wallHeight = 1.2 + upgrades.wallLevel * 0.7;
    const wallMat = new THREE.MeshStandardMaterial({
      color: upgrades.wallLevel >= 3 ? '#38BDF8' : '#64748B',
      roughness: 0.8
    });
    const segments: Array<[number, number, number, number]> = [
      [-17.5, 0, 1.0, 32],
      [17.5, 0, 1.0, 32],
      [-9, -17.5, 16, 1.0],
      [9, -17.5, 16, 1.0],
      [-9, 17.5, 16, 1.0],
      [9, 17.5, 16, 1.0]
    ];
    for (const [x, z, w, d] of segments) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, wallHeight, d), wallMat);
      m.position.set(x, wallHeight / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      handles.wallGroup.add(m);
    }
  }

  clearGroup(handles.towerGroup);
  const towerPositions = [
    [-16, -16],
    [16, -16],
    [-16, 16],
    [16, 16]
  ];
  for (let i = 0; i < Math.min(4, upgrades.towerLevel); i++) {
    const t = buildWatchtower();
    t.position.set(towerPositions[i][0], 0, towerPositions[i][1]);
    handles.towerGroup.add(t);
  }

  clearGroup(handles.lanternGroup);
  if (upgrades.lanternLevel > 0) {
    const lanternSpots = [
      [-14, 0],
      [14, 0],
      [0, -16],
      [0, 16]
    ];
    for (let i = 0; i < Math.min(4, upgrades.lanternLevel + 1); i++) {
      const t = buildTorch();
      t.group.position.set(lanternSpots[i][0], 0, lanternSpots[i][1]);
      handles.lanternGroup.add(t.group);
    }
  }

  clearGroup(handles.libraryGroup);
  if (upgrades.libraryLevel > 0) {
    const lib = buildVillageHouse('#7C3AED');
    lib.position.set(13, 0, -3);
    lib.rotation.y = -Math.PI / 2;
    lib.scale.setScalar(0.95 + upgrades.libraryLevel * 0.08);
    handles.libraryGroup.add(lib);
  }
}
