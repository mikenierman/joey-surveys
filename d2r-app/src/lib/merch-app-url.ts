/**
 * JOEY / Circle K field merchandising host (embedded via iframe).
 * Prefer NEXT_PUBLIC_MERCH_APP_URL; fall back so staging/prod always has a target.
 */
export function getMerchAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_MERCH_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return 'https://joey-surveys.vercel.app';
  }
  return 'http://localhost:3000';
}
