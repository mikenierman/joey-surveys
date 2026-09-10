import { currentCycleKey } from './visitLogic';

const DONE_STATUSES = ['submitted', 'qualified', 'in_review', 'pending_sync', 'exception'];

export function shortDivision(businessUnit) {
  if (!businessUnit) return 'Unknown';
  const parts = String(businessUnit).split(' - ');
  const name = (parts.length > 1 ? parts.slice(1).join(' - ') : parts[0]).trim();
  return name.replace(/\s+Division$/i, '') || 'Unknown';
}

export function pct(n, d) {
  return d ? Math.round((100 * n) / d) : 0;
}

function isCycleVisit(v, cycleKey) {
  const key = v.cycle_key || currentCycleKey(new Date(v.visit_date || v.created_at));
  return key === cycleKey && DONE_STATUSES.includes(v.status || 'submitted');
}

export function cycleVisits(visits, cycleKey) {
  return (visits || []).filter((v) => isCycleVisit(v, cycleKey));
}

function survey(v) {
  return v.survey_data || {};
}

function posState(v) {
  return survey(v).pos || {};
}

/** Status tags for visit rows: CLEAN | NOT SET | MISSING POS */
export function visitStatusTags(visit) {
  const sd = survey(visit);
  const flags = visit.flags || [];
  const tags = [];
  const notSet =
    flags.includes('NOT_SET') || sd.present === 'no' || sd.present === false;
  if (notSet) tags.push({ key: 'not_set', label: 'NOT SET', tone: 'red' });

  const pos = posState(visit);
  const missingPos =
    flags.includes('POS_DECLINED') ||
    ['door', 'strip', 'bollard'].some(
      (k) => pos[k] === 'declined' || pos[k] === 'notprovided'
    );
  if (missingPos) tags.push({ key: 'missing_pos', label: 'MISSING POS', tone: 'warn' });

  const material =
    notSet ||
    missingPos ||
    flags.includes('UNCORRECTED') ||
    flags.includes('OOS_NO_INVENTORY') ||
    flags.includes('NOT_REPLENISHED') ||
    visit.followup;

  if (!material && tags.length === 0) {
    tags.push({ key: 'clean', label: 'CLEAN', tone: 'ok' });
  }
  return tags;
}

export function visitDurationMinutes(visit) {
  const sd = survey(visit);
  const start = sd.startedAt ? new Date(sd.startedAt) : null;
  const endRaw = visit.visit_date || visit.created_at;
  const end = endRaw ? new Date(endRaw) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins < 0 || mins > 24 * 60) return null;
  return mins;
}

export function resolveDivision(visit, storeBySite) {
  if (visit.business_unit) return shortDivision(visit.business_unit);
  const store = storeBySite.get(String(visit.store_number));
  return shortDivision(store?.business_unit);
}

export function computeReviewMetrics(stores, visits, cycleKey) {
  const cycle = cycleVisits(visits, cycleKey);
  const storeBySite = new Map((stores || []).map((s) => [String(s.site_number), s]));
  const doneSites = new Set(cycle.map((v) => String(v.store_number)));
  const assigned = (stores || []).length;
  const completed = doneSites.size;
  const completionPct = pct(completed, assigned);

  let inSet = 0;
  let notSet = 0;
  let posInstall = 0;
  let posOpp = 0;
  let posDeclined = 0;
  let well = 0;
  let low = 0;
  let out = 0;
  let facSum = 0;
  let facN = 0;
  let oosStores = 0;
  let askYes = 0;
  let askAns = 0;
  let sellYes = 0;
  let sellAns = 0;
  let pouchYes = 0;
  let orders = 0;
  let uncorrectable = 0;
  let withFlags = 0;

  cycle.forEach((v) => {
    const sd = survey(v);
    const flags = v.flags || [];
    if (flags.length || v.followup) withFlags += 1;
    if (flags.includes('UNCORRECTED') || sd.unc === 'yes') uncorrectable += 1;

    if (sd.present === 'yes') inSet += 1;
    else if (sd.present === 'no') notSet += 1;

    const pos = sd.pos || {};
    ['door', 'strip', 'bollard'].forEach((k) => {
      const s = pos[k];
      if (s == null) return;
      posOpp += 1;
      if (s === 'installed' || s === 'present') posInstall += 1;
      if (s === 'declined') posDeclined += 1;
    });

    if (sd.present === 'yes') {
      if (sd.shelf === 'well') well += 1;
      else if (sd.shelf === 'low') low += 1;
      else if (sd.shelf === 'out') out += 1;
      const fac = Number(sd.facings) || 0;
      facSum += fac;
      facN += 1;
      if ((Number(sd.oos) || 0) > 0) oosStores += 1;
    }

    if (sd.asking === 'yes') askYes += 1;
    if (sd.asking === 'yes' || sd.asking === 'no') askAns += 1;
    if (sd.selling === 'yes') sellYes += 1;
    if (sd.selling === 'yes' || sd.selling === 'no') sellAns += 1;
    if (sd.usesPouches === 'yes') pouchYes += 1;
    if (sd.orderPlaced === 'yes' || sd.orderPlaced === true) orders += 1;
  });

  const stockN = well + low + out;
  const followups = cycle.filter((v) => v.followup).length;

  const divMap = new Map();
  (stores || []).forEach((s) => {
    const name = shortDivision(s.business_unit);
    if (!divMap.has(name)) divMap.set(name, { name, total: 0, done: 0 });
    divMap.get(name).total += 1;
    if (doneSites.has(String(s.site_number))) divMap.get(name).done += 1;
  });
  const divisions = [...divMap.values()]
    .map((d) => ({ ...d, pct: pct(d.done, d.total) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    assigned,
    completed,
    completionPct,
    inSetPct: pct(inSet, cycle.length),
    notSet,
    posPct: pct(posInstall, posOpp),
    posDeclined,
    stock: {
      well,
      low,
      out,
      n: stockN,
      wellPct: pct(well, stockN),
      lowPct: pct(low, stockN),
      outPct: pct(out, stockN),
    },
    avgFacings: facN ? +(facSum / facN).toFixed(1) : 0,
    oosFacingPct: pct(oosStores, facN),
    followups,
    flaggedVisits: withFlags,
    uncorrectable,
    pulse: {
      askingPct: pct(askYes, askAns),
      sellingPct: pct(sellYes, sellAns),
      pouchPct: pct(pouchYes, cycle.length),
      orders,
    },
    divisions,
    cycleVisits: cycle,
    storeBySite,
  };
}

export function enrichVisitRow(visit, storeBySite) {
  const store = storeBySite.get(String(visit.store_number));
  const sd = survey(visit);
  const dateRaw = visit.visit_date || visit.created_at;
  const date = dateRaw ? new Date(dateRaw) : null;
  return {
    visit,
    store,
    division: resolveDivision(visit, storeBySite),
    tags: visitStatusTags(visit),
    date,
    durationMin: visitDurationMinutes(visit),
    gps: visit.gps || sd.gps || null,
    gpsStatus: sd.gpsStatus,
    present: sd.present,
    shelf: sd.shelf,
    phaseStrip: buildPhaseStrip(sd),
  };
}

function buildPhaseStrip(sd) {
  const inSet = sd.present === 'yes';
  return [
    { key: 'checkin', ok: sd.asking != null },
    { key: 'find', ok: sd.present != null },
    { key: 'stock', ok: !inSet || sd.shelf != null, skip: !inSet && sd.present === 'no' },
    { key: 'fix', ok: !inSet || sd.unc != null || (sd.fixes && Object.values(sd.fixes).some(Boolean)), skip: !inSet && sd.present === 'no' },
    { key: 'pos', ok: sd.pos && Object.values(sd.pos).some((x) => x != null) },
    { key: 'edu', ok: sd.educated != null },
    { key: 'photo', ok: true },
  ];
}

export function filterAndSortVisits(rows, filters) {
  const q = (filters.search || '').trim().toLowerCase();
  let out = rows.filter((row) => {
    const v = row.visit;
    if (filters.division && row.division !== filters.division) return false;
    if (filters.followOnly && !v.followup) return false;
    if (filters.status === 'clean' && !row.tags.some((t) => t.key === 'clean')) return false;
    if (filters.status === 'not_set' && !row.tags.some((t) => t.key === 'not_set')) return false;
    if (filters.status === 'missing_pos' && !row.tags.some((t) => t.key === 'missing_pos'))
      return false;
    if (!q) return true;
    return (
      String(v.store_number).includes(q) ||
      (v.store_city || '').toLowerCase().includes(q) ||
      (v.store_address || '').toLowerCase().includes(q) ||
      (v.store_state || '').toLowerCase().includes(q) ||
      (v.rep_name || '').toLowerCase().includes(q) ||
      (v.submitted_by || '').toLowerCase().includes(q) ||
      row.division.toLowerCase().includes(q) ||
      (row.store?.address || '').toLowerCase().includes(q)
    );
  });

  const sort = filters.sort || 'date_desc';
  out = [...out].sort((a, b) => {
    if (sort === 'division') return a.division.localeCompare(b.division);
    if (sort === 'status') {
      const rank = (tags) =>
        tags.some((t) => t.key === 'not_set')
          ? 0
          : tags.some((t) => t.key === 'missing_pos')
            ? 1
            : tags.some((t) => t.key === 'clean')
              ? 3
              : 2;
      return rank(a.tags) - rank(b.tags);
    }
    const ta = a.date ? a.date.getTime() : 0;
    const tb = b.date ? b.date.getTime() : 0;
    return sort === 'date_asc' ? ta - tb : tb - ta;
  });
  return out;
}
