import React from 'react';

const CIRC = 2 * Math.PI * 22;

export function KpiDash({ metrics }) {
  const { stock } = metrics;
  const dash = ((CIRC * metrics.completionPct) / 100).toFixed(1);

  return (
    <div className="rp-dash">
      <div className="rp-kpi">
        <div className="lab">Visits completed</div>
        <div className="rp-ringrow">
          <svg className="rp-ring" viewBox="0 0 52 52" aria-hidden>
            <circle className="bg" cx="26" cy="26" r="22" />
            <circle
              className="fg"
              cx="26"
              cy="26"
              r="22"
              strokeDasharray={`${dash} ${CIRC.toFixed(1)}`}
            />
          </svg>
          <div>
            <div className="big">{metrics.completed.toLocaleString()}</div>
            <div className="foot">
              of <b>{metrics.assigned.toLocaleString()}</b> assigned
              <br />
              <b>{metrics.completionPct}%</b> complete
            </div>
          </div>
        </div>
      </div>

      <div className="rp-kpi">
        <div className="lab">JOEY in set</div>
        <div className="big">
          {metrics.inSetPct}
          <small>%</small>
        </div>
        <div className="foot">
          <b>{metrics.notSet.toLocaleString()}</b> stores flagged NOT SET
        </div>
      </div>

      <div className="rp-kpi">
        <div className="lab">POS placement</div>
        <div className="big">
          {metrics.posPct}
          <small>%</small>
        </div>
        <div className="foot">
          of kit items installed or present
          <br />
          <b>{metrics.posDeclined.toLocaleString()}</b> declined by store
        </div>
      </div>

      <div className="rp-kpi">
        <div className="lab">Stock condition</div>
        <div className="rp-tribar">
          <span style={{ width: `${stock.wellPct}%`, background: 'var(--rp-green)' }} />
          <span style={{ width: `${stock.lowPct}%`, background: 'var(--rp-orange)' }} />
          <span style={{ width: `${stock.outPct}%`, background: 'var(--rp-red)' }} />
        </div>
        <div className="rp-legend">
          <span className="li">
            <span className="rp-dot" style={{ background: 'var(--rp-green)' }} />
            Well {stock.wellPct}%
          </span>
          <span className="li">
            <span className="rp-dot" style={{ background: 'var(--rp-orange)' }} />
            Low {stock.lowPct}%
          </span>
          <span className="li">
            <span className="rp-dot" style={{ background: 'var(--rp-red)' }} />
            Out {stock.outPct}%
          </span>
        </div>
        <div className="foot">
          <b>{stock.n.toLocaleString()}</b> stores with JOEY in set
        </div>
      </div>

      <div className="rp-kpi">
        <div className="lab">Avg facings</div>
        <div className="big">{metrics.avgFacings}</div>
        <div className="foot">
          <b>{metrics.oosFacingPct}%</b> of set stores had 1+ facing out
        </div>
      </div>

      <div className="rp-kpi">
        <div className="lab">Follow-ups</div>
        <div className="big" style={{ color: 'var(--rp-orange)' }}>
          {metrics.followups.toLocaleString()}
        </div>
        <div className="foot">
          visits marked follow-up
          <br />
          <b>{metrics.uncorrectable.toLocaleString()}</b> uncorrectable issues logged
        </div>
      </div>
    </div>
  );
}

export function StorePulse({ pulse }) {
  return (
    <div className="rp-pulse">
      <span className="plab">STORE PULSE</span>
      <span className="pdiv" />
      <span className="pitem">
        <span className="pval">{pulse.askingPct}%</span> say customers are asking for JOEY
      </span>
      <span className="pdiv" />
      <span className="pitem">
        <span className="pval">{pulse.sellingPct}%</span> say JOEY has been selling well
      </span>
      <span className="pdiv" />
      <span className="pitem">
        <span className="pval">{pulse.pouchPct}%</span> of clerks use pouches
      </span>
      <span className="pdiv" />
      <span className="pitem">
        <span className="pval">{pulse.orders.toLocaleString()}</span> orders placed during visits
      </span>
    </div>
  );
}

export function DivisionBars({ divisions, activeDivision, onSelect }) {
  return (
    <div className="rp-divsec">
      <div className="lab">
        <span>Completion by division</span>
        <span>COMPLETED / ASSIGNED THIS CYCLE</span>
      </div>
      <div className="rp-divgrid">
        {divisions.map((d) => (
          <button
            type="button"
            key={d.name}
            className={`rp-divrow${activeDivision === d.name ? ' active' : ''}`}
            onClick={() => onSelect(activeDivision === d.name ? '' : d.name)}
          >
            <span className="dn">{d.name}</span>
            <span className="db">
              <span style={{ width: `${d.pct}%` }} />
            </span>
            <span className="dv">
              {d.done} / {d.total} · {d.pct}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
