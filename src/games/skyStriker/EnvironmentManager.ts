import * as THREE from 'three';
import { getPbrTextureSet } from '../engine/PbrTextureFactory';
import { createAtmosphericSkyDome } from '../engine/VisualMasterpieceEngine';
import { GraphicsQuality, WorldId } from './types';

export interface WorldConfig {
  id: WorldId;
  name: string;
  subtitle: string;
  skyColor: number;
  fogColor: number;
  sunColor: number;
  ambientColor: number;
  terrainColor: number;
  mountainColor: number;
  accentColor: number;
}

export const SKY_WORLDS: WorldConfig[] = [
  {
    id: 'desert_storm',
    name: '1. Desert Storm',
    subtitle: 'Golden canyon mountains, rocky valleys & sunlit clouds',
    skyColor: 0xe8b574,
    fogColor: 0xdca563,
    sunColor: 0xffe4b5,
    ambientColor: 0x93c5fd,
    terrainColor: 0xc88f50,
    mountainColor: 0x8f552d,
    accentColor: 0xf59e0b
  },
  {
    id: 'frozen_horizon',
    name: '2. Frozen Horizon',
    subtitle: 'Snow-capped peaks, glacial valleys & crisp blue skies',
    skyColor: 0x7dd3fc,
    fogColor: 0xbae6fd,
    sunColor: 0xf0f9ff,
    ambientColor: 0x60a5fa,
    terrainColor: 0xe2e8f0,
    mountainColor: 0x94a3b8,
    accentColor: 0x38bdf8
  },
  {
    id: 'ocean_frontier',
    name: '3. Ocean Frontier',
    subtitle: 'Deep azure sea, tropical islands & towering cumulus clouds',
    skyColor: 0x38bdf8,
    fogColor: 0x7dd3fc,
    sunColor: 0xfef3c7,
    ambientColor: 0x93c5fd,
    terrainColor: 0x0369a1,
    mountainColor: 0x15803d,
    accentColor: 0x22d3ee
  },
  {
    id: 'future_city',
    name: '4. Future City',
    subtitle: 'Neon skyline, holographic towers & twilight atmosphere',
    skyColor: 0x090d24,
    fogColor: 0x172554,
    sunColor: 0x38bdf8,
    ambientColor: 0x6366f1,
    terrainColor: 0x0f172a,
    mountainColor: 0x1e293b,
    accentColor: 0x22d3ee
  },
  {
    id: 'sky_kingdom',
    name: '5. Sky Kingdom',
    subtitle: 'Floating islands, golden clouds & ancient sky spires',
    skyColor: 0x4f46e5,
    fogColor: 0x818cf8,
    sunColor: 0xfde68a,
    ambientColor: 0xc4b5fd,
    terrainColor: 0x312e81,
    mountainColor: 0x6d28d9,
    accentColor: 0xfbbf24
  }
];

export interface SkyEnvironmentHandle {
  group: THREE.Group;
  update: (dt: number, forwardSpeed: number) => void;
}

export function buildSkyEnvironment(
  scene: THREE.Scene,
  worldId: WorldId,
  quality: GraphicsQuality
): SkyEnvironmentHandle {
  const cfg = SKY_WORLDS.find((w) => w.id === worldId) || SKY_WORLDS[0];

  scene.background = new THREE.Color(cfg.skyColor);
  scene.fog = new THREE.FogExp2(cfg.fogColor, 0.0036);

  const group = new THREE.Group();

  // Procedural Atmospheric Sky Dome with Sun/Moon Halo & Starfield
  if (typeof document !== 'undefined') {
    const skyDome = createAtmosphericSkyDome({
      radius: 460,
      topColor: worldId === 'future_city' ? 0x020617 : cfg.skyColor,
      horizonColor: cfg.fogColor,
      bottomColor: cfg.terrainColor,
      sunColor: cfg.sunColor,
      sunDirection: new THREE.Vector3(0.45, 0.42, -0.78),
      starIntensity: worldId === 'future_city' || worldId === 'sky_kingdom' ? 0.78 : 0.12
    });
    group.add(skyDome.mesh);
  }

  // Lighting
  const ambient = new THREE.HemisphereLight(cfg.ambientColor, cfg.terrainColor, 0.95);
  group.add(ambient);

  const sun = new THREE.DirectionalLight(cfg.sunColor, 1.85);
  sun.position.set(60, 110, -40);
  if (quality !== 'low') {
    sun.castShadow = true;
    sun.shadow.mapSize.width = quality === 'high' ? 2048 : 1024;
    sun.shadow.mapSize.height = quality === 'high' ? 2048 : 1024;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 260;
    const d = 75;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
  }
  group.add(sun);

  // Vast Terrain Ground Plane
  const terrainGeo = new THREE.PlaneGeometry(900, 900, 40, 40);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    // Gentle valley in the center, taller ridges on flanks
    const valleyFactor = Math.min(1, Math.abs(x) / 90);
    const ridge = (Math.sin(x * 0.035) * Math.cos(z * 0.035) * 14 + Math.sin(x * 0.09) * 4) * valleyFactor;
    posAttr.setY(i, ridge - 38);
  }
  terrainGeo.computeVertexNormals();

  const terrainPbr =
    typeof document !== 'undefined'
      ? getPbrTextureSet(worldId === 'ocean_frontier' ? 'water' : 'stone', 18, 18)
      : null;
  const terrainMat = new THREE.MeshStandardMaterial({
    color: cfg.terrainColor,
    roughness: worldId === 'ocean_frontier' ? 0.14 : 0.86,
    metalness: worldId === 'ocean_frontier' ? 0.62 : 0.08,
    normalMap: terrainPbr?.normalMap ?? null,
    roughnessMap: terrainPbr?.roughnessMap ?? null,
    normalScale: new THREE.Vector2(0.55, 0.55),
    flatShading: worldId !== 'ocean_frontier'
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  group.add(terrain);

  // Scrolling Mountains / Skyscrapers / Floating Islands
  const mountainMat = new THREE.MeshStandardMaterial({
    color: cfg.mountainColor,
    roughness: 0.82,
    metalness: worldId === 'future_city' ? 0.6 : 0.1,
    flatShading: true
  });

  const neonMat = new THREE.MeshBasicMaterial({ color: cfg.accentColor });
  const landmarks: THREE.Object3D[] = [];
  const landmarkCount = quality === 'low' ? 24 : quality === 'medium' ? 40 : 56;

  for (let i = 0; i < landmarkCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (42 + Math.random() * 145);
    const z = -320 + (i / landmarkCount) * 420;

    let obj: THREE.Object3D;
    if (worldId === 'future_city') {
      const h = 35 + Math.random() * 65;
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(14 + Math.random() * 10, h, 14 + Math.random() * 10), mountainMat);
      bldg.position.set(x, -38 + h / 2, z);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(14.4, 1.2, 14.4), neonMat);
      strip.position.y = h * 0.42;
      bldg.add(strip);
      obj = bldg;
    } else if (worldId === 'sky_kingdom') {
      const isl = new THREE.Mesh(new THREE.ConeGeometry(16 + Math.random() * 12, 22, 6), mountainMat);
      isl.rotation.x = Math.PI;
      isl.position.set(x, -12 + Math.random() * 24, z);
      obj = isl;
    } else {
      const h = 28 + Math.random() * 54;
      const r = 18 + Math.random() * 22;
      const peak = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), mountainMat);
      peak.position.set(x, -38 + h / 2, z);
      peak.rotation.y = Math.random() * Math.PI;
      obj = peak;
    }
    group.add(obj);
    landmarks.push(obj);
  }

  // Layered Volumetric-Style Clouds
  const cloudMat = new THREE.MeshStandardMaterial({
    color: worldId === 'future_city' ? 0x334155 : 0xffffff,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85
  });

  const clouds: THREE.Group[] = [];
  const cloudCount = quality === 'low' ? 14 : 26;
  for (let i = 0; i < cloudCount; i++) {
    const cg = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(
        new THREE.DodecahedronGeometry(4.5 + Math.random() * 4.5, 1),
        cloudMat
      );
      puff.position.set((p - 1.5) * 4.8, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 3.5);
      puff.scale.set(1.4, 0.72, 1.1);
      cg.add(puff);
    }
    cg.position.set(
      (Math.random() - 0.5) * 240,
      18 + Math.random() * 36,
      -340 + Math.random() * 420
    );
    group.add(cg);
    clouds.push(cg);
  }

  scene.add(group);

  return {
    group,
    update(dt: number, forwardSpeed: number) {
      const scroll = forwardSpeed * dt;
      for (const lm of landmarks) {
        lm.position.z += scroll;
        if (lm.position.z > 100) {
          lm.position.z -= 420;
        }
      }
      for (const cl of clouds) {
        cl.position.z += scroll * 0.72;
        if (cl.position.z > 100) {
          cl.position.z -= 420;
          cl.position.x = (Math.random() - 0.5) * 240;
        }
      }
    }
  };
}
