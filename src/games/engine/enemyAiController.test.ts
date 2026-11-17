import { describe, expect, it } from 'vitest';
import { createEnemyAiAgent, hasLineOfSight, stepEnemyAi } from './EnemyAiController';

describe('EnemyAiController', () => {
  it('blocks line-of-sight detection through solid obstacles', () => {
    const wall = [{ minX: 4, maxX: 6, minZ: -3, maxZ: 3 }];
    expect(hasLineOfSight(0, 0, 10, 0, wall)).toBe(false);
    expect(hasLineOfSight(0, 0, 2, 0, wall)).toBe(true);
  });

  it('transitions patrol -> detect -> approach -> prepare_attack -> attack (single hit) -> recover -> cooldown', () => {
    const agent = createEnemyAiAgent({ id: 'e1', archetype: 'basic', x: 8, z: 0, hp: 60 });
    expect(agent.state).toBe('patrol');

    // Detect player within radius
    const ev1 = stepEnemyAi(agent, { playerX: 0, playerZ: 0, obstacles: [], dt: 0.016 });
    expect(ev1.detectedPlayer).toBe(true);
    expect(agent.state).toBe('detect');

    // Advance into approach
    for (let i = 0; i < 20; i++) {
      stepEnemyAi(agent, { playerX: 0, playerZ: 0, obstacles: [], dt: 0.03 });
    }
    expect(agent.state).toBe('approach');

    // Step until enemy enters attack range, prepares attack, and lands exactly 1 hit
    let hitCount = 0;
    for (let i = 0; i < 120; i++) {
      const ev = stepEnemyAi(agent, { playerX: 0, playerZ: 0, obstacles: [], dt: 0.03 });
      if (ev.hitPlayer) hitCount++;
      if (agent.state === 'recover' || agent.state === 'cooldown') break;
    }
    expect(hitCount).toBe(1);
    expect(['recover', 'cooldown']).toContain(agent.state);
  });

  it('repositions ranged enemies when player gets too close', () => {
    const ranged = createEnemyAiAgent({ id: 'r1', archetype: 'ranged', x: 2, z: 0, hp: 50 });
    ranged.state = 'approach';
    stepEnemyAi(ranged, { playerX: 0, playerZ: 0, obstacles: [], dt: 0.03 });
    expect(ranged.state).toBe('reposition');
  });
});
