import * as THREE from 'three';
import { getPbrTextureSet } from '../engine/PbrTextureFactory';
import {
  createAnimatedWaterSurface,
  createVolumetricLightShafts
} from '../engine/VisualMasterpieceEngine';
import {
  AdventureMode,
  GraphicsTier,
  MinecraftBiomeId,
  NinjaRealmId,
  OptionId,
  PlacedBlockKind
} from './types';

export interface WorldCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface ShrineRig {
  index: number;
  position: THREE.Vector3;
  group: THREE.Group;
  crystal: THREE.Mesh;
  ring: THREE.Mesh;
  labelMesh: THREE.Mesh;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  optionId: OptionId;
  optionText: string;
}

export interface CollectibleNode {
  id: string;
  kind: 'wood' | 'stone' | 'crystal' | 'scroll';
  position: THREE.Vector3;
  mesh: THREE.Group;
  collected: boolean;
  respawnTimer: number;
}

export interface BuiltRealmsWorld {
  root: THREE.Group;
  colliders: WorldCollider[];
  shrines: ShrineRig[];
  collectibles: CollectibleNode[];
  waterNormalMap?: THREE.Texture;
  waterfallTexture?: THREE.Texture;
  updateWater?: (elapsedSeconds: number) => void;
  lanternLights: THREE.PointLight[];
  birds: Array<{ group: THREE.Group; radius: number; speed: number; phase: number; baseY: number }>;
  floatingIslands: THREE.Group[];
  portalPos: THREE.Vector3;
  portalRing: THREE.Mesh;
  getZoneName: (x: number, z: number) => string;
  placeVoxelBlock: (kind: PlacedBlockKind, x: number, y: number, z: number) => THREE.Mesh;
}

function addCollider(colliders: WorldCollider[], cx: number, cz: number, hw: number, hd: number): void {
  colliders.push({ minX: cx - hw, maxX: cx + hw, minZ: cz - hd, maxZ: cz + hd });
}

function createShrineRig(index: number, pos: THREE.Vector3, isVoxel: boolean): ShrineRig {
  const group = new THREE.Group();
  group.position.copy(pos);

  const stonePbr = typeof document !== 'undefined' ? getPbrTextureSet('stone', 1, 1) : null;
  const baseMat = new THREE.MeshStandardMaterial({
    color: isVoxel ? '#334155' : '#1E293B',
    roughness: 0.6,
    metalness: 0.25,
    normalMap: stonePbr?.normalMap ?? null
  });
  const base = new THREE.Mesh(
    isVoxel ? new THREE.BoxGeometry(2.1, 0.7, 2.1) : new THREE.CylinderGeometry(1.1, 1.35, 0.7, 12),
    baseMat
  );
  base.position.y = 0.35;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const crystal = new THREE.Mesh(
    isVoxel ? new THREE.BoxGeometry(0.75, 1.25, 0.75) : new THREE.OctahedronGeometry(0.65, 0),
    new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      emissive: '#0284C7',
      emissiveIntensity: 1.45,
      roughness: 0.15,
      metalness: 0.3
    })
  );
  crystal.position.y = 1.95;
  crystal.castShadow = true;
  group.add(crystal);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 1.42, 24),
    new THREE.MeshBasicMaterial({
      color: '#38BDF8',
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  group.add(ring);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const labelMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), labelMat);
  labelMesh.position.y = 3.55;
  group.add(labelMesh);

  const rig: ShrineRig = {
    index,
    position: pos.clone(),
    group,
    crystal,
    ring,
    labelMesh,
    canvas,
    texture,
    optionId: 'A',
    optionText: '...'
  };
  updateRealmsShrineLabel(rig, 'A', 'Approach Shrine', false);
  return rig;
}

export function updateRealmsShrineLabel(
  rig: ShrineRig,
  optionId: OptionId,
  optionText: string,
  isTargeted: boolean
): void {
  rig.optionId = optionId;
  rig.optionText = optionText;
  const ctx = rig.canvas.getContext('2d');
  if (!ctx) return;

  const w = rig.canvas.width;
  const h = rig.canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = isTargeted ? 'rgba(234, 88, 12, 0.96)' : 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = isTargeted ? '#FEF08A' : '#38BDF8';
  ctx.lineWidth = isTargeted ? 8 : 4;
  ctx.beginPath();
  ctx.roundRect(8, 8, w - 16, h - 16, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isTargeted ? '#FFFFFF' : '#0EA5E9';
  ctx.beginPath();
  ctx.arc(58, h / 2, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isTargeted ? '#EA580C' : '#FFFFFF';
  ctx.font = 'bold 34px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(optionId, 58, h / 2 + 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  const trimmed = optionText.length > 34 ? `${optionText.slice(0, 32)}…` : optionText;
  ctx.fillText(trimmed, 108, h / 2 + 2);

  rig.texture.needsUpdate = true;
  (rig.ring.material as THREE.MeshBasicMaterial).color.set(isTargeted ? '#FACC15' : '#38BDF8');
  (rig.ring.material as THREE.MeshBasicMaterial).opacity = isTargeted ? 0.88 : 0.42;
}

function createCollectible(
  id: string,
  kind: CollectibleNode['kind'],
  pos: THREE.Vector3,
  isVoxel: boolean
): CollectibleNode {
  const mesh = new THREE.Group();
  mesh.position.copy(pos);

  const colorMap: Record<CollectibleNode['kind'], string> = {
    wood: '#92400E',
    stone: '#64748B',
    crystal: '#22D3EE',
    scroll: '#FACC15'
  };

  const geo =
    kind === 'crystal'
      ? new THREE.OctahedronGeometry(0.45, 0)
      : kind === 'scroll'
      ? new THREE.CylinderGeometry(0.16, 0.16, 0.72, 10)
      : isVoxel
      ? new THREE.BoxGeometry(0.75, 0.75, 0.75)
      : new THREE.DodecahedronGeometry(0.48, 0);

  const mat = new THREE.MeshStandardMaterial({
    color: colorMap[kind],
    emissive: kind === 'crystal' || kind === 'scroll' ? colorMap[kind] : '#000000',
    emissiveIntensity: kind === 'crystal' || kind === 'scroll' ? 1.15 : 0,
    roughness: kind === 'crystal' ? 0.18 : 0.75
  });
  const item = new THREE.Mesh(geo, mat);
  item.position.y = 0.75;
  if (kind === 'scroll') item.rotation.z = Math.PI / 3;
  item.castShadow = true;
  mesh.add(item);

  return { id, kind, position: pos, mesh, collected: false, respawnTimer: 0 };
}

export function buildRealmsWorld(
  scene: THREE.Scene,
  opts: {
    mode: AdventureMode;
    ninjaRealm: NinjaRealmId;
    minecraftBiome: MinecraftBiomeId;
    tier: GraphicsTier;
  }
): BuiltRealmsWorld {
  const { mode, ninjaRealm, minecraftBiome, tier } = opts;
  const isVoxel = mode === 'minecraft_realms';
  const root = new THREE.Group();
  const colliders: WorldCollider[] = [];
  const collectibles: CollectibleNode[] = [];
  const lanternLights: THREE.PointLight[] = [];

  const texRes: 128 | 256 | 512 =
    graphicsTier === 'low' ? 128 : graphicsTier === 'ultra' || graphicsTier === 'high' ? 512 : 256;
  const groundKind =
    isVoxel && minecraftBiome === 'desert_oasis'
      ? 'sand'
      : isVoxel && minecraftBiome === 'alpine_snow_peaks'
      ? 'snow'
      : 'grass';
  const grassPbr = typeof document !== 'undefined' ? getPbrTextureSet(groundKind, 24, 24, texRes) : null;
  const stonePbr = typeof document !== 'undefined' ? getPbrTextureSet('stone', 12, 12, texRes) : null;
  const woodPbr = typeof document !== 'undefined' ? getPbrTextureSet('wood', 4, 4, texRes) : null;
  const waterPbr = typeof document !== 'undefined' ? getPbrTextureSet('water', 6, 6, texRes) : null;

  const groundColor = !isVoxel
    ? ninjaRealm === 'sakura_sanctuary'
      ? '#3F6212'
      : ninjaRealm === 'misty_waterfall_peaks'
      ? '#1E3A2F'
      : '#2E5A27'
    : minecraftBiome === 'alpine_snow_peaks'
    ? '#E2E8F0'
    : minecraftBiome === 'desert_oasis'
    ? '#EAB308'
    : '#4ADE80';

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(130, 1.2, 130),
    new THREE.MeshStandardMaterial({
      color: groundColor,
      map: grassPbr?.map ?? undefined,
      normalMap: grassPbr?.normalMap ?? undefined,
      roughnessMap: grassPbr?.roughnessMap ?? undefined,
      aoMap: grassPbr?.aoMap ?? undefined,
      aoMapIntensity: 0.45,
      normalScale: new THREE.Vector2(0.75, 0.75),
      roughness: 0.88
    })
  );
  ground.position.y = -0.6;
  ground.receiveShadow = true;
  root.add(ground);

  const animatedWater = createAnimatedWaterSurface({
    width: 120,
    depth: 9,
    segments: graphicsTier === 'low' ? 16 : 36,
    deepColor: 0x0369a1,
    shallowColor: 0x38bdf8,
    skyColor: 0xbae6fd,
    waveHeight: 0.11
  });
  animatedWater.mesh.position.set(0, 0.05, -18);
  root.add(animatedWater.mesh);

  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 0.35, 11),
    new THREE.MeshStandardMaterial({
      color: '#78350F',
      normalMap: woodPbr?.normalMap ?? undefined,
      roughness: 0.78
    })
  );
  bridge.position.set(0, 0.18, -18);
  bridge.castShadow = true;
  bridge.receiveShadow = true;
  root.add(bridge);

  const cliffMat = new THREE.MeshStandardMaterial({
    color: '#475569',
    normalMap: stonePbr?.normalMap ?? undefined,
    roughness: 0.85
  });
  const cliff = new THREE.Mesh(new THREE.BoxGeometry(14, 18, 8), cliffMat);
  cliff.position.set(24, 8, -28);
  cliff.castShadow = true;
  cliff.receiveShadow = true;
  root.add(cliff);
  addCollider(colliders, 24, -28, 7, 4);

  const waterfallTex = waterPbr?.normalMap;
  const waterfallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 16),
    new THREE.MeshPhysicalMaterial({
      color: '#38BDF8',
      emissive: '#0284C7',
      emissiveIntensity: 0.32,
      normalMap: waterfallTex ?? undefined,
      roughness: 0.1,
      transparent: true,
      opacity: 0.82
    })
  );
  waterfallMesh.position.set(24, 8, -23.9);
  root.add(waterfallMesh);

  if (!isVoxel) {
    const templeStone = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 12), cliffMat);
    templeStone.position.set(0, 0.4, -34);
    templeStone.receiveShadow = true;
    root.add(templeStone);

    const templeWall = new THREE.Mesh(
      new THREE.BoxGeometry(9, 4.5, 7),
      new THREE.MeshStandardMaterial({ color: '#991B1B', normalMap: woodPbr?.normalMap ?? undefined, roughness: 0.72 })
    );
    templeWall.position.set(0, 3.0, -34);
    templeWall.castShadow = true;
    root.add(templeWall);
    addCollider(colliders, 0, -34, 4.6, 3.6);

    const roof1 = new THREE.Mesh(
      new THREE.ConeGeometry(7.8, 2.2, 4),
      new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.65 })
    );
    roof1.rotation.y = Math.PI / 4;
    roof1.position.set(0, 6.2, -34);
    roof1.castShadow = true;
    root.add(roof1);

    const roof2 = new THREE.Mesh(
      new THREE.ConeGeometry(5.2, 2.0, 4),
      new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.6 })
    );
    roof2.rotation.y = Math.PI / 4;
    roof2.position.set(0, 8.2, -34);
    roof2.castShadow = true;
    root.add(roof2);

    const toriiMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.55 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 5.2, 10), toriiMat);
    postL.position.set(-2.5, 2.6, -11);
    postL.castShadow = true;
    const postR = postL.clone();
    postR.position.x = 2.5;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.45, 0.6), toriiMat);
    lintel.position.set(0, 5.1, -11);
    lintel.castShadow = true;
    root.add(postL, postR, lintel);

    for (const lx of [-3.4, 3.4]) {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 10, 8),
        new THREE.MeshStandardMaterial({ color: '#FDE68A', emissive: '#F59E0B', emissiveIntensity: 1.6 })
      );
      lantern.position.set(lx, 2.4, -11);
      const pl = new THREE.PointLight('#F59E0B', 1.4, 11);
      lantern.add(pl);
      lanternLights.push(pl);
      root.add(lantern);
    }

    const bambooCount = tier === 'low' ? 40 : 90;
    const bambooGeo = new THREE.CylinderGeometry(0.14, 0.16, 8.5, 6);
    bambooGeo.translate(0, 4.25, 0);
    const bambooMat = new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.65 });
    const bambooInst = new THREE.InstancedMesh(bambooGeo, bambooMat, bambooCount);
    bambooInst.castShadow = true;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < bambooCount; i++) {
      const bx = -14 - (i % 6) * 4.2 + Math.sin(i) * 1.4;
      const bz = -30 + Math.floor(i / 6) * 4.4;
      dummy.position.set(bx, 0, bz);
      dummy.rotation.z = Math.sin(i * 1.3) * 0.05;
      dummy.scale.set(1, 0.8 + (i % 4) * 0.16, 1);
      dummy.updateMatrix();
      bambooInst.setMatrixAt(i, dummy.matrix);
    }
    bambooInst.instanceMatrix.needsUpdate = true;
    root.add(bambooInst);

    const sakuraPositions = [
      [-9, -6],
      [10, -4],
      [-11, 10],
      [12, 12],
      [9, -26]
    ];
    for (const [tx, tz] of sakuraPositions) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.45, 3.6, 8),
        new THREE.MeshStandardMaterial({ color: '#451A03', normalMap: woodPbr?.normalMap ?? undefined })
      );
      trunk.position.set(tx, 1.8, tz);
      trunk.castShadow = true;
      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2.6, 1),
        new THREE.MeshStandardMaterial({ color: '#F472B6', roughness: 0.85 })
      );
      canopy.position.set(tx, 4.3, tz);
      canopy.castShadow = true;
      root.add(trunk, canopy);
      addCollider(colliders, tx, tz, 0.6, 0.6);
    }
  } else {
    const leafHex =
      minecraftBiome === 'alpine_snow_peaks'
        ? '#CBD5E1'
        : minecraftBiome === 'desert_oasis'
        ? '#65A30D'
        : '#16A34A';
    const treePositions = [
      [-12, -5],
      [13, -6],
      [-16, 8],
      [15, 11],
      [-22, -26],
      [11, -30]
    ];
    for (const [tx, tz] of treePositions) {
      const trunk = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 3.6, 1.1),
        new THREE.MeshStandardMaterial({ color: '#78350F', normalMap: woodPbr?.normalMap ?? undefined })
      );
      trunk.position.set(tx, 1.8, tz);
      trunk.castShadow = true;
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 2.6, 3.2),
        new THREE.MeshStandardMaterial({ color: leafHex, roughness: 0.88 })
      );
      crown.position.set(tx, 4.4, tz);
      crown.castShadow = true;
      root.add(trunk, crown);
      addCollider(colliders, tx, tz, 0.7, 0.7);
    }

    const cottageWall = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 6),
      new THREE.MeshStandardMaterial({ color: '#B45309', normalMap: woodPbr?.normalMap ?? undefined })
    );
    cottageWall.position.set(-14, 2, -32);
    cottageWall.castShadow = true;
    const cottageRoof = new THREE.Mesh(
      new THREE.BoxGeometry(7, 1.4, 7),
      new THREE.MeshStandardMaterial({ color: '#475569', normalMap: stonePbr?.normalMap ?? undefined })
    );
    cottageRoof.position.set(-14, 4.7, -32);
    cottageRoof.castShadow = true;
    root.add(cottageWall, cottageRoof);
    addCollider(colliders, -14, -32, 3.1, 3.1);

    const caveArch = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 5), cliffMat);
    caveArch.position.set(-24, 2.5, -28);
    caveArch.castShadow = true;
    root.add(caveArch);
    const crystalOre = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.1, 1.1),
      new THREE.MeshStandardMaterial({ color: '#22D3EE', emissive: '#06B6D4', emissiveIntensity: 1.4 })
    );
    crystalOre.position.set(-21.5, 1.4, -25.2);
    root.add(crystalOre);
  }

  for (let i = -4; i <= 4; i++) {
    const h = 18 + (Math.abs(i * 5) % 14);
    const peak = new THREE.Mesh(
      isVoxel ? new THREE.BoxGeometry(16, h, 14) : new THREE.ConeGeometry(13, h, 6),
      cliffMat
    );
    peak.position.set(i * 17, h * 0.42 - 2, -62);
    root.add(peak);
  }

  if (tier !== 'low') {
    root.add(
      createVolumetricLightShafts(
        [
          { x: -8, y: 12, z: -6, rotZ: -0.2, scale: 0.9 },
          { x: 0, y: 13, z: -9, rotZ: -0.16, scale: 1.05 },
          { x: 8, y: 12, z: -6, rotZ: -0.22, scale: 0.9 }
        ],
        '#BAE6FD',
        0.055
      )
    );
  }

  const shrineCoords = [
    new THREE.Vector3(-8.5, 0, -6.5),
    new THREE.Vector3(0, 0, -8.5),
    new THREE.Vector3(8.5, 0, -6.5)
  ];
  const shrines = shrineCoords.map((pos, idx) => {
    const rig = createShrineRig(idx, pos, isVoxel);
    root.add(rig.group);
    return rig;
  });

  const itemSpecs: Array<[CollectibleNode['kind'], number, number]> = isVoxel
    ? [
        ['wood', -7, 4],
        ['stone', 7, 5],
        ['crystal', -11, -12],
        ['crystal', 11, -12],
        ['wood', 14, 2],
        ['stone', -15, 3]
      ]
    : [
        ['scroll', -7, 4],
        ['crystal', 7, 5],
        ['scroll', -10, -14],
        ['crystal', 10, -14],
        ['scroll', 0, -25],
        ['crystal', 19, -20]
      ];

  itemSpecs.forEach(([kind, x, z], idx) => {
    const c = createCollectible(`col-${idx}`, kind, new THREE.Vector3(x, 0, z), isVoxel);
    root.add(c.mesh);
    collectibles.push(c);
  });

  const placedBlocksGroup = new THREE.Group();
  root.add(placedBlocksGroup);

  // Floating Sky Islands in the distance
  const floatingIslands: THREE.Group[] = [];
  const islandPositions = [
    [-28, 19, -38],
    [32, 22, -44],
    [0, 26, -54]
  ];
  for (const [ix, iy, iz] of islandPositions) {
    const ig = new THREE.Group();
    const rock = new THREE.Mesh(
      isVoxel ? new THREE.BoxGeometry(8, 3.5, 8) : new THREE.ConeGeometry(5.5, 6, 6),
      cliffMat
    );
    if (!isVoxel) rock.rotation.x = Math.PI;
    const topCap = new THREE.Mesh(
      isVoxel ? new THREE.BoxGeometry(8.4, 0.9, 8.4) : new THREE.CylinderGeometry(5.6, 5.2, 1.0, 8),
      new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.85 })
    );
    topCap.position.y = isVoxel ? 2.1 : 2.8;
    ig.add(rock, topCap);
    ig.position.set(ix, iy, iz);
    root.add(ig);
    floatingIslands.push(ig);
  }

  // Soaring Birds circling above the valley
  const birds: BuiltRealmsWorld['birds'] = [];
  const birdMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.6 });
  const birdCount = tier === 'low' ? 4 : 8;
  for (let i = 0; i < birdCount; i++) {
    const bg = new THREE.Group();
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.24), birdMat);
    wingL.position.x = -0.32;
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.24), birdMat);
    wingR.position.x = 0.32;
    bg.add(wingL, wingR);
    root.add(bg);
    birds.push({
      group: bg,
      radius: 14 + (i % 4) * 5,
      speed: 0.35 + (i % 3) * 0.12,
      phase: (i / birdCount) * Math.PI * 2,
      baseY: 14 + (i % 3) * 3.5
    });
  }

  // Magical Realm Switch Portal (switch seamlessly between Shadow Ninja & Minecraft Realms)
  const portalPos = new THREE.Vector3(-13, 0, 9);
  const portalGroup = new THREE.Group();
  portalGroup.position.copy(portalPos);
  const portalArch = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, 0.22, 10, 28, Math.PI),
    cliffMat
  );
  portalArch.position.y = 2.0;
  portalArch.castShadow = true;
  const portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.12, 8, 28),
    new THREE.MeshStandardMaterial({
      color: isVoxel ? '#22D3EE' : '#34D399',
      emissive: isVoxel ? '#0EA5E9' : '#10B981',
      emissiveIntensity: 1.8
    })
  );
  portalRing.position.y = 2.0;
  const portalGlow = new THREE.PointLight(isVoxel ? '#22D3EE' : '#34D399', 1.6, 9);
  portalGlow.position.y = 2.0;
  portalGroup.add(portalArch, portalRing, portalGlow);
  root.add(portalGroup);

  const placeVoxelBlock = (kind: PlacedBlockKind, x: number, y: number, z: number): THREE.Mesh => {
    const blockColors: Record<PlacedBlockKind, { color: string; emissive?: string }> = {
      oak_wood: { color: '#92400E' },
      stone_brick: { color: '#64748B' },
      glow_crystal: { color: '#22D3EE', emissive: '#0891B2' },
      sakura_plank: { color: '#F472B6' }
    };
    const spec = blockColors[kind];
    const mat = new THREE.MeshStandardMaterial({
      color: spec.color,
      emissive: spec.emissive ?? '#000000',
      emissiveIntensity: spec.emissive ? 1.15 : 0,
      roughness: spec.emissive ? 0.2 : 0.78,
      normalMap: kind === 'stone_brick' ? (stonePbr?.normalMap ?? null) : (woodPbr?.normalMap ?? null)
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), mat);
    const gx = Math.round(x / 1.5) * 1.5;
    const gz = Math.round(z / 1.5) * 1.5;
    mesh.position.set(gx, Math.max(0.75, y), gz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    placedBlocksGroup.add(mesh);
    return mesh;
  };

  scene.add(root);

  return {
    root,
    colliders,
    shrines,
    collectibles,
    waterNormalMap: waterPbr?.normalMap,
    waterfallTexture: waterfallTex,
    updateWater: animatedWater.update,
    lanternLights,
    birds,
    floatingIslands,
    portalPos,
    portalRing,
    getZoneName: (x: number, z: number) => {
      if (z < -23) return isVoxel ? 'Crystal Cave & Village' : 'Ancient Pagoda Temple';
      if (z < -13) return 'Waterfall River Crossing';
      if (x < -12) return isVoxel ? 'Voxel Timberlands' : 'Bamboo Shadow Grove';
      if (x > 14) return isVoxel ? 'Frontier Ridge' : 'Waterfall Cliffs';
      return isVoxel ? 'Minecraft Realms Plaza' : 'Sakura Shrine Courtyard';
    },
    placeVoxelBlock
  };
}
