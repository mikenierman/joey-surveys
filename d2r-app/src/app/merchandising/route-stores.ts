import fs from 'fs';
import path from 'path';
import type { DevUser } from '@/lib/auth';

export type RouteStore = {
  site_number: string;
  business_unit: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  pog_set: string | null;
  rep_name: string;
  assigned_to: string;
  closing: boolean;
  /** Offline twin has no visit export — always todo until field app syncs. */
  status: 'todo' | 'done';
};

type RawStore = {
  site_number?: string;
  business_unit?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  pog_set?: string | null;
  rep_name?: string;
  assigned_to?: string;
  closing?: boolean;
};

const STORE_CANDIDATES = [
  path.join(process.cwd(), 'data', 'seed', 'circle-k-stores.json'),
  path.join(process.cwd(), '..', 'public', 'data', 'stores.json'),
];

/** Demo twin rep maps to Adam Scott so `/merchandising` is usable offline. */
export function resolveMerchRouteIdentity(user: DevUser): {
  emails: string[];
  names: string[];
  demoMappedTo: string | null;
} {
  const emails = [user.email.toLowerCase()];
  const names = [user.name];
  let demoMappedTo: string | null = null;

  if (
    user.email.toLowerCase() === 'rep@direct2retailers.com' ||
    user.name === 'Field Rep'
  ) {
    emails.push('adam@themotoman.com');
    names.push('Adam Scott');
    demoMappedTo = 'Adam Scott';
  }

  return { emails, names, demoMappedTo };
}

function loadRawStores(): RawStore[] {
  for (const file of STORE_CANDIDATES) {
    if (!fs.existsSync(file)) continue;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as
      | RawStore[]
      | { stores?: RawStore[] };
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.stores)) return parsed.stores;
  }
  return [];
}

export function getMerchRouteStores(user: DevUser): {
  stores: RouteStore[];
  demoMappedTo: string | null;
  source: string | null;
} {
  const { emails, names, demoMappedTo } = resolveMerchRouteIdentity(user);
  const emailSet = new Set(emails.map((e) => e.toLowerCase()));
  const nameSet = new Set(names.map((n) => n.toLowerCase()));

  let source: string | null = null;
  for (const file of STORE_CANDIDATES) {
    if (fs.existsSync(file)) {
      source = path.relative(process.cwd(), file);
      break;
    }
  }

  const stores = loadRawStores()
    .filter((s) => {
      const email = (s.assigned_to || '').toLowerCase();
      const name = (s.rep_name || '').toLowerCase();
      return (email && emailSet.has(email)) || (name && nameSet.has(name));
    })
    .map(
      (s): RouteStore => ({
        site_number: String(s.site_number || ''),
        business_unit: String(s.business_unit || ''),
        address: String(s.address || ''),
        city: String(s.city || ''),
        state: String(s.state || ''),
        zip: String(s.zip || ''),
        pog_set: s.pog_set ?? null,
        rep_name: String(s.rep_name || ''),
        assigned_to: String(s.assigned_to || ''),
        closing: Boolean(s.closing),
        status: 'todo',
      })
    )
    .sort((a, b) => a.site_number.localeCompare(b.site_number));

  return { stores, demoMappedTo, source };
}
