import fs from 'fs';
import path from 'path';
import { readSeed } from '@/lib/data';
import type { DevUser } from '@/lib/auth';

export type MerchRep = {
  rep: string;
  assigned: number;
  completed: number;
  withinWindow: number;
  completePct: string;
  unpaidVisits: number;
};

export type MerchProgram = {
  meta?: {
    capturedAt?: string;
    count?: number;
    period?: string;
    programKey?: string;
    source?: string;
    url?: string;
    note?: string;
  };
  periods?: string[];
  reps?: MerchRep[];
  rows?: MerchRep[];
};

export const MERCH_COLUMNS = [
  { key: 'rep', label: 'Rep' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'completed', label: 'Completed' },
  { key: 'withinWindow', label: 'Within window' },
  { key: 'completePct', label: 'Complete %' },
  { key: 'unpaidVisits', label: 'Unpaid visits' },
] as const;

const PERIOD_FILES: Record<string, string> = {
  '2026-Q3': 'merchandising-joey_circle_k-2026-Q3.json',
  '2026-Q2': 'merchandising-joey_circle_k-2026-Q2.json',
};

export const DEFAULT_MERCH_PERIOD = '2026-Q3';

const seedDir = path.join(process.cwd(), 'data', 'seed');

export function normalizeMerchPeriod(input?: string | null): string {
  if (!input) return DEFAULT_MERCH_PERIOD;
  if (PERIOD_FILES[input]) return input;
  const short = input.toUpperCase();
  if (short === 'Q3') return '2026-Q3';
  if (short === 'Q2') return '2026-Q2';
  return DEFAULT_MERCH_PERIOD;
}

export function getMerchSeedPeriods(): string[] {
  return Object.keys(PERIOD_FILES).filter((period) =>
    fs.existsSync(path.join(seedDir, PERIOD_FILES[period]))
  );
}

export function getMerchProgram(period?: string | null): MerchProgram | null {
  const normalized = normalizeMerchPeriod(period);
  const file = PERIOD_FILES[normalized];
  if (!file) return null;
  return readSeed<MerchProgram>(file);
}

export function getMerchReps(program: MerchProgram | null): MerchRep[] {
  return program?.reps || program?.rows || [];
}

export function getMerchPeriodOptions(program: MerchProgram | null): string[] {
  const seeded = getMerchSeedPeriods();
  let fromMeta = program?.periods || [];
  if (!fromMeta.length) {
    fromMeta = readSeed<MerchProgram>(PERIOD_FILES[DEFAULT_MERCH_PERIOD])?.periods || [];
  }
  const merged = [...new Set([...fromMeta, ...seeded])];
  return merged.sort((a, b) => b.localeCompare(a));
}

export function merchRepToRow(rep: MerchRep): Array<string | number> {
  return MERCH_COLUMNS.map(({ key }) => rep[key]);
}

export function findMerchRep(
  reps: MerchRep[],
  user: DevUser
): MerchRep | null {
  const seedName = lookupSeedUserName(user.email);
  const candidates = [user.name, seedName].filter(Boolean) as string[];

  for (const name of candidates) {
    const exact = reps.find((r) => r.rep === name);
    if (exact) return exact;
  }

  for (const name of candidates) {
    const partial = reps.find(
      (r) =>
        r.rep.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(r.rep.toLowerCase())
    );
    if (partial) return partial;
  }

  return null;
}

function lookupSeedUserName(email: string): string | null {
  const data = readSeed<{ users?: Array<{ Name?: string; Email?: string }> }>(
    'users.json'
  );
  const match = data?.users?.find(
    (u) => u.Email?.toLowerCase() === email.toLowerCase()
  );
  return match?.Name || null;
}

export function merchProgramSubtitle(program: MerchProgram | null, period: string) {
  const key = program?.meta?.programKey || 'joey_circle_k';
  const captured = program?.meta?.capturedAt
    ? new Date(program.meta.capturedAt).toLocaleDateString()
    : null;
  return `Program ${key} · ${period}${captured ? ` · vault ${captured}` : ''}`;
}
