#!/usr/bin/env node
/**
 * qc-twin-smoke.mjs — minimal twin parity smoke for Traffic Controller.
 *
 * Checks:
 *  1) Required seed JSON files exist under data/seed/
 *  2) Key route page.tsx files exist under src/app/
 *
 * Does NOT start Next, hit HTTP, or validate table headers (see ops/fleet/QC-GATES.md).
 *
 * Usage (from d2r-app/):
 *   node scripts/qc-twin-smoke.mjs
 *   npm run qc:twin-smoke
 *
 * Exit 0 = pass; exit 1 = missing artifacts listed on stderr/stdout.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const seedDir = path.join(root, 'data', 'seed');
const appDir = path.join(root, 'src', 'app');

const REQUIRED_SEEDS = [
  'inventory-sample.json',
  'ledger-performance.json',
  'ledger-by-rep-brand.json',
  'transfers.json',
  'warehouses.json',
  'brand-levels.json',
  'businesses.json',
  'merchandising-joey_circle_k-2026-Q2.json',
  'merchandising-joey_circle_k-2026-Q3.json',
  'orders.json',
  'shopify-health.json',
  'shopify-shops.json',
  'stores.json',
  'pulse-signals.json',
  'users.json',
  'assignments.json',
  'rep-assignments.json',
  'payouts.json',
  'payout-rules.json',
  'commissions.json',
  'settlements.json',
];

/** Route files that must exist for the offline twin audit skeleton. */
const REQUIRED_PAGES = [
  'page.tsx',
  'login/page.tsx',
  'admin/dashboard/page.tsx',
  'admin/inventory/page.tsx',
  'admin/inventory/ledgers/page.tsx',
  'admin/inventory/transfers/page.tsx',
  'admin/inventory/refresh/page.tsx',
  'admin/warehouses/page.tsx',
  'admin/merchandising/page.tsx',
  'admin/merchandising/stores/page.tsx',
  'admin/orders/page.tsx',
  'admin/shopify/page.tsx',
  'admin/stores/page.tsx',
  'admin/pulse/page.tsx',
  'admin/pulse/signals/page.tsx',
  'admin/pulse/goals/page.tsx',
  'admin/pulse/health/page.tsx',
  'admin/pulse/scores/page.tsx',
  'admin/payouts/page.tsx',
  'admin/commissions/page.tsx',
  'admin/settlements/page.tsx',
  'admin/users/page.tsx',
  'admin/rep-assignments/page.tsx',
  'admin/reports/page.tsx',
  'inventory/page.tsx',
  'inventory/transfers/preview/page.tsx',
  'orders/page.tsx',
  'merchandising/page.tsx',
  'stores/page.tsx',
];

const SHARED_LIBS = [
  'src/lib/nav.ts',
  'src/lib/data.ts',
  'src/lib/merch-app-url.ts',
  'src/components/merch-embed.tsx',
  'src/components/dashboard-tabs.tsx',
  'src/components/sample-depth-banner.tsx',
  'src/components/report-proxy-banner.tsx',
  'src/components/pulse-filter-chrome.tsx',
];

/** Source strings that must appear in key pages (iframe / proxy honesty). */
const REQUIRED_SNIPPETS = [
  {
    file: 'src/app/admin/dashboard/page.tsx',
    needle: 'tab=merchandising',
    label: 'dashboard merchandising tab',
  },
  {
    file: 'src/app/admin/dashboard/page.tsx',
    needle: 'MerchEmbed',
    label: 'dashboard MerchEmbed',
  },
  {
    file: 'src/components/merch-embed.tsx',
    needle: 'iframe',
    label: 'merch embed iframe',
  },
  {
    file: 'src/lib/merch-app-url.ts',
    needle: 'joey-surveys.vercel.app',
    label: 'default merch host',
  },
];

function exists(relFromRoot) {
  return fs.existsSync(path.join(root, relFromRoot));
}

const missing = [];

for (const seed of REQUIRED_SEEDS) {
  const p = path.join(seedDir, seed);
  if (!fs.existsSync(p)) missing.push(`seed: data/seed/${seed}`);
}

for (const page of REQUIRED_PAGES) {
  const p = path.join(appDir, page);
  if (!fs.existsSync(p)) missing.push(`page: src/app/${page}`);
}

for (const lib of SHARED_LIBS) {
  if (!exists(lib)) missing.push(`lib: ${lib}`);
}

for (const snip of REQUIRED_SNIPPETS) {
  const abs = path.join(root, snip.file);
  if (!fs.existsSync(abs)) {
    missing.push(`snippet-file: ${snip.file} (${snip.label})`);
    continue;
  }
  const body = fs.readFileSync(abs, 'utf8');
  if (!body.includes(snip.needle)) {
    missing.push(`snippet: ${snip.label} — missing "${snip.needle}" in ${snip.file}`);
  }
}

const liveExportHint = path.join(
  root,
  '..',
  'D2R-COMPANY',
  'ops',
  'exports',
  '2026-09-16',
  'live'
);
const liveOk = fs.existsSync(liveExportHint);

console.log('qc-twin-smoke — D2R offline twin');
console.log(`root: ${root}`);
console.log(`seeds checked: ${REQUIRED_SEEDS.length}`);
console.log(`pages checked: ${REQUIRED_PAGES.length}`);
console.log(`libs checked: ${SHARED_LIBS.length}`);
console.log(`snippets checked: ${REQUIRED_SNIPPETS.length}`);
console.log(`live export dir present: ${liveOk ? 'yes' : 'no (optional for this smoke)'}`);

if (missing.length) {
  console.error('\nFAIL — missing artifacts:');
  for (const m of missing) console.error(`  - ${m}`);
  console.error('\nSee D2R-COMPANY/ops/fleet/QC-GATES.md');
  process.exit(1);
}

console.log('\nPASS — required seeds + key route files present.');
process.exit(0);
