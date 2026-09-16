import { geofenceGate } from './gps';
import { dwellSeconds, validateVisit, freshVisit } from './visitLogic';

describe('geofenceGate + dwellSeconds', () => {
  test('soft by default when mismatched', () => {
    expect(geofenceGate({ locationMismatch: true }).blocked).toBe(false);
  });

  test('hard block requires exception note', () => {
    expect(
      geofenceGate({ locationMismatch: true, exceptionNote: '' }, { hardBlock: true }).blocked
    ).toBe(true);
    expect(
      geofenceGate(
        { locationMismatch: true, exceptionNote: 'parking lot drift' },
        { hardBlock: true }
      ).blocked
    ).toBe(false);
  });

  test('exception path skips geofence note requirement', () => {
    const v = freshVisit();
    v.locationMismatch = true;
    v.exception = 'closed';
    expect(validateVisit(v, { requireGeofenceNote: true })).toBeNull();
  });

  test('dwellSeconds from startedAt', () => {
    const start = new Date(Date.now() - 125000).toISOString();
    const sec = dwellSeconds({ startedAt: start });
    expect(sec).toBeGreaterThanOrEqual(120);
    expect(sec).toBeLessThan(140);
  });

  test('dwellSeconds null without start', () => {
    expect(dwellSeconds({})).toBeNull();
  });
});
