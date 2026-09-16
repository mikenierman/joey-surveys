'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AddUserForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fd.get('email'),
        name: fd.get('name'),
        role: fd.get('role'),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Failed to add user');
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-4"
    >
      <label className="text-xs text-stone-600">
        Name
        <input
          name="name"
          required
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs text-stone-600">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs text-stone-600">
        Role
        <select
          name="role"
          className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
          defaultValue="rep"
        >
          <option value="admin">admin</option>
          <option value="manager">manager</option>
          <option value="rep">rep</option>
          <option value="delegate">delegate</option>
          <option value="brand_partner">brand_partner</option>
          <option value="client">client</option>
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Add demo user'}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600 sm:col-span-4">{error}</p> : null}
    </form>
  );
}
