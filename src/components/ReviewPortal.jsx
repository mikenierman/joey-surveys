import React, { useEffect, useMemo, useState } from 'react';
import { exportVisitsCsv } from '../lib/data';
import {
  computeReviewMetrics,
  enrichVisitRow,
  filterAndSortVisits,
} from '../lib/reviewMetrics';
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
  onLogout,
  onBackToRoute,
  selectedVisit,
  setSelectedVisit,
  toast,
  showToast,
  bootLoading,
  onRefresh,
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
              <h1>JOEY × Circle K Merchandising</h1>
              <div className="rp-sub">
                {isClient
                  ? 'VISIT REVIEW PORTAL · CLIENT (READ-ONLY)'
                  : 'VISIT REVIEW PORTAL · ADMIN'}
              </div>
            </div>
          </div>
          <div className="rp-headmeta">
            <div className="rp-chip solid">{cycleKey}</div>
            <div className="rp-chip">
              {metrics.assigned.toLocaleString()} STORES ASSIGNED
            </div>
            {!isClient && dataSource ? (
              <div className="rp-chip">{String(dataSource).toUpperCase()}</div>
            ) : null}
            {!isClient ? (
              <Button variant="outline" onClick={onBackToRoute}>
                Route
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
