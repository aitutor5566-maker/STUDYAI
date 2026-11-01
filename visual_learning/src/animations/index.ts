export interface CameraTransitionConfig {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  durationMs: number;
  easing?: 'linear' | 'easeInQuad' | 'easeInOutCubic';
}

export interface ExplodeAnimationConfig {
  factor: number;
  durationMs: number;
  spreadDirection?: [number, number, number];
}
