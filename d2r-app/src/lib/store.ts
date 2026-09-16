/**
 * Thin file-based persistence for the failsafe twin.
 * Path to Postgres: swap these helpers for a DB client; keep the same function names.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataRoot = path.join(process.cwd(), 'data');

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function dataPath(...parts: string[]) {
  return path.join(dataRoot, ...parts);
}

export function readJsonFile<T>(file: string, fallback: T): T {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonFile(file: string, value: unknown) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

export function appendJsonLine(file: string, value: unknown) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, JSON.stringify(value) + '\n');
}

export function listJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f));
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

/** Seed / runtime JSON under data/seed */
export function seedPath(name: string) {
  return dataPath('seed', name);
}

export function readSeedStore<T>(name: string, fallback: T): T {
  return readJsonFile(seedPath(name), fallback);
}

export function writeSeedStore(name: string, value: unknown) {
  writeJsonFile(seedPath(name), value);
}
