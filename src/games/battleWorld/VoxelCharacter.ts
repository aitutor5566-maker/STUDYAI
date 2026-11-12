import * as THREE from 'three';

export class VoxelCharacter {
  public group: THREE.Group;
  public headGroup: THREE.Group;
  public torsoMesh: THREE.Mesh;
  public leftArmGroup: THREE.Group;
  public rightArmGroup: THREE.Group;
  public leftLegGroup: THREE.Group;
  public rightLegGroup: THREE.Group;
  public weaponMesh: THREE.Mesh;

  // Physics & Transform State
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public velocityY: number = 0;
  public isGrounded: boolean = true;
  public rotationY: number = 0;
  public targetRotationY: number = 0;

  // Animation State
  public walkCycle: number = 0;
  public isMoving: boolean = false;
  public isSwinging: boolean = false;
  public swingProgress: number = 0;
  public swingDuration: number = 0.28; // seconds

  // Combat & Stats
  public health: number = 100;
  public maxHealth: number = 100;
  public hitFlashTimer: number = 0;
  public invulnerableTimer: number = 0;

  private materialsToDispose: THREE.Material[] = [];
  private boxGeo = new THREE.BoxGeometry(1, 1, 1);

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'VoxelPlayer';

    // Materials
    const matSkin = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const matHair = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const matEyes = new THREE.MeshBasicMaterial({ color: 0x1a237e });
    const matShirt = new THREE.MeshLambertMaterial({ color: 0xff6a00 }); // STUDYAI Orange!
    const matPants = new THREE.MeshLambertMaterial({ color: 0x1565c0 }); // Vibrant Blue
    const matShoes = new THREE.MeshLambertMaterial({ color: 0x212121 });
    const matBlade = new THREE.MeshLambertMaterial({ color: 0x00e5ff }); // Glowing Cyan knowledge blade
    const matHilt = new THREE.MeshLambertMaterial({ color: 0xffd600 }); // Gold hilt

    this.materialsToDispose.push(
      matSkin,
      matHair,
      matEyes,
      matShirt,
      matPants,
      matShoes,
      matBlade,
      matHilt
    );

    // 1. Torso (Y: 0.7 to 1.3 -> center at 1.0)
    this.torsoMesh = new THREE.Mesh(this.boxGeo, matShirt);
    this.torsoMesh.scale.set(0.7, 0.75, 0.4);
    this.torsoMesh.position.set(0, 1.05, 0);
    this.torsoMesh.castShadow = true;
    this.group.add(this.torsoMesh);

    // 2. Head Group (pivot at neck Y = 1.42)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.45, 0);

    const headMesh = new THREE.Mesh(this.boxGeo, matSkin);
    headMesh.scale.set(0.55, 0.55, 0.55);
    headMesh.position.set(0, 0.28, 0);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Hair cap
    const hairMesh = new THREE.Mesh(this.boxGeo, matHair);
    hairMesh.scale.set(0.58, 0.22, 0.58);
    hairMesh.position.set(0, 0.46, 0);
    this.headGroup.add(hairMesh);

    // Eyes (2 small blocks on front)
    const leftEye = new THREE.Mesh(this.boxGeo, matEyes);
    leftEye.scale.set(0.1, 0.08, 0.04);
    leftEye.position.set(-0.14, 0.28, 0.28);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(this.boxGeo, matEyes);
    rightEye.scale.set(0.1, 0.08, 0.04);
    rightEye.position.set(0.14, 0.28, 0.28);
    this.headGroup.add(rightEye);

    this.group.add(this.headGroup);

    // 3. Left Arm Group (pivot at shoulder Y = 1.35, X = -0.48)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.48, 1.35, 0);

    const leftArmMesh = new THREE.Mesh(this.boxGeo, matShirt);
    leftArmMesh.scale.set(0.24, 0.72, 0.28);
    leftArmMesh.position.set(0, -0.32, 0);
    leftArmMesh.castShadow = true;
    this.leftArmGroup.add(leftArmMesh);

    this.group.add(this.leftArmGroup);

    // 4. Right Arm Group (pivot at shoulder Y = 1.35, X = 0.48)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.48, 1.35, 0);

    const rightArmMesh = new THREE.Mesh(this.boxGeo, matShirt);
    rightArmMesh.scale.set(0.24, 0.72, 0.28);
    rightArmMesh.position.set(0, -0.32, 0);
    rightArmMesh.castShadow = true;
    this.rightArmGroup.add(rightArmMesh);

    // Voxel Weapon attached to right arm
    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(0, -0.55, 0.2);

    const blade = new THREE.Mesh(this.boxGeo, matBlade);
    blade.scale.set(0.1, 0.9, 0.2);
    blade.position.set(0, 0.4, 0);
    blade.castShadow = true;
    weaponGroup.add(blade);

    const crossguard = new THREE.Mesh(this.boxGeo, matHilt);
    crossguard.scale.set(0.28, 0.08, 0.24);
    crossguard.position.set(0, 0.0, 0);
    weaponGroup.add(crossguard);

    this.weaponMesh = blade;
    this.rightArmGroup.add(weaponGroup);
    this.group.add(this.rightArmGroup);

    // 5. Left Leg (pivot at hip Y = 0.7, X = -0.18)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.18, 0.7, 0);

    const leftLegMesh = new THREE.Mesh(this.boxGeo, matPants);
    leftLegMesh.scale.set(0.28, 0.7, 0.32);
    leftLegMesh.position.set(0, -0.35, 0);
    leftLegMesh.castShadow = true;
    this.leftLegGroup.add(leftLegMesh);

    this.group.add(this.leftLegGroup);

    // 6. Right Leg (pivot at hip Y = 0.7, X = 0.18)
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.18, 0.7, 0);

    const rightLegMesh = new THREE.Mesh(this.boxGeo, matPants);
    rightLegMesh.scale.set(0.28, 0.7, 0.32);
    rightLegMesh.position.set(0, -0.35, 0);
    rightLegMesh.castShadow = true;
    this.rightLegGroup.add(rightLegMesh);

    this.group.add(this.rightLegGroup);
  }

  public triggerSwing() {
    if (!this.isSwinging) {
      this.isSwinging = true;
      this.swingProgress = 0;
    }
  }

  public jump() {
    if (this.isGrounded) {
      this.velocityY = 8.5;
      this.isGrounded = false;
    }
  }

  public takeDamage(amount: number) {
    if (this.invulnerableTimer > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.hitFlashTimer = 0.2;
    this.invulnerableTimer = 0.6;
  }

  public heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  public update(delta: number, moving: boolean) {
    this.isMoving = moving;

    // Gravity & Grounding
    if (!this.isGrounded) {
      this.velocityY -= 22 * delta; // Gravity
      this.position.y += this.velocityY * delta;
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    // Rotation interpolation
    const rotDiff = this.targetRotationY - this.rotationY;
    // Normalize angle difference to -PI..PI
    const wrappedDiff = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff));
    this.rotationY += wrappedDiff * Math.min(1, 14 * delta);
    this.group.rotation.y = this.rotationY;

    // Timers
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= delta;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= delta;

    // Flash white when hit
    if (this.hitFlashTimer > 0) {
      (this.torsoMesh.material as THREE.MeshLambertMaterial).color.setHex(0xffffff);
    } else {
      (this.torsoMesh.material as THREE.MeshLambertMaterial).color.setHex(0xff6a00);
    }

    // Walking Limb Animation
    if (this.isMoving) {
      this.walkCycle += delta * 12;
      const swingAngle = this.isGrounded ? Math.sin(this.walkCycle) * 0.65 : 0.35;

      this.leftLegGroup.rotation.x = swingAngle;
      this.rightLegGroup.rotation.x = -swingAngle;

      this.leftArmGroup.rotation.x = -swingAngle;
      if (!this.isSwinging) {
        this.rightArmGroup.rotation.x = swingAngle;
      }
    } else {
      // Idle return to neutral
      this.leftLegGroup.rotation.x *= 0.8;
      this.rightLegGroup.rotation.x *= 0.8;
      this.leftArmGroup.rotation.x *= 0.8;
      if (!this.isSwinging) {
        this.rightArmGroup.rotation.x *= 0.8;
      }
    }

    // Attack Swing Animation
    if (this.isSwinging) {
      this.swingProgress += delta / this.swingDuration;
      if (this.swingProgress >= 1.0) {
        this.isSwinging = false;
        this.swingProgress = 0;
        this.rightArmGroup.rotation.x = 0;
        this.rightArmGroup.rotation.z = 0;
      } else {
        // Dramatic slash from raised +0.8 rads to forward slash -1.4 rads
        const p = this.swingProgress;
        if (p < 0.3) {
          // Windup back
          this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(0, 1.2, p / 0.3);
          this.rightArmGroup.rotation.z = -0.3;
        } else {
          // Slashing forward
          const slashP = (p - 0.3) / 0.7;
          this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(1.2, -1.6, slashP);
          this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(-0.3, 0.4, slashP);
        }
      }
    }

    // Sync group position
    this.group.position.copy(this.position);
  }

  public dispose() {
    this.boxGeo.dispose();
    for (const m of this.materialsToDispose) {
      m.dispose();
    }
  }
}
