import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getPayoutRules } from '@/lib/data';

export default function PayoutRulesPage() {
  const rules = getPayoutRules();

  return (
    <div>
      <PageTitle title="Payout rules" subtitle={`${rules.length} rule sets (scaffold)`} />
      <StubNote>
        Stub for <code>/admin/payouts/rules</code>. Rule types and cadences are inferred from
        site-map until CTO trail commission/payout docs import.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/payouts"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          ← Payout runs
        </Link>
        <Link
          href="/admin/payouts/rules/example"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Rules example
        </Link>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Add rule (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Save (offline)
        </span>
      </div>
      <DataTable
        headers={['Name', 'Label', 'Type', 'Method', 'Cadence', 'Min $', 'Active', 'Reps']}
        rows={rules.map((r) => [
          r.name,
          r.label,
          r.type,
          r.method,
          r.cadence,
          r.minAmount > 0 ? `$${r.minAmount}` : '—',
          r.active ? 'yes' : 'no',
          r.repCount,
        ])}
      />
    </div>
  );
}
