import { PulseStubPage } from '../_components/pulse-stub-page';

export default function PulseScoresPage() {
  return (
    <PulseStubPage
      title="Pulse scores"
      current="/admin/pulse/scores"
      purpose="Composite rep score ranking and export."
      headers={['Rep', 'Score', 'Period', 'Rank', 'Trend']}
      emptyHint="No scores capture seeded — only Adam Scott score (74) exists on Signals."
    />
  );
}
