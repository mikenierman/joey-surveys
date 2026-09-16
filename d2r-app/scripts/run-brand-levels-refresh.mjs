#!/usr/bin/env node
/**
 * Nightly brand-levels refresh stub (offline-capable).
 * Writes under data/runtime/ without needing Shopify tokens.
 *
 * Usage: node scripts/run-brand-levels-refresh.mjs
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const runtimeDir = path.join(root, 'data', 'runtime');
const seedLevels = path.join(root, 'data', 'seed', 'brand-levels.json');
const seedHealth = path.join(root, 'data', 'seed', 'shopify-health.json');

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

const levels = readJson(seedLevels, {});
const health = readJson(seedHealth, { meta: {}, shops: [] });
const brandCount = Array.isArray(levels.brands)
  ? levels.brands.length
  : levels.meta?.count || 0;
const healthy = health.meta?.healthy ?? 0;
const total = health.meta?.total ?? (health.shops || []).length;
const hasToken = Boolean(process.env.SHOPIFY_SHOP && process.env.SHOPIFY_ADMIN_TOKEN);
const now = new Date().toISOString();
const id = `auto-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

const run = {
  id,
  timestamp: now,
  job: 'brand-levels-refresh',
  status: hasToken ? 'ok' : 'offline',
  shopDomain: process.env.SHOPIFY_SHOP || null,
  message: hasToken
    ? `CLI stub with token: would refresh brand levels; seed has ${brandCount} brands. Scope health ${healthy}/${total}.`
    : `Offline CLI stub: logged brand-levels refresh over ${brandCount} seed brands (no Shopify token). Scope health ${healthy}/${total}.`,
  meta: {
    brandCount,
    mode: hasToken ? 'live-token' : 'offline-seed',
    healthy,
    total,
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
