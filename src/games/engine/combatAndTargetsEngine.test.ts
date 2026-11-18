import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  EnergyCombatSystem,
  MovingAnswerTargetSystem
} from './CombatAndTargetsEngine';

describe('MovingAnswerTargetSystem', () => {
  it('moves each answer target independently and detects exact projectile hits', () => {
    const sys = new MovingAnswerTargetSystem();
    sys.setTargets([
      {
        answerId: 'A',
        label: 'A',
        text: 'Friction',
        basePosition: new THREE.Vector3(-8, 3, -5),
        pattern: 'horizontal',
        amplitude: 2
      },
      {
        answerId: 'B',
        label: 'B',
        text: 'Gravity',
        basePosition: new THREE.Vector3(0, 3, -5),
        pattern: 'vertical',
        amplitude: 2
      },
      {
        answerId: 'C',
        label: 'C',
        text: 'Magnetism',
        basePosition: new THREE.Vector3(8, 3, -5),
        pattern: 'curved',
        amplitude: 2
      }
    ]);

    sys.update(1.2, 1.0);
    const tA = sys.targets[0];
    const tB = sys.targets[1];
    const tC = sys.targets[2];

    // Horizontal target moves on X, Vertical target moves on Y, Curved moves on both
    expect(tA.position.x).not.toBe(-8);
    expect(tA.position.y).toBe(3);
    expect(tB.position.x).toBe(0);
    expect(tB.position.y).not.toBe(3);
    expect(tC.position.x).not.toBe(8);

    // Hit test on exact target position succeeds; miss returns null
    expect(sys.checkCollision(tB.position.clone(), 0.4)?.config.answerId).toBe('B');
    expect(sys.checkCollision(new THREE.Vector3(50, 50, 50), 0.4)).toBeNull();
  });
});

describe('EnergyCombatSystem', () => {
  it('handles player projectiles, enemy attacks, dodge cooldown, and shield absorption', () => {
    const combat = new EnergyCombatSystem(100);
    const sys = new MovingAnswerTargetSystem();
    sys.setTargets([
      {
        answerId: 'A',
        label: 'A',
        text: 'Friction',
        basePosition: new THREE.Vector3(0, 2, -10),
        pattern: 'horizontal',
        amplitude: 0
      }
    ]);

    // Dodge activates and prevents immediate repeat spam
    expect(combat.triggerDodge(new THREE.Vector3(1, 0, 0))).toBe(true);
    expect(combat.dodgeActive).toBe(true);
    expect(combat.triggerDodge(new THREE.Vector3(1, 0, 0))).toBe(false);

    // Player energy projectile hits target A
    combat.spawnProjectile({
      owner: 'player',
      origin: new THREE.Vector3(0, 2, -8),
      direction: new THREE.Vector3(0, 0, -1),
      speed: 20
    });
    const stepHit = combat.step(0.1, new THREE.Vector3(0, 0, 8), 0.7, sys);
    expect(stepHit.hitTarget?.config.answerId).toBe('A');

    // Shield absorbs enemy projectile without HP loss
    expect(combat.activateShield(2.0)).toBe(true);
    combat.spawnProjectile({
      owner: 'enemy',
      origin: new THREE.Vector3(0, 0, 7.5),
      direction: new THREE.Vector3(0, 0, 1),
      speed: 10,
      damage: 15
    });
    const stepShield = combat.step(0.05, new THREE.Vector3(0, 0, 8), 0.7, sys);
    expect(stepShield.absorbedByShield).toBe(true);
    expect(combat.playerHp).toBe(100);
  });
});
