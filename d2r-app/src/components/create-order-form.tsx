'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CreateOrderForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store: fd.get('store'),
        account: fd.get('account'),
        customer: fd.get('customer'),
        location: fd.get('location'),
        fulfillment: fd.get('fulfillment'),
        total: fd.get('total'),
        rep: fd.get('rep'),
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError('Failed to create order');
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="text-xs text-stone-600">
        Store
        <input
          name="store"
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          defaultValue="ALP"
        />
      </label>
      <label className="text-xs text-stone-600">
        Account
        <input
          name="account"
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          placeholder="Account name"
        />
      </label>
      <label className="text-xs text-stone-600">
        Customer
        <input
          name="customer"
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          placeholder="Customer name"
        />
      </label>
      <label className="text-xs text-stone-600">
        Location
        <input
          name="location"
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          placeholder="Street, city, state"
        />
      </label>
      <label className="text-xs text-stone-600">
        Fulfillment
        <select
          name="fulfillment"
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          defaultValue="Unfulfilled"
        >
          <option>Unfulfilled</option>
          <option>Fulfilled</option>
          <option>Partial</option>
          <option>Draft</option>
        </select>
      </label>
      <label className="text-xs text-stone-600">
        Total
        <input
          name="total"
          type="number"
          step="0.01"
          required
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          defaultValue={100}
        />
      </label>
      <label className="text-xs text-stone-600">
        Sales rep
        <input
          name="rep"
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          placeholder="Rep name"
        />
      </label>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Create order'}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
    </form>
  );
}
