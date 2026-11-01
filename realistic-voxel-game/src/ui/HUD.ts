export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  physicsBodies: number;
}

export class HUD {
  private container: HTMLDivElement;
  private metricsElement: HTMLDivElement;
  private statusElement: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'hud-container';
    this.container.style.position = 'fixed';
    this.container.style.top = '12px';
    this.container.style.left = '12px';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '12px';
    this.container.style.lineHeight = '1.5';
    this.container.style.color = '#e2e8f0';
    this.container.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
    this.container.style.backdropFilter = 'blur(6px)';
    this.container.style.padding = '12px 16px';
    this.container.style.borderRadius = '8px';
    this.container.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    this.container.style.zIndex = '1000';
    this.container.style.pointerEvents = 'none';

    this.container.innerHTML = `
      <div style="font-weight: bold; font-size: 13px; color: #38bdf8; margin-bottom: 6px;">
        Voxel Engine Verification Baseline
      </div>
      <div id="hud-status" style="margin-bottom: 8px; color: #fbbf24;">Initializing WebGL & Physics...</div>
      <div id="hud-metrics"></div>
      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
        Controls: Left Mouse to Orbit | Right Mouse to Pan | Scroll to Zoom | Click "Drop Block" to test physics
      </div>
    `;

    document.body.appendChild(this.container);
    this.metricsElement = this.container.querySelector('#hud-metrics')!;
    this.statusElement = this.container.querySelector('#hud-status')!;
  }

  public setStatus(text: string, color: string = '#4ade80'): void {
    this.statusElement.textContent = text;
    this.statusElement.style.color = color;
  }

  public updateMetrics(metrics: PerformanceMetrics): void {
    this.metricsElement.innerHTML = `
      <div>FPS: <b>${metrics.fps.toFixed(0)}</b> (${metrics.frameTimeMs.toFixed(1)} ms)</div>
      <div>Draw Calls: <b>${metrics.drawCalls}</b> | Triangles: <b>${metrics.triangles.toLocaleString()}</b></div>
      <div>Active Physics Bodies: <b>${metrics.physicsBodies}</b></div>
    `;
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
