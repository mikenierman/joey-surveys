/**
 * Visible label that report runners are ledger/commission proxies — not live finance truth.
 */
export function ReportProxyBanner({
  proxyOf,
  seedHint,
}: {
  proxyOf: string;
  seedHint?: string;
}) {
  return (
    <div
      className="mb-4 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-800"
      role="note"
    >
      <strong>Proxy report — not live sales/finance truth.</strong> Numbers derive from{' '}
      {proxyOf}
      {seedHint ? (
        <>
          {' '}
          (<code>{seedHint}</code>)
        </>
      ) : null}
      . Replace with a dedicated live capture before cutover decisions.
    </div>
  );
}
