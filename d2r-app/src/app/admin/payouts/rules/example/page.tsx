import Link from 'next/link';
import { PageTitle, StubNote } from '@/components/ui';

export default function PayoutRulesExamplePage() {
  return (
    <div>
      <PageTitle title="Payout rules example" subtitle="Documentation stub" />
      <StubNote>
        Stub for <code>/admin/payouts/rules/example</code> — likely live docs/examples page.
        Replace with CTO trail payout rule spec when available.
      </StubNote>
      <div className="mb-4">
        <Link
          href="/admin/payouts/rules"
          className="text-sm text-amber-800 underline"
        >
          ← Back to payout rules
        </Link>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
        <h2 className="font-medium text-stone-900">Example: biweekly-standard</h2>
        <p className="mt-2">
          Reps on the standard schedule receive ACH payouts every two weeks on Friday when net
          approved commissions exceed $25. Runs are created from approved commission lines in the
          current open settlement period.
        </p>
        <h2 className="mt-4 font-medium text-stone-900">Example: merch-bonus</h2>
        <p className="mt-2">
          Program-specific bonuses (e.g. JOEY Circle K Q3 visit completion) post as separate payout
          runs at quarter end, independent of order commission lines.
        </p>
        <h2 className="mt-4 font-medium text-stone-900">Example: manual-review</h2>
        <p className="mt-2">
          Lines flagged for rep assignment mismatch or missing bank info route here. Payout stays on
          hold until an admin approves and rep banking is verified.
        </p>
      </div>
    </div>
  );
}
