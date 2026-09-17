import { getMerchAppUrl } from '@/lib/merch-app-url';

export function MerchEmbed({
  title = 'JOEY merchandising',
  heightClass = 'h-[75vh]',
}: {
  title?: string;
  heightClass?: string;
}) {
  const merchUrl = getMerchAppUrl();

  return (
    <div className="overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-stone-500">
          Field app
        </span>
        <a
          href={merchUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-amber-800 underline"
        >
          Open in new tab
        </a>
      </div>
      <iframe
        title={title}
        src={merchUrl}
        className={`${heightClass} w-full border-0`}
        allow="geolocation; camera; microphone"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
