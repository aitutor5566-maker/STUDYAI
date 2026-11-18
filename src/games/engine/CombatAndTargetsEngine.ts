import * as THREE from 'three';

export type TargetMovementPattern = 'horizontal' | 'vertical' | 'curved' | 'patrol';

export interface MovingAnswerTargetConfig {
  answerId: string;
  label: string;
  text: string;
  basePosition: THREE.Vector3;
  pattern: TargetMovementPattern;
  amplitude?: number;
  speed?: number;
  phaseOffset?: number;
  hitRadius?: number;
  accentColor?: string;
}

export interface MovingAnswerTargetInstance {
  config: MovingAnswerTargetConfig;
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  position: THREE.Vector3;
  hitRadius: number;
  active: boolean;
}

const DEFAULT_TARGET_COLORS = ['#38BDF8', '#F97316', '#A855F7', '#10B981'];

export function createBillboardLabelSprite(
  label: string,
  text: string,
  accentHex = '#38BDF8'
): THREE.Sprite | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 112, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accentHex;
  ctx.font = 'bold 34px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}.`, 28, 64);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 30px Inter, system-ui, sans-serif';
  const clipped = text.length > 26 ? `${text.slice(0, 24)}…` : text;
  ctx.fillText(clipped, 86, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.8, 1.2, 1);
  return sprite;
}

/**
 * Manages independently moving 3D educational answer targets with distinct movement paths
 * and accurate projectile collision detection.
 */
export class MovingAnswerTargetSystem {
  public readonly targets: MovingAnswerTargetInstance[] = [];
  public readonly root: THREE.Group = new THREE.Group();

  public setTargets(configs: MovingAnswerTargetConfig[]): void {
    this.clear();
    configs.forEach((cfg, idx) => {
      const group = new THREE.Group();
      const accent = cfg.accentColor || DEFAULT_TARGET_COLORS[idx % DEFAULT_TARGET_COLORS.length];

      const coreGeo = new THREE.OctahedronGeometry(0.75, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.65
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.castShadow = true;
      group.add(coreMesh);

      const ringGeo = new THREE.TorusGeometry(1.1, 0.08, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: '#F8FAFC',
        emissive: accent,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      const sprite = createBillboardLabelSprite(cfg.label, cfg.text, accent);
      if (sprite) {
        sprite.position.set(0, 1.85, 0);
        group.add(sprite);
      }

      const pos = cfg.basePosition.clone();
      group.position.copy(pos);
      this.root.add(group);

      this.targets.push({
        config: cfg,
        group,
        coreMesh,
        ringMesh,
        position: pos,
        hitRadius: cfg.hitRadius ?? 1.45,
        active: true
      });
    });
  }

  public update(elapsedSeconds: number, difficultySpeedMultiplier = 1): void {
    for (const t of this.targets) {
      if (!t.active) continue;
      const base = t.config.basePosition;
      const amp = t.config.amplitude ?? 2.2;
      const spd = (t.config.speed ?? 1.2) * difficultySpeedMultiplier;
      const phase = t.config.phaseOffset ?? 0;
      const angle = elapsedSeconds * spd + phase;

      let ox = 0;
      let oy = 0;
      let oz = 0;
      switch (t.config.pattern) {
        case 'horizontal':
          ox = Math.sin(angle) * amp;
          break;
        case 'vertical':
          oy = Math.sin(angle) * (amp * 0.65);
          break;
        case 'curved':
          ox = Math.sin(angle) * amp;
          oy = Math.sin(angle * 2) * (amp * 0.4);
          break;
        case 'patrol':
          ox = Math.cos(angle) * (amp * 0.8);
          oz = Math.sin(angle) * (amp * 0.8);
          break;
      }

      t.position.set(base.x + ox, base.y + oy, base.z + oz);
      t.group.position.copy(t.position);
      t.coreMesh.rotation.y = elapsedSeconds * 1.4;
      t.ringMesh.rotation.x = elapsedSeconds * 1.1;
      t.ringMesh.rotation.y = -elapsedSeconds * 0.9;
    }
  }

  public checkCollision(point: THREE.Vector3, projectileRadius = 0.45): MovingAnswerTargetInstance | null {
    for (const t of this.targets) {
      if (!t.active) continue;
      if (t.position.distanceTo(point) <= t.hitRadius + projectileRadius) {
        return t;
      }
    }
    return null;
  }

  public deactivateAll(): void {
    for (const t of this.targets) {
      t.active = false;
      t.group.visible = false;
    }
  }

  public clear(): void {
    while (this.root.children.length > 0) {
      this.root.remove(this.root.children[0]);
    }
    this.targets.length = 0;
  }
}

export interface EnergyProjectile {
  id: string;
  owner: 'player' | 'enemy';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
  ttl: number;
  damage: number;
  mesh?: THREE.Mesh;
}

/**
 * Shared fictional energy-projectile, dodge, shield, and health system.
 */
export class EnergyCombatSystem {
  public playerHp: number;
  public maxHp: number;
  public shieldActive = false;
  public shieldRemaining = 0;
  public shieldCooldown = 0;
  public dodgeActive = false;
  public dodgeRemaining = 0;
  public dodgeCooldown = 0;
  public dodgeDirection = new THREE.Vector3();
  public invulnerableTimer = 0;
  public readonly projectiles: EnergyProjectile[] = [];
  private seq = 0;

  constructor(maxHp = 100) {
    this.maxHp = maxHp;
    this.playerHp = maxHp;
  }

  public triggerDodge(direction: THREE.Vector3): boolean {
    if (this.dodgeCooldown > 0 || this.dodgeActive) return false;
    const dir = direction.clone();
    if (dir.lengthSq() < 0.001) dir.set(1, 0, 0);
    dir.y = 0;
    dir.normalize();
    this.dodgeDirection.copy(dir);
    this.dodgeActive = true;
    this.dodgeRemaining = 0.28;
    this.dodgeCooldown = 1.15;
    this.invulnerableTimer = Math.max(this.invulnerableTimer, 0.32);
    return true;
  }

  public activateShield(duration = 2.5): boolean {
    if (this.shieldCooldown > 0 || this.shieldActive) return false;
    this.shieldActive = true;
    this.shieldRemaining = duration;
    this.shieldCooldown = 5.0;
    return true;
  }

  public spawnProjectile(params: {
    owner: 'player' | 'enemy';
    origin: THREE.Vector3;
    direction: THREE.Vector3;
    speed?: number;
    radius?: number;
    ttl?: number;
    damage?: number;
    mesh?: THREE.Mesh;
  }): EnergyProjectile {
    const dir = params.direction.clone().normalize();
    const proj: EnergyProjectile = {
      id: `proj-${++this.seq}`,
      owner: params.owner,
      position: params.origin.clone(),
      velocity: dir.multiplyScalar(params.speed ?? (params.owner === 'player' ? 32 : 16)),
      radius: params.radius ?? 0.45,
      ttl: params.ttl ?? 2.6,
      damage: params.damage ?? 12,
      mesh: params.mesh
    };
    if (proj.mesh) {
      proj.mesh.position.copy(proj.position);
    }
    this.projectiles.push(proj);
    return proj;
  }

  public step(
    dt: number,
    playerPos: THREE.Vector3,
    playerRadius: number,
    targetSystem?: MovingAnswerTargetSystem
  ): {
    hitTarget: MovingAnswerTargetInstance | null;
    playerDamaged: number;
    absorbedByShield: boolean;
    expiredMeshes: THREE.Mesh[];
  } {
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
    this.shieldCooldown = Math.max(0, this.shieldCooldown - dt);
    this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);

    if (this.dodgeActive) {
      this.dodgeRemaining -= dt;
      if (this.dodgeRemaining <= 0) {
        this.dodgeActive = false;
        this.dodgeRemaining = 0;
      }
    }
    if (this.shieldActive) {
      this.shieldRemaining -= dt;
      if (this.shieldRemaining <= 0) {
        this.shieldActive = false;
        this.shieldRemaining = 0;
      }
    }

    let hitTarget: MovingAnswerTargetInstance | null = null;
    let playerDamaged = 0;
    let absorbedByShield = false;
    const expiredMeshes: THREE.Mesh[] = [];

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.ttl -= dt;
      p.position.addScaledVector(p.velocity, dt);
      if (p.mesh) {
        p.mesh.position.copy(p.position);
      }

      let remove = p.ttl <= 0;

      if (!remove && p.owner === 'player' && targetSystem) {
        const hit = targetSystem.checkCollision(p.position, p.radius);
        if (hit) {
          hitTarget = hit;
          remove = true;
        }
      } else if (!remove && p.owner === 'enemy') {
        if (p.position.distanceTo(playerPos) <= playerRadius + p.radius) {
          if (this.shieldActive) {
            absorbedByShield = true;
          } else if (this.invulnerableTimer <= 0) {
            this.playerHp = Math.max(0, this.playerHp - p.damage);
            this.invulnerableTimer = 0.75;
            playerDamaged += p.damage;
          }
          remove = true;
        }
      }

      if (remove) {
        if (p.mesh) expiredMeshes.push(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    return { hitTarget, playerDamaged, absorbedByShield, expiredMeshes };
  }

  public reset(hp = this.maxHp): void {
    this.playerHp = hp;
    this.shieldActive = false;
    this.shieldRemaining = 0;
    this.shieldCooldown = 0;
    this.dodgeActive = false;
    this.dodgeRemaining = 0;
    this.dodgeCooldown = 0;
    this.invulnerableTimer = 0;
    this.projectiles.length = 0;
  }
}
