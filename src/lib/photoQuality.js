/**
 * Phase A photo quality: client-side blur / framing heuristics.
 * Does not call external AI — reps confirm / retake before submit.
 */

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid image'));
    img.src = dataUrl;
  });
}

/** Laplacian variance proxy for blur (higher = sharper). */
export function laplacianVariance(imageData) {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const lap =
        -gray[i - width] - gray[i - 1] + 4 * gray[i] - gray[i + 1] - gray[i + width];
      sum += lap;
      sumSq += lap * lap;
      n += 1;
    }
  }
  if (!n) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

export function framingScore(imageData) {
  const { data, width, height } = imageData;
  let edge = 0;
  let dark = 0;
  const total = width * height;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < 28) dark += 1;
    if (lum > 240) edge += 1;
  }
  const darkRatio = dark / total;
  const brightRatio = edge / total;
  // Prefer neither mostly black nor blown-out
  const score = Math.max(0, 1 - darkRatio * 1.4 - brightRatio * 1.2);
  return { score, darkRatio, brightRatio };
}

export const BLUR_THRESHOLD = 45;
export const FRAMING_THRESHOLD = 0.35;

/**
 * Analyze a JPEG/PNG data URL. Returns quality object for storage on the photo.
 */
export async function analyzePhotoDataUrl(dataUrl, maxSide = 320) {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(32, Math.round(img.width * scale));
  const h = Math.max(32, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const blurVar = laplacianVariance(imageData);
  const framing = framingScore(imageData);
  const blurOk = blurVar >= BLUR_THRESHOLD;
  const framingOk = framing.score >= FRAMING_THRESHOLD;
  let message = null;
  if (!blurOk && !framingOk) message = 'Photo looks blurry and poorly lit — retake recommended';
  else if (!blurOk) message = 'Photo looks blurry — hold steady and retake';
  else if (!framingOk) message = 'Photo may be too dark or washed out — retake recommended';
  return {
    blurVariance: Math.round(blurVar * 10) / 10,
    framingScore: Math.round(framing.score * 100) / 100,
    blurOk,
    framingOk,
    ok: blurOk && framingOk,
    message,
  };
}
