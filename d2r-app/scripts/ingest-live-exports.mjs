#!/usr/bin/env node
/**
 * Ingest live admin JSON captures into d2r-app/data/seed/.
 *
 * Usage:
 *   node d2r-app/scripts/ingest-live-exports.mjs [liveDir]
 *
 * Default liveDir:
 *   D2R-COMPANY/ops/exports/2026-09-16/live/
 *
 * Filename patterns map to known seed files. Unmatched JSON is listed,
 * not copied. Merchandising keeps period-specific names when possible.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..');
const seedDir = path.join(appRoot, 'data', 'seed');

const liveDir =
  process.argv[2] ||
  path.join(repoRoot, 'D2R-COMPANY/ops/exports/2026-09-16/live');

/** Ordered: first match wins. More specific patterns before broad ones. */
const MAP = [
  { match: /ledger[-_]?by[-_]?rep[-_]?brand[-_]?product/i, dest: 'ledger-by-rep-brand-product.json' },
  { match: /ledger[-_]?by[-_]?rep[-_]?brand/i, dest: 'ledger-by-rep-brand.json' },
  { match: /ledger[-_]?(performance|perf)/i, dest: 'ledger-performance.json' },
  { match: /brand[-_]?levels?/i, dest: 'brand-levels.json' },
  { match: /warehouse/i, dest: 'warehouses.json' },
  { match: /inventory/i, dest: 'inventory-sample.json' },
  { match: /merchandising/i, dest: null }, // resolved dynamically
  { match: /shopify[-_]?health/i, dest: 'shopify-health.json' },
  { match: /shopify/i, dest: 'shopify-shops.json' },
  { match: /transfer/i, dest: 'transfers.json' },
  { match: /order/i, dest: 'orders.json' },
  { match: /commission/i, dest: 'commissions.json' },
  { match: /settlement/i, dest: 'settlements.json' },
  { match: /payout/i, dest: 'payouts.json' },
  { match: /business(es)?/i, dest: 'businesses.json' },
  { match: /retail[-_]?stores?|stores?/i, dest: 'stores.json' },
  { match: /assign/i, dest: 'rep-assignments.json' },
  { match: /pulse/i, dest: 'pulse-signals.json' },
  { match: /dashboard|kpi/i, dest: 'dashboard-kpis.json' },
  { match: /users?/i, dest: 'users.json' },
];

const COUNT_KEYS = [
  'warehouses',
  'rows',
  'reps',
  'users',
  'shops',
  'transfers',
  'orders',
  'commissions',
  'settlements',
  'payouts',
  'businesses',
  'brands',
  'stores',
  'signals',
  'assignments',
  'items',
  'data',
  'results',
];

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.toLowerCase().endsWith('.json'))
    .map((n) => path.join(dir, n))
    .sort();
}

function resolveMerchDest(base) {
  if (/q2/i.test(base)) return 'merchandising-joey_circle_k-2026-Q2.json';
  if (/q3/i.test(base)) return 'merchandising-joey_circle_k-2026-Q3.json';
  if (/q4/i.test(base)) return 'merchandising-joey_circle_k-2026-Q4.json';
  // Prefer keeping a stable Q3 default for unnamed merch dumps
  return 'merchandising-joey_circle_k-2026-Q3.json';
}

function resolveDest(base) {
  const rule = MAP.find((m) => m.match.test(base));
  if (!rule) return null;
  if (rule.dest === null && /merchandising/i.test(base)) {
    return resolveMerchDest(base);
  }
  return rule.dest;
}

function countRows(data) {
  if (Array.isArray(data)) return data.length;
  if (!data || typeof data !== 'object') return 0;
  for (const key of COUNT_KEYS) {
    if (Array.isArray(data[key])) return data[key].length;
  }
  if (typeof data.meta?.count === 'number') return data.meta.count;
  // Largest top-level array as fallback
  let max = 0;
  for (const v of Object.values(data)) {
    if (Array.isArray(v) && v.length > max) max = v.length;
  }
  return max;
}

function prettyWrite(destPath, data) {
  fs.writeFileSync(destPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

fs.mkdirSync(seedDir, { recursive: true });
fs.mkdirSync(liveDir, { recursive: true });

const files = listJsonFiles(liveDir);
const ingested = [];
const unmatched = [];
const errors = [];

console.log(`Live dir:  ${liveDir}`);
console.log(`Seed dir:  ${seedDir}`);
console.log(`JSON files found: ${files.length}\n`);

for (const file of files) {
  const base = path.basename(file);
  const destName = resolveDest(base);
  if (!destName) {
    unmatched.push(base);
    continue;
  }

  try {
    const raw = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(raw);
    const destPath = path.join(seedDir, destName);
    prettyWrite(destPath, data);
    const rows = countRows(data);
    ingested.push({ source: base, dest: destName, rows });
    console.log(`✓ ${base} → ${destName}  (${rows} rows)`);
  } catch (err) {
    errors.push({ source: base, error: err.message });
    console.error(`✗ ${base}: ${err.message}`);
  }
}

console.log('\n--- Summary ---');
console.log(`Ingested:   ${ingested.length}`);
console.log(`Unmatched:  ${unmatched.length}`);
console.log(`Errors:     ${errors.length}`);

if (ingested.length) {
  console.log('\nSeed updates:');
  for (const row of ingested) {
    console.log(`  ${row.dest.padEnd(42)} ${String(row.rows).padStart(6)} rows  ← ${row.source}`);
  }
  const totalRows = ingested.reduce((s, r) => s + r.rows, 0);
  console.log(`\nTotal mapped rows: ${totalRows}`);
}

if (unmatched.length) {
  console.log('\nUnmatched (left in live/, not copied):');
  for (const name of unmatched) console.log(`  - ${name}`);
}

if (!files.length) {
  console.log(
    '\nNo live JSON yet. Drop captures into live/, then re-run:\n' +
      '  node d2r-app/scripts/ingest-live-exports.mjs'
  );
}

process.exit(errors.length ? 1 : 0);
