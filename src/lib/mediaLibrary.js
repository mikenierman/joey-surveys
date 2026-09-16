import { getCachedProgram } from './programConfig';

/**
 * POG / sell-sheet media library helpers.
 * Assets live under public/media/{brand}/ — JOEY supplies final artwork.
 */

export function sellSheetUrl(program = getCachedProgram()) {
  return program.media?.sellSheet || '/media/joey/sell-sheet.svg';
}

export function pogUrlForSet(pogSet, program = getCachedProgram()) {
  const n = String(pogSet || '').replace(/[^0-9]/g, '') || '1';
  const base = program.media?.pogBase || '/media/joey/pog';
  return `${base}/set-${n}.svg`;
}

export async function resolveMediaUrl(url) {
  if (!url) return { url: null, ok: false };
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return { url, ok: true };
  } catch {
    /* missing */
  }
  return { url, ok: false };
}
