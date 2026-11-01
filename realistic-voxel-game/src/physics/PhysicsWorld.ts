import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export interface PhysicsBodyBinding {
  mesh: THREE.Object3D;
  body: RAPIER.RigidBody;
  isDynamic: boolean;
}

export class PhysicsWorld {
  private static isInitialized = false;
  public world!: RAPIER.World;
  private bindings: PhysicsBodyBinding[] = [];
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60;

  public static async init(): Promise<void> {
    if (!PhysicsWorld.isInitialized) {
      await RAPIER.init();
      PhysicsWorld.isInitialized = true;
    }
  }

  constructor(gravity = { x: 0.0, y: -9.81, z: 0.0 }) {
    if (!PhysicsWorld.isInitialized) {
      throw new Error('Call await PhysicsWorld.init() before instantiating PhysicsWorld.');
    }
    this.world = new RAPIER.World(gravity);
  }

  /**
   * Creates a static ground collider at the specified coordinates and half-extents.
   */
  public createStaticBox(
    position: { x: number; y: number; z: number },
    halfExtents: { x: number; y: number; z: number }
  ): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      position.x,
      position.y,
      position.z
    );
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z);
    const collider = this.world.createCollider(colliderDesc, body);
    return { body, collider };
  }

  /**
   * Spawns a dynamic rigid box coupled with a Three.js mesh.
   */
  public createDynamicBox(
    mesh: THREE.Object3D,
    halfExtents: { x: number; y: number; z: number },
    restitution = 0.25,
    friction = 0.7
  ): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
      .setRotation(mesh.quaternion);

    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z)
      .setRestitution(restitution)
      .setFriction(friction);

    const collider = this.world.createCollider(colliderDesc, body);
    this.bindings.push({ mesh, body, isDynamic: true });

    return { body, collider };
  }

  /**
   * Step physics simulation with fixed timestep accumulator for determinism.
   */
  public step(deltaTime: number): void {
    // Clamp delta time to avoid spiral of death on long frames
    const dt = Math.min(deltaTime, 0.1);
    this.accumulator += dt;

    while (this.accumulator >= this.fixedTimeStep) {
      this.world.step();
      this.accumulator -= this.fixedTimeStep;
    }

    // Synchronize Three.js visual meshes with Rapier rigid bodies
    for (const binding of this.bindings) {
      if (binding.isDynamic) {
        const pos = binding.body.translation();
        const rot = binding.body.rotation();
        binding.mesh.position.set(pos.x, pos.y, pos.z);
        binding.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
      }
    }
  }

  public getDynamicBodyCount(): number {
    return this.bindings.filter((b) => b.isDynamic).length;
  }

  public getBindings(): readonly PhysicsBodyBinding[] {
    return this.bindings;
  }

  public dispose(): void {
    this.bindings = [];
    if (this.world) {
      this.world.free();
    }
  }
}
