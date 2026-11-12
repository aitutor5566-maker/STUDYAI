import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { initDatabase, db } from '../server/db.ts';
import { ARENA_DEFINITIONS, VoxelArenaManager } from '../src/games/battleWorld/VoxelArenaManager.ts';
import { VoxelCharacter } from '../src/games/battleWorld/VoxelCharacter.ts';
import { VoxelMobManager } from '../src/games/battleWorld/VoxelMobManager.ts';
import { getCurriculumFallbackQuestions } from '../src/games/curriculumBank.ts';

initDatabase();

test('STUDYAI BATTLE WORLD — Master Game Center Verification Suite', async (t) => {
  await t.test('1. 5 Voxel Arena Biomes Definition & Atmosphere Configuration', () => {
    const biomes = ['grassland', 'desert', 'snow', 'castle', 'forest'] as const;

    biomes.forEach((b, idx) => {
      const def = ARENA_DEFINITIONS[b];
      assert.ok(def, `Arena definition for ${b} must exist`);
      assert.strictEqual(def.waveIndex, idx + 1, `Wave index for ${b} must match ${idx + 1}`);
      assert.ok(def.name.length > 3, `Arena name must be defined`);
      assert.ok(def.description.length > 10, `Arena description must be detailed`);
      assert.ok(def.gridSize >= 28, `Arena grid size must be compact enclosed (>= 28)`);
      assert.ok(def.wallHeight >= 4.0, `Perimeter walls must be at least 4 units high`);
      assert.ok(typeof def.skyColor === 'number', `Sky color must be defined`);
      assert.ok(typeof def.ambientLightColor === 'number', `Ambient light color must be defined`);
      assert.ok(def.mobCount >= 1, `Mob count must be positive`);
    });

    assert.strictEqual(ARENA_DEFINITIONS.forest.bossWave, true, 'Wave 5 Forest must be boss wave');
    assert.strictEqual(ARENA_DEFINITIONS.forest.mobType, 'shadow_warden');
  });

  await t.test('2. Solid Perimeter Wall Clamping & Obstacle Collision (Zero Void Falls)', () => {
    const arenaManager = new VoxelArenaManager();
    const colors = arenaManager.buildArena('grassland');

    assert.ok(colors.skyColor, 'Must return valid atmosphere sky color');
    const boundaryRadius = arenaManager.getBoundaryRadius();
    assert.ok(boundaryRadius > 10, `Boundary radius must be reasonable`);

    // Extreme out of bounds
    const outResult = arenaManager.clampPositionToBounds(100, -100, 0.5);
    assert.ok(
      Math.abs(outResult.x) <= boundaryRadius,
      `Clamped X (${outResult.x}) must not exceed boundary radius (${boundaryRadius})`
    );
    assert.ok(
      Math.abs(outResult.z) <= boundaryRadius,
      `Clamped Z (${outResult.z}) must not exceed boundary radius (${boundaryRadius})`
    );

    // Collision with tree obstacle at (-11, -10)
    assert.ok(arenaManager.obstacles.length >= 4, 'Must have at least 4 obstacles in grassland');
    const firstObs = arenaManager.obstacles[0];
    const collideResult = arenaManager.clampPositionToBounds(firstObs.x, firstObs.z, 0.5);
    assert.strictEqual(collideResult.collidedWithObstacle, true, 'Must detect obstacle collision');

    arenaManager.dispose();
  });

  await t.test('3. Minecraft-Style Voxel Humanoid Player Character Rig & Physics', () => {
    const player = new VoxelCharacter();

    assert.ok(player.group, 'Player group must be created');
    assert.ok(player.headGroup, 'Head group must be created');
    assert.ok(player.torsoMesh, 'Torso must be created');
    assert.ok(player.leftArmGroup && player.rightArmGroup, 'Arms must be articulated');
    assert.ok(player.leftLegGroup && player.rightLegGroup, 'Legs must be articulated');
    assert.ok(player.weaponMesh, 'Knowledge weapon must be attached');

    // Jumping
    assert.strictEqual(player.isGrounded, true);
    player.jump();
    assert.strictEqual(player.isGrounded, false);
    assert.ok(player.velocityY > 0, 'Vertical velocity must be positive after jump');

    // Attack Swing
    player.triggerSwing();
    assert.strictEqual(player.isSwinging, true);

    // Animation Tick
    player.update(0.016, true);
    assert.ok(player.walkCycle > 0, 'Walk cycle must advance');

    // Damage & Healing
    player.takeDamage(20);
    assert.strictEqual(player.health, 80);
    player.heal(10);
    assert.strictEqual(player.health, 90);

    player.dispose();
  });

  await t.test('4. 5 Stylized Voxel Mob Types, AI Steering, Hit Arc & Defeat Particles', () => {
    const scene = new THREE.Scene();
    const arenaManager = new VoxelArenaManager();
    arenaManager.buildArena('snow');

    const mobManager = new VoxelMobManager(scene, arenaManager);
    mobManager.spawnWaveMobs('snow', 5, false);

    assert.strictEqual(mobManager.mobs.length, 5);
    assert.strictEqual(mobManager.getAliveCount(), 5);

    // Mob 0
    const mob0 = mobManager.mobs[0];
    assert.strictEqual(mob0.state.name, 'Frost Sprite');
    assert.strictEqual(mob0.state.isAlive, true);
    assert.ok(mob0.state.maxHealth >= 50);

    // AI Tick
    const playerPos = new THREE.Vector3(0, 0, 0);
    let playerHitCount = 0;
    mobManager.update(0.016, playerPos, (dmg) => {
      playerHitCount += dmg;
    });

    // Check hit detection
    const mobPos = mob0.group.position;
    const testPlayerPos = new THREE.Vector3(mobPos.x, 0, mobPos.z - 1.0);
    const hitRes = mobManager.checkPlayerAttack(testPlayerPos, 0, 100);

    assert.ok(hitRes.hits >= 1, 'Hit must register when player strikes in front of mob');
    assert.ok(hitRes.defeatedCount >= 1, 'Mob must be defeated when damage exceeds max HP');
    assert.ok(hitRes.xpEarned >= 40, 'Knowledge XP must be awarded on defeat');
    assert.ok(mobManager.particles.length > 0, 'Defeat burst particles must be spawned');

    // Boss Mob Check
    mobManager.spawnWaveMobs('forest', 1, true);
    assert.strictEqual(mobManager.mobs.length, 1);
    const boss = mobManager.mobs[0];
    assert.strictEqual(boss.state.isBoss, true);
    assert.strictEqual(boss.state.name, 'Shadow Warden Boss');
    assert.ok(boss.state.maxHealth >= 200, 'Boss must have >= 200 HP');

    mobManager.dispose();
    arenaManager.dispose();
  });

  await t.test('5. Curriculum Question Engine & Offline Caching Fallback', () => {
    const questions = getCurriculumFallbackQuestions('Photosynthesis', 5, 'English');
    assert.ok(questions.length >= 3, 'Must have at least 3 fallback questions for Photosynthesis');

    questions.forEach((q) => {
      assert.ok(q.id, 'Question ID must be non-empty');
      assert.ok(q.question.length > 10, 'Question text must be descriptive');
      assert.ok(q.options.length >= 3, 'Question must have at least 3 options');
      assert.ok(['A', 'B', 'C', 'D'].includes(q.correct_option_id), 'Correct option ID must be valid');
      assert.ok(q.explanation.length > 10, 'Explanation must be educational');
    });
  });

  await t.test('6. Backend Session Persistence for STUDYAI BATTLE WORLD', () => {
    const testSessionId = `test-bw-${Date.now()}`;
    const testUserId = 'student-vishwak'; // existing test user

    db.prepare(`
      INSERT INTO game_sessions (
        id, user_id, game_type, subject, topic, difficulty, score, accuracy,
        correct_count, total_questions, stage_reached, duration_seconds, mistakes_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      testSessionId,
      testUserId,
      'battle_world',
      'Science',
      'Photosynthesis',
      'medium',
      950,
      88,
      5,
      6,
      5,
      140,
      JSON.stringify([{ question: 'What gas do plants absorb?', chosen: 'Oxygen', correct: 'Carbon Dioxide' }]),
      new Date().toISOString()
    );

    const saved = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(testSessionId) as any;
    assert.ok(saved, 'Session must be saved in database');
    assert.strictEqual(saved.game_type, 'battle_world');
    assert.strictEqual(saved.score, 950);
    assert.strictEqual(saved.accuracy, 88);
    assert.strictEqual(saved.stage_reached, 5);

    // Clean up test record
    db.prepare('DELETE FROM game_sessions WHERE id = ?').run(testSessionId);
  });
});
