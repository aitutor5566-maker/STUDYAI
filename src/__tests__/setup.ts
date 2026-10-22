import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import * as THREE from 'three';

// Mock WebGLRenderer for Headless Vitest Testing
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof THREE>();
  class MockWebGLRenderer {
    domElement = document.createElement('canvas');
    shadowMap = { enabled: false };
    setSize = vi.fn();
    setPixelRatio = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
    constructor() {}
  }
  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  };
});

// Mock Web Speech API SpeechSynthesis
if (typeof window !== 'undefined') {
  window.speechSynthesis = {
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    getVoices: () => [],
    pending: false,
    speaking: false,
    paused: false,
    onvoiceschanged: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  } as any;

  (window as any).SpeechSynthesisUtterance = class {
    text: string;
    lang: string = 'en-US';
    rate: number = 1;
    pitch: number = 1;
    volume: number = 1;
    voice: any = null;
    onstart: any = null;
    onend: any = null;
    onerror: any = null;
    constructor(text: string) {
      this.text = text;
    }
  };

  // Mock matchMedia
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

  // Mock scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = function () {};
}
