import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';

function fmtDate(d) {
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtTime(d) {
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function Tag({ tag }) {
  const cls = tag.tone === 'red' ? 'red' : tag.tone === 'ok' ? 'ok' : '';
  return <span className={`rp-flag ${cls}`}>{tag.label}</span>;
}

export function VisitTable({
  rows,
  shown,
  onShowMore,
  onSelect,
  filters,
  onFiltersChange,
  divisions,
  onExport,
  bootLoading,
}) {
  const visible = rows.slice(0, shown);

  return (
    <>
      <div className="rp-toolbar" id="rp-toolbar">
        <div className="rp-search">
          <Search size={15} strokeWidth={2.4} color="#57534E" aria-hidden />
          <input
            type="search"
            placeholder="Search store #, address, city, state, or rep"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="rp-select"
          value={filters.division}
          onChange={(e) => onFiltersChange({ ...filters, division: e.target.value })}
        >
          <option value="">All divisions</option>
          {divisions.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          className="rp-select"
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="clean">Clean</option>
          <option value="not_set">Not Set</option>
          <option value="missing_pos">Missing POS</option>
        </select>
        <button
          type="button"
          className={`rp-tgl${filters.followOnly ? ' on' : ''}`}
          onClick={() => onFiltersChange({ ...filters, followOnly: !filters.followOnly })}
        >
          Follow-ups only
        </button>
        <select
          className="rp-select"
          value={filters.sort}
          onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="division">Division</option>
          <option value="status">Status</option>
        </select>
        <Button onClick={onExport}>EXPORT CSV</Button>
      </div>

      <div className="rp-rescount">
        {bootLoading
          ? 'Loading…'
          : `${rows.length.toLocaleString()} visit${rows.length === 1 ? '' : 's'} · showing ${Math.min(
              shown,
              rows.length
            ).toLocaleString()}`}
      </div>

      <div className="rp-list">
        {!bootLoading && rows.length === 0 ? (
          <div className="rp-empty">
            <div className="eh">No visits match</div>
            <div>Try clearing filters or refreshing data.</div>
          </div>
        ) : (
          visible.map((row) => {
            const v = row.visit;
            return (
              <button
                type="button"
                key={v.id || `${v.store_number}-${v.created_at}`}
                className="rp-vrow"
                onClick={() => onSelect(v)}
              >
                <div className="rp-vdate">
                  <b>{fmtDate(row.date)}</b>
                  {fmtTime(row.date)}
                </div>
                <div className="rp-vstore">
                  <div className="sn">CK #{v.store_number}</div>
                  <div className="sa">
                    {v.store_address || row.store?.address || '—'}
                    {v.store_city || row.store?.city
                      ? ` · ${v.store_city || row.store?.city}, ${
                          v.store_state || row.store?.state || ''
                        }`
                      : ''}
                  </div>
                </div>
                <div className="rp-vdiv">{row.division}</div>
                <div className="rp-vrep col-rep">{v.rep_name || '—'}</div>
                <div className="col-strip">
                  <div className="rp-strip" aria-hidden>
                    {(row.phaseStrip || []).map((p) => (
                      <i
                        key={p.key}
                        className={p.skip ? 'skip' : p.ok ? '' : 'warn'}
                      />
                    ))}
                  </div>
                </div>
                <div className="rp-flags">
                  {row.tags.map((t) => (
                    <Tag key={t.key} tag={t} />
                  ))}
                  {v.followup ? <span className="rp-flag">FOLLOW-UP</span> : null}
                </div>
                <div className="rp-chev">›</div>
              </button>
            );
          })
        )}
      </div>

      {shown < rows.length ? (
        <button type="button" className="rp-more" onClick={onShowMore}>
          SHOW 60 MORE
        </button>
      ) : null}
    </>
  );
}
