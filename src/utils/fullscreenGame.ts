export async function enterElementFullscreen(element: HTMLElement | null): Promise<boolean> {
  if (!element || typeof document === 'undefined') return false;
  try {
    if (document.fullscreenElement === element) return true;
    const req =
      element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen;
    if (typeof req === 'function') {
      await req.call(element);
      return Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
    }
  } catch {
    // Fullscreen denied or unsupported (e.g. iOS Safari or non-gesture) -> fallback to full-viewport immersive mode
  }
  return false;
}

export async function exitBrowserFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
    if (!fsEl) return;
    const exit =
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen;
    if (typeof exit === 'function') {
      await exit.call(document);
    }
  } catch {
    // Ignore errors when already exited
  }
}

export function isBrowserFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
}
