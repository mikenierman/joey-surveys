import {
  freshVisit,
  requiredPhotoDefs,
  validateVisit,
  visitFlags,
  PHASES,
} from './visitLogic';

describe('visitLogic proto alignment', () => {
  test('phaseFind does not require reset', () => {
    const v = { ...freshVisit(), present: 'no' };
    expect(PHASES.find((p) => p.key === 'find').st(v)).toBe('done');
    expect(v.reset).toBeUndefined();
  });

  test('required photos include shelf zooms even when JOEY absent (Claude proto)', () => {
    const v = { ...freshVisit(), present: 'no' };
    const ids = requiredPhotoDefs(v).map((d) => d.id);
    expect(ids).toEqual(expect.arrayContaining(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p9']));
  });

  test('photo titles match Claude prototype', () => {
    const titles = requiredPhotoDefs(freshVisit()).map((d) => d.title);
    expect(titles).toEqual([
      'Full backbar',
      'Zoom shelf 1',
      'Zoom shelf 2',
      'JOEY close up',
      'POS: Door',
      'POS: Shelf / Channel Strip',
      'Exterior',
    ]);
  });

  test('POS declined flags', () => {
    const v = {
      ...freshVisit(),
      pos: { door: 'declined', strip: 'present', bollard: 'notprovided' },
    };
    expect(visitFlags(v)).toContain('POS_DECLINED');
  });

  test('validateVisit asks for Find it when present unanswered', () => {
    expect(validateVisit(freshVisit())).toMatch(/Check in|Find it/i);
  });
});
