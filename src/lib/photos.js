import { supabase } from './data';

export const PHOTO_BUCKET = 'visit-photos';
export const PHOTO_SLOT_IDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p9'];

export function dataUrlToBlob(dataUrl) {
  const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error('Invalid photo data');
  const mime = m[1] || 'image/jpeg';
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function isHttpUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}

function isDataUrl(s) {
  return typeof s === 'string' && s.startsWith('data:');
}

/**
 * Upload visit photos to Supabase Storage.
 * Returns HTTPS URLs when upload succeeds; falls back to data URLs if Storage is unavailable.
 */
export async function uploadVisitPhotos({ cycleKey, storeNumber, photos }) {
  const out = {};
  const entries = Object.entries(photos || {}).filter(([, p]) => p?.dataUrl || isHttpUrl(p));

  if (!supabase) {
    entries.forEach(([id, photo]) => {
      if (isHttpUrl(photo)) out[id] = photo;
      else if (photo?.dataUrl) out[id] = photo.dataUrl;
    });
    return { photo_urls: out, uploaded: false };
  }

  let uploaded = 0;
  const site = String(storeNumber);
  const cycle = cycleKey || 'cycle';

  for (const [id, photo] of entries) {
    if (isHttpUrl(photo)) {
      out[id] = photo;
      continue;
    }
    const dataUrl = photo?.dataUrl;
    if (!isDataUrl(dataUrl)) continue;

    try {
      const blob = dataUrlToBlob(dataUrl);
      const stamp = Date.now();
      const path = `${cycle}/${site}/${id}-${stamp}.jpg`;
      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: false,
          cacheControl: '3600',
        });
      if (error) throw error;
      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error('No public URL');
      out[id] = data.publicUrl;
      uploaded += 1;
    } catch {
      // Keep data URL so the visit still saves offline / if bucket missing
      out[id] = dataUrl;
    }
  }

  return {
    photo_urls: out,
    uploaded: uploaded > 0 && Object.values(out).every(isHttpUrl),
  };
}
