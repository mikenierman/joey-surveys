#!/usr/bin/env node
/**
 * Copy weekly admin exports into d2r-app/data/seed when filenames match known patterns.
 * Usage: node d2r-app/scripts/import-exports.mjs [exportsDir]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const seed = path.join(root, 'data', 'seed');
const exportsDir =
  process.argv[2] ||
  path.resolve(root, '../D2R-COMPANY/ops/exports');

const MAP = [
  { match: /warehouse/i, dest: 'warehouses.json' },
  { match: /ledger-performance|ledger_performance/i, dest: 'ledger-performance.json' },
  { match: /inventory/i, dest: 'inventory-sample.json' },
  { match: /merchandising.*Q3|q3/i, dest: 'merchandising-joey_circle_k-2026-Q3.json' },
  { match: /users/i, dest: 'users.json' },
  { match: /shopify/i, dest: 'shopify-shops.json' },
  { match: /transfer/i, dest: 'transfers.json' },
  { match: /order/i, dest: 'orders.json' },
  { match: /commission/i, dest: 'commissions.json' },
  { match: /settlement/i, dest: 'settlements.json' },
  { match: /payout/i, dest: 'payouts.json' },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(json|tsv|csv)$/i.test(name)) out.push(p);
  }
  return out;
}

fs.mkdirSync(seed, { recursive: true });
const files = walk(exportsDir);
let copied = 0;
for (const file of files) {
  const base = path.basename(file);
  const rule = MAP.find((m) => m.match.test(base));
  if (!rule) continue;
  if (file.endsWith('.json')) {
    fs.copyFileSync(file, path.join(seed, rule.dest));
    console.log('copied', base, '->', rule.dest);
    copied += 1;
  }
}
console.log(`Done. ${copied} file(s) from ${exportsDir}`);
if (!files.length) console.log('No export files found — see D2R-COMPANY/ops/exports/EXPORT-PASS-STATUS.md');
