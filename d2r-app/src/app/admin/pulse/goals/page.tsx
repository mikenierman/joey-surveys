import { PulseStubPage } from '../_components/pulse-stub-page';

export default function PulseGoalsPage() {
  return (
    <PulseStubPage
      title="Pulse goals"
      current="/admin/pulse/goals"
      purpose="Goal targets vs attainment by rep and period."
      headers={['Goal', 'Target', 'Actual', 'Attainment %', 'Period']}
      emptyHint="No goals capture seeded — table shape mirrors live map."
    />
  );
}
