'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ShopifySyncButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runSync() {
    setPending(true);
    setMessage(null);
    const res = await fetch('/api/shopify/sync', { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setMessage(body.error || 'Sync failed');
      return;
    }
    const snap = body.snapshot;
    setMessage(
      snap
        ? `Synced ${snap.productCount} products, ${snap.inventoryLevelCount} inventory levels` +
            (snap.errors?.length ? ` (${snap.errors.length} error(s))` : '')
        : 'Sync complete'
    );
    router.refresh();
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={runSync}
        disabled={pending}
        className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-50"
      >
        {pending ? 'Syncing…' : 'Run read sync'}
      </button>
      {message ? <span className="text-sm text-stone-600">{message}</span> : null}
    </div>
  );
}
