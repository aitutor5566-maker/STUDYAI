import * as THREE from 'three';
import { EducationalQuestion, OptionId } from '../types';
import { SpaceBattleAudio } from './SpaceBattleAudio';
import { SpacecraftModels, PlayerCraftMeshResult, EnemyCraftMeshResult } from './SpacecraftModels';

export interface SpaceBattleEngineCallbacks {
  onAnswerChosen: (optionId: OptionId, isCorrect: boolean) => void;
  onDamageTaken: (remainingLives: number) => void;
  onScoreGained: (points: number, combo: number) => void;
}

export interface EnemyEntity {
  id: string;
  optionId: OptionId;
  text: string;
  isCorrect: boolean;
  row: number;
  col: number;
  baseX: number;
  baseY: number;
  currentX: number;
  currentY: number;
  hitRadius: number;
  isDestroyed: boolean;
  craftResult: EnemyCraftMeshResult;
}

export interface LaserEntity {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  active: boolean;
}

export interface PlasmaEntity {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  active: boolean;
}

export class SpaceBattleEngine {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private callbacks: SpaceBattleEngineCallbacks;
  public audio: SpaceBattleAudio;

  // Three.js Core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private animFrameId: number | null = null;

  // Environment
  private starfield!: THREE.Points;
  private planetMesh!: THREE.Mesh;
  private asteroidsGroup!: THREE.Group;
  private targetingReticle!: THREE.Group;

  // Player Spacecraft
  private playerCraft!: PlayerCraftMeshResult;
  private playerPos = new THREE.Vector2(0, -6.2);
  private playerTargetPos = new THREE.Vector2(0, -6.2);
  private playerSpeed = 16.0;
  private isBoosting = false;
  private lives = 3;
  private invulnerableTimer = 0;
  private muzzleToggle = 0;

  // Fleet & Combat
  private currentQuestion: EducationalQuestion | null = null;
  private enemies: EnemyEntity[] = [];
  private playerLasers: LaserEntity[] = [];
  private enemyPlasmas: PlasmaEntity[] = [];
  private lastFireTime = 0;
  private enemyFireCooldown = 2.0;
  private questionResolved = false;
  private isPaused = false;

  // FX
  private explosions: Array<{ points: THREE.Points; life: number }> = [];
  private shockwaves: Array<{ mesh: THREE.Mesh; life: number }> = [];
  private screenShake = 0;

  constructor(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    callbacks: SpaceBattleEngineCallbacks
  ) {
    this.container = container;
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.audio = new SpaceBattleAudio();
    this.clock = new THREE.Clock();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 900;

    // 1. Scene, Camera, WebGLRenderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040714);

    this.camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 120);
    this.camera.position.set(0, 0, 18.5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    try {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;
    } catch {
      // Graceful fallback for mock environments
    }

    // 2. Space Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xdbeafe, 2.0);
    sunLight.position.set(8, 20, 14);
    this.scene.add(sunLight);

    const cosmicBlueLight = new THREE.PointLight(0x0284c7, 3, 40);
    cosmicBlueLight.position.set(-6, -4, 6);
    this.scene.add(cosmicBlueLight);

    // 3. Build Deep-Space Environment
    this.buildEnvironment();

    // 4. Assemble Player Starfighter
    this.playerCraft = SpacecraftModels.createPlayerStarfighter();
    this.playerCraft.group.position.set(this.playerPos.x, this.playerPos.y, 0);
    this.scene.add(this.playerCraft.group);

    // 5. Targeting Reticle
    this.buildTargetingReticle();

    // 6. Window Resize Listener
    window.addEventListener('resize', this.onResize);

    // 7. Start Render Loop
    this.startLoop();
  }

  // -------------------------------------------------------------
  // ENVIRONMENT (Stars, Planet, Asteroids)
  // -------------------------------------------------------------

  private buildEnvironment(): void {
    // A. Multi-layer starfield
    const starCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xf472b6),
      new THREE.Color(0xfacc15)
    ];

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 60;
      positions[i + 2] = -Math.random() * 45 - 2;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    this.starfield = new THREE.Points(geometry, starMat);
    this.scene.add(this.starfield);

    // B. Celestial Blue Planet in lower-left background
    const planetGeo = new THREE.SphereGeometry(6.5, 36, 36);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.45,
      metalness: 0.25,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3
    });
    this.planetMesh = new THREE.Mesh(planetGeo, planetMat);
    this.planetMesh.position.set(-11.5, -6.5, -9);

    const atmosphereGeo = new THREE.SphereGeometry(6.8, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    this.planetMesh.add(new THREE.Mesh(atmosphereGeo, atmosphereMat));
    this.scene.add(this.planetMesh);

    // C. Floating 3D Asteroids
    this.asteroidsGroup = new THREE.Group();
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true
    });

    const asteroidCoords = [
      [-7.8, 3.2, -4, 1.0],
      [-8.5, -2.8, -3, 1.3],
      [7.8, 4.2, -5, 1.1],
      [8.6, -1.2, -4, 1.4],
      [7.2, -5.8, -3, 0.9]
    ];

    asteroidCoords.forEach(([x, y, z, s]) => {
      const geo = new THREE.DodecahedronGeometry(s, 1);
      const mesh = new THREE.Mesh(geo, asteroidMat);
      mesh.position.set(x, y, z);
      this.asteroidsGroup.add(mesh);
    });

    this.scene.add(this.asteroidsGroup);
  }

  private buildTargetingReticle(): void {
    this.targetingReticle = new THREE.Group();
    this.targetingReticle.visible = false;

    // Glowing orange/red hexagonal target reticle
    const ringGeo = new THREE.RingGeometry(1.3, 1.5, 6);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    this.targetingReticle.add(ring);

    this.scene.add(this.targetingReticle);
  }

  // -------------------------------------------------------------
  // QUESTION & ALIEN FLEET INITIALIZATION
  // -------------------------------------------------------------

  public setQuestion(question: EducationalQuestion | null): void {
    this.currentQuestion = question;
    this.questionResolved = false;

    this.clearEnemies();
    this.clearProjectiles();

    if (!question) return;

    // Build tactical 8-enemy fleet (2 rows x 4 columns)
    const options = [...question.options];
    if (options.length < 8) {
      const distractors = ['Stomach', 'Kidney', 'Brain', 'Pancreas', 'Spleen', 'Thymus', 'Thyroid'];
      for (let i = options.length; i < 8; i++) {
        options.push({
          id: String.fromCharCode(65 + i) as OptionId,
          text: distractors[i % distractors.length]
        });
      }
    }

    const colsX = [-5.4, -1.8, 1.8, 5.4];
    const rowsY = [5.0, 2.4]; // Top and Bottom rows

    const shipStyles: Array<{ variant: 'cruiser' | 'interceptor' | 'raider'; color: number }> = [
      { variant: 'cruiser', color: 0xef4444 }, // Red
      { variant: 'interceptor', color: 0x2563eb }, // Blue
      { variant: 'raider', color: 0x10b981 }, // Green
      { variant: 'interceptor', color: 0xa855f7 }, // Purple
      { variant: 'cruiser', color: 0xf97316 }, // Orange
      { variant: 'interceptor', color: 0x06b6d4 }, // Cyan
      { variant: 'raider', color: 0xc084fc }, // Lavender
      { variant: 'cruiser', color: 0xeab308 }  // Amber
    ];

    options.slice(0, 8).forEach((opt, idx) => {
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      const isCorrect = opt.id === question.correct_option_id;
      const baseX = colsX[col];
      const baseY = rowsY[row];
      const style = shipStyles[idx % shipStyles.length];

      const craftResult = SpacecraftModels.createAlienStarfighter(
        style.variant,
        style.color,
        opt.text
      );

      craftResult.group.position.set(baseX, baseY, 0);
      this.scene.add(craftResult.group);

      this.enemies.push({
        id: `enemy-${idx}-${opt.id}`,
        optionId: opt.id,
        text: opt.text,
        isCorrect,
        row,
        col,
        baseX,
        baseY,
        currentX: baseX,
        currentY: baseY,
        hitRadius: craftResult.hitRadius,
        isDestroyed: false,
        craftResult
      });
    });
  }

  private clearEnemies(): void {
    for (const enemy of this.enemies) {
      if (enemy.craftResult?.group) {
        this.scene.remove(enemy.craftResult.group);
      }
    }
    this.enemies = [];
  }

  private clearProjectiles(): void {
    for (const l of this.playerLasers) {
      if (l.mesh) this.scene.remove(l.mesh);
    }
    this.playerLasers = [];

    for (const p of this.enemyPlasmas) {
      if (p.mesh) this.scene.remove(p.mesh);
    }
    this.enemyPlasmas = [];
  }

  // -------------------------------------------------------------
  // PLAYER MOVEMENT & CONTROLS
  // -------------------------------------------------------------

  public setPlayerSteer(normalizedX: number, normalizedY?: number): void {
    const boundX = 6.8;
    this.playerTargetPos.x = Math.max(-boundX, Math.min(boundX, normalizedX * boundX));

    if (normalizedY !== undefined) {
      // Allow vertical movement within bottom quadrant
      const minY = -7.2;
      const maxY = -4.5;
      this.playerTargetPos.y = minY + ((normalizedY + 1) / 2) * (maxY - minY);
    }
  }

  public movePlayerBy(deltaX: number, deltaY: number = 0): void {
    const boundX = 6.8;
    this.playerTargetPos.x = Math.max(-boundX, Math.min(boundX, this.playerTargetPos.x + deltaX));

    const minY = -7.2;
    const maxY = -4.5;
    this.playerTargetPos.y = Math.max(minY, Math.min(maxY, this.playerTargetPos.y + deltaY));
  }

  public setBoost(boosting: boolean): void {
    this.isBoosting = boosting;
  }

  public triggerFire(): void {
    if (this.isPaused || this.questionResolved) return;

    const now = performance.now();
    if (now - this.lastFireTime < 160) return; // Fire rate limit (6 shots/sec)
    this.lastFireTime = now;

    this.spawnPlayerLaser();
    this.audio.playPlayerLaser();
  }

  // -------------------------------------------------------------
  // REAL PROJECTILES & WEAPON MUZZLES
  // -------------------------------------------------------------

  private spawnPlayerLaser(): void {
    // Twin laser bolts originate from actual left & right wing blasters
    const muzzles = this.playerCraft.muzzlePoints;
    const muzzleOffset = muzzles[this.muzzleToggle % muzzles.length];
    this.muzzleToggle++;

    const laserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);

    [-1.2, 1.2].forEach((offsetX) => {
      const mesh = new THREE.Mesh(laserGeo, laserMat);
      mesh.rotation.z = Math.PI;

      const spawnX = this.playerPos.x + offsetX;
      const spawnY = this.playerPos.y + 0.8;
      mesh.position.set(spawnX, spawnY, 0);
      this.scene.add(mesh);

      this.playerLasers.push({
        mesh,
        x: spawnX,
        y: spawnY,
        z: 0,
        vx: 0,
        vy: 24.0, // High-speed vertical bolt
        active: true
      });
    });
  }

  private spawnEnemyPlasma(enemy: EnemyEntity): void {
    const plasmaGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const plasmaMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const mesh = new THREE.Mesh(plasmaGeo, plasmaMat);

    mesh.position.set(enemy.currentX, enemy.currentY - 1.2, 0);
    this.scene.add(mesh);

    // Aim plasma bolt slightly toward player position for engaging dodging
    const dx = this.playerPos.x - enemy.currentX;
    const vx = Math.max(-2.5, Math.min(2.5, dx * 0.35));

    this.enemyPlasmas.push({
      mesh,
      x: mesh.position.x,
      y: mesh.position.y,
      z: 0,
      vx,
      vy: -8.8,
      active: true
    });
  }

  // -------------------------------------------------------------
  // EXPLOSIONS & FX
  // -------------------------------------------------------------

  private spawnSupernovaExplosion(pos: THREE.Vector3, colorHex: number): void {
    const count = 72;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = pos.x;
      positions[i + 1] = pos.y;
      positions[i + 2] = pos.z;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 7.5;
      velocities[i] = Math.cos(angle) * speed;
      velocities[i + 1] = Math.sin(angle) * speed;
      velocities[i + 2] = (Math.random() - 0.5) * 5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    (geometry as any).userData = { velocities };

    const material = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.42,
      transparent: true,
      opacity: 1.0
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.explosions.push({ points, life: 1.0 });

    // Expanding shockwave ring
    const ringGeo = new THREE.RingGeometry(0.35, 0.55, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    this.scene.add(ring);
    this.shockwaves.push({ mesh: ring, life: 1.0 });

    // Camera shake
    this.screenShake = 0.35;
  }

  // -------------------------------------------------------------
  // SIMULATION & COLLISION TICK
  // -------------------------------------------------------------

  private startLoop(): void {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      this.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private update(): void {
    if (this.isPaused) return;

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    // 1. Smooth Player Flight with Banking Roll & Pitch
    const currentSpeed = this.isBoosting ? this.playerSpeed * 1.5 : this.playerSpeed;
    const diffX = this.playerTargetPos.x - this.playerPos.x;
    const diffY = this.playerTargetPos.y - this.playerPos.y;

    this.playerPos.x += diffX * Math.min(1.0, currentSpeed * delta);
    this.playerPos.y += diffY * Math.min(1.0, currentSpeed * delta);

    this.playerCraft.group.position.set(this.playerPos.x, this.playerPos.y, 0);

    // Banking roll proportional to horizontal velocity
    this.playerCraft.group.rotation.z = -diffX * 0.14;
    this.playerCraft.group.rotation.x = diffY * 0.1;

    // Engine exhaust flames scale
    const flameScale = (this.isBoosting ? 1.8 : 1.0) + Math.sin(elapsed * 30) * 0.25;
    this.playerCraft.thrusterFlames.forEach((flame) => {
      flame.scale.set(1, flameScale, 1);
    });
    this.playerCraft.thrusterLight.intensity = this.isBoosting ? 3.5 : 2.2;

    // Invulnerability shield timer
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      const alpha = Math.max(0, this.invulnerableTimer / 1.8);
      (this.playerCraft.shield.material as THREE.MeshBasicMaterial).opacity = alpha * 0.65;
      this.playerCraft.group.visible = Math.floor(elapsed * 24) % 2 === 0;
    } else {
      (this.playerCraft.shield.material as THREE.MeshBasicMaterial).opacity = 0;
      this.playerCraft.group.visible = true;
    }

    // 2. Starfield & Asteroid Motion
    const starPos = this.starfield.geometry.attributes.position as THREE.BufferAttribute;
    const starArr = starPos.array as Float32Array;
    for (let i = 1; i < starArr.length; i += 3) {
      starArr[i] -= delta * (this.isBoosting ? 26 : 14);
      if (starArr[i] < -28) starArr[i] = 28;
    }
    starPos.needsUpdate = true;

    this.asteroidsGroup.children.forEach((a, idx) => {
      a.rotation.x += delta * (0.2 + idx * 0.05);
      a.rotation.y += delta * (0.15 + idx * 0.05);
    });

    // 3. Dynamic Enemy Fleet Wave Formation Movement
    let closestEnemy: EnemyEntity | null = null;
    let minAimDist = 999;

    const waveOffset = Math.sin(elapsed * 1.6) * 0.85;

    this.enemies.forEach((enemy, idx) => {
      if (enemy.isDestroyed || !enemy.craftResult.group) return;

      // Coordinated wave motion + gentle hovering
      enemy.currentX = enemy.baseX + waveOffset;
      enemy.currentY = enemy.baseY + Math.sin(elapsed * 2.4 + idx * 0.8) * 0.22;
      enemy.craftResult.group.position.set(enemy.currentX, enemy.currentY, 0);

      // Track closest enemy aligned with player's X line-of-fire
      const dist = Math.abs(enemy.currentX - this.playerPos.x);
      if (dist < minAimDist) {
        minAimDist = dist;
        closestEnemy = enemy;
      }
    });

    // Update Targeting Reticle
    if (closestEnemy && !this.questionResolved) {
      const e = closestEnemy as EnemyEntity;
      this.targetingReticle.visible = true;
      this.targetingReticle.position.set(e.currentX, e.currentY, 0.25);
      this.targetingReticle.rotation.z += delta * 2.8;
    } else {
      this.targetingReticle.visible = false;
    }

    // 4. Enemy Counter-Attack Salvos
    if (!this.questionResolved && this.enemies.some((e) => !e.isDestroyed)) {
      this.enemyFireCooldown -= delta;
      if (this.enemyFireCooldown <= 0) {
        this.enemyFireCooldown = 1.3 + Math.random() * 1.1;
        const activeEnemies = this.enemies.filter((e) => !e.isDestroyed);
        if (activeEnemies.length > 0) {
          const shooter = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
          this.spawnEnemyPlasma(shooter);
          this.audio.playEnemyShot();
        }
      }
    }

    // 5. Update Player Lasers & Test Real Projectile Collisions
    for (let i = this.playerLasers.length - 1; i >= 0; i--) {
      const laser = this.playerLasers[i];
      laser.y += laser.vy * delta;
      laser.mesh.position.y = laser.y;

      // Off-screen culling
      if (laser.y > 11) {
        this.scene.remove(laser.mesh);
        this.playerLasers.splice(i, 1);
        continue;
      }

      // Continuous sphere-sphere collision check
      let hitEnemy: EnemyEntity | null = null;
      for (const enemy of this.enemies) {
        if (enemy.isDestroyed) continue;
        const dist = Math.hypot(laser.x - enemy.currentX, laser.y - enemy.currentY);
        if (dist <= enemy.hitRadius) {
          hitEnemy = enemy;
          break;
        }
      }

      if (hitEnemy) {
        // Remove laser immediately on impact
        this.scene.remove(laser.mesh);
        this.playerLasers.splice(i, 1);

        this.handleEnemyCollision(hitEnemy);
      }
    }

    // 6. Update Enemy Plasmas & Player Collision Check
    for (let i = this.enemyPlasmas.length - 1; i >= 0; i--) {
      const plasma = this.enemyPlasmas[i];
      plasma.x += plasma.vx * delta;
      plasma.y += plasma.vy * delta;
      plasma.mesh.position.set(plasma.x, plasma.y, 0);

      // Off-screen culling
      if (plasma.y < -11) {
        this.scene.remove(plasma.mesh);
        this.enemyPlasmas.splice(i, 1);
        continue;
      }

      // Test collision against Player Starfighter
      if (this.invulnerableTimer <= 0) {
        const dist = Math.hypot(plasma.x - this.playerPos.x, plasma.y - this.playerPos.y);
        if (dist <= 1.25) {
          this.scene.remove(plasma.mesh);
          this.enemyPlasmas.splice(i, 1);
          this.handlePlayerCollision();
          break;
        }
      }
    }

    // 7. Update Supernova Particles & Shockwaves
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.life -= delta * 1.8;
      const positions = exp.points.geometry.attributes.position as THREE.BufferAttribute;
      const arr = positions.array as Float32Array;
      const vels = (exp.points.geometry as any).userData.velocities as Float32Array;

      for (let j = 0; j < arr.length; j += 3) {
        arr[j] += vels[j] * delta;
        arr[j + 1] += vels[j + 1] * delta;
        arr[j + 2] += vels[j + 2] * delta;
      }
      positions.needsUpdate = true;
      (exp.points.material as THREE.PointsMaterial).opacity = Math.max(0, exp.life);

      if (exp.life <= 0) {
        this.scene.remove(exp.points);
        this.explosions.splice(i, 1);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= delta * 2.2;
      sw.mesh.scale.multiplyScalar(1.09);
      (sw.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, sw.life);

      if (sw.life <= 0) {
        this.scene.remove(sw.mesh);
        this.shockwaves.splice(i, 1);
      }
    }

    // 8. Screen Shake decay
    if (this.screenShake > 0) {
      this.camera.position.x = (Math.random() - 0.5) * this.screenShake;
      this.camera.position.y = (Math.random() - 0.5) * this.screenShake;
      this.screenShake = Math.max(0, this.screenShake - delta * 1.5);
    } else {
      this.camera.position.x = 0;
      this.camera.position.y = 0;
    }
  }

  // -------------------------------------------------------------
  // COLLISION HANDLERS
  // -------------------------------------------------------------

  private handleEnemyCollision(enemy: EnemyEntity): void {
    if (this.questionResolved) return;

    if (enemy.isCorrect) {
      // Direct Hit! Correct answer chosen via real projectile collision!
      this.questionResolved = true;
      enemy.isDestroyed = true;

      if (enemy.craftResult.group) {
        this.scene.remove(enemy.craftResult.group);
      }

      this.spawnSupernovaExplosion(new THREE.Vector3(enemy.currentX, enemy.currentY, 0), 0x38bdf8);
      this.audio.playExplosion();
      this.audio.playCorrectChime();

      // Clear remaining incoming attacks
      this.clearProjectiles();

      this.callbacks.onScoreGained(500, 1);
      this.callbacks.onAnswerChosen(enemy.optionId, true);
    } else {
      // Hit an incorrect enemy ship!
      // Visual shield deflection on enemy
      this.spawnSupernovaExplosion(new THREE.Vector3(enemy.currentX, enemy.currentY, 0), 0xef4444);
      this.audio.playShieldHit();

      // Trigger educational feedback for incorrect choice
      this.callbacks.onAnswerChosen(enemy.optionId, false);
    }
  }

  private handlePlayerCollision(): void {
    if (this.invulnerableTimer > 0) return;

    this.lives = Math.max(0, this.lives - 1);
    this.invulnerableTimer = 1.8;
    this.audio.playShieldHit();
    this.screenShake = 0.5;

    this.spawnSupernovaExplosion(new THREE.Vector3(this.playerPos.x, this.playerPos.y, 0), 0xf43f5e);
    this.callbacks.onDamageTaken(this.lives);
  }

  public setLives(lives: number): void {
    this.lives = lives;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  private onResize = (): void => {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.clearEnemies();
    this.clearProjectiles();
    this.audio.dispose();
    this.renderer.dispose();
  }
}
