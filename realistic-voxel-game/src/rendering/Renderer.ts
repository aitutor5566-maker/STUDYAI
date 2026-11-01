import * as THREE from 'three';

export interface RendererOptions {
  container: HTMLElement;
  enableShadows?: boolean;
}

export class Renderer {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  private readonly container: HTMLElement;
  private resizeHandler: () => void;

  constructor(options: RendererOptions) {
    this.container = options.container;

    // 1. Verify WebGL 2 availability
    if (!this.isWebGL2Supported()) {
      const errMsg =
        'WebGL 2 is not supported or is disabled in your browser/graphics environment.';
      this.displayWebGLError(errMsg);
      throw new Error(errMsg);
    }

    // 2. Initialize Three.js Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(12, 14, 18);
    this.camera.lookAt(0, 4, 0);

    // 3. Initialize WebGLRenderer with high-fidelity color & lighting defaults
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Color space & Tone mapping
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Shadows
    if (options.enableShadows !== false) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.container.appendChild(this.renderer.domElement);

    // 4. Responsive Resize Listener
    this.resizeHandler = () => this.onWindowResize();
    window.addEventListener('resize', this.resizeHandler);
  }

  private isWebGL2Supported(): boolean {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && testCanvas.getContext('webgl2'));
    } catch {
      return false;
    }
  }

  private displayWebGLError(message: string): void {
    const errorBox = document.createElement('div');
    errorBox.id = 'webgl-error-banner';
    errorBox.style.position = 'fixed';
    errorBox.style.top = '50%';
    errorBox.style.left = '50%';
    errorBox.style.transform = 'translate(-50%, -50%)';
    errorBox.style.backgroundColor = '#991b1b';
    errorBox.style.color = '#fef2f2';
    errorBox.style.padding = '24px 32px';
    errorBox.style.borderRadius = '12px';
    errorBox.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
    errorBox.style.zIndex = '99999';
    errorBox.style.maxWidth = '450px';
    errorBox.style.textAlign = 'center';
    errorBox.style.fontFamily = 'sans-serif';
    errorBox.innerHTML = `
      <h3 style="margin-top:0; font-size:18px;">Graphics Initialization Failure</h3>
      <p style="margin-bottom:0; font-size:14px; line-height:1.4;">${message}</p>
    `;
    this.container.appendChild(errorBox);
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    window.removeEventListener('resize', this.resizeHandler);
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
