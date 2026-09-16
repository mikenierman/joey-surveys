import { StatCard } from '@/components/ui';
import {
  formatPulseSignalValue,
  PULSE_SIGNAL_LABELS,
  type PulseSignalKpis,
} from '@/lib/data';

const DEFAULT_KEYS: Array<keyof PulseSignalKpis> = [
  'score',
  'revenue',
  'orders',
  'activeStores',
  'reorderRate',
  'reorderMissRate',
  'newDoors',
  'onHandShare',
  'onHandFeePct',
  'dropShipFeePct',
];

export function PulseKpiGrid({
  kpis,
  keys = DEFAULT_KEYS,
}: {
  kpis: PulseSignalKpis;
  keys?: Array<keyof PulseSignalKpis>;
}) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {keys.map((key) => (
        <StatCard
          key={key}
          label={PULSE_SIGNAL_LABELS[key]}
          value={formatPulseSignalValue(key, kpis[key])}
        />
      ))}
    </div>
  );
}
