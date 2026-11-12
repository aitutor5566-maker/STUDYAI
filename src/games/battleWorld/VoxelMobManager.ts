import * as THREE from 'three';
import type { BiomeType, HitParticle, VoxelMobState } from './types.ts';
import { VoxelArenaManager } from './VoxelArenaManager.ts';

export interface MobInstance {
  state: VoxelMobState;
  group: THREE.Group;
  healthBarMesh: THREE.Mesh;
  bodyMesh: THREE.Mesh;
  attackCooldown: number;
  walkCycle: number;
  knockbackVel: THREE.Vector3;
}

export class VoxelMobManager {
  public mobs: MobInstance[] = [];
  public particles: HitParticle[] = [];
  public particlePoints: THREE.Points;

  private scene: THREE.Scene;
  private arenaManager: VoxelArenaManager;
  private sharedBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  private sharedPlaneGeo = new THREE.PlaneGeometry(1, 0.14);
  private particleGeo: THREE.BufferGeometry;
  private particleMat: THREE.PointsMaterial;
  private materialsToDispose: THREE.Material[] = [];

  constructor(scene: THREE.Scene, arenaManager: VoxelArenaManager) {
    this.scene = scene;
    this.arenaManager = arenaManager;

    // Particle system for defeat and hit sparks
    const maxParticles = 300;
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.particleMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });

    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMat);
    this.particlePoints.name = 'HitParticles';
    this.scene.add(this.particlePoints);
  }

  public spawnWaveMobs(biome: BiomeType, mobCount: number, isBoss: boolean = false) {
    this.clearMobs();

    const spawnRadius = 8;
    for (let i = 0; i < mobCount; i++) {
      const angle = (i / mobCount) * Math.PI * 2 + Math.PI / 4;
      const dist = isBoss ? 6 : spawnRadius + (Math.random() * 2 - 1);
      const spawnX = Math.cos(angle) * dist;
      const spawnZ = Math.sin(angle) * dist;

      const mob = this.createMob(biome, `mob-${biome}-${i}`, spawnX, spawnZ, isBoss);
      this.mobs.push(mob);
      this.scene.add(mob.group);
    }
  }

  private createMob(
    biome: BiomeType,
    id: string,
    x: number,
    z: number,
    isBoss: boolean
  ): MobInstance {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    let maxHp = 40;
    let speed = 2.2;
    let mobName = 'Grass Golem';
    let mainColor = 0x43a047;
    let secondaryColor = 0x2e7d32;
    let eyeColor = 0xffeb3b;
    let scale = 1.0;

    if (biome === 'grassland') {
      mobName = 'Grass Golem';
      mainColor = 0x43a047;
      secondaryColor = 0x33691e;
      eyeColor = 0xffd600;
      maxHp = 40;
      speed = 2.3;
    } else if (biome === 'desert') {
      mobName = 'Desert Scorcher';
      mainColor = 0xff9800;
      secondaryColor = 0xe65100;
      eyeColor = 0xd50000;
      maxHp = 50;
      speed = 2.5;
    } else if (biome === 'snow') {
      mobName = 'Frost Sprite';
      mainColor = 0x80deea;
      secondaryColor = 0x00acc1;
      eyeColor = 0x00e5ff;
      maxHp = 60;
      speed = 2.4;
    } else if (biome === 'castle') {
      mobName = 'Stone Sentinel';
      mainColor = 0x616161;
      secondaryColor = 0x212121;
      eyeColor = 0xaa00ff;
      maxHp = 75;
      speed = 2.0;
    } else if (biome === 'forest') {
      mobName = isBoss ? 'Shadow Warden Boss' : 'Shadow Sentinel';
      mainColor = 0x1b5e20;
      secondaryColor = 0x004d40;
      eyeColor = 0x00e676;
      maxHp = isBoss ? 260 : 80;
      speed = isBoss ? 2.6 : 2.2;
      scale = isBoss ? 1.9 : 1.1;
    }

    const matBody = new THREE.MeshLambertMaterial({ color: mainColor });
    const matSec = new THREE.MeshLambertMaterial({ color: secondaryColor });
    const matEyes = new THREE.MeshBasicMaterial({ color: eyeColor });
    this.materialsToDispose.push(matBody, matSec, matEyes);

    // Voxel Body Construction
    const bodyMesh = new THREE.Mesh(this.sharedBoxGeo, matBody);
    bodyMesh.scale.set(0.8 * scale, 0.9 * scale, 0.6 * scale);
    bodyMesh.position.set(0, 0.7 * scale, 0);
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Head
    const head = new THREE.Mesh(this.sharedBoxGeo, matSec);
    head.scale.set(0.6 * scale, 0.6 * scale, 0.6 * scale);
    head.position.set(0, 1.35 * scale, 0);
    head.castShadow = true;
    group.add(head);

    // Glowing Eyes
    const leftEye = new THREE.Mesh(this.sharedBoxGeo, matEyes);
    leftEye.scale.set(0.12 * scale, 0.1 * scale, 0.05 * scale);
    leftEye.position.set(-0.16 * scale, 1.35 * scale, 0.31 * scale);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(this.sharedBoxGeo, matEyes);
    rightEye.scale.set(0.12 * scale, 0.1 * scale, 0.05 * scale);
    rightEye.position.set(0.16 * scale, 1.35 * scale, 0.31 * scale);
    group.add(rightEye);

    // If Boss, add massive horns
    if (isBoss) {
      const hornMat = new THREE.MeshLambertMaterial({ color: 0x00e5ff });
      this.materialsToDispose.push(hornMat);

      const leftHorn = new THREE.Mesh(this.sharedBoxGeo, hornMat);
      leftHorn.scale.set(0.18, 0.7, 0.18);
      leftHorn.position.set(-0.35 * scale, 1.8 * scale, 0);
      leftHorn.rotation.z = -0.3;
      group.add(leftHorn);

      const rightHorn = new THREE.Mesh(this.sharedBoxGeo, hornMat);
      rightHorn.scale.set(0.18, 0.7, 0.18);
      rightHorn.position.set(0.35 * scale, 1.8 * scale, 0);
      rightHorn.rotation.z = 0.3;
      group.add(rightHorn);
    }

    // Floating Health Bar
    const hbMat = new THREE.MeshBasicMaterial({ color: 0x4caf50, side: THREE.DoubleSide });
    this.materialsToDispose.push(hbMat);
    const healthBar = new THREE.Mesh(this.sharedPlaneGeo, hbMat);
    healthBar.position.set(0, 1.85 * scale, 0);
    group.add(healthBar);

    return {
      state: {
        id,
        type: biome,
        name: mobName,
        biome,
        position: { x, y: 0, z },
        rotationY: 0,
        health: maxHp,
        maxHealth: maxHp,
        speed,
        isBoss,
        isAlive: true,
        hitFlashTime: 0
      },
      group,
      healthBarMesh: healthBar,
      bodyMesh,
      attackCooldown: 1.0,
      walkCycle: Math.random() * 10,
      knockbackVel: new THREE.Vector3()
    };
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    onPlayerDamage: (dmg: number) => void
  ) {
    for (const mob of this.mobs) {
      if (!mob.state.isAlive) continue;

      // Handle knockback physics
      if (mob.knockbackVel.lengthSq() > 0.01) {
        mob.group.position.addScaledVector(mob.knockbackVel, delta);
        mob.knockbackVel.multiplyScalar(Math.max(0, 1 - delta * 8));
      }

      // Flash effect countdown
      if (mob.state.hitFlashTime > 0) {
        mob.state.hitFlashTime -= delta;
        if (mob.state.hitFlashTime <= 0) {
          (mob.bodyMesh.material as THREE.MeshLambertMaterial).color.setHex(
            mob.state.biome === 'grassland' ? 0x43a047 :
            mob.state.biome === 'desert' ? 0xff9800 :
            mob.state.biome === 'snow' ? 0x80deea :
            mob.state.biome === 'castle' ? 0x616161 : 0x1b5e20
          );
        }
      }

      // Steering towards player
      const dx = playerPos.x - mob.group.position.x;
      const dz = playerPos.z - mob.group.position.z;
      const distToPlayer = Math.hypot(dx, dz);

      // Rotate towards player
      const targetAngle = Math.atan2(dx, dz);
      mob.group.rotation.y = targetAngle;

      // Move if farther than attack range
      if (distToPlayer > 1.35) {
        const moveDist = mob.state.speed * delta;
        const nextX = mob.group.position.x + (dx / distToPlayer) * moveDist;
        const nextZ = mob.group.position.z + (dz / distToPlayer) * moveDist;

        // Separation from other mobs
        let sepX = 0;
        let sepZ = 0;
        for (const other of this.mobs) {
          if (other === mob || !other.state.isAlive) continue;
          const odx = mob.group.position.x - other.group.position.x;
          const odz = mob.group.position.z - other.group.position.z;
          const odist = Math.hypot(odx, odz);
          if (odist < 1.2 && odist > 0.01) {
            sepX += (odx / odist) * (1.2 - odist);
            sepZ += (odz / odist) * (1.2 - odist);
          }
        }

        const clamped = this.arenaManager.clampPositionToBounds(
          nextX + sepX * delta * 2,
          nextZ + sepZ * delta * 2,
          0.6
        );
        mob.group.position.x = clamped.x;
        mob.group.position.z = clamped.z;

        // Walk wobble
        mob.walkCycle += delta * 8;
        mob.bodyMesh.position.y = (mob.state.isBoss ? 1.3 : 0.7) + Math.sin(mob.walkCycle) * 0.05;
      } else {
        // Attack range: cooldown check
        mob.attackCooldown -= delta;
        if (mob.attackCooldown <= 0) {
          mob.attackCooldown = mob.state.isBoss ? 1.1 : 1.4;
          const dmg = mob.state.isBoss ? 16 : 8;
          onPlayerDamage(dmg);
        }
      }

      // Update Health Bar display
      const hpPct = Math.max(0, mob.state.health / mob.state.maxHealth);
      mob.healthBarMesh.scale.x = hpPct;
      if (hpPct > 0.5) {
        (mob.healthBarMesh.material as THREE.MeshBasicMaterial).color.setHex(0x4caf50); // Green
      } else if (hpPct > 0.25) {
        (mob.healthBarMesh.material as THREE.MeshBasicMaterial).color.setHex(0xff9800); // Orange
      } else {
        (mob.healthBarMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf44336); // Red
      }

      // Face health bar towards camera
      mob.healthBarMesh.rotation.y = -mob.group.rotation.y;
    }

    // Update Particles
    this.updateParticles(delta);
  }

  public checkPlayerAttack(
    playerPos: THREE.Vector3,
    playerRotY: number,
    damage: number
  ): { hits: number; defeatedCount: number; xpEarned: number } {
    let hits = 0;
    let defeatedCount = 0;
    let xpEarned = 0;

    // Forward direction of player
    const forwardX = Math.sin(playerRotY);
    const forwardZ = Math.cos(playerRotY);

    const hitRange = 2.4;
    const arcCos = 0.3; // ~70 degree swing arc

    for (const mob of this.mobs) {
      if (!mob.state.isAlive) continue;

      const dx = mob.group.position.x - playerPos.x;
      const dz = mob.group.position.z - playerPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist <= hitRange) {
        // Check dot product to ensure mob is in front
        const dot = (dx / dist) * forwardX + (dz / dist) * forwardZ;
        if (dot >= arcCos || dist <= 1.2) {
          hits++;
          mob.state.health -= damage;
          mob.state.hitFlashTime = 0.22;
          (mob.bodyMesh.material as THREE.MeshLambertMaterial).color.setHex(0xffffff);

          // Knockback
          mob.knockbackVel.set(
            (dx / Math.max(0.1, dist)) * 7.5,
            0,
            (dz / Math.max(0.1, dist)) * 7.5
          );

          // Hit spark particles
          this.spawnHitSparks(mob.group.position.x, 1.2, mob.group.position.z, 0xffeb3b, 8);

          // Check if defeated
          if (mob.state.health <= 0) {
            mob.state.isAlive = false;
            defeatedCount++;
            xpEarned += mob.state.isBoss ? 200 : 45;
            this.scene.remove(mob.group);

            // Defeat star explosion
            this.spawnDefeatBurst(
              mob.group.position.x,
              1.0,
              mob.group.position.z,
              mob.state.isBoss
            );
          }
        }
      }
    }

    return { hits, defeatedCount, xpEarned };
  }

  private spawnHitSparks(x: number, y: number, z: number, color: number, count: number) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length > 250) this.particles.shift();
      const speed = 2.5 + Math.random() * 2.5;
      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: 1.5 + Math.random() * 3,
        vz: Math.sin(angle) * speed,
        color,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.5,
        size: 0.3
      });
    }
  }

  private spawnDefeatBurst(x: number, y: number, z: number, isBoss: boolean) {
    const count = isBoss ? 45 : 22;
    const colors = [0xffd600, 0x00e5ff, 0xff6a00, 0xffffff];

    for (let i = 0; i < count; i++) {
      if (this.particles.length > 280) this.particles.shift();
      const speed = 3.5 + Math.random() * 4.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      this.particles.push({
        x,
        y: y + 0.3,
        z,
        vx: Math.cos(theta) * Math.cos(phi) * speed,
        vy: Math.sin(phi) * speed + 3.0,
        vz: Math.sin(theta) * Math.cos(phi) * speed,
        color: colors[i % colors.length],
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        size: isBoss ? 0.45 : 0.3
      });
    }
  }

  private updateParticles(delta: number) {
    const posAttr = this.particleGeo.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = this.particleGeo.getAttribute('color') as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;
      p.vy -= 9.8 * delta; // Gravity

      const idx = i * 3;
      posArr[idx] = p.x;
      posArr[idx + 1] = p.y;
      posArr[idx + 2] = p.z;

      const c = new THREE.Color(p.color);
      colArr[idx] = c.r;
      colArr[idx + 1] = c.g;
      colArr[idx + 2] = c.b;
    }

    // Zero out unused slots
    for (let i = this.particles.length; i < 300; i++) {
      const idx = i * 3;
      posArr[idx] = 0;
      posArr[idx + 1] = -999;
      posArr[idx + 2] = 0;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  public getAliveCount(): number {
    return this.mobs.filter((m) => m.state.isAlive).length;
  }

  public clearMobs() {
    for (const mob of this.mobs) {
      this.scene.remove(mob.group);
    }
    this.mobs = [];
  }

  public dispose() {
    this.clearMobs();
    this.scene.remove(this.particlePoints);
    this.particleGeo.dispose();
    this.particleMat.dispose();
    this.sharedBoxGeo.dispose();
    this.sharedPlaneGeo.dispose();
    for (const m of this.materialsToDispose) {
      m.dispose();
    }
    this.materialsToDispose = [];
  }
}
