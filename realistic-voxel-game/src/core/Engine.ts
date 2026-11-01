import * as THREE from 'three';
import { Renderer } from '../rendering/Renderer';
import { Atmosphere } from '../rendering/Atmosphere';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { CameraController } from '../interaction/CameraController';
import { HUD } from '../ui/HUD';

export class Engine {
  public readonly renderer: Renderer;
  public readonly atmosphere: Atmosphere;
  public readonly physics: PhysicsWorld;
  public readonly cameraController: CameraController;
  public readonly hud: HUD;

  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private frameCount = 0;
  private fpsAccumulator = 0;
  private currentFps = 60;
  private currentFrameTime = 16.6;

  private dynamicMeshes: THREE.Mesh[] = [];

  constructor(container: HTMLElement) {
    this.hud = new HUD();
    this.renderer = new Renderer({ container, enableShadows: true });
    this.atmosphere = new Atmosphere(this.renderer.scene);
    this.physics = new PhysicsWorld({ x: 0, y: -9.81, z: 0 });
    this.cameraController = new CameraController(
      this.renderer.camera,
      this.renderer.renderer.domElement
    );
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.hud.setStatus('Engine & Physics Active: Ready', '#4ade80');
    this.loop(this.lastTime);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    const deltaMs = currentTime - this.lastTime;
    const deltaSec = deltaMs / 1000;
    this.lastTime = currentTime;

    // Profiling calculation
    this.frameCount++;
    this.fpsAccumulator += deltaMs;
    if (this.fpsAccumulator >= 500) {
      this.currentFps = (this.frameCount * 1000) / this.fpsAccumulator;
      this.currentFrameTime = this.fpsAccumulator / this.frameCount;
      this.frameCount = 0;
      this.fpsAccumulator = 0;

      // Update HUD metrics
      const renderInfo = this.renderer.renderer.info.render;
      this.hud.updateMetrics({
        fps: this.currentFps,
        frameTimeMs: this.currentFrameTime,
        drawCalls: renderInfo.calls,
        triangles: renderInfo.triangles,
        physicsBodies: this.physics.getDynamicBodyCount()
      });
    }

    // Step physics with fixed accumulator
    this.physics.step(deltaSec);

    // Render 3D Scene
    this.renderer.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Spawns a physical falling voxel cube in the 3D scene.
   */
  public spawnPhysicsBlock(
    position = new THREE.Vector3(
      8 + (Math.random() - 0.5) * 4,
      12 + Math.random() * 2,
      8 + (Math.random() - 0.5) * 4
    ),
    color = 0xf59e0b
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.renderer.scene.add(mesh);
    this.physics.createDynamicBox(mesh, { x: 0.5, y: 0.5, z: 0.5 }, 0.35, 0.6);
    this.dynamicMeshes.push(mesh);

    return mesh;
  }

  public dispose(): void {
    this.stop();
    this.cameraController.dispose();
    this.atmosphere.dispose(this.renderer.scene);

    for (const mesh of this.dynamicMeshes) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      this.renderer.scene.remove(mesh);
    }
    this.dynamicMeshes = [];

    this.physics.dispose();
    this.renderer.dispose();
    this.hud.destroy();
  }
}
