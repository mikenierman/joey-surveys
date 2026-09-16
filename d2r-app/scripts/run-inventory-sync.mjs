#!/usr/bin/env node
/**
 * Inventory sync trigger stub (offline-capable).
 * Logs a run without calling Shopify when tokens are missing.
 *
 * Usage: node scripts/run-inventory-sync.mjs
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const runtimeDir = path.join(root, 'data', 'runtime');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function appendLine(file, value) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, JSON.stringify(value) + '\n');
}

const hasToken = Boolean(process.env.SHOPIFY_SHOP && process.env.SHOPIFY_ADMIN_TOKEN);
const now = new Date().toISOString();
const id = `auto-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const run = {
  id,
  timestamp: now,
  job: 'inventory-sync',
  status: hasToken ? 'ok' : 'offline',
  shopDomain: process.env.SHOPIFY_SHOP || null,
  message: hasToken
    ? `CLI stub: inventory sync trigger logged for ${process.env.SHOPIFY_SHOP}. Use POST /api/shopify/sync for read snapshot (write path disabled).`
    : 'Offline CLI stub: SHOPIFY_SHOP / SHOPIFY_ADMIN_TOKEN missing — logged without calling Shopify.',
  meta: {
    mode: hasToken ? 'read-sync-queued' : 'offline-stub',
    tokenPresent: hasToken,
    triggeredBy: 'cli',
    writePathEnabled: false,
  },
};

const runsFile = path.join(runtimeDir, 'automation-runs.json');
const existing = readJson(runsFile, { runs: [] });
existing.runs = [...(existing.runs || []), run].slice(-200);
writeJson(runsFile, existing);

appendLine(path.join(runtimeDir, 'ops-events.jsonl'), {
  id: `ops-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
  timestamp: now,
  kind: 'automation',
  status: run.status,
  shopDomain: run.shopDomain,
  job: run.job,
  message: run.message,
  meta: run.meta,
});

console.log(JSON.stringify({ ok: true, run, path: 'data/runtime/automation-runs.json' }, null, 2));
