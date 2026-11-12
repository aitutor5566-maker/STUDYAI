import * as THREE from 'three';
import type { ArenaDefinition, BiomeType } from './types.ts';

export const ARENA_DEFINITIONS: Record<BiomeType, ArenaDefinition> = {
  grassland: {
    id: 'grassland',
    waveIndex: 1,
    name: 'Verdant Meadow',
    themeTitle: 'Wave 1: Grassland Sanctuary',
    description: 'Lush voxel grass, oak trees, and ancient boulders. Home to Grass Golems.',
    groundColor: 0x4caf50,
    groundSecondaryColor: 0x388e3c,
    wallColor: 0x795548,
    wallTrimColor: 0x8d6e63,
    skyColor: 0x87ceeb,
    fogColor: 0xc8e6c9,
    fogDensity: 0.012,
    ambientLightColor: 0xffffff,
    sunLightColor: 0xfff8e1,
    accentColor: '#4CAF50',
    gridSize: 28,
    wallHeight: 4.5,
    mobType: 'grass_golem',
    mobCount: 4
  },
  desert: {
    id: 'desert',
    waveIndex: 2,
    name: 'Scorched Dunes',
    themeTitle: 'Wave 2: Desert Ruins',
    description: 'Golden sandstone blocks, ancient obelisks, and desert cacti.',
    groundColor: 0xe0a96d,
    groundSecondaryColor: 0xd29054,
    wallColor: 0xc4975e,
    wallTrimColor: 0xa97c50,
    skyColor: 0xfde2b8,
    fogColor: 0xfce8cc,
    fogDensity: 0.015,
    ambientLightColor: 0xffeedd,
    sunLightColor: 0xffdfba,
    accentColor: '#FF9800',
    gridSize: 28,
    wallHeight: 4.5,
    mobType: 'desert_scorcher',
    mobCount: 4
  },
  snow: {
    id: 'snow',
    waveIndex: 3,
    name: 'Glacial Peak',
    themeTitle: 'Wave 3: Frozen Frostlands',
    description: 'Powder snow terrain, crystalline ice monoliths, and winter pines.',
    groundColor: 0xe0f7fa,
    groundSecondaryColor: 0xb2ebf2,
    wallColor: 0x90caf9,
    wallTrimColor: 0x64b5f6,
    skyColor: 0xcfe8fc,
    fogColor: 0xdceefb,
    fogDensity: 0.018,
    ambientLightColor: 0xe3f2fd,
    sunLightColor: 0xffffff,
    accentColor: '#00BCD4',
    gridSize: 28,
    wallHeight: 4.5,
    mobType: 'frost_sprite',
    mobCount: 5
  },
  castle: {
    id: 'castle',
    waveIndex: 4,
    name: 'Obsidian Keep',
    themeTitle: 'Wave 4: Fortress of Stone',
    description: 'Chiseled cobblestone ramparts, fortified battlements, and flickering braziers.',
    groundColor: 0x424242,
    groundSecondaryColor: 0x303030,
    wallColor: 0x263238,
    wallTrimColor: 0x455a64,
    skyColor: 0x212121,
    fogColor: 0x2c3437,
    fogDensity: 0.022,
    ambientLightColor: 0x9e9e9e,
    sunLightColor: 0xffab40,
    accentColor: '#9C27B0',
    gridSize: 28,
    wallHeight: 5.0,
    mobType: 'stone_sentinel',
    mobCount: 5
  },
  forest: {
    id: 'forest',
    waveIndex: 5,
    name: 'Ancient Canopy',
    themeTitle: 'Wave 5: Boss Chamber of Knowledge',
    description: 'Towering mystical redwood canopies and glowing bioluminescent fungi. Lair of the Shadow Warden.',
    groundColor: 0x2e7d32,
    groundSecondaryColor: 0x1b5e20,
    wallColor: 0x3e2723,
    wallTrimColor: 0x4e342e,
    skyColor: 0x1b2838,
    fogColor: 0x192a32,
    fogDensity: 0.02,
    ambientLightColor: 0x80cbc4,
    sunLightColor: 0x80deea,
    accentColor: '#E91E63',
    gridSize: 30,
    wallHeight: 5.5,
    mobType: 'shadow_warden',
    mobCount: 1,
    bossWave: true
  }
};

export interface ObstacleCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  radius: number;
  x: number;
  z: number;
}

export class VoxelArenaManager {
  public arenaGroup: THREE.Group;
  public currentBiome: BiomeType = 'grassland';
  public currentDef: ArenaDefinition = ARENA_DEFINITIONS.grassland;
  public obstacles: ObstacleCollider[] = [];

  private sharedBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  private materialsToDispose: THREE.Material[] = [];

  constructor() {
    this.arenaGroup = new THREE.Group();
    this.arenaGroup.name = 'VoxelArena';
  }

  public getBoundaryRadius(): number {
    return (this.currentDef.gridSize / 2) - 1.2;
  }

  public buildArena(biome: BiomeType): {
    skyColor: number;
    fogColor: number;
    fogDensity: number;
    ambientColor: number;
    sunColor: number;
  } {
    this.clearArena();
    this.currentBiome = biome;
    this.currentDef = ARENA_DEFINITIONS[biome] || ARENA_DEFINITIONS.grassland;

    const def = this.currentDef;
    const half = def.gridSize / 2;

    // 1. Checkered Voxel Floor
    const matGroundA = new THREE.MeshLambertMaterial({ color: def.groundColor });
    const matGroundB = new THREE.MeshLambertMaterial({ color: def.groundSecondaryColor });
    this.materialsToDispose.push(matGroundA, matGroundB);

    const floorTileSize = 2;
    const steps = Math.floor(def.gridSize / floorTileSize);
    for (let ix = -steps / 2; ix < steps / 2; ix++) {
      for (let iz = -steps / 2; iz < steps / 2; iz++) {
        const isA = (Math.abs(ix) + Math.abs(iz)) % 2 === 0;
        const tileMesh = new THREE.Mesh(this.sharedBoxGeo, isA ? matGroundA : matGroundB);
        tileMesh.scale.set(floorTileSize, 0.4, floorTileSize);
        tileMesh.position.set(
          ix * floorTileSize + floorTileSize / 2,
          -0.2,
          iz * floorTileSize + floorTileSize / 2
        );
        tileMesh.receiveShadow = true;
        this.arenaGroup.add(tileMesh);
      }
    }

    // 2. Solid 4 Perimeter Boundary Walls (No falling out)
    const matWall = new THREE.MeshLambertMaterial({ color: def.wallColor });
    const matWallTrim = new THREE.MeshLambertMaterial({ color: def.wallTrimColor });
    this.materialsToDispose.push(matWall, matWallTrim);

    const wallThickness = 1.6;
    const wallHeight = def.wallHeight;
    const span = def.gridSize + wallThickness;

    // North Wall
    this.createWallBlock(0, wallHeight / 2, -half, span, wallHeight, wallThickness, matWall, matWallTrim);
    // South Wall
    this.createWallBlock(0, wallHeight / 2, half, span, wallHeight, wallThickness, matWall, matWallTrim);
    // West Wall
    this.createWallBlock(-half, wallHeight / 2, 0, wallThickness, wallHeight, span, matWall, matWallTrim);
    // East Wall
    this.createWallBlock(half, wallHeight / 2, 0, wallThickness, wallHeight, span, matWall, matWallTrim);

    // 4 Corner Towers
    const cornerSize = 2.4;
    const cornerH = wallHeight + 1.5;
    this.createTowerBlock(-half, cornerH / 2, -half, cornerSize, cornerH, matWallTrim);
    this.createTowerBlock(half, cornerH / 2, -half, cornerSize, cornerH, matWallTrim);
    this.createTowerBlock(-half, cornerH / 2, half, cornerSize, cornerH, matWallTrim);
    this.createTowerBlock(half, cornerH / 2, half, cornerSize, cornerH, matWallTrim);

    // 3. Biome-Specific Voxel Decorative Obstacles
    this.buildBiomeProps(biome, half - 3);

    return {
      skyColor: def.skyColor,
      fogColor: def.fogColor,
      fogDensity: def.fogDensity,
      ambientColor: def.ambientLightColor,
      sunColor: def.sunLightColor
    };
  }

  private createWallBlock(
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    matMain: THREE.Material,
    matTrim: THREE.Material
  ) {
    const wallMesh = new THREE.Mesh(this.sharedBoxGeo, matMain);
    wallMesh.scale.set(sx, sy, sz);
    wallMesh.position.set(x, y, z);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    this.arenaGroup.add(wallMesh);

    // Battlements / Trim on top
    const trimMesh = new THREE.Mesh(this.sharedBoxGeo, matTrim);
    trimMesh.scale.set(sx * 1.02, 0.4, sz * 1.02);
    trimMesh.position.set(x, y + sy / 2 + 0.2, z);
    this.arenaGroup.add(trimMesh);
  }

  private createTowerBlock(x: number, y: number, z: number, size: number, height: number, mat: THREE.Material) {
    const tower = new THREE.Mesh(this.sharedBoxGeo, mat);
    tower.scale.set(size, height, size);
    tower.position.set(x, y, z);
    tower.castShadow = true;
    tower.receiveShadow = true;
    this.arenaGroup.add(tower);

    // Top cap
    const cap = new THREE.Mesh(this.sharedBoxGeo, mat);
    cap.scale.set(size + 0.4, 0.6, size + 0.4);
    cap.position.set(x, height + 0.3, z);
    this.arenaGroup.add(cap);
  }

  private buildBiomeProps(biome: BiomeType, limit: number) {
    this.obstacles = [];

    if (biome === 'grassland') {
      // 4 Voxel Trees + 2 Boulders
      const treePositions = [
        [-limit + 3, -limit + 4],
        [limit - 4, -limit + 3],
        [-limit + 4, limit - 3],
        [limit - 3, limit - 4]
      ];
      for (const [tx, tz] of treePositions) {
        this.buildVoxelTree(tx, tz);
        this.obstacles.push({
          x: tx,
          z: tz,
          radius: 1.2,
          minX: tx - 1.2,
          maxX: tx + 1.2,
          minZ: tz - 1.2,
          maxZ: tz + 1.2
        });
      }
      this.buildVoxelBoulder(5, 5);
      this.obstacles.push({ x: 5, z: 5, radius: 1.4, minX: 3.6, maxX: 6.4, minZ: 3.6, maxZ: 6.4 });
      this.buildVoxelBoulder(-6, -4);
      this.obstacles.push({ x: -6, z: -4, radius: 1.4, minX: -7.4, maxX: -4.6, minZ: -5.4, maxZ: -2.6 });
    } else if (biome === 'desert') {
      // 4 Cacti + 2 Ancient Sandstone Pillars
      const cactusPositions = [
        [-8, 6],
        [7, -8],
        [-7, -7],
        [8, 7]
      ];
      for (const [cx, cz] of cactusPositions) {
        this.buildVoxelCactus(cx, cz);
        this.obstacles.push({ x: cx, z: cz, radius: 1.0, minX: cx - 1, maxX: cx + 1, minZ: cz - 1, maxZ: cz + 1 });
      }
      this.buildAncientPillar(0, -6);
      this.obstacles.push({ x: 0, z: -6, radius: 1.3, minX: -1.3, maxX: 1.3, minZ: -7.3, maxZ: -4.7 });
      this.buildAncientPillar(0, 6);
      this.obstacles.push({ x: 0, z: 6, radius: 1.3, minX: -1.3, maxX: 1.3, minZ: 4.7, maxZ: 7.3 });
    } else if (biome === 'snow') {
      // 4 Ice Monoliths + 2 Snow Pines
      const icePositions = [
        [-7, -7],
        [7, -7],
        [-7, 7],
        [7, 7]
      ];
      for (const [ix, iz] of icePositions) {
        this.buildIceMonolith(ix, iz);
        this.obstacles.push({ x: ix, z: iz, radius: 1.2, minX: ix - 1.2, maxX: ix + 1.2, minZ: iz - 1.2, maxZ: iz + 1.2 });
      }
      this.buildSnowPine(-5, 4);
      this.obstacles.push({ x: -5, z: 4, radius: 1.2, minX: -6.2, maxX: -3.8, minZ: 2.8, maxZ: 5.2 });
      this.buildSnowPine(5, -4);
      this.obstacles.push({ x: 5, z: -4, radius: 1.2, minX: 3.8, maxX: 6.2, minZ: -5.2, maxZ: -2.8 });
    } else if (biome === 'castle') {
      // 4 Fortress Pillars with glowing torches
      const pillarPos = [
        [-6, -6],
        [6, -6],
        [-6, 6],
        [6, 6]
      ];
      for (const [px, pz] of pillarPos) {
        this.buildCastlePillar(px, pz);
        this.obstacles.push({ x: px, z: pz, radius: 1.3, minX: px - 1.3, maxX: px + 1.3, minZ: pz - 1.3, maxZ: pz + 1.3 });
      }
    } else if (biome === 'forest') {
      // 4 Giant Glowing Mushroom Pillars around boss arena
      const shroomPos = [
        [-8, -8],
        [8, -8],
        [-8, 8],
        [8, 8]
      ];
      for (const [sx, sz] of shroomPos) {
        this.buildGlowingMushroom(sx, sz);
        this.obstacles.push({ x: sx, z: sz, radius: 1.4, minX: sx - 1.4, maxX: sx + 1.4, minZ: sz - 1.4, maxZ: sz + 1.4 });
      }
    }
  }

  // --- Decorative Voxel Builders ---

  private buildVoxelTree(x: number, z: number) {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    this.materialsToDispose.push(trunkMat, leafMat);

    // Trunk
    const trunk = new THREE.Mesh(this.sharedBoxGeo, trunkMat);
    trunk.scale.set(0.8, 2.6, 0.8);
    trunk.position.set(x, 1.3, z);
    trunk.castShadow = true;
    this.arenaGroup.add(trunk);

    // Voxel Foliage Layers
    const leaves1 = new THREE.Mesh(this.sharedBoxGeo, leafMat);
    leaves1.scale.set(2.4, 1.2, 2.4);
    leaves1.position.set(x, 3.2, z);
    leaves1.castShadow = true;
    this.arenaGroup.add(leaves1);

    const leaves2 = new THREE.Mesh(this.sharedBoxGeo, leafMat);
    leaves2.scale.set(1.6, 1.0, 1.6);
    leaves2.position.set(x, 4.2, z);
    leaves2.castShadow = true;
    this.arenaGroup.add(leaves2);
  }

  private buildVoxelBoulder(x: number, z: number) {
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x757575 });
    this.materialsToDispose.push(stoneMat);

    const boulder = new THREE.Mesh(this.sharedBoxGeo, stoneMat);
    boulder.scale.set(1.8, 1.4, 1.8);
    boulder.position.set(x, 0.7, z);
    boulder.rotation.y = 0.4;
    boulder.castShadow = true;
    this.arenaGroup.add(boulder);
  }

  private buildVoxelCactus(x: number, z: number) {
    const cactusMat = new THREE.MeshLambertMaterial({ color: 0x388e3c });
    this.materialsToDispose.push(cactusMat);

    // Main Stem
    const stem = new THREE.Mesh(this.sharedBoxGeo, cactusMat);
    stem.scale.set(0.7, 3.0, 0.7);
    stem.position.set(x, 1.5, z);
    stem.castShadow = true;
    this.arenaGroup.add(stem);

    // Side Arms
    const arm1 = new THREE.Mesh(this.sharedBoxGeo, cactusMat);
    arm1.scale.set(0.9, 0.5, 0.5);
    arm1.position.set(x + 0.6, 1.8, z);
    this.arenaGroup.add(arm1);

    const arm1Up = new THREE.Mesh(this.sharedBoxGeo, cactusMat);
    arm1Up.scale.set(0.5, 1.0, 0.5);
    arm1Up.position.set(x + 0.9, 2.2, z);
    this.arenaGroup.add(arm1Up);
  }

  private buildAncientPillar(x: number, z: number) {
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xcbb279 });
    this.materialsToDispose.push(pillarMat);

    const pillar = new THREE.Mesh(this.sharedBoxGeo, pillarMat);
    pillar.scale.set(1.4, 3.8, 1.4);
    pillar.position.set(x, 1.9, z);
    pillar.castShadow = true;
    this.arenaGroup.add(pillar);
  }

  private buildIceMonolith(x: number, z: number) {
    const iceMat = new THREE.MeshLambertMaterial({
      color: 0x80deea,
      transparent: true,
      opacity: 0.88
    });
    this.materialsToDispose.push(iceMat);

    const ice = new THREE.Mesh(this.sharedBoxGeo, iceMat);
    ice.scale.set(1.3, 3.5, 1.3);
    ice.position.set(x, 1.75, z);
    ice.rotation.y = 0.35;
    ice.castShadow = true;
    this.arenaGroup.add(ice);
  }

  private buildSnowPine(x: number, z: number) {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4e342e });
    const snowMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    this.materialsToDispose.push(trunkMat, snowMat);

    const trunk = new THREE.Mesh(this.sharedBoxGeo, trunkMat);
    trunk.scale.set(0.7, 3.2, 0.7);
    trunk.position.set(x, 1.6, z);
    this.arenaGroup.add(trunk);

    const snowFoliage = new THREE.Mesh(this.sharedBoxGeo, snowMat);
    snowFoliage.scale.set(2.2, 2.0, 2.2);
    snowFoliage.position.set(x, 3.2, z);
    snowFoliage.castShadow = true;
    this.arenaGroup.add(snowFoliage);
  }

  private buildCastlePillar(x: number, z: number) {
    const brickMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
    const torchMat = new THREE.MeshBasicMaterial({ color: 0xffa000 });
    this.materialsToDispose.push(brickMat, torchMat);

    const col = new THREE.Mesh(this.sharedBoxGeo, brickMat);
    col.scale.set(1.5, 4.0, 1.5);
    col.position.set(x, 2.0, z);
    col.castShadow = true;
    this.arenaGroup.add(col);

    // Glowing Torch on top
    const torch = new THREE.Mesh(this.sharedBoxGeo, torchMat);
    torch.scale.set(0.4, 0.6, 0.4);
    torch.position.set(x, 4.3, z);
    this.arenaGroup.add(torch);
  }

  private buildGlowingMushroom(x: number, z: number) {
    const stalkMat = new THREE.MeshLambertMaterial({ color: 0x263238 });
    const capMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
    this.materialsToDispose.push(stalkMat, capMat);

    const stalk = new THREE.Mesh(this.sharedBoxGeo, stalkMat);
    stalk.scale.set(0.9, 3.6, 0.9);
    stalk.position.set(x, 1.8, z);
    this.arenaGroup.add(stalk);

    const cap = new THREE.Mesh(this.sharedBoxGeo, capMat);
    cap.scale.set(2.4, 0.8, 2.4);
    cap.position.set(x, 3.8, z);
    this.arenaGroup.add(cap);
  }

  // --- Collision Clamping & Obstacle Resolution ---

  public clampPositionToBounds(
    currX: number,
    currZ: number,
    radius: number = 0.5
  ): { x: number; z: number; collidedWithObstacle: boolean } {
    const maxBound = this.getBoundaryRadius();
    let clampedX = Math.max(-maxBound, Math.min(maxBound, currX));
    let clampedZ = Math.max(-maxBound, Math.min(maxBound, currZ));
    let collided = false;

    // Check collision against obstacles
    for (const obs of this.obstacles) {
      let dx = clampedX - obs.x;
      let dz = clampedZ - obs.z;
      let dist = Math.hypot(dx, dz);
      const minDist = obs.radius + radius;
      if (dist < minDist) {
        collided = true;
        if (dist < 0.0001) {
          dx = 0.01;
          dist = 0.01;
        }
        // Push out along normal
        const overlap = minDist - dist;
        clampedX += (dx / dist) * overlap;
        clampedZ += (dz / dist) * overlap;
      }
    }

    // Re-clamp to arena walls after pushing
    clampedX = Math.max(-maxBound, Math.min(maxBound, clampedX));
    clampedZ = Math.max(-maxBound, Math.min(maxBound, clampedZ));

    return { x: clampedX, z: clampedZ, collidedWithObstacle: collided };
  }

  public clearArena() {
    while (this.arenaGroup.children.length > 0) {
      const child = this.arenaGroup.children[0];
      this.arenaGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        // child.geometry is shared, don't dispose sharedBoxGeo
      }
    }
    for (const mat of this.materialsToDispose) {
      mat.dispose();
    }
    this.materialsToDispose = [];
    this.obstacles = [];
  }

  public dispose() {
    this.clearArena();
    this.sharedBoxGeo.dispose();
  }
}
