import * as THREE from 'three';

export type PbrMaterialKind =
  | 'stone'
  | 'wood'
  | 'grass'
  | 'metal'
  | 'fabric'
  | 'water'
  | 'arcane'
  | 'sand'
  | 'snow'
  | 'bark'
  | 'roof';

export interface PbrTextureSet {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  aoMap: THREE.CanvasTexture;
  metalnessMap?: THREE.CanvasTexture;
}

const textureSetCache = new Map<string, PbrTextureSet>();
let softGlowTextureCache: THREE.CanvasTexture | null = null;
let contactShadowTextureCache: THREE.CanvasTexture | null = null;

function createCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const dummyImgData = {
      data: new Uint8ClampedArray(size * size * 4),
      width: size,
      height: size,
      colorSpace: 'srgb' as PredefinedColorSpace
    };
    const stubCtx = {
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      fillRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      roundRect: () => {},
      fill: () => {},
      stroke: () => {},
      drawImage: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createImageData: () => dummyImgData,
      getImageData: () => dummyImgData,
      putImageData: () => {}
    } as unknown as CanvasRenderingContext2D;
    return [canvas, stubCtx];
  }
  return [canvas, ctx];
}

function makeSeededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Converts a grayscale height canvas into a tangent-space normal map CanvasTexture.
 */
function buildNormalMapFromHeightCanvas(
  heightCanvas: HTMLCanvasElement,
  strength: number,
  repeatX: number,
  repeatY: number
): THREE.CanvasTexture {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const srcCtx = heightCanvas.getContext('2d');
  const srcData = srcCtx
    ? srcCtx.getImageData(0, 0, w, h).data
    : new Uint8ClampedArray(w * h * 4);

  const [normCanvas, normCtx] = createCanvas(w);
  const outImg = normCtx.createImageData(w, h);
  const out = outImg.data;

  const sample = (x: number, y: number): number => {
    const wx = ((x % w) + w) % w;
    const wy = ((y % h) + h) % h;
    return srcData[(wy * w + wx) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hL = sample(x - 1, y);
      const hR = sample(x + 1, y);
      const hU = sample(x, y - 1);
      const hD = sample(x, y + 1);

      const dx = (hL - hR) * strength;
      const dy = (hU - hD) * strength;
      const dz = 1.0;
      const invLen = 1 / Math.sqrt(dx * dx + dy * dy + dz * dz);

      const idx = (y * w + x) * 4;
      out[idx] = Math.round((dx * invLen * 0.5 + 0.5) * 255);
      out[idx + 1] = Math.round((dy * invLen * 0.5 + 0.5) * 255);
      out[idx + 2] = Math.round((dz * invLen * 0.5 + 0.5) * 255);
      out[idx + 3] = 255;
    }
  }

  normCtx.putImageData(outImg, 0, 0);
  const tex = new THREE.CanvasTexture(normCanvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.needsUpdate = true;
  return tex;
}

function finalizeColorTexture(
  canvas: HTMLCanvasElement,
  repeatX: number,
  repeatY: number,
  isColor: boolean
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates or returns cached procedural PBR textures (albedo, normal, roughness).
 */
export function getPbrTextureSet(
  kind: PbrMaterialKind,
  repeatX = 1,
  repeatY = 1,
  resolution: 128 | 256 | 512 = 256
): PbrTextureSet {
  const key = `${kind}:${repeatX}:${repeatY}:${resolution}`;
  const cached = textureSetCache.get(key);
  if (cached) return cached;

  const size = resolution;
  const rand = makeSeededRandom(
    kind.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17)
  );

  const [diffCanvas, diffCtx] = createCanvas(size);
  const [heightCanvas, heightCtx] = createCanvas(size);
  const [roughCanvas, roughCtx] = createCanvas(size);

  if (kind === 'stone') {
    diffCtx.fillStyle = '#94a3b8';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#888888';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#c8c8c8';
    roughCtx.fillRect(0, 0, size, size);

    // Subtle stone block grid + pitted mineral grain
    const rows = 4;
    const cols = 4;
    const cellW = size / cols;
    const cellH = size / rows;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (cellW * 0.5);
      for (let c = -1; c <= cols; c++) {
        const bx = c * cellW + offset;
        const by = r * cellH;
        const shade = Math.floor(135 + rand() * 35);
        diffCtx.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`;
        diffCtx.fillRect(bx + 2, by + 2, cellW - 4, cellH - 4);
        const hVal = Math.floor(150 + rand() * 45);
        heightCtx.fillStyle = `rgb(${hVal},${hVal},${hVal})`;
        heightCtx.fillRect(bx + 2, by + 2, cellW - 4, cellH - 4);
      }
    }
    for (let i = 0; i < 1800; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const s = 1 + rand() * 3;
      const v = rand() > 0.5 ? 210 : 75;
      diffCtx.fillStyle = `rgba(${v},${v},${v},0.12)`;
      diffCtx.fillRect(x, y, s, s);
      heightCtx.fillStyle = `rgba(${v},${v},${v},0.22)`;
      heightCtx.fillRect(x, y, s, s);
    }
  } else if (kind === 'wood') {
    diffCtx.fillStyle = '#8b5a2b';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#808080';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#b8b8b8';
    roughCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 2) {
      const wave = Math.sin(y * 0.08) * 14 + (rand() - 0.5) * 16;
      const r = Math.min(255, Math.max(0, 132 + wave));
      const g = Math.min(255, Math.max(0, 86 + wave * 0.65));
      const b = Math.min(255, Math.max(0, 46 + wave * 0.4));
      diffCtx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      diffCtx.fillRect(0, y, size, 2);

      const hv = Math.min(255, Math.max(0, 128 + wave * 2));
      heightCtx.fillStyle = `rgb(${hv | 0},${hv | 0},${hv | 0})`;
      heightCtx.fillRect(0, y, size, 2);
    }
    // Plank seams
    for (let p = 0; p < 4; p++) {
      const py = p * (size / 4);
      diffCtx.fillStyle = 'rgba(28, 16, 8, 0.45)';
      diffCtx.fillRect(0, py, size, 2);
      heightCtx.fillStyle = '#202020';
      heightCtx.fillRect(0, py, size, 2);
    }
  } else if (kind === 'grass') {
    diffCtx.fillStyle = '#4d8b31';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#808080';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#dcdcdc';
    roughCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 2400; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const len = 3 + rand() * 6;
      const g = Math.floor(115 + rand() * 75);
      const r = Math.floor(55 + rand() * 45);
      const b = Math.floor(35 + rand() * 30);
      diffCtx.fillStyle = `rgb(${r},${g},${b})`;
      diffCtx.fillRect(x, y, 2, len);
      const hv = Math.floor(110 + rand() * 110);
      heightCtx.fillStyle = `rgb(${hv},${hv},${hv})`;
      heightCtx.fillRect(x, y, 2, len);
    }
  } else if (kind === 'metal') {
    diffCtx.fillStyle = '#cbd5e1';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#808080';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#525252';
    roughCtx.fillRect(0, 0, size, size);

    // Brushed anisotropic streaks + subtle panel lines
    for (let y = 0; y < size; y++) {
      const streak = Math.floor(195 + (rand() - 0.5) * 28);
      diffCtx.fillStyle = `rgb(${streak},${streak + 4},${streak + 8})`;
      diffCtx.fillRect(0, y, size, 1);
      const hv = Math.floor(124 + (rand() - 0.5) * 18);
      heightCtx.fillStyle = `rgb(${hv},${hv},${hv})`;
      heightCtx.fillRect(0, y, size, 1);
    }
    diffCtx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
    diffCtx.lineWidth = 2;
    diffCtx.strokeRect(2, 2, size - 4, size - 4);
    diffCtx.beginPath();
    diffCtx.moveTo(0, size / 2);
    diffCtx.lineTo(size, size / 2);
    diffCtx.stroke();

    heightCtx.strokeStyle = '#303030';
    heightCtx.lineWidth = 2;
    heightCtx.strokeRect(2, 2, size - 4, size - 4);
  } else if (kind === 'fabric') {
    diffCtx.fillStyle = '#d1d5db';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#808080';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#e5e5e5';
    roughCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        const even = ((x + y) / 4) % 2 === 0;
        const v = even ? 215 : 180;
        diffCtx.fillStyle = `rgb(${v},${v},${v})`;
        diffCtx.fillRect(x, y, 3, 3);
        const hv = even ? 165 : 95;
        heightCtx.fillStyle = `rgb(${hv},${hv},${hv})`;
        heightCtx.fillRect(x, y, 3, 3);
      }
    }
  } else if (kind === 'water') {
    diffCtx.fillStyle = '#0ea5e9';
    diffCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#141414';
    roughCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const w1 = Math.sin((x / size) * Math.PI * 6 + Math.cos((y / size) * Math.PI * 4));
        const w2 = Math.cos((y / size) * Math.PI * 8 - Math.sin((x / size) * Math.PI * 6));
        const hv = Math.floor(128 + (w1 + w2) * 45);
        heightCtx.fillStyle = `rgb(${hv},${hv},${hv})`;
        heightCtx.fillRect(x, y, 1, 1);
      }
    }
  } else if (kind === 'sand') {
    diffCtx.fillStyle = '#d6b47a';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#808080';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#d8d8d8';
    roughCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 6) {
      const wave = Math.sin((y / size) * Math.PI * 6) * 8;
      diffCtx.fillStyle = `rgba(194,154,92,${0.12 + rand() * 0.1})`;
      diffCtx.fillRect(0, y, size, 3);
      heightCtx.fillStyle = `rgb(${120 + wave},${120 + wave},${120 + wave})`;
      heightCtx.fillRect(0, y, size, 4);
    }
    for (let i = 0; i < 650; i++) {
      const x = rand() * size;
      const y = rand() * size;
      diffCtx.fillStyle = rand() > 0.5 ? 'rgba(255,245,220,0.18)' : 'rgba(130,96,52,0.16)';
      diffCtx.fillRect(x, y, 2, 2);
    }
  } else if (kind === 'snow') {
    diffCtx.fillStyle = '#e8f1fb';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#888888';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#8a8a8a';
    roughCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 500; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 3 + rand() * 14;
      diffCtx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(186,210,238,0.18)';
      diffCtx.beginPath();
      diffCtx.arc(x, y, r, 0, Math.PI * 2);
      diffCtx.fill();
      heightCtx.fillStyle = rand() > 0.5 ? 'rgba(215,215,215,0.25)' : 'rgba(105,105,105,0.2)';
      heightCtx.beginPath();
      heightCtx.arc(x, y, r, 0, Math.PI * 2);
      heightCtx.fill();
    }
  } else if (kind === 'bark') {
    diffCtx.fillStyle = '#5c4033';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#757575';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#e4e4e4';
    roughCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 120; i++) {
      const x = rand() * size;
      const w = 2 + rand() * 5;
      diffCtx.fillStyle = rand() > 0.5 ? '#3e2723' : '#795548';
      diffCtx.fillRect(x, 0, w, size);
      heightCtx.fillStyle = rand() > 0.5 ? '#3a3a3a' : '#b8b8b8';
      heightCtx.fillRect(x, 0, w, size);
    }
  } else if (kind === 'roof') {
    diffCtx.fillStyle = '#475569';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#808080';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#9a9a9a';
    roughCtx.fillRect(0, 0, size, size);

    const tileH = Math.max(16, Math.round(size / 8));
    const tileW = Math.max(16, Math.round(size / 8));
    for (let row = 0; row < size; row += tileH) {
      const offset = (Math.floor(row / tileH) % 2) * (tileW / 2);
      for (let col = -tileW; col < size + tileW; col += tileW) {
        const shade = Math.floor(65 + rand() * 25);
        diffCtx.fillStyle = `rgb(${shade},${shade + 10},${shade + 24})`;
        diffCtx.fillRect(col + offset + 1, row + 1, tileW - 2, tileH - 2);
        heightCtx.fillStyle = `rgb(${140 + Math.floor(rand() * 35)},140,140)`;
        heightCtx.fillRect(col + offset + 2, row + 2, tileW - 4, tileH - 4);
      }
    }
  } else {
    // arcane
    diffCtx.fillStyle = '#0f172a';
    diffCtx.fillRect(0, 0, size, size);
    heightCtx.fillStyle = '#707070';
    heightCtx.fillRect(0, 0, size, size);
    roughCtx.fillStyle = '#606060';
    roughCtx.fillRect(0, 0, size, size);

    diffCtx.strokeStyle = '#38bdf8';
    diffCtx.lineWidth = 2;
    heightCtx.strokeStyle = '#dcdcdc';
    heightCtx.lineWidth = 2;
    for (let i = 32; i < size; i += 64) {
      diffCtx.strokeRect(i - 18, i - 18, 36, 36);
      heightCtx.strokeRect(i - 18, i - 18, 36, 36);
    }
  }

  // Derive Ambient Occlusion canvas from heightCanvas (darker crevices = deeper AO)
  const [aoCanvas, aoCtx] = createCanvas(size);
  aoCtx.drawImage(heightCanvas, 0, 0);
  const aoImg = aoCtx.getImageData(0, 0, size, size);
  for (let i = 0; i < aoImg.data.length; i += 4) {
    const h = aoImg.data[i];
    const ao = Math.min(255, Math.max(95, Math.round(115 + (h / 255) * 140)));
    aoImg.data[i] = ao;
    aoImg.data[i + 1] = ao;
    aoImg.data[i + 2] = ao;
    aoImg.data[i + 3] = 255;
  }
  aoCtx.putImageData(aoImg, 0, 0);

  let metalnessMap: THREE.CanvasTexture | undefined;
  if (kind === 'metal' || kind === 'arcane') {
    const [metalCanvas, metalCtx] = createCanvas(size);
    metalCtx.fillStyle = kind === 'metal' ? '#e2e2e2' : '#949494';
    metalCtx.fillRect(0, 0, size, size);
    for (let i = 0; i < 60; i++) {
      metalCtx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(60,60,60,0.18)';
      metalCtx.fillRect(0, rand() * size, size, 1 + rand() * 2);
    }
    metalnessMap = finalizeColorTexture(metalCanvas, repeatX, repeatY, false);
  }

  const normalStrength = kind === 'water' ? 2.6 : kind === 'metal' ? 1.1 : 2.1;
  const set: PbrTextureSet = {
    map: finalizeColorTexture(diffCanvas, repeatX, repeatY, true),
    normalMap: buildNormalMapFromHeightCanvas(heightCanvas, normalStrength, repeatX, repeatY),
    roughnessMap: finalizeColorTexture(roughCanvas, repeatX, repeatY, false),
    aoMap: finalizeColorTexture(aoCanvas, repeatX, repeatY, false),
    ...(metalnessMap ? { metalnessMap } : {})
  };
  textureSetCache.set(key, set);
  return set;
}

/**
 * Soft radial glow sprite for lightweight GPU particle systems.
 */
export function getSoftGlowTexture(): THREE.CanvasTexture {
  if (softGlowTextureCache) return softGlowTextureCache;
  const [canvas, ctx] = createCanvas(128);
  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.28, 'rgba(255,255,255,0.75)');
  grad.addColorStop(0.65, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  softGlowTextureCache = tex;
  return tex;
}

/**
 * Soft ground contact shadow decal texture for grounding characters and props.
 */
export function getContactShadowTexture(): THREE.CanvasTexture {
  if (contactShadowTextureCache) return contactShadowTextureCache;
  const [canvas, ctx] = createCanvas(128);
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(2, 6, 23, 0.56)');
  grad.addColorStop(0.55, 'rgba(2, 6, 23, 0.24)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  contactShadowTextureCache = tex;
  return tex;
}
