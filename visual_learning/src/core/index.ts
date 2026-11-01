export interface SceneConfig {
  antialias?: boolean;
  alpha?: boolean;
  shadows?: boolean;
  clearColor?: number;
  clearAlpha?: number;
}

export class CoreSceneManager {
  private config: SceneConfig;

  constructor(config: SceneConfig = {}) {
    this.config = {
      antialias: true,
      alpha: true,
      shadows: true,
      clearColor: 0x0f172a,
      clearAlpha: 1,
      ...config,
    };
  }

  public getConfig(): SceneConfig {
    return this.config;
  }
}
