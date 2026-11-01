import * as THREE from 'three';

export interface AtmosphereConfig {
  sunPosition?: THREE.Vector3;
  sunColor?: number;
  sunIntensity?: number;
  ambientColor?: number;
  ambientIntensity?: number;
  fogColor?: number;
  fogDensity?: number;
}

export class Atmosphere {
  public readonly sunLight: THREE.DirectionalLight;
  public readonly hemiLight: THREE.HemisphereLight;
  public readonly fog: THREE.FogExp2;

  constructor(scene: THREE.Scene, config: AtmosphereConfig = {}) {
    // 1. Sky / Fog colors (realistic atmospheric daylight)
    const skyColor = config.fogColor ?? 0xd0e6f9;
    scene.background = new THREE.Color(skyColor);

    this.fog = new THREE.FogExp2(skyColor, config.fogDensity ?? 0.012);
    scene.fog = this.fog;

    // 2. Realistic Hemisphere illumination (Sky vs Ground bounce)
    this.hemiLight = new THREE.HemisphereLight(
      config.ambientColor ?? 0xffffff,
      0x4a5568, // Ground reflection tone
      config.ambientIntensity ?? 0.7
    );
    scene.add(this.hemiLight);

    // 3. Directional Sun Light with Shadows
    this.sunLight = new THREE.DirectionalLight(
      config.sunColor ?? 0xfff7ed,
      config.sunIntensity ?? 2.2
    );
    const sunPos = config.sunPosition ?? new THREE.Vector3(25, 40, 20);
    this.sunLight.position.copy(sunPos);
    this.sunLight.castShadow = true;

    // Shadow camera bounds
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;

    const d = 25;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0003;

    scene.add(this.sunLight);
  }

  public dispose(scene: THREE.Scene): void {
    scene.remove(this.sunLight);
    scene.remove(this.hemiLight);
    this.sunLight.dispose();
  }
}
