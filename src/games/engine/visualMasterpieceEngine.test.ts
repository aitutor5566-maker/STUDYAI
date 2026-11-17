import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  CinematicCameraController,
  FramePerformanceMonitor,
  createAnimatedWaterSurface,
  createVolumetricCloudLayer
} from './VisualMasterpieceEngine';

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

describe('AAA Water, Clouds & Performance Monitor', () => {
  it('creates animated GLSL water and volumetric cloud layer and tracks frame metrics', () => {
    const water = createAnimatedWaterSurface({ width: 20, depth: 20, segments: 12 });
    expect(water.mesh).toBeInstanceOf(THREE.Mesh);
    water.update(1.25);
    const mat = water.mesh.material as THREE.ShaderMaterial;
    expect(mat.uniforms.uTime.value).toBeCloseTo(1.25, 3);

    const clouds = createVolumetricCloudLayer({ count: 4, spreadX: 60, windSpeed: 2 });
    expect(clouds.group.children.length).toBe(4);
    const firstX = clouds.group.children[0].position.x;
    clouds.update(0.5);
    expect(clouds.group.children[0].position.x).not.toBe(firstX);

    const monitor = new FramePerformanceMonitor(10);
    for (let i = 0; i < 10; i++) monitor.recordFrame(1 / 60);
    const healthy = monitor.getMetrics();
    expect(healthy.avgFps).toBe(60);
    expect(healthy.isFrameBudgetExceeded).toBe(false);

    for (let i = 0; i < 10; i++) monitor.recordFrame(0.045);
    const slow = monitor.getMetrics();
    expect(slow.isFrameBudgetExceeded).toBe(true);
  });
});
