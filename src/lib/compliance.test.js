import {
  complianceBand,
  complianceScoreFromFlags,
  buildIssueQueue,
  scoreVisit,
} from './compliance';

describe('compliance', () => {
  test('perfect visit scores 100', () => {
    expect(complianceScoreFromFlags([], {})).toBe(100);
  });

  test('NOT_SET penalizes heavily', () => {
    expect(complianceScoreFromFlags(['NOT_SET'], {})).toBe(65);
  });

  test('educated bumps score slightly', () => {
    expect(complianceScoreFromFlags([], { educated: 'yes' })).toBe(100);
  });

  test('bands map correctly', () => {
    expect(complianceBand(90).key).toBe('good');
    expect(complianceBand(70).key).toBe('fair');
    expect(complianceBand(40).key).toBe('poor');
  });

  test('buildIssueQueue finds followups', () => {
    const visits = [
      { id: '1', flags: ['NOT_SET'], status: 'submitted', followup: true },
      { id: '2', flags: [], status: 'qualified' },
      { id: '3', flags: [], status: 'submitted', followup: false },
    ];
    const q = buildIssueQueue(visits);
    expect(q.map((x) => x.id)).toEqual(['1']);
    expect(scoreVisit(visits[0]).score).toBeLessThan(100);
  });
});
