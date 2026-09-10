#!/usr/bin/env node
/**
 * Upsert Circle K stores into Supabase from public/data/stores.json
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/import-stores.mjs
 *
 * Falls back to REACT_APP_* from .env.local if present.
 * Publishable anon keys may work if RLS write policies allow it.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadEnvLocal() {
  const p = path.join(root, '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

loadEnvLocal();

const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.REACT_APP_SUPABASE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL / SUPABASE_KEY');
  process.exit(1);
}

const stores = JSON.parse(
  fs.readFileSync(path.join(root, 'public/data/stores.json'), 'utf8')
).map((s) => ({
  site_number: String(s.site_number),
  business_unit: s.business_unit || null,
  address: s.address || null,
  city: s.city || null,
  state: s.state || null,
  zip: s.zip || null,
  reset_date: s.reset_note ? null : s.reset_date || null,
  reset_note: s.reset_note || null,
  pog_set: s.pog_set != null ? String(s.pog_set) : null,
  rep_name: s.rep_name || null,
  assigned_to: (s.assigned_to || '').toLowerCase() || null,
  closing: Boolean(s.closing),
  lat: Number.isFinite(Number(s.lat)) ? Number(s.lat) : null,
  lng: Number.isFinite(Number(s.lng)) ? Number(s.lng) : null,
}));

const supabase = createClient(url, key);
const BATCH = 200;

async function main() {
  console.log(`Upserting ${stores.length} stores to ${url}`);
  let ok = 0;
  for (let i = 0; i < stores.length; i += BATCH) {
    const chunk = stores.slice(i, i + BATCH);
    const { error } = await supabase.from('stores').upsert(chunk, {
      onConflict: 'site_number',
    });
    if (error) {
      console.error(`Batch ${i}-${i + chunk.length} failed:`, error.message);
      process.exit(1);
    }
    ok += chunk.length;
    console.log(`  ${ok}/${stores.length}`);
  }
  const { count, error } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true });
  if (error) console.warn('Count check failed:', error.message);
  else console.log(`Done. stores table count=${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
