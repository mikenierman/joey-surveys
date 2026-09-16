import Link from 'next/link';
import { PageTitle, StatCard, StubNote } from '@/components/ui';
import { PulseNav } from '../_components/pulse-nav';

export default function PulseHealthPage() {
  return (
    <div>
      <PageTitle title="Pulse health" subtitle="Mapped route — awaiting live capture" />
      <PulseNav current="/admin/pulse/health" />
      <StubNote>
        Offline placeholder for <code>/admin/pulse/health</code>. Aggregate RAG / status
        rollups across reps — no live dump yet.
      </StubNote>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-stone-600">
        <span>
          Rep: <strong>All reps</strong> (stub)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-2 py-0.5 text-stone-500">
          Refresh (offline)
        </span>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Healthy reps" value="—" />
        <StatCard label="At-risk reps" value="—" />
        <StatCard label="Critical reps" value="—" />
      </div>

      <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
        Health badges / small multiples will land when a multi-rep pulse export exists.
        Until then use{' '}
        <Link className="text-amber-800 underline" href="/admin/pulse/signals">
          Signals
        </Link>{' '}
        (Adam Scott sample).
      </div>
    </div>
  );
}
