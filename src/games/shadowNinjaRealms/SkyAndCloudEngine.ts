import * as THREE from 'three';
import { createAtmosphericSkyDome, SkyDomeHandle } from '../engine/VisualMasterpieceEngine';
import { getSoftGlowTexture } from '../engine/PbrTextureFactory';
import { GraphicsTier, WeatherType } from './types';

interface CloudCluster {
  group: THREE.Group;
  speed: number;
  baseY: number;
  layer: 0 | 1;
}

export interface SkyCloudWeatherHandle {
  root: THREE.Group;
  skyDome: SkyDomeHandle;
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  update: (dt: number, elapsed: number, playerPos: THREE.Vector3, weather: WeatherType) => {
    timeLabel: string;
    fogColor: number;
    fogDensity: number;
  };
}

export function buildSkyAndCloudSystem(
  scene: THREE.Scene,
  tier: GraphicsTier,
  initialWeather: WeatherType
): SkyCloudWeatherHandle {
  const root = new THREE.Group();

  const skyDome = createAtmosphericSkyDome({
    radius: 260,
    topColor: '#0284C7',
    horizonColor: '#BAE6FD',
    bottomColor: '#1E293B',
    sunColor: '#FFFBEB',
    sunDirection: new THREE.Vector3(0.45, 0.55, -0.7),
    starIntensity: 0
  });
  root.add(skyDome.mesh);

  const hemiLight = new THREE.HemisphereLight('#E0F2FE', '#1E293B', 0.9);
  root.add(hemiLight);

  const sunLight = new THREE.DirectionalLight('#FFF7ED', 1.75);
  sunLight.position.set(35, 52, -28);
  if (tier !== 'low') {
    sunLight.castShadow = true;
    const mapSize = tier === 'ultra' ? 2048 : tier === 'high' ? 1536 : 1024;
    sunLight.shadow.mapSize.set(mapSize, mapSize);
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 140;
    const d = 44;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
  }
  root.add(sunLight);

  const cloudMatLower = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.94,
    metalness: 0.0,
    transparent: true,
    opacity: 0.88
  });
  const cloudMatUpper = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.96,
    metalness: 0.0,
    transparent: true,
    opacity: 0.68
  });

  const clouds: CloudCluster[] = [];
  const cloudCount = tier === 'low' ? 12 : tier === 'medium' ? 20 : 30;
  const puffGeo = new THREE.DodecahedronGeometry(3.2, 1);

  for (let i = 0; i < cloudCount; i++) {
    const layer: 0 | 1 = i % 3 === 0 ? 1 : 0;
    const cg = new THREE.Group();
    const puffs = 3 + (i % 4);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(puffGeo, layer === 0 ? cloudMatLower : cloudMatUpper);
      const sx = 1.2 + ((p * 7 + i) % 5) * 0.25;
      const sy = 0.55 + ((p * 3 + i) % 3) * 0.14;
      const sz = 0.95 + ((p * 5 + i) % 4) * 0.2;
      puff.scale.set(sx, sy, sz);
      puff.position.set((p - puffs / 2) * 3.1, (p % 2) * 0.9, ((p * 2) % 3 - 1) * 1.4);
      cg.add(puff);
    }
    const baseY = layer === 0 ? 34 + (i % 5) * 3.2 : 52 + (i % 4) * 4.5;
    cg.position.set(
      ((i * 37) % 240) - 120,
      baseY,
      ((i * 53) % 220) - 120
    );
    const speed = layer === 0 ? 1.8 + (i % 4) * 0.45 : 0.95 + (i % 3) * 0.3;
    root.add(cg);
    clouds.push({ group: cg, speed, baseY, layer });
  }

  const particleCount = tier === 'low' ? 90 : 240;
  const pPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 56;
    pPositions[i * 3 + 1] = Math.random() * 24 + 1;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 56;
  }
  const weatherGeo = new THREE.BufferGeometry();
  weatherGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const weatherMat = new THREE.PointsMaterial({
    color: '#FBCFE8',
    map: getSoftGlowTexture(),
    size: 0.34,
    transparent: true,
    opacity: 0.65,
    depthWrite: false
  });
  const weatherPoints = new THREE.Points(weatherGeo, weatherMat);
  root.add(weatherPoints);

  scene.add(root);

  const weatherThemes: Record<
    WeatherType,
    {
      label: string;
      top: string;
      horizon: string;
      bottom: string;
      sun: string;
      sunIntensity: number;
      hemiIntensity: number;
      cloudTint: string;
      fogColor: number;
      fogDensity: number;
      stars: number;
      particleColor: string;
      particleSize: number;
      particleOpacity: number;
      fallSpeed: number;
    }
  > = {
    clear: {
      label: 'Sunlit Day',
      top: '#0284C7',
      horizon: '#BAE6FD',
      bottom: '#1E293B',
      sun: '#FFFBEB',
      sunIntensity: 1.8,
      hemiIntensity: 0.92,
      cloudTint: '#FFFFFF',
      fogColor: 0xbae6fd,
      fogDensity: 0.0085,
      stars: 0,
      particleColor: '#FBCFE8',
      particleSize: 0.28,
      particleOpacity: 0.55,
      fallSpeed: 1.4
    },
    golden_sunset: {
      label: 'Golden Sunset',
      top: '#4C1D95',
      horizon: '#FB923C',
      bottom: '#1E1B4B',
      sun: '#FDBA74',
      sunIntensity: 1.45,
      hemiIntensity: 0.72,
      cloudTint: '#FED7AA',
      fogColor: 0xfb923c,
      fogDensity: 0.011,
      stars: 0.28,
      particleColor: '#FDE68A',
      particleSize: 0.3,
      particleOpacity: 0.65,
      fallSpeed: 1.1
    },
    misty: {
      label: 'Misty Valley',
      top: '#334155',
      horizon: '#CBD5E1',
      bottom: '#0F172A',
      sun: '#E2E8F0',
      sunIntensity: 1.05,
      hemiIntensity: 0.78,
      cloudTint: '#E2E8F0',
      fogColor: 0x94a3b8,
      fogDensity: 0.019,
      stars: 0.1,
      particleColor: '#E2E8F0',
      particleSize: 0.36,
      particleOpacity: 0.5,
      fallSpeed: 0.7
    },
    rain: {
      label: 'Monsoon Rain',
      top: '#1E293B',
      horizon: '#475569',
      bottom: '#0F172A',
      sun: '#94A3B8',
      sunIntensity: 0.82,
      hemiIntensity: 0.65,
      cloudTint: '#94A3B8',
      fogColor: 0x475569,
      fogDensity: 0.017,
      stars: 0,
      particleColor: '#BAE6FD',
      particleSize: 0.22,
      particleOpacity: 0.82,
      fallSpeed: 18.0
    },
    starry_night: {
      label: 'Starry Night',
      top: '#020617',
      horizon: '#1E1B4B',
      bottom: '#020617',
      sun: '#C7D2FE',
      sunIntensity: 0.62,
      hemiIntensity: 0.44,
      cloudTint: '#475569',
      fogColor: 0x0f172a,
      fogDensity: 0.014,
      stars: 0.95,
      particleColor: '#67E8F9',
      particleSize: 0.32,
      particleOpacity: 0.78,
      fallSpeed: 0.5
    }
  };

  let activeWeather = initialWeather;
  const targetSunDir = new THREE.Vector3(0.45, 0.55, -0.7);

  return {
    root,
    skyDome,
    sunLight,
    hemiLight,
    update: (dt, elapsed, playerPos, weather) => {
      activeWeather = weather;
      const cfg = weatherThemes[activeWeather];

      const sunAngle = elapsed * 0.025;
      targetSunDir.set(
        Math.cos(sunAngle) * 0.55,
        weather === 'golden_sunset' ? 0.24 : 0.55,
        -0.72 + Math.sin(sunAngle) * 0.15
      ).normalize();

      sunLight.position.copy(targetSunDir).multiplyScalar(64).add(new THREE.Vector3(playerPos.x, 0, playerPos.z));
      sunLight.target.position.set(playerPos.x, 0, playerPos.z);
      sunLight.target.updateMatrixWorld();
      sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, cfg.sunIntensity, 1 - Math.exp(-3 * dt));
      sunLight.color.lerp(new THREE.Color(cfg.sun), 1 - Math.exp(-3 * dt));
      hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, cfg.hemiIntensity, 1 - Math.exp(-3 * dt));

      cloudMatLower.color.lerp(new THREE.Color(cfg.cloudTint), 1 - Math.exp(-3 * dt));
      cloudMatUpper.color.lerp(new THREE.Color(cfg.cloudTint), 1 - Math.exp(-3 * dt));

      skyDome.update({
        topColor: cfg.top,
        horizonColor: cfg.horizon,
        bottomColor: cfg.bottom,
        sunDirection: targetSunDir,
        starIntensity: cfg.stars,
        time: elapsed
      });

      for (const c of clouds) {
        c.group.position.x += c.speed * dt;
        c.group.position.y = c.baseY + Math.sin(elapsed * 0.3 + c.group.position.z * 0.05) * 0.45;
        if (c.group.position.x > 130) c.group.position.x = -130;
      }

      weatherMat.color.set(cfg.particleColor);
      weatherMat.size = cfg.particleSize;
      weatherMat.opacity = cfg.particleOpacity;

      const attr = weatherGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        let x = pPositions[ix] + Math.sin(elapsed * 1.4 + i) * (weather === 'rain' ? 0.4 : 1.3) * dt;
        let y = pPositions[ix + 1] - cfg.fallSpeed * dt;
        let z = pPositions[ix + 2] + Math.cos(elapsed * 1.1 + i) * 0.6 * dt;

        if (y < 0.2) {
          y = 22 + Math.random() * 6;
          x = playerPos.x + (Math.random() - 0.5) * 52;
          z = playerPos.z + (Math.random() - 0.5) * 52;
        }
        pPositions[ix] = x;
        pPositions[ix + 1] = y;
        pPositions[ix + 2] = z;
      }
      attr.needsUpdate = true;

      return {
        timeLabel: cfg.label,
        fogColor: cfg.fogColor,
        fogDensity: cfg.fogDensity
      };
    }
  };
}
