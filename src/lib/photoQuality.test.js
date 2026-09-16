import { laplacianVariance, framingScore, BLUR_THRESHOLD } from './photoQuality';

function makeImageData(w, h, fill = [128, 128, 128, 255]) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = fill[3];
  }
  return { data, width: w, height: h };
}

describe('photoQuality', () => {
  test('flat image has low laplacian variance (blurry proxy)', () => {
    const flat = makeImageData(40, 40, [100, 100, 100, 255]);
    expect(laplacianVariance(flat)).toBeLessThan(BLUR_THRESHOLD);
  });

  test('checker pattern has higher variance', () => {
    const img = makeImageData(40, 40);
    for (let y = 0; y < 40; y += 1) {
      for (let x = 0; x < 40; x += 1) {
        const on = (x + y) % 2 === 0;
        const i = (y * 40 + x) * 4;
        const v = on ? 0 : 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
      }
    }
    expect(laplacianVariance(img)).toBeGreaterThan(BLUR_THRESHOLD);
  });

  test('framingScore penalizes dark frames', () => {
    const dark = makeImageData(20, 20, [5, 5, 5, 255]);
    const mid = makeImageData(20, 20, [120, 120, 120, 255]);
    expect(framingScore(dark).score).toBeLessThan(framingScore(mid).score);
  });
});
