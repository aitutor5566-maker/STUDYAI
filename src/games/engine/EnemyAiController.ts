export type EnemyAiState =
  | 'idle'
  | 'patrol'
  | 'detect'
  | 'approach'
  | 'prepare_attack'
  | 'attack'
  | 'recover'
  | 'cooldown'
  | 'reposition'
  | 'stunned'
  | 'defeated';

export type EnemyArchetype = 'basic' | 'ranged' | 'defensive' | 'boss';

export interface ObstacleBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface EnemyAiAgent {
  id: string;
  archetype: EnemyArchetype;
  state: EnemyAiState;
  x: number;
  z: number;
  homeX: number;
  homeZ: number;
  patrolTargetX: number;
  patrolTargetZ: number;
  speed: number;
  detectionRadius: number;
  loseInterestRadius: number;
  attackRange: number;
  preferredMinRange: number;
  hp: number;
  maxHp: number;
  stateTimer: number;
  cooldownTimer: number;
  attackHitApplied: boolean;
  facingAngle: number;
}

export interface EnemyStepContext {
  playerX: number;
  playerZ: number;
  fallbackTargetX?: number;
  fallbackTargetZ?: number;
  obstacles: ObstacleBox[];
  dt: number;
}

export interface EnemyStepEvents {
  detectedPlayer: boolean;
  startedAttackWindup: boolean;
  hitPlayer: boolean;
  hitFallbackTarget: boolean;
  firedRangedProjectile: boolean;
  damageAmount: number;
}

/**
 * Checks whether the segment from (x1,z1) to (x2,z2) is unobstructed by any 2D AABB obstacle.
 */
export function hasLineOfSight(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  obstacles: ObstacleBox[]
): boolean {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const steps = Math.max(4, Math.ceil(Math.hypot(dx, dz) / 1.1));

  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    const px = x1 + dx * t;
    const pz = z1 + dz * t;
    for (const b of obstacles) {
      if (px > b.minX && px < b.maxX && pz > b.minZ && pz < b.maxZ) {
        return false;
      }
    }
  }
  return true;
}

function collidesObstacle(x: number, z: number, radius: number, obstacles: ObstacleBox[]): boolean {
  for (const b of obstacles) {
    if (x + radius > b.minX && x - radius < b.maxX && z + radius > b.minZ && z - radius < b.maxZ) {
      return true;
    }
  }
  return false;
}

function moveWithObstacleAvoidance(
  agent: EnemyAiAgent,
  dirX: number,
  dirZ: number,
  speed: number,
  dt: number,
  obstacles: ObstacleBox[]
): void {
  const step = speed * dt;
  const nx = agent.x + dirX * step;
  const nz = agent.z + dirZ * step;
  if (!collidesObstacle(nx, agent.z, 0.55, obstacles)) {
    agent.x = nx;
  }
  if (!collidesObstacle(agent.x, nz, 0.55, obstacles)) {
    agent.z = nz;
  }
  if (Math.hypot(dirX, dirZ) > 0.01) {
    agent.facingAngle = Math.atan2(dirX, dirZ);
  }
}

export function createEnemyAiAgent(opts: {
  id: string;
  archetype: EnemyArchetype;
  x: number;
  z: number;
  hp: number;
}): EnemyAiAgent {
  const speedMap: Record<EnemyArchetype, number> = {
    basic: 3.4,
    ranged: 2.9,
    defensive: 2.6,
    boss: 2.3
  };
  const rangeMap: Record<EnemyArchetype, number> = {
    basic: 2.3,
    ranged: 9.5,
    defensive: 2.4,
    boss: 3.1
  };
  return {
    id: opts.id,
    archetype: opts.archetype,
    state: 'patrol',
    x: opts.x,
    z: opts.z,
    homeX: opts.x,
    homeZ: opts.z,
    patrolTargetX: opts.x + 3.5,
    patrolTargetZ: opts.z - 2.5,
    speed: speedMap[opts.archetype],
    detectionRadius: opts.archetype === 'boss' ? 18 : 14,
    loseInterestRadius: opts.archetype === 'boss' ? 25 : 20,
    attackRange: rangeMap[opts.archetype],
    preferredMinRange: opts.archetype === 'ranged' ? 5.2 : 1.1,
    hp: opts.hp,
    maxHp: opts.hp,
    stateTimer: 0,
    cooldownTimer: 0,
    attackHitApplied: false,
    facingAngle: 0
  };
}

/**
 * Advances an Enemy AI Agent through its finite state machine with:
 * - Line-of-sight obstacle checks
 * - Telegraphed attack preparation
 * - Single-hit-per-attack guarantee (never deals damage every frame)
 * - Recovery, cooldown, and patrol fallback
 */
export function stepEnemyAi(agent: EnemyAiAgent, ctx: EnemyStepContext): EnemyStepEvents {
  const events: EnemyStepEvents = {
    detectedPlayer: false,
    startedAttackWindup: false,
    hitPlayer: false,
    hitFallbackTarget: false,
    firedRangedProjectile: false,
    damageAmount: agent.archetype === 'boss' ? 16 : agent.archetype === 'ranged' ? 7 : 9
  };

  if (agent.hp <= 0 || agent.state === 'defeated') {
    agent.state = 'defeated';
    return events;
  }

  const dt = Math.min(0.05, Math.max(0.001, ctx.dt));
  if (agent.cooldownTimer > 0) {
    agent.cooldownTimer = Math.max(0, agent.cooldownTimer - dt);
  }

  if (agent.state === 'stunned') {
    agent.stateTimer -= dt;
    if (agent.stateTimer <= 0) {
      agent.state = 'cooldown';
      agent.stateTimer = 0.4;
    }
    return events;
  }

  const distToPlayer = Math.hypot(ctx.playerX - agent.x, ctx.playerZ - agent.z);
  const canSeePlayer =
    distToPlayer <= agent.loseInterestRadius &&
    hasLineOfSight(agent.x, agent.z, ctx.playerX, ctx.playerZ, ctx.obstacles);

  const hasFallback = ctx.fallbackTargetX !== undefined && ctx.fallbackTargetZ !== undefined;
  const targetX = canSeePlayer ? ctx.playerX : hasFallback ? ctx.fallbackTargetX! : agent.patrolTargetX;
  const targetZ = canSeePlayer ? ctx.playerZ : hasFallback ? ctx.fallbackTargetZ! : agent.patrolTargetZ;
  const distToTarget = Math.hypot(targetX - agent.x, targetZ - agent.z);

  if (agent.state === 'idle') {
    agent.stateTimer -= dt;
    if (distToPlayer <= agent.detectionRadius && canSeePlayer) {
      agent.state = 'detect';
      agent.stateTimer = 0.25;
      events.detectedPlayer = true;
    } else if (agent.stateTimer <= 0) {
      agent.state = 'patrol';
    }
    return events;
  }

  if (agent.state === 'patrol') {
    if (distToPlayer <= agent.detectionRadius && canSeePlayer) {
      agent.state = 'detect';
      agent.stateTimer = 0.25;
      events.detectedPlayer = true;
      return events;
    }
    if (hasFallback && distToTarget > agent.attackRange) {
      const dx = (targetX - agent.x) / Math.max(0.001, distToTarget);
      const dz = (targetZ - agent.z) / Math.max(0.001, distToTarget);
      moveWithObstacleAvoidance(agent, dx, dz, agent.speed * 0.85, dt, ctx.obstacles);
      return events;
    }
    const pdx = agent.patrolTargetX - agent.x;
    const pdz = agent.patrolTargetZ - agent.z;
    const pDist = Math.hypot(pdx, pdz);
    if (pDist < 0.8) {
      agent.patrolTargetX = agent.homeX + (Math.random() - 0.5) * 9;
      agent.patrolTargetZ = agent.homeZ + (Math.random() - 0.5) * 9;
      agent.state = 'idle';
      agent.stateTimer = 0.8;
    } else {
      moveWithObstacleAvoidance(agent, pdx / pDist, pdz / pDist, agent.speed * 0.55, dt, ctx.obstacles);
    }
    return events;
  }

  if (agent.state === 'detect') {
    agent.stateTimer -= dt;
    agent.facingAngle = Math.atan2(ctx.playerX - agent.x, ctx.playerZ - agent.z);
    if (agent.stateTimer <= 0) {
      agent.state = 'approach';
    }
    return events;
  }

  if (agent.state === 'approach') {
    if (!canSeePlayer && !hasFallback) {
      agent.state = 'patrol';
      return events;
    }
    if (agent.archetype === 'ranged' && canSeePlayer && distToPlayer < agent.preferredMinRange) {
      agent.state = 'reposition';
      agent.stateTimer = 0.7;
      return events;
    }
    if (distToTarget <= agent.attackRange) {
      if (agent.cooldownTimer <= 0) {
        agent.state = 'prepare_attack';
        agent.stateTimer = agent.archetype === 'boss' ? 0.75 : 0.45;
        agent.attackHitApplied = false;
        events.startedAttackWindup = true;
      } else {
        agent.state = 'cooldown';
        agent.stateTimer = agent.cooldownTimer;
      }
      return events;
    }
    const dx = (targetX - agent.x) / Math.max(0.001, distToTarget);
    const dz = (targetZ - agent.z) / Math.max(0.001, distToTarget);
    moveWithObstacleAvoidance(agent, dx, dz, agent.speed, dt, ctx.obstacles);
    return events;
  }

  if (agent.state === 'prepare_attack') {
    agent.facingAngle = Math.atan2(targetX - agent.x, targetZ - agent.z);
    agent.stateTimer -= dt;
    if (agent.stateTimer <= 0) {
      agent.state = 'attack';
      agent.stateTimer = 0.22;
    }
    return events;
  }

  if (agent.state === 'attack') {
    if (!agent.attackHitApplied) {
      agent.attackHitApplied = true;
      if (agent.archetype === 'ranged') {
        events.firedRangedProjectile = true;
        if (canSeePlayer && distToPlayer <= agent.attackRange + 0.8) {
          events.hitPlayer = true;
        }
      } else if (canSeePlayer && distToPlayer <= agent.attackRange + 0.75) {
        events.hitPlayer = true;
      } else if (hasFallback && distToTarget <= agent.attackRange + 0.8) {
        events.hitFallbackTarget = true;
      }
    }
    agent.stateTimer -= dt;
    if (agent.stateTimer <= 0) {
      agent.state = 'recover';
      agent.stateTimer = 0.4;
      agent.cooldownTimer = agent.archetype === 'boss' ? 2.4 : 1.65;
    }
    return events;
  }

  if (agent.state === 'recover') {
    agent.stateTimer -= dt;
    if (agent.stateTimer <= 0) {
      agent.state = agent.archetype === 'defensive' ? 'reposition' : 'cooldown';
      agent.stateTimer = 0.7;
    }
    return events;
  }

  if (agent.state === 'reposition') {
    agent.stateTimer -= dt;
    const awayX = agent.x - ctx.playerX;
    const awayZ = agent.z - ctx.playerZ;
    const len = Math.max(0.001, Math.hypot(awayX, awayZ));
    // Strafe/backstep smoothly
    const dirX = agent.archetype === 'ranged' ? awayX / len : -awayZ / len;
    const dirZ = agent.archetype === 'ranged' ? awayZ / len : awayX / len;
    moveWithObstacleAvoidance(agent, dirX, dirZ, agent.speed * 0.75, dt, ctx.obstacles);
    if (agent.stateTimer <= 0) {
      agent.state = 'approach';
    }
    return events;
  }

  // cooldown
  agent.stateTimer -= dt;
  if (agent.stateTimer <= 0 && agent.cooldownTimer <= 0) {
    agent.state = canSeePlayer || hasFallback ? 'approach' : 'patrol';
  }
  return events;
}
