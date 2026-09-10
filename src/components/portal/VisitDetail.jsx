import React, { useEffect, useMemo, useState } from 'react';
import { POS_ITEMS, POS_OPTS, requiredPhotoDefs } from '../../lib/visitLogic';
import { resolveDivision, visitDurationMinutes } from '../../lib/reviewMetrics';

function yn(val) {
  if (val === 'yes' || val === true) return <span className="fv good">Yes</span>;
  if (val === 'no' || val === false) return <span className="fv bad">No</span>;
  return <span className="fv">—</span>;
}

function Frow({ label, children }) {
  return (
    <div className="rp-frow">
      <span className="fl">{label}</span>
      {typeof children === 'string' || typeof children === 'number' ? (
        <span className="fv">{children}</span>
      ) : (
        children
      )}
    </div>
  );
}

function posLabel(val) {
  return POS_OPTS.find((o) => o.val === val)?.label || val || '—';
}

function posClass(val) {
  if (val === 'installed') return 'good';
  if (val === 'present') return '';
  if (val === 'declined') return 'bad';
  if (val === 'notprovided') return 'warn';
  return '';
}

function fmtDateTime(d) {
  if (!d || Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

function formatGps(visit, sd) {
  const gps = visit.gps || sd.gps;
  if (gps?.lat != null && gps?.lng != null) {
    const acc =
      gps.accuracy != null ? ` (±${Math.round(gps.accuracy)}m)` : '';
    const dist =
      gps.distanceM != null ? ` · ${gps.distanceM}m from store` : '';
    return `${Number(gps.lat).toFixed(5)}, ${Number(gps.lng).toFixed(5)}${acc}${dist}`;
  }
  return sd.gpsStatus || 'unavailable';
}

export function VisitDetail({ visit, storeBySite, open, onClose }) {
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!open) setLightbox(null);
  }, [open, visit]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null);
        else onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, lightbox, onClose]);

  const meta = useMemo(() => {
    if (!visit) return null;
    const sd = visit.survey_data || {};
    const store = storeBySite?.get(String(visit.store_number));
    const dateRaw = visit.visit_date || visit.created_at;
    const date = dateRaw ? new Date(dateRaw) : null;
    const duration = visitDurationMinutes(visit);
    const division = resolveDivision(visit, storeBySite || new Map());
    const photos = visit.photo_urls || {};
    const defs = requiredPhotoDefs(sd);
    return { sd, store, date, duration, division, photos, defs };
  }, [visit, storeBySite]);

  if (!visit || !meta) {
    return (
      <>
        <div className={`rp-scrim${open ? ' open' : ''}`} onClick={onClose} aria-hidden />
        <div className={`rp-panel${open ? ' open' : ''}`} aria-hidden={!open} />
      </>
    );
  }

  const { sd, store, date, duration, division, photos, defs } = meta;
  const inSet = sd.present === 'yes';
  const skipStock = sd.present === 'no';

  const fixLabels = [];
  if (sd.fixes?.faced) fixLabels.push('Faced product');
  if (sd.fixes?.shrink) fixLabels.push('Addressed shrink');
  if (sd.fixes?.placement) fixLabels.push('Fixed placement');
  if (sd.fixes?.none) fixLabels.push('Nothing needed');

  return (
    <>
      <div className={`rp-scrim${open ? ' open' : ''}`} onClick={onClose} aria-hidden />
      <div className={`rp-panel${open ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="rp-phead">
          <div>
            <div className="pt">
              CK #{visit.store_number} · {visit.store_city || store?.city || '—'},{' '}
              {visit.store_state || store?.state || ''}
            </div>
            <div className="pm">
              {visit.store_address || store?.address || '—'} · {division.toUpperCase()} DIVISION
              <br />
              REP {(visit.rep_name || '—').toUpperCase()} · {fmtDateTime(date).toUpperCase()}
              {duration != null ? ` · ${duration} MIN IN STORE` : ''}
              <br />
              GPS {formatGps(visit, sd)}
            </div>
          </div>
          <button type="button" className="rp-pclose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="rp-pbody">
          <div className="rp-sec">
            <div className="sh">
              <span className="snum">01</span>
              <span className="st">CHECK IN</span>
            </div>
            <Frow label="Are customers asking for JOEY?">
              <span
                className={`fv${
                  sd.asking === 'yes' ? ' good' : sd.asking === 'no' ? ' bad' : ''
                }`}
              >
                {sd.asking === 'yes' ? 'Yes' : sd.asking === 'no' ? 'No' : '—'}
              </span>
            </Frow>
            <Frow label="Has JOEY been selling well?">
              <span
                className={`fv${
                  sd.selling === 'yes' ? ' good' : sd.selling === 'no' ? ' bad' : ''
                }`}
              >
                {sd.selling === 'yes' ? 'Yes' : sd.selling === 'no' ? 'No' : '—'}
              </span>
            </Frow>
            <Frow label="Does the clerk use pouches?">{yn(sd.usesPouches)}</Frow>
            {sd.usesPouches === 'no' ? (
              <Frow label="How do they hear about pouches?">{sd.pouchInfo || '—'}</Frow>
            ) : null}
          </div>

          <div className="rp-sec">
            <div className="sh">
              <span className="snum">02</span>
              <span className="st">FIND IT</span>
            </div>
            <Frow label="Planogram (POG set)">
              {store?.pog_set ? `Set ${store.pog_set}` : visit.pog_set || 'n/a'}
            </Frow>
            <Frow label="Spring set date">{store?.reset_date || 'n/a'}</Frow>
            <Frow label="JOEY present / in set?">{yn(sd.present)}</Frow>
            {inSet ? (
              <>
                <Frow label="Shelf position">{sd.shelfPos || '—'}</Frow>
                <Frow label="POG facings">{sd.facings ?? '—'}</Frow>
                <Frow label="Facings out of stock">
                  <span className={`fv${Number(sd.oos) > 0 ? ' warn' : ' good'}`}>
                    {sd.oos ?? '—'}
                  </span>
                </Frow>
              </>
            ) : null}
          </div>

          <div className="rp-sec">
            <div className="sh">
              <span className={`snum${skipStock ? ' skip' : ''}`}>03</span>
              <span className="st">CHECK & FILL</span>
              {skipStock ? (
                <span className="skipnote">skipped — not set with JOEY</span>
              ) : null}
            </div>
            {inSet ? (
              <>
                <Frow label="Shelf condition">
                  <span
                    className={`fv${
                      sd.shelf === 'well'
                        ? ' good'
                        : sd.shelf === 'low'
                          ? ' warn'
                          : sd.shelf === 'out'
                            ? ' bad'
                            : ''
                    }`}
                  >
                    {sd.shelf === 'well'
                      ? 'Well stocked'
                      : sd.shelf === 'low'
                        ? 'Low'
                        : sd.shelf === 'out'
                          ? 'Out'
                          : '—'}
                  </span>
                </Frow>
                {sd.shelf && sd.shelf !== 'well' ? (
                  <>
                    <Frow label="Backstock available">{yn(sd.backstock)}</Frow>
                    {sd.backstock === 'yes' ? (
                      <Frow label="Replenished from backstock">{yn(sd.replenished)}</Frow>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="rp-sec">
            <div className="sh">
              <span className={`snum${skipStock ? ' skip' : ''}`}>04</span>
              <span className="st">FIX IT</span>
              {skipStock ? (
                <span className="skipnote">skipped — not set with JOEY</span>
              ) : null}
            </div>
            {inSet ? (
              <>
                <Frow label="Actions taken">
                  {fixLabels.length ? fixLabels.join(', ') : '—'}
                </Frow>
                <Frow label="Was an order placed while you were there?">
                  {yn(sd.orderPlaced)}
                </Frow>
                <Frow label="Uncorrectable issue">
                  {sd.unc === 'yes' ? (
                    <span className="fv bad">Yes</span>
                  ) : (
                    <span className="fv good">None</span>
                  )}
                </Frow>
                {sd.unc === 'yes' && sd.uncNote ? (
                  <div className="rp-notebox">&ldquo;{sd.uncNote}&rdquo;</div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="rp-sec">
            <div className="sh">
              <span className="snum">05</span>
              <span className="st">POS IT</span>
            </div>
            {POS_ITEMS.map((item) => {
              const val = sd.pos?.[item.id];
              return (
                <Frow key={item.id} label={item.name}>
                  <span className={`fv ${posClass(val)}`}>{posLabel(val)}</span>
                </Frow>
              );
            })}
          </div>

          <div className="rp-sec">
            <div className="sh">
              <span className="snum">06</span>
              <span className="st">EDUCATE & PRICE</span>
            </div>
            <Frow label="Clerk / manager educated">{yn(sd.educated)}</Frow>
            <Frow label="Leave-behind provided">{yn(sd.leaveBehind)}</Frow>
            <Frow label="Reorder tags placed">{yn(sd.reorderTags)}</Frow>
            <Frow label="Is the shelf price visible?">
              {sd.priceVisible === 'yes' ? (
                <span className="fv good">Yes</span>
              ) : sd.priceVisible === 'no' ? (
                <span className="fv bad">No — flagged</span>
              ) : (
                <span className="fv">—</span>
              )}
            </Frow>
            {sd.priceVisible === 'yes' ? (
              <Frow label="Promo price correct ($20 off Mix or Match)">
                {sd.priceOk === 'yes' ? (
                  <span className="fv good">Yes</span>
                ) : sd.priceOk === 'no' ? (
                  <span className="fv bad">No — flagged</span>
                ) : (
                  <span className="fv">—</span>
                )}
              </Frow>
            ) : null}
          </div>

          <div className="rp-sec">
            <div className="sh">
              <span className="snum">07</span>
              <span className="st">PHOTO IT</span>
              <span className="skipnote">
                {defs.length} required · {Object.keys(photos).length} on file
              </span>
            </div>
            <div className="rp-pgrid">
              {defs.map((d) => {
                const src = photos[d.id];
                return (
                  <button
                    type="button"
                    key={d.id}
                    className="rp-ptile"
                    onClick={() => src && setLightbox({ src, title: d.title, id: d.id })}
                    disabled={!src}
                  >
                    <div className="pimg">
                      {src ? (
                        <img src={src} alt={d.title} />
                      ) : (
                        <span style={{ fontSize: 11, color: '#57534E' }}>No photo</span>
                      )}
                    </div>
                    <div className="pcap">
                      {d.id} · {d.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {(visit.followup || sd.followNote) && (
            <div className="rp-sec">
              <div className="sh">
                <span className="snum">SUB</span>
                <span className="st">FOLLOW-UP</span>
              </div>
              <Frow label="Follow-up requested">{yn(visit.followup || sd.followReq)}</Frow>
              {sd.followNote ? <div className="rp-notebox">{sd.followNote}</div> : null}
            </div>
          )}
        </div>
      </div>

      <div
        className={`rp-lbox${lightbox ? ' open' : ''}`}
        onClick={() => setLightbox(null)}
        role="presentation"
      >
        {lightbox ? (
          <div className="rp-lcard" onClick={(e) => e.stopPropagation()} role="presentation">
            <img src={lightbox.src} alt={lightbox.title} />
            <div className="rp-lcap">
              <span>
                {lightbox.id} · {lightbox.title.toUpperCase()}
              </span>
              <span>CK #{visit.store_number}</span>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
