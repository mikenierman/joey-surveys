import React, { useEffect, useMemo, useState } from 'react';
import { exportVisitsCsv } from '../lib/data';
import {
  computeReviewMetrics,
  enrichVisitRow,
  filterAndSortVisits,
} from '../lib/reviewMetrics';
import { buildIssueQueue, scoreVisit } from '../lib/compliance';
import { territorySummary } from '../lib/dispatch';
import { readAuditEvents } from '../lib/audit';
import { Button } from './ui/button';
import { DivisionBars, KpiDash, StorePulse } from './portal/KpiDash';
import { VisitTable } from './portal/VisitTable';
import { VisitDetail } from './portal/VisitDetail';
import './portal/portal-tw.css';
import './portal/ReviewPortal.css';

const PAGE = 60;

function Toast({ toast }) {
  if (!toast) return null;
  return <div className="rp-toast">{toast}</div>;
}

export default function ReviewPortal({
  mode = 'admin',
  visits,
  stores,
  cycleKey,
  dataSource,
  program,
  onLogout,
  onBackToRoute,
  selectedVisit,
  setSelectedVisit,
  toast,
  showToast,
  bootLoading,
  onRefresh,
  onIssueStatus,
  onAssignStore,
  currentUser,
}) {
  const isClient = mode === 'client';
  const [filters, setFilters] = useState({
    search: '',
    division: '',
    status: '',
    followOnly: false,
    sort: 'date_desc',
  });
  const [shown, setShown] = useState(PAGE);
  const [assignSite, setAssignSite] = useState('');
  const [assignEmail, setAssignEmail] = useState('');
  const [showAudit, setShowAudit] = useState(false);

  const metrics = useMemo(
    () => computeReviewMetrics(stores, visits, cycleKey),
    [stores, visits, cycleKey]
  );

  const rows = useMemo(() => {
    const enriched = metrics.cycleVisits.map((v) =>
      enrichVisitRow(v, metrics.storeBySite)
    );
    return filterAndSortVisits(enriched, filters);
  }, [metrics, filters]);

  const issues = useMemo(() => buildIssueQueue(visits), [visits]);
  const territories = useMemo(() => territorySummary(stores).slice(0, 8), [stores]);
  const auditEvents = useMemo(
    () => (showAudit ? readAuditEvents().slice(0, 40) : []),
    [showAudit]
  );

  const avgCompliance = useMemo(() => {
    const scored = (metrics.cycleVisits || []).map((v) =>
      v.compliance_score != null ? v.compliance_score : scoreVisit(v).score
    );
    if (!scored.length) return null;
    return Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
  }, [metrics]);

  useEffect(() => {
    setShown(PAGE);
  }, [filters]);

  const downloadCsv = () => {
    const csv = exportVisitsCsv(stores, visits);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isClient
      ? `joey-client-export-${cycleKey}.csv`
      : `joey-circlek-${cycleKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast?.('CSV downloaded');
  };

  const onDivisionSelect = (name) => {
    setFilters((f) => ({ ...f, division: name }));
    document.getElementById('rp-toolbar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="review-portal">
      <Toast toast={toast} />
      <div className="rp-wrap">
        <div className="rp-topbar">
          <div className="rp-brandline">
            <div className="rp-logos">
              <img
                className="rp-logo-d2r"
                src="/branding/d2r-logo.png"
                alt="D2R Direct to Retailers"
              />
              <img className="rp-logo-joey" src="/branding/joey-logo.png" alt="JOEY" />
            </div>
            <div className="rp-titleblock">
              <h1>{program?.name || 'JOEY × Circle K Merchandising'}</h1>
              <div className="rp-sub">
                {isClient
                  ? 'VISIT REVIEW PORTAL · CLIENT (READ-ONLY)'
                  : 'VISIT REVIEW PORTAL · ADMIN'}
                {program?.id ? ` · ${program.id}` : ''}
              </div>
            </div>
          </div>
          <div className="rp-headmeta">
            <div className="rp-chip solid">{cycleKey}</div>
            <div className="rp-chip">
              {metrics.assigned.toLocaleString()} STORES ASSIGNED
            </div>
            {avgCompliance != null ? (
              <div className="rp-chip">AVG COMPLIANCE {avgCompliance}</div>
            ) : null}
            {!isClient && dataSource ? (
              <div className="rp-chip">{String(dataSource).toUpperCase()}</div>
            ) : null}
            {!isClient ? (
              <Button variant="outline" onClick={onBackToRoute}>
                Route
              </Button>
            ) : null}
            {!isClient ? (
              <Button variant="outline" onClick={() => setShowAudit((s) => !s)}>
                {showAudit ? 'Hide audit' : 'Audit log'}
              </Button>
            ) : null}
            <Button variant="outline" onClick={onRefresh}>
              Refresh
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </div>

        <KpiDash metrics={metrics} />
        <StorePulse pulse={metrics.pulse} />
        <DivisionBars
          divisions={metrics.divisions}
          activeDivision={filters.division}
          onSelect={onDivisionSelect}
        />

        {!isClient && territories.length > 0 ? (
          <section className="rp-panel-block">
            <h2 className="rp-section-title">Territories / dispatch</h2>
            <div className="rp-territory-grid">
              {territories.map((t) => (
                <div key={t.division} className="rp-territory-card">
                  <strong>{t.division}</strong>
                  <span>
                    {t.count} stores · {t.repCount} reps
                  </span>
                </div>
              ))}
            </div>
            <div className="rp-assign-row">
              <input
                placeholder="Site #"
                value={assignSite}
                onChange={(e) => setAssignSite(e.target.value)}
              />
              <input
                placeholder="Rep email"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (!assignSite.trim()) return;
                  onAssignStore?.(assignSite.trim(), assignEmail.trim().toLowerCase());
                  setAssignSite('');
                  setAssignEmail('');
                }}
              >
                Assign store
              </Button>
            </div>
          </section>
        ) : null}

        {!isClient && issues.length > 0 ? (
          <section className="rp-panel-block">
            <h2 className="rp-section-title">Open issues ({issues.length})</h2>
            <div className="rp-issue-list">
              {issues.slice(0, 12).map((issue) => (
                <div key={issue.id} className="rp-issue-row">
                  <button
                    type="button"
                    className="rp-issue-main"
                    onClick={() => setSelectedVisit(issue.visit)}
                  >
                    <strong>CK #{issue.store_number}</strong>
                    <span className={`rp-score ${issue.band.key}`}>
                      Score {issue.score} · {issue.band.label}
                    </span>
                    <span className="rp-issue-flags">
                      {(issue.flags || []).slice(0, 3).join(' · ') || 'Follow-up'}
                    </span>
                  </button>
                  <select
                    value={issue.status}
                    onChange={(e) => onIssueStatus?.(issue.id, e.target.value)}
                    aria-label="Issue status"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {showAudit && !isClient ? (
          <section className="rp-panel-block">
            <h2 className="rp-section-title">Audit log (local)</h2>
            <ul className="rp-audit-list">
              {auditEvents.length === 0 ? (
                <li>No events yet</li>
              ) : (
                auditEvents.map((ev) => (
                  <li key={ev.id}>
                    <code>{ev.at}</code> · {ev.type}
                    {ev.actor ? ` · ${ev.actor}` : ''}
                    {ev.store_number ? ` · CK#${ev.store_number}` : ''}
                    {ev.from && ev.to ? ` · ${ev.from}→${ev.to}` : ''}
                  </li>
                ))
              )}
            </ul>
            <p className="rp-muted">
              Signed in as {currentUser?.email || '—'} ({currentUser?.role || mode})
            </p>
          </section>
        ) : null}

        {program?.phases?.length ? (
          <section className="rp-panel-block">
            <h2 className="rp-section-title">Survey config ({program.id})</h2>
            <div className="rp-phase-pills">
              {program.phases.map((p) => (
                <span key={p.key} className="rp-chip">
                  {p.num} {p.name}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <VisitTable
          rows={rows}
          shown={shown}
          onShowMore={() => setShown((n) => n + PAGE)}
          onSelect={setSelectedVisit}
          filters={filters}
          onFiltersChange={setFilters}
          divisions={metrics.divisions}
          onExport={downloadCsv}
          bootLoading={bootLoading}
        />

        <footer className="rp-footer">
          D2R FIELD NETWORK · VISIT COMPLETE = STORE VISITED + SURVEY + PHOTOS SUBMITTED
          <br />
          {isClient
            ? 'CLIENT PORTAL · EXPORT INCLUDES PHOTO LINKS'
            : 'ADMIN REVIEW · SAME DASHBOARD SHARED WITH CLIENT'}
        </footer>
      </div>

      <VisitDetail
        visit={selectedVisit}
        storeBySite={metrics.storeBySite}
        open={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
      />
    </div>
  );
}
