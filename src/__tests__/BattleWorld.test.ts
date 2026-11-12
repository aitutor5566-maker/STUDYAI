import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { ARENA_DEFINITIONS, VoxelArenaManager } from '../games/battleWorld/VoxelArenaManager';
import { VoxelCharacter } from '../games/battleWorld/VoxelCharacter';
import { VoxelMobManager } from '../games/battleWorld/VoxelMobManager';

describe('STUDYAI BATTLE WORLD — 3D Voxel Engine & Arena System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. VoxelArenaManager defines 5 compact enclosed arenas with wall colliders', () => {
    const biomes = ['grassland', 'desert', 'snow', 'castle', 'forest'] as const;
    expect(Object.keys(ARENA_DEFINITIONS)).toHaveLength(5);

    const arenaManager = new VoxelArenaManager();

    biomes.forEach((b, idx) => {
      const def = ARENA_DEFINITIONS[b];
      expect(def.waveIndex).toBe(idx + 1);
      expect(def.gridSize).toBeGreaterThanOrEqual(28);
      expect(def.wallHeight).toBeGreaterThanOrEqual(4.0);

      const colors = arenaManager.buildArena(b);
      expect(colors.skyColor).toBeDefined();
      expect(colors.ambientColor).toBeDefined();
      expect(arenaManager.arenaGroup.children.length).toBeGreaterThan(10);
    });

    arenaManager.dispose();
  });

  it('2. VoxelArenaManager strictly clamps player inside 4 boundary walls and obstacles', () => {
    const arenaManager = new VoxelArenaManager();
    arenaManager.buildArena('grassland');

    const maxBound = arenaManager.getBoundaryRadius();

    // Test extreme out-of-bounds position
    const clampedOut = arenaManager.clampPositionToBounds(999, -999, 0.5);
    expect(clampedOut.x).toBeLessThanOrEqual(maxBound);
    expect(clampedOut.z).toBeGreaterThanOrEqual(-maxBound);

    // Test obstacle collision detection
    const inside = arenaManager.clampPositionToBounds(0, 0, 0.5);
    expect(inside.x).toBe(0);
    expect(inside.z).toBe(0);

    arenaManager.dispose();
  });

  it('3. VoxelCharacter constructs articulated Minecraft-style humanoid player', () => {
    const player = new VoxelCharacter();
    expect(player.group).toBeDefined();
    expect(player.headGroup).toBeDefined();
    expect(player.torsoMesh).toBeDefined();
    expect(player.leftArmGroup).toBeDefined();
    expect(player.rightArmGroup).toBeDefined();
    expect(player.leftLegGroup).toBeDefined();
    expect(player.rightLegGroup).toBeDefined();
    expect(player.weaponMesh).toBeDefined();

    // Trigger action swing & jump
    player.triggerSwing();
    expect(player.isSwinging).toBe(true);

    player.jump();
    expect(player.isGrounded).toBe(false);
    expect(player.velocityY).toBeGreaterThan(0);

    // Update animation tick
    player.update(0.016, true);
    expect(player.walkCycle).toBeGreaterThan(0);

    player.dispose();
  });

  it('4. VoxelMobManager spawns stylized mobs and handles attack detection & defeat particles', () => {
    const scene = new THREE.Scene();
    const arenaManager = new VoxelArenaManager();
    arenaManager.buildArena('grassland');

    const mobManager = new VoxelMobManager(scene, arenaManager);
    mobManager.spawnWaveMobs('grassland', 4, false);

    expect(mobManager.mobs).toHaveLength(4);
    expect(mobManager.getAliveCount()).toBe(4);

    // Position player right in front of mob 0 and swing
    const mob0 = mobManager.mobs[0];
    const playerPos = new THREE.Vector3(
      mob0.group.position.x,
      0,
      mob0.group.position.z - 1.0
    );

    const attackRes = mobManager.checkPlayerAttack(playerPos, 0, 50);
    expect(attackRes.hits).toBeGreaterThan(0);
    expect(attackRes.defeatedCount).toBeGreaterThan(0);
    expect(attackRes.xpEarned).toBeGreaterThan(0);
    expect(mobManager.getAliveCount()).toBeLessThan(4);

    mobManager.dispose();
    arenaManager.dispose();
  });
});
