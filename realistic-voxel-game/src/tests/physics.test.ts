import { describe, it, expect, beforeAll } from 'vitest';
import * as THREE from 'three';
import { PhysicsWorld } from '../physics/PhysicsWorld';

describe('Rapier 3D Physics Verification', () => {
  beforeAll(async () => {
    await PhysicsWorld.init();
  });

  it('initializes physics world with gravity', () => {
    const physics = new PhysicsWorld({ x: 0, y: -9.81, z: 0 });
    expect(physics.world).toBeDefined();
    physics.dispose();
  });

  it('demonstrates dynamic object falling and resting on static ground collider', () => {
    const physics = new PhysicsWorld({ x: 0, y: -9.81, z: 0 });

    // 1. Create static ground at y = 0, half-height = 0.5 (top surface is at y = 0.5)
    physics.createStaticBox({ x: 0, y: 0, z: 0 }, { x: 10, y: 0.5, z: 10 });

    // 2. Create dynamic mesh starting at y = 5
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
    mesh.position.set(0, 5, 0);

    // Box has half-extents (0.5, 0.5, 0.5)
    const { body } = physics.createDynamicBox(mesh, { x: 0.5, y: 0.5, z: 0.5 }, 0.0, 0.8);

    const initialY = body.translation().y;
    expect(initialY).toBeCloseTo(5, 1);

    // 3. Step physics simulation forward for 2.0 seconds (120 ticks)
    for (let i = 0; i < 120; i++) {
      physics.step(1 / 60);
    }

    const finalY = body.translation().y;
    const finalMeshY = mesh.position.y;

    // The box should fall down from y=5 and land on the ground plane (ground top = 0.5, box half-height = 0.5 -> expected y ~ 1.0)
    expect(finalY).toBeLessThan(initialY);
    expect(finalY).toBeGreaterThanOrEqual(0.95);
    expect(finalY).toBeLessThanOrEqual(1.05);

    // Verify mesh synchronization
    expect(finalMeshY).toBeCloseTo(finalY, 4);

    // Verify velocity is settled near zero
    const linvel = body.linvel();
    expect(Math.abs(linvel.y)).toBeLessThan(0.05);

    // 4. Cleanup
    physics.dispose();
  });
});
