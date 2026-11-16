import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CinematicCameraController } from './VisualMasterpieceEngine';

describe('CinematicCameraController', () => {
  it('smoothly damps camera position, handles FOV boost, and decays camera shake', () => {
    const cam = new THREE.PerspectiveCamera(58, 16 / 9, 0.2, 500);
    const controller = new CinematicCameraController(58, 0);

    const targetPos = new THREE.Vector3(0, 5, 14);
    const lookAt = new THREE.Vector3(0, 2, 0);
    controller.update(cam, targetPos, lookAt, 0.016);
    expect(cam.position.z).toBeCloseTo(14, 3);

    controller.setTargetFov(66);
    controller.addShake(0.6);
    for (let i = 0; i < 40; i++) {
      controller.update(cam, new THREE.Vector3(4, 5, 14), lookAt, 0.016);
    }

    expect(cam.fov).toBeGreaterThan(64);
    expect(cam.position.x).toBeGreaterThan(3.5);

    controller.resetFov();
    for (let i = 0; i < 40; i++) {
      controller.update(cam, new THREE.Vector3(4, 5, 14), lookAt, 0.016);
    }
    expect(cam.fov).toBeLessThan(60);
  });
});
