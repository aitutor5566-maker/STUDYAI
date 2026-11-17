import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { getContactShadowTexture, getSoftGlowTexture } from './PbrTextureFactory';

export type VisualQualityTier = 'low' | 'medium' | 'high' | 'ultra';

export interface BloomConfig {
  strength?: number;
  radius?: number;
  threshold?: number;
}

/**
 * Adaptive Post-Processing Pipeline using Three.js EffectComposer + UnrealBloomPass + OutputPass.
 * Automatically degrades gracefully if frame time spikes so gameplay always stays responsive.
 */
export class AdaptivePostProcessingPipeline {
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private quality: VisualQualityTier;
  private bloomEnabled: boolean;
  private slowFrameStreak = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    width: number,
    height: number,
    quality: VisualQualityTier = 'high',
    bloomConfig: BloomConfig = {}
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.quality = quality;
    this.bloomEnabled = quality !== 'low';

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    if (this.bloomEnabled) {
      try {
        const composer = new EffectComposer(renderer);
        composer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, quality === 'ultra' ? 2 : quality === 'high' ? 1.75 : 1.35)
        );
        composer.setSize(Math.max(1, width), Math.max(1, height));

        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomStrength =
          bloomConfig.strength ?? (quality === 'ultra' ? 0.48 : quality === 'high' ? 0.40 : 0.28);
        const bloomRadius = bloomConfig.radius ?? 0.55;
        const bloomThreshold = bloomConfig.threshold ?? 0.78;
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(Math.max(1, width), Math.max(1, height)),
          bloomStrength,
          bloomRadius,
          bloomThreshold
        );
        composer.addPass(bloomPass);

        const outputPass = new OutputPass();
        composer.addPass(outputPass);

        this.composer = composer;
        this.bloomPass = bloomPass;
      } catch {
        this.composer = null;
        this.bloomEnabled = false;
      }
    }
  }

  public setBloomStrength(strength: number): void {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
    }
  }

  public resize(width: number, height: number): void {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    this.renderer.setSize(w, h, false);
    if (this.composer) {
      this.composer.setSize(w, h);
    }
    if (this.bloomPass) {
      this.bloomPass.setSize(w, h);
    }
  }

  public render(dtSeconds?: number): void {
    // Adaptive FPS safeguard: if consistently > 42ms (~23fps) for 35 frames, disable heavy bloom
    if (dtSeconds !== undefined && this.bloomEnabled && dtSeconds > 0.042) {
      this.slowFrameStreak += 1;
      if (this.slowFrameStreak > 35) {
        this.bloomEnabled = false;
        this.renderer.setPixelRatio(1);
      }
    } else if (dtSeconds !== undefined && dtSeconds < 0.028) {
      this.slowFrameStreak = Math.max(0, this.slowFrameStreak - 1);
    }

    if (this.bloomEnabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public dispose(): void {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    if (this.bloomPass) {
      this.bloomPass.dispose();
      this.bloomPass = null;
    }
  }
}

/**
 * Generates an IBL environment map via PMREMGenerator for realistic PBR reflections
 * on metallic armor, aircraft hulls, glass canopies, crystals, and water.
 */
export function buildAtmosphericEnvMap(
  renderer: THREE.WebGLRenderer,
  topHex: string | number,
  horizonHex: string | number,
  bottomHex: string | number
): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  const domeGeo = new THREE.SphereGeometry(20, 24, 16);
  const domeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(topHex) },
      uHorizon: { value: new THREE.Color(horizonHex) },
      uBottom: { value: new THREE.Color(bottomHex) }
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uBottom;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        vec3 col = h >= 0.0
          ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.65))
          : mix(uHorizon, uBottom, pow(clamp(-h, 0.0, 1.0), 0.75));
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  envScene.add(new THREE.Mesh(domeGeo, domeMat));

  // Add subtle specular reflection light cards for crisp metallic highlights
  const keyCard = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  keyCard.position.set(10, 12, 8);
  keyCard.lookAt(0, 0, 0);
  envScene.add(keyCard);

  const rimCard = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 4),
    new THREE.MeshBasicMaterial({ color: horizonHex, side: THREE.DoubleSide })
  );
  rimCard.position.set(-12, 5, -10);
  rimCard.lookAt(0, 0, 0);
  envScene.add(rimCard);

  const renderTarget = pmrem.fromScene(envScene, 0.04);
  domeGeo.dispose();
  domeMat.dispose();
  (keyCard.geometry as THREE.BufferGeometry).dispose();
  (keyCard.material as THREE.Material).dispose();
  (rimCard.geometry as THREE.BufferGeometry).dispose();
  (rimCard.material as THREE.Material).dispose();
  pmrem.dispose();

  return renderTarget.texture;
}

export interface SkyDomeHandle {
  mesh: THREE.Mesh;
  update: (params: {
    topColor?: THREE.Color | string | number;
    horizonColor?: THREE.Color | string | number;
    bottomColor?: THREE.Color | string | number;
    sunDirection?: THREE.Vector3;
    starIntensity?: number;
    time?: number;
  }) => void;
}

/**
 * Creates a procedural atmospheric sky dome with sun/moon disc, horizon scattering, and twinkling stars.
 */
export function createAtmosphericSkyDome(opts: {
  radius?: number;
  topColor: string | number;
  horizonColor: string | number;
  bottomColor: string | number;
  sunColor?: string | number;
  sunDirection?: THREE.Vector3;
  starIntensity?: number;
}): SkyDomeHandle {
  const geo = new THREE.SphereGeometry(opts.radius ?? 260, 32, 20);
  const uniforms = {
    uTopColor: { value: new THREE.Color(opts.topColor) },
    uHorizonColor: { value: new THREE.Color(opts.horizonColor) },
    uBottomColor: { value: new THREE.Color(opts.bottomColor) },
    uSunColor: { value: new THREE.Color(opts.sunColor ?? '#FFFBEB') },
    uSunDir: { value: (opts.sunDirection ?? new THREE.Vector3(0.4, 0.5, -0.7)).clone().normalize() },
    uStarIntensity: { value: opts.starIntensity ?? 0.35 },
    uTime: { value: 0 }
  };

  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTopColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uBottomColor;
      uniform vec3 uSunColor;
      uniform vec3 uSunDir;
      uniform float uStarIntensity;
      uniform float uTime;
      varying vec3 vDir;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      void main() {
        vec3 dir = normalize(vDir);
        float h = dir.y;
        vec3 sky = h >= 0.0
          ? mix(uHorizonColor, uTopColor, pow(clamp(h, 0.0, 1.0), 0.58))
          : mix(uHorizonColor, uBottomColor, pow(clamp(-h, 0.0, 1.0), 0.72));

        // Sun / Moon disc & atmospheric Mie glow
        float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
        float halo = pow(sunDot, 12.0) * 0.38;
        float disc = smoothstep(0.9965, 0.9992, sunDot) * 1.15;
        sky += uSunColor * (halo + disc);

        // Subtle procedural twinkling starfield above horizon
        if (uStarIntensity > 0.01 && h > 0.02) {
          vec3 grid = floor(dir * 220.0);
          float n = hash(grid);
          if (n > 0.9935) {
            float twinkle = 0.65 + 0.35 * sin(uTime * 2.5 + n * 120.0);
            sky += vec3(0.88, 0.94, 1.0) * twinkle * uStarIntensity * smoothstep(0.02, 0.25, h);
          }
        }

        gl_FragColor = vec4(sky, 1.0);
      }
    `
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;

  return {
    mesh,
    update: (params) => {
      if (params.topColor !== undefined) uniforms.uTopColor.value.set(params.topColor);
      if (params.horizonColor !== undefined) uniforms.uHorizonColor.value.set(params.horizonColor);
      if (params.bottomColor !== undefined) uniforms.uBottomColor.value.set(params.bottomColor);
      if (params.sunDirection !== undefined) uniforms.uSunDir.value.copy(params.sunDirection).normalize();
      if (params.starIntensity !== undefined) uniforms.uStarIntensity.value = params.starIntensity;
      if (params.time !== undefined) uniforms.uTime.value = params.time;
    }
  };
}

/**
 * Creates soft additive volumetric light shafts (god-rays) for cinematic depth.
 */
export function createVolumetricLightShafts(
  positions: Array<{ x: number; y: number; z: number; rotZ?: number; scale?: number }>,
  color: string | number,
  opacity = 0.075
): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.ConeGeometry(4.2, 26, 16, 1, true);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  positions.forEach((p) => {
    const beam = new THREE.Mesh(geo, mat);
    beam.position.set(p.x, p.y, p.z);
    beam.rotation.z = p.rotZ ?? -0.22;
    if (p.scale) beam.scale.setScalar(p.scale);
    group.add(beam);
  });

  return group;
}

/**
 * Soft radial ground contact shadow disc to anchor characters & objects to terrain.
 */
export function createContactShadowMesh(radius = 0.9): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: getContactShadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.72
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.03;
  return mesh;
}

/**
 * Lightweight single-draw-call atmospheric particle system (fireflies, embers, speed dust).
 */
export class AtmosphericParticleSystem {
  public readonly points: THREE.Points;
  private positions: Float32Array;
  private phases: Float32Array;
  private speeds: Float32Array;
  private count: number;
  private bounds: { x: number; y: number; z: number };
  private driftVel: THREE.Vector3;

  constructor(opts: {
    count: number;
    bounds: { x: number; y: number; z: number };
    center?: THREE.Vector3;
    color?: string | number;
    size?: number;
    opacity?: number;
    driftVel?: THREE.Vector3;
  }) {
    this.count = opts.count;
    this.bounds = opts.bounds;
    this.driftVel = opts.driftVel ?? new THREE.Vector3(0.25, 0.35, 0.15);

    const center = opts.center ?? new THREE.Vector3(0, opts.bounds.y * 0.5, 0);
    this.positions = new Float32Array(this.count * 3);
    this.phases = new Float32Array(this.count);
    this.speeds = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3] = center.x + (Math.random() - 0.5) * this.bounds.x;
      this.positions[i * 3 + 1] = Math.max(0.4, center.y + (Math.random() - 0.5) * this.bounds.y);
      this.positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * this.bounds.z;
      this.phases[i] = Math.random() * Math.PI * 2;
      this.speeds[i] = 0.6 + Math.random() * 0.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const mat = new THREE.PointsMaterial({
      color: opts.color ?? '#BAE6FD',
      map: getSoftGlowTexture(),
      size: opts.size ?? 0.36,
      transparent: true,
      opacity: opts.opacity ?? 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(geo, mat);
  }

  public setOpacity(opacity: number): void {
    (this.points.material as THREE.PointsMaterial).opacity = opacity;
  }

  public update(dt: number, elapsed: number, anchor?: THREE.Vector3): void {
    const posAttr = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const cx = anchor?.x ?? 0;
    const cy = anchor?.y ?? this.bounds.y * 0.5;
    const cz = anchor?.z ?? 0;
    const halfX = this.bounds.x * 0.5;
    const halfY = this.bounds.y * 0.5;
    const halfZ = this.bounds.z * 0.5;

    for (let i = 0; i < this.count; i++) {
      const ix = i * 3;
      const spd = this.speeds[i];
      const ph = this.phases[i];

      let x = this.positions[ix] + (this.driftVel.x * spd + Math.sin(elapsed * 0.9 + ph) * 0.35) * dt;
      let y = this.positions[ix + 1] + (this.driftVel.y * spd + Math.cos(elapsed * 1.1 + ph) * 0.2) * dt;
      let z = this.positions[ix + 2] + (this.driftVel.z * spd + Math.sin(elapsed * 0.7 + ph) * 0.35) * dt;

      if (x > cx + halfX) x -= this.bounds.x;
      if (x < cx - halfX) x += this.bounds.x;
      if (y > cy + halfY) y -= this.bounds.y;
      if (y < Math.max(0.25, cy - halfY)) y += this.bounds.y;
      if (z > cz + halfZ) z -= this.bounds.z;
      if (z < cz - halfZ) z += this.bounds.z;

      this.positions[ix] = x;
      this.positions[ix + 1] = y;
      this.positions[ix + 2] = z;
    }

    posAttr.needsUpdate = true;
  }
}

/**
 * Smooth third-person cinematic camera controller with exponential damping,
 * intro sweep, impact camera shake, and dynamic FOV boost.
 */
export class CinematicCameraController {
  private currentLookAt = new THREE.Vector3();
  private shakeIntensity = 0;
  private introTimer = 0;
  private introDuration: number;
  private baseFov: number;
  private targetFov: number;
  private initialized = false;

  constructor(baseFov = 58, introDuration = 1.4) {
    this.baseFov = baseFov;
    this.targetFov = baseFov;
    this.introDuration = introDuration;
  }

  public addShake(intensity: number): void {
    this.shakeIntensity = Math.min(1.2, Math.max(this.shakeIntensity, intensity));
  }

  public setTargetFov(fov: number): void {
    this.targetFov = fov;
  }

  public resetFov(): void {
    this.targetFov = this.baseFov;
  }

  public update(
    camera: THREE.PerspectiveCamera,
    desiredPos: THREE.Vector3,
    desiredLookAt: THREE.Vector3,
    dt: number,
    posSmoothing = 8.5,
    lookSmoothing = 11.0
  ): void {
    if (!this.initialized) {
      camera.position.copy(desiredPos);
      this.currentLookAt.copy(desiredLookAt);
      camera.lookAt(this.currentLookAt);
      this.initialized = true;
    }

    const posAlpha = 1 - Math.exp(-posSmoothing * dt);
    const lookAlpha = 1 - Math.exp(-lookSmoothing * dt);

    // Subtle cinematic intro arc
    const effectiveDesired = desiredPos.clone();
    if (this.introTimer < this.introDuration) {
      this.introTimer += dt;
      const t = Math.min(1, this.introTimer / this.introDuration);
      const easeOut = 1 - Math.pow(1 - t, 3);
      const arcOffset = (1 - easeOut) * 3.2;
      effectiveDesired.y += arcOffset * 0.65;
      effectiveDesired.x += Math.sin((1 - easeOut) * 1.4) * 2.8;
    }

    camera.position.lerp(effectiveDesired, posAlpha);
    this.currentLookAt.lerp(desiredLookAt, lookAlpha);

    // Frame-rate independent camera shake decay
    if (this.shakeIntensity > 0.002) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity * 0.8;
      camera.position.x += sx;
      camera.position.y += sy;
      this.shakeIntensity *= Math.exp(-9.5 * dt);
    } else {
      this.shakeIntensity = 0;
    }

    if (Math.abs(camera.fov - this.targetFov) > 0.05) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, this.targetFov, 1 - Math.exp(-6.0 * dt));
      camera.updateProjectionMatrix();
    }

    camera.lookAt(this.currentLookAt);
  }
}

/**
 * Cleanly disposes all geometries, materials, and textures in a Three.js scene.
 */
export function disposeThreeScene(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  pipeline?: AdaptivePostProcessingPipeline | null,
  envTexture?: THREE.Texture | null
): void {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mat = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
    if (mat) {
      const mats = Array.isArray(mat) ? mat : [mat];
      for (const m of mats) {
        m.dispose();
      }
    }
  });
  if (envTexture) {
    envTexture.dispose();
  }
  if (pipeline) {
    pipeline.dispose();
  }
  renderer.dispose();
}
