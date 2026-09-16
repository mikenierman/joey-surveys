/**
 * Offline twin: resolve session user → vault rep / warehouse / brands.
 * Demo Field Rep maps to Adam Scott (same as merchandising route-stores).
 */

import type { DevUser } from '@/lib/auth';
import {
  getInventorySample,
  getLedgerBrandRows,
  getUsers,
  getWarehouses,
  type Warehouse,
} from '@/lib/data';

export type RepScope = {
  session: DevUser;
  /** Canonical vault display name used for filters */
  matchedName: string;
  matchedEmail: string | null;
  warehouses: Warehouse[];
  warehouseNames: string[];
  brands: string[];
  /** Partial / demo identity map (not exact email→users.json hit) */
  fuzzy: boolean;
  demoMapped: boolean;
  /** Present when fuzzy — e.g. "offline scope: matched Adam Scott" */
  scopeBanner: string | null;
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** 2 = exact, 1 = fuzzy containment / token overlap, 0 = none */
export function nameMatchQuality(a: string, b: string): 0 | 1 | 2 {
  if (!a?.trim() || !b?.trim()) return 0;
  if (a === b || a.toLowerCase() === b.toLowerCase()) return 2;
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 2;
  if (na.includes(nb) || nb.includes(na)) return 1;
  const ta = new Set(na.split(' ').filter((t) => t.length > 1));
  const tb = nb.split(' ').filter((t) => t.length > 1);
  if (tb.length && tb.every((t) => ta.has(t))) return 1;
  return 0;
}

function matchesAnyName(candidate: string, names: string[]): boolean {
  return names.some((n) => nameMatchQuality(candidate, n) > 0);
}

export function resolveRepScope(user: DevUser): RepScope {
  const users = getUsers().users;
  const allWarehouses = getWarehouses();

  let matchedName = user.name;
  let matchedEmail: string | null = user.email;
  let fuzzy = false;
  let demoMapped = false;

  const byEmail = users.find(
    (u) => u.email.toLowerCase() === user.email.toLowerCase()
  );
  if (byEmail?.name) {
    matchedName = byEmail.name;
    matchedEmail = byEmail.email;
  } else if (
    user.email.toLowerCase() === 'rep@direct2retailers.com' ||
    user.name === 'Field Rep'
  ) {
    matchedName = 'Adam Scott';
    matchedEmail = 'adam@themotoman.com';
    fuzzy = true;
    demoMapped = true;
  } else {
    // Fuzzy against users.json names / warehouse.rep
    let best: { name: string; email: string | null; q: number } | null = null;
    for (const u of users) {
      const q = Math.max(
        nameMatchQuality(user.name, u.name),
        nameMatchQuality(user.email.split('@')[0] || '', u.name)
      );
      if (q > 0 && (!best || q > best.q)) {
        best = { name: u.name, email: u.email, q };
      }
    }
    for (const w of allWarehouses) {
      if (!w.rep) continue;
      const q = nameMatchQuality(user.name, w.rep);
      if (q > 0 && (!best || q > best.q)) {
        best = { name: w.rep, email: best?.email ?? null, q };
      }
    }
    if (best) {
      matchedName = best.name;
      matchedEmail = best.email;
      fuzzy = best.q < 2 || best.name !== user.name;
    }
  }

  const identityNames = [matchedName, user.name].filter(Boolean);
  const warehouses = allWarehouses.filter((w) => {
    if (w.rep && matchesAnyName(w.rep, identityNames)) return true;
    if (w.warehouse && matchesAnyName(w.warehouse, identityNames)) return true;
    return false;
  });
  const warehouseNames = warehouses.map((w) => w.warehouse);

  const brands = [
    ...new Set(
      getLedgerBrandRows().filter((r) => matchesAnyName(r.rep, identityNames)).map((r) => r.brand)
    ),
  ].sort((a, b) => a.localeCompare(b));

  const scopeBanner =
    fuzzy || demoMapped
      ? `offline scope: matched ${matchedName}${demoMapped ? ' (demo Field Rep)' : ''}`
      : null;

  return {
    session: user,
    matchedName,
    matchedEmail,
    warehouses,
    warehouseNames,
    brands,
    fuzzy,
    demoMapped,
    scopeBanner,
  };
}

export function scopeMatchesRep(value: string | null | undefined, scope: RepScope): boolean {
  if (!value) return false;
  return matchesAnyName(String(value), [scope.matchedName, scope.session.name]);
}

export function scopeMatchesWarehouse(
  warehouse: string | null | undefined,
  scope: RepScope
): boolean {
  if (!warehouse) return false;
  const wh = String(warehouse);
  if (scope.warehouseNames.some((n) => nameMatchQuality(n, wh) > 0)) return true;
  return matchesAnyName(wh, [scope.matchedName, scope.session.name]);
}

/** Inventory sample is single brand×warehouse — show only when it matches scope. */
export function scopedInventorySample(scope: RepScope) {
  const sample = getInventorySample();
  const metaWh = sample.meta?.warehouse ? String(sample.meta.warehouse) : '';
  const metaRep = sample.meta?.warehouse
    ? String(sample.meta.warehouse).replace(/^D2R\s*-\s*/i, '')
    : '';
  const matches =
    (metaWh && scopeMatchesWarehouse(metaWh, scope)) ||
    (metaRep && scopeMatchesRep(metaRep, scope));
  return {
    ...sample,
    inScope: Boolean(matches),
  };
}

export function filterBrandStoresForRep<T extends { Name: string }>(
  stores: T[],
  scope: RepScope
): { stores: T[]; filtered: boolean } {
  if (!scope.brands.length) {
    return { stores, filtered: false };
  }
  const filtered = stores.filter((s) =>
    scope.brands.some(
      (b) =>
        nameMatchQuality(s.Name, b) > 0 ||
        norm(s.Name).includes(norm(b).split(' ')[0] || '') ||
        norm(b).includes(norm(s.Name))
    )
  );
  if (!filtered.length) {
    return { stores, filtered: false };
  }
  return { stores: filtered, filtered: true };
}
