import { DataTable } from '@/components/ui';
import {
  MERCH_COLUMNS,
  merchRepToRow,
  type MerchRep,
} from '@/lib/merchandising';

export function MerchRepTable({ reps }: { reps: MerchRep[] }) {
  return (
    <DataTable
      headers={MERCH_COLUMNS.map((c) => c.label)}
      rows={reps.map(merchRepToRow)}
    />
  );
}
