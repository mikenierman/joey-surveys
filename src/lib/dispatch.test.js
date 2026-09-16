/**
 * @jest-environment jsdom
 */
import {
  sortStoresForRoute,
  territorySummary,
  writeLocalAssignment,
  applyLocalAssignments,
  readLocalAssignments,
} from './dispatch';

describe('dispatch', () => {
  beforeEach(() => localStorage.clear());

  test('sorts by division then site without GPS', () => {
    const stores = [
      { site_number: '2', business_unit: 'B' },
      { site_number: '1', business_unit: 'A' },
      { site_number: '3', business_unit: 'A' },
    ];
    const sorted = sortStoresForRoute(stores, null);
    expect(sorted.map((s) => s.site_number)).toEqual(['1', '3', '2']);
  });

  test('territorySummary aggregates reps', () => {
    const summary = territorySummary([
      { business_unit: 'GC', assigned_to: 'a@x.com' },
      { business_unit: 'GC', assigned_to: 'b@x.com' },
      { business_unit: 'West', assigned_to: 'a@x.com' },
    ]);
    expect(summary[0].division).toBe('GC');
    expect(summary[0].count).toBe(2);
    expect(summary[0].repCount).toBe(2);
  });

  test('local assignments override', () => {
    writeLocalAssignment('100', 'rep@demo.com');
    expect(readLocalAssignments()['100']).toBe('rep@demo.com');
    const applied = applyLocalAssignments([
      { site_number: '100', assigned_to: 'old@x.com' },
      { site_number: '200', assigned_to: 'keep@x.com' },
    ]);
    expect(applied[0].assigned_to).toBe('rep@demo.com');
    expect(applied[1].assigned_to).toBe('keep@x.com');
  });
});
