import {
  computeReviewMetrics,
  shortDivision,
  visitStatusTags,
  filterAndSortVisits,
  enrichVisitRow,
} from './reviewMetrics';

describe('reviewMetrics', () => {
  const stores = [
    {
      site_number: '1',
      business_unit: '1700 - Southeast Division',
      address: '1 Main',
      city: 'Atlanta',
      state: 'GA',
    },
    {
      site_number: '2',
      business_unit: '1400 - Florida Division',
      address: '2 Ocean',
      city: 'Miami',
      state: 'FL',
    },
  ];

  const visits = [
    {
      id: 'a',
      store_number: '1',
      cycle_key: '2026-Q3',
      status: 'submitted',
      followup: false,
      flags: [],
      rep_name: 'Ada',
      store_city: 'Atlanta',
      store_state: 'GA',
      store_address: '1 Main',
      visit_date: '2026-09-01T12:00:00.000Z',
      survey_data: {
        present: 'yes',
        shelf: 'well',
        facings: 4,
        oos: 0,
        asking: 'yes',
        selling: 'yes',
        usesPouches: 'yes',
        orderPlaced: 'no',
        pos: { door: 'installed', strip: 'present', bollard: 'declined' },
        startedAt: '2026-09-01T11:45:00.000Z',
      },
    },
    {
      id: 'b',
      store_number: '2',
      cycle_key: '2026-Q3',
      status: 'submitted',
      followup: true,
      flags: ['NOT_SET'],
      rep_name: 'Bob',
      store_city: 'Miami',
      store_state: 'FL',
      store_address: '2 Ocean',
      visit_date: '2026-09-02T15:00:00.000Z',
      survey_data: {
        present: 'no',
        asking: 'no',
        selling: 'no',
        usesPouches: 'no',
        pos: { door: 'notprovided', strip: 'notprovided', bollard: 'notprovided' },
      },
    },
  ];

  test('shortDivision strips code prefix', () => {
    expect(shortDivision('1700 - Southeast Division')).toBe('Southeast');
  });

  test('visitStatusTags CLEAN / NOT SET / MISSING POS', () => {
    const tagsA = visitStatusTags(visits[0]);
    expect(tagsA.some((t) => t.key === 'missing_pos')).toBe(true);
    expect(tagsA.some((t) => t.key === 'clean')).toBe(false);

    const tagsB = visitStatusTags(visits[1]);
    expect(tagsB.some((t) => t.key === 'not_set')).toBe(true);
    expect(tagsB.some((t) => t.key === 'missing_pos')).toBe(true);

    const cleanVisit = {
      ...visits[0],
      flags: [],
      survey_data: {
        ...visits[0].survey_data,
        pos: { door: 'installed', strip: 'present', bollard: 'installed' },
      },
    };
    expect(visitStatusTags(cleanVisit).some((t) => t.key === 'clean')).toBe(true);
  });

  test('computeReviewMetrics KPIs and divisions', () => {
    const m = computeReviewMetrics(stores, visits, '2026-Q3');
    expect(m.completed).toBe(2);
    expect(m.assigned).toBe(2);
    expect(m.notSet).toBe(1);
    expect(m.pulse.askingPct).toBe(50);
    expect(m.divisions.find((d) => d.name === 'Southeast').done).toBe(1);
    expect(m.posDeclined).toBe(1);
  });

  test('filterAndSortVisits by status and division', () => {
    const m = computeReviewMetrics(stores, visits, '2026-Q3');
    const rows = m.cycleVisits.map((v) => enrichVisitRow(v, m.storeBySite));
    const notSet = filterAndSortVisits(rows, {
      search: '',
      division: '',
      status: 'not_set',
      followOnly: false,
      sort: 'date_desc',
    });
    expect(notSet).toHaveLength(1);
    expect(String(notSet[0].visit.store_number)).toBe('2');

    const fl = filterAndSortVisits(rows, {
      search: '',
      division: 'Florida',
      status: '',
      followOnly: false,
      sort: 'date_desc',
    });
    expect(fl).toHaveLength(1);
  });
});
