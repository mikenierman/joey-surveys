import { createClient } from '@supabase/supabase-js';
import { currentCycleKey } from './visitLogic';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_KEY;

export const supabase =
  url && key ? createClient(url, key) : null;

const VISITS_KEY = 'joey_visits_local_v1';

function readLocalVisits() {
  try {
    return JSON.parse(localStorage.getItem(VISITS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalVisits(visits) {
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

async function loadStoresLocal() {
  const res = await fetch('/data/stores.json');
  if (!res.ok) throw new Error('Could not load store list');
  const stores = await res.json();
  return { stores, source: 'local' };
}

export async function loadStores() {
  if (!supabase) return loadStoresLocal();

  const remote = (async () => {
    const { data, error } = await supabase.from('stores').select('*');
    if (!error && data && data.length > 0) return { stores: data, source: 'supabase' };
    throw new Error('empty-or-error');
  })();

  try {
    return await withTimeout(remote, 1500);
  } catch {
    return loadStoresLocal();
  }
}

export async function loadVisits() {
  if (!supabase) return readLocalVisits();

  const remote = (async () => {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      const local = readLocalVisits();
      const remoteIds = new Set(data.map((v) => v.id).filter(Boolean));
      const pending = local.filter((v) => v._pending && !remoteIds.has(v.id));
      return [...pending, ...data];
    }
    throw new Error('empty-or-error');
  })();

  try {
    return await withTimeout(remote, 1500);
  } catch {
    return readLocalVisits();
  }
}

export function storeIsDone(store, visits, cycleKey = currentCycleKey()) {
  const site = String(store.site_number);
  return visits.some(
    (v) =>
      String(v.store_number) === site &&
      (v.cycle_key || currentCycleKey(new Date(v.visit_date || v.created_at))) ===
        cycleKey &&
      ['submitted', 'qualified', 'in_review', 'pending_sync', 'exception'].includes(
        v.status || 'submitted'
      )
  );
}

export async function submitVisit(payload) {
  const cycle_key = payload.cycle_key || currentCycleKey();
  const row = {
    ...payload,
    cycle_key,
    status: payload.status || 'submitted',
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('visits').insert([row]).select().single();
      if (!error && data) return { visit: data, synced: true };
      if (error && /duplicate|unique/i.test(error.message)) {
        throw new Error('This store already has a visit for this cycle');
      }
    } catch (e) {
      if (e.message && /already has a visit/i.test(e.message)) throw e;
      /* queue offline */
    }
  }

  const local = readLocalVisits();
  if (
    local.some(
      (v) =>
        String(v.store_number) === String(row.store_number) &&
        v.cycle_key === cycle_key &&
        !['rejected'].includes(v.status)
    )
  ) {
    throw new Error('This store already has a visit for this cycle');
  }
  const visit = {
    ...row,
    id: `local-${Date.now()}-${row.store_number}`,
    _pending: true,
    status: 'pending_sync',
  };
  writeLocalVisits([visit, ...local]);
  return { visit, synced: false };
}

export function exportVisitsCsv(stores, visits) {
  const bySite = new Map(visits.map((v) => [String(v.store_number), v]));
  const headers = [
    'site_number',
    'business_unit',
    'address',
    'city',
    'state',
    'zip',
    'pog_set',
    'assigned_to',
    'rep_name',
    'status',
    'visit_date',
    'submitted_by',
    'followup',
    'flags',
    'gps_lat',
    'gps_lng',
    'gps_accuracy_m',
    'gps_distance_m',
    'joey_present',
    'facings',
    'oos',
    'shelf',
    'replenished',
    'educated',
    'price_ok',
    'follow_note',
    'photo_count',
    'photo_p1',
    'photo_p2',
    'photo_p3',
    'photo_p4',
    'photo_p5',
    'photo_p6',
    'photo_p7',
    'photo_p9',
  ];
  const lines = [headers.join(',')];
  const esc = (x) => {
    const s = x == null ? '' : String(x);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  for (const s of stores) {
    const v = bySite.get(String(s.site_number));
    const sd = v?.survey_data || {};
    const photos = v?.photo_urls || {};
    const photoSlots = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p9'];
    const status = v
      ? v.status === 'pending_sync'
        ? 'Completed (pending sync)'
        : 'Completed'
      : 'Not Completed';
    const row = [
      s.site_number,
      s.business_unit,
      s.address,
      s.city,
      s.state,
      s.zip,
      s.pog_set,
      s.assigned_to,
      v?.rep_name || s.rep_name,
      status,
      v?.visit_date || '',
      v?.submitted_by || '',
      v?.followup ? 'Yes' : 'No',
      (v?.flags || []).join('|'),
      v?.gps?.lat ?? sd.gps?.lat ?? '',
      v?.gps?.lng ?? sd.gps?.lng ?? '',
      v?.gps?.accuracy ?? sd.gps?.accuracy ?? '',
      v?.gps?.distanceM ?? sd.gpsDistanceM ?? '',
      sd.present ?? '',
      sd.facings ?? '',
      sd.oos ?? '',
      sd.shelf ?? '',
      sd.replenished ?? '',
      sd.educated ?? '',
      sd.priceOk ?? sd.priceVisible ?? '',
      sd.followNote ?? '',
      Object.keys(photos).length,
      ...photoSlots.map((id) => photos[id] || ''),
    ];
    lines.push(row.map(esc).join(','));
  }
  return lines.join('\n');
}
