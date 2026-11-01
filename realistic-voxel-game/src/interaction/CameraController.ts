import * as THREE from 'three';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private isMouseDown = false;
  private isRightMouseDown = false;
  private prevMouseX = 0;
  private prevMouseY = 0;

  // Spherical coordinates around target
  private target = new THREE.Vector3(8, 4, 8);
  private radius = 24;
  private theta = Math.PI / 4; // azimuth
  private phi = Math.PI / 4; // polar angle

  private onMouseDownBind: (e: MouseEvent) => void;
  private onMouseMoveBind: (e: MouseEvent) => void;
  private onMouseUpBind: (e: MouseEvent) => void;
  private onWheelBind: (e: WheelEvent) => void;
  private onContextMenuBind: (e: MouseEvent) => void;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.onMouseDownBind = (e) => this.onMouseDown(e);
    this.onMouseMoveBind = (e) => this.onMouseMove(e);
    this.onMouseUpBind = (e) => this.onMouseUp(e);
    this.onWheelBind = (e) => this.onWheel(e);
    this.onContextMenuBind = (e) => e.preventDefault();

    this.domElement.addEventListener('mousedown', this.onMouseDownBind);
    window.addEventListener('mousemove', this.onMouseMoveBind);
    window.addEventListener('mouseup', this.onMouseUpBind);
    this.domElement.addEventListener('wheel', this.onWheelBind, { passive: false });
    this.domElement.addEventListener('contextmenu', this.onContextMenuBind);

    this.updateCamera();
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      this.isMouseDown = true;
    } else if (e.button === 2) {
      this.isRightMouseDown = true;
    }
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown && !this.isRightMouseDown) return;

    const deltaX = e.clientX - this.prevMouseX;
    const deltaY = e.clientY - this.prevMouseY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    if (this.isMouseDown) {
      // Orbit rotation
      this.theta -= deltaX * 0.008;
      this.phi -= deltaY * 0.008;
      // Clamp phi to prevent flip
      this.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.phi));
      this.updateCamera();
    } else if (this.isRightMouseDown) {
      // Pan
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      this.camera.getWorldDirection(right);
      right.cross(up).normalize();

      this.target.addScaledVector(right, -deltaX * 0.02);
      this.target.y += deltaY * 0.02;
      this.updateCamera();
    }
  }

  private onMouseUp(e: MouseEvent): void {
    if (e.button === 0) this.isMouseDown = false;
    if (e.button === 2) this.isRightMouseDown = false;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    this.radius += e.deltaY * 0.02;
    this.radius = Math.max(5, Math.min(80, this.radius));
    this.updateCamera();
  }

  public updateCamera(): void {
    const x = this.target.x + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.target.y + this.radius * Math.cos(this.phi);
    const z = this.target.z + this.radius * Math.sin(this.phi) * Math.cos(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  public dispose(): void {
    this.domElement.removeEventListener('mousedown', this.onMouseDownBind);
    window.removeEventListener('mousemove', this.onMouseMoveBind);
    window.removeEventListener('mouseup', this.onMouseUpBind);
    this.domElement.removeEventListener('wheel', this.onWheelBind);
    this.domElement.removeEventListener('contextmenu', this.onContextMenuBind);
  }
}
