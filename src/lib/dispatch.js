import { distanceMeters, storeCoords } from './gps';

/** Sort stores by division then distance from a GPS fix (smarter route order). */
export function sortStoresForRoute(stores, fromGps) {
  const list = [...(stores || [])];
  list.sort((a, b) => {
    const div = String(a.business_unit || '').localeCompare(String(b.business_unit || ''));
    if (div !== 0) return div;
    if (!fromGps) {
      return String(a.site_number).localeCompare(String(b.site_number));
    }
    const da = distanceMeters(fromGps, storeCoords(a));
    const db = distanceMeters(fromGps, storeCoords(b));
    if (da == null && db == null) {
      return String(a.site_number).localeCompare(String(b.site_number));
    }
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });
  return list;
}

export function territorySummary(stores = []) {
  const byDiv = new Map();
  for (const s of stores) {
    const key = s.business_unit || 'Unknown';
    const row = byDiv.get(key) || { division: key, count: 0, reps: new Set() };
    row.count += 1;
    if (s.assigned_to) row.reps.add(String(s.assigned_to).toLowerCase());
    byDiv.set(key, row);
  }
  return [...byDiv.values()]
    .map((r) => ({
      division: r.division,
      count: r.count,
      repCount: r.reps.size,
      reps: [...r.reps],
    }))
    .sort((a, b) => b.count - a.count);
}

const ASSIGN_KEY = 'joey_store_assignments_v1';

export function readLocalAssignments() {
  try {
    return JSON.parse(localStorage.getItem(ASSIGN_KEY) || '{}');
  } catch {
    return {};
  }
}

export function writeLocalAssignment(siteNumber, email) {
  const map = readLocalAssignments();
  map[String(siteNumber)] = email || '';
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(map));
  return map;
}

export function applyLocalAssignments(stores) {
  const map = readLocalAssignments();
  return (stores || []).map((s) => {
    const override = map[String(s.site_number)];
    if (override === undefined) return s;
    return { ...s, assigned_to: override };
  });
}
