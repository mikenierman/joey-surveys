/** Append-only local audit log (enterprise auth scaffold). */

const KEY = 'joey_audit_events_v1';
const MAX = 500;

export function readAuditEvents() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function appendAuditEvent(event) {
  const row = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...event,
  };
  const prev = readAuditEvents();
  const next = [row, ...prev].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return row;
}

export function auditLogin(user) {
  return appendAuditEvent({
    type: 'login',
    actor: user?.email || null,
    role: user?.role || null,
  });
}

export function auditLogout(email) {
  return appendAuditEvent({ type: 'logout', actor: email || null });
}

export function auditVisitSubmit(visit, meta = {}) {
  return appendAuditEvent({
    type: 'visit_submit',
    actor: visit?.submitted_by || null,
    store_number: visit?.store_number,
    synced: meta.synced,
    status: visit?.status,
  });
}

export function auditStatusChange(visitId, from, to, actor) {
  return appendAuditEvent({
    type: 'status_change',
    actor,
    visitId,
    from,
    to,
  });
}
