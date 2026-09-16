'use client';

import { useMemo, useState } from 'react';
import type { RouteStore } from './route-stores';

type Tab = 'all' | 'todo' | 'done';

export function MerchRouteShell({
  stores,
  period,
  rollupCompleted,
}: {
  stores: RouteStore[];
  period: string;
  rollupCompleted: number;
}) {
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');

  const counts = useMemo(() => {
    const done = stores.filter((s) => s.status === 'done').length;
    const todo = stores.length - done;
    return { all: stores.length, todo, done };
  }, [stores]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return stores.filter((s) => {
      if (tab === 'todo' && s.status !== 'todo') return false;
      if (tab === 'done' && s.status !== 'done') return false;
      if (!needle) return true;
      const hay = [
        s.site_number,
        s.address,
        s.city,
        s.state,
        s.business_unit,
        s.pog_set || '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [stores, tab, q]);

  const checked = counts.done;
  const toGo = Math.max(stores.length - checked, 0);
  const pct =
    stores.length > 0 ? Math.round((checked / stores.length) * 100) : 0;

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Circle K Route</h2>
          <p className="text-sm text-stone-600">
            {period} · offline list / status (survey opens in field app)
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
          <div
            className="relative grid h-14 w-14 place-items-center rounded-full border-4 border-amber-400 text-sm font-semibold"
            title="Stores checked (offline visit rows not exported)"
          >
            {pct}%
          </div>
          <div className="text-sm">
            <div>
              <span className="font-medium">{checked}</span> of {stores.length} checked
            </div>
            <div className="text-stone-600">{toGo} to go</div>
            {rollupCompleted > 0 ? (
              <div className="text-xs text-stone-500">
                Rollup reports {rollupCompleted} completed (store-level visits not
                in vault)
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search store #, city, or address"
          className="min-w-[14rem] flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
        />
        {(
          [
            ['all', 'All', counts.all],
            ['todo', 'To do', counts.todo],
            ['done', 'Done', counts.done],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              tab === id
                ? 'border-amber-500 bg-amber-50 font-medium text-amber-950'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-600">
          {tab === 'done'
            ? 'No completed visits in the offline twin — open the field app when online to capture Done status.'
            : 'No stores match this filter.'}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const done = s.status === 'done';
            return (
              <li
                key={s.site_number}
                className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                      done
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {done ? '✓' : 'GO'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        Circle K #{s.site_number}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          done
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {done ? 'Done' : 'To do'}
                      </span>
                      {s.closing ? (
                        <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                          Closing
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-stone-700">
                      {s.address}, {s.city}, {s.state}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      POG {s.pog_set || '—'} · {s.business_unit || '—'}
                    </p>
                    <button
                      type="button"
                      disabled
                      className="mt-2 rounded border border-stone-200 bg-stone-50 px-2 py-1 text-xs text-stone-400"
                      title="Survey engine lives in the field app"
                    >
                      Start visit (field app)
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
