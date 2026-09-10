import {
  GPS_STATUS,
  GPS_LOW_ACCURACY_M,
  MISMATCH_RADIUS_M,
  captureGps,
  distanceMeters,
  storeCoords,
  evaluateLocation,
  formatDistance,
  locationBannerCopy,
} from './gps';
import { freshVisit, visitFlags, validateVisit, currentCycleKey } from './visitLogic';

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function approx(a, b, tol = 25) {
  return Math.abs(a - b) <= tol;
}

describe('distanceMeters', () => {
  test('returns null for incomplete inputs', () => {
    expect(distanceMeters(null, { lat: 1, lng: 2 })).toBeNull();
    expect(distanceMeters({ lat: 1 }, { lat: 1, lng: 2 })).toBeNull();
    expect(distanceMeters({ lat: 1, lng: 2 }, { lat: 1, lng: null })).toBeNull();
  });

  test('same point is ~0m', () => {
    const p = { lat: 35.1894, lng: -114.053 };
    expect(distanceMeters(p, p)).toBeLessThan(1);
  });

  test('known short distance is reasonable', () => {
    // ~111m north at equator-ish; at ~35°N ~1e-3 deg lat ≈ 111m
    const a = { lat: 35.0, lng: -114.0 };
    const b = { lat: 35.001, lng: -114.0 };
    const d = distanceMeters(a, b);
    expect(approx(d, 111, 5)).toBe(true);
  });
});

describe('storeCoords', () => {
  test('reads lat/lng', () => {
    expect(storeCoords({ lat: 35.1, lng: -114.2 })).toEqual({ lat: 35.1, lng: -114.2 });
  });

  test('reads latitude/longitude aliases', () => {
    expect(storeCoords({ latitude: '35.1', longitude: '-114.2' })).toEqual({
      lat: 35.1,
      lng: -114.2,
    });
  });

  test('rejects missing / invalid', () => {
    expect(storeCoords(null)).toBeNull();
    expect(storeCoords({})).toBeNull();
    expect(storeCoords({ lat: 91, lng: 0 })).toBeNull();
    expect(storeCoords({ lat: 0, lng: 200 })).toBeNull();
  });
});

describe('evaluateLocation', () => {
  const store = { lat: 35.1894, lng: -114.053, site_number: '2652036' };

  test('missing gps is unavailable, not mismatch', () => {
    const r = evaluateLocation({ gps: null, status: GPS_STATUS.TIMEOUT, error: 't' }, store);
    expect(r.gpsUnavailable).toBe(true);
    expect(r.locationMismatch).toBe(false);
    expect(r.gpsStatus).toBe(GPS_STATUS.TIMEOUT);
    expect(r.storeHasCoords).toBe(true);
  });

  test('near store is ok', () => {
    const r = evaluateLocation(
      {
        gps: { lat: store.lat + 0.0001, lng: store.lng, accuracy: 15, at: 'x' },
        status: GPS_STATUS.OK,
      },
      store
    );
    expect(r.gpsUnavailable).toBe(false);
    expect(r.locationMismatch).toBe(false);
    expect(r.gpsStatus).toBe(GPS_STATUS.OK);
    expect(r.gpsDistanceM).toBeLessThan(50);
  });

  test('far from store is mismatch', () => {
    const r = evaluateLocation(
      {
        gps: { lat: 40.7, lng: -74.0, accuracy: 20, at: 'x' },
        status: GPS_STATUS.OK,
      },
      store
    );
    expect(r.locationMismatch).toBe(true);
    expect(r.gpsStatus).toBe(GPS_STATUS.MISMATCH);
    expect(r.gpsDistanceM).toBeGreaterThan(MISMATCH_RADIUS_M);
  });

  test('coarse accuracy near store is low_accuracy', () => {
    const r = evaluateLocation(
      {
        gps: {
          lat: store.lat,
          lng: store.lng,
          accuracy: GPS_LOW_ACCURACY_M + 50,
          at: 'x',
        },
        status: GPS_STATUS.OK,
      },
      store
    );
    expect(r.locationMismatch).toBe(false);
    expect(r.gpsStatus).toBe(GPS_STATUS.LOW_ACCURACY);
  });

  test('gps without store coords never mismatches', () => {
    const r = evaluateLocation(
      {
        gps: { lat: 40.7, lng: -74.0, accuracy: 10, at: 'x' },
        status: GPS_STATUS.OK,
      },
      { city: 'Nowhere' }
    );
    expect(r.storeHasCoords).toBe(false);
    expect(r.locationMismatch).toBe(false);
    expect(r.gpsStatus).toBe(GPS_STATUS.OK);
    expect(r.gpsDistanceM).toBeNull();
  });

  test('mismatch wins over low accuracy', () => {
    const r = evaluateLocation(
      {
        gps: { lat: 40.7, lng: -74.0, accuracy: 500, at: 'x' },
        status: GPS_STATUS.OK,
      },
      store
    );
    expect(r.gpsStatus).toBe(GPS_STATUS.MISMATCH);
  });
});

describe('formatDistance', () => {
  test('meters and miles', () => {
    expect(formatDistance(null)).toBeNull();
    expect(formatDistance(NaN)).toBeNull();
    expect(formatDistance(250)).toBe('250 m');
    expect(formatDistance(1609.344)).toBe('1.0 mi');
  });
});

describe('locationBannerCopy', () => {
  const statuses = Object.values(GPS_STATUS);
  test.each(statuses)('returns tone/title/body for %s', (status) => {
    const copy = locationBannerCopy({ gpsStatus: status, gpsDistanceM: 120 });
    expect(copy.tone).toMatch(/ok|info|warn/);
    expect(copy.title).toBeTruthy();
    expect(copy.body).toBeTruthy();
  });

  test('defaults to pending', () => {
    expect(locationBannerCopy({}).title).toMatch(/Getting GPS/);
  });
});

describe('captureGps', () => {
  afterEach(() => {
    delete global.navigator;
  });

  test('unsupported without geolocation', async () => {
    global.navigator = {};
    const r = await captureGps();
    expect(r.gps).toBeNull();
    expect(r.status).toBe(GPS_STATUS.UNSUPPORTED);
  });

  test('success on high accuracy', async () => {
    global.navigator = {
      geolocation: {
        getCurrentPosition: (ok) =>
          ok({
            coords: { latitude: 35.1, longitude: -114.2, accuracy: 12 },
          }),
      },
    };
    const r = await captureGps();
    expect(r.status).toBe(GPS_STATUS.OK);
    expect(r.gps.lat).toBe(35.1);
    expect(r.gps.lng).toBe(-114.2);
    expect(r.gps.accuracy).toBe(12);
    expect(r.gps.at).toBeTruthy();
  });

  test('denied does not fall back', async () => {
    let calls = 0;
    global.navigator = {
      geolocation: {
        getCurrentPosition: (_ok, err) => {
          calls += 1;
          err({ code: 1, message: 'denied' });
        },
      },
    };
    const r = await captureGps();
    expect(r.status).toBe(GPS_STATUS.DENIED);
    expect(r.gps).toBeNull();
    expect(calls).toBe(1);
  });

  test('falls back after high-accuracy timeout', async () => {
    let calls = 0;
    global.navigator = {
      geolocation: {
        getCurrentPosition: (ok, err, opts) => {
          calls += 1;
          if (opts.enableHighAccuracy) {
            err({ code: 3, message: 'timeout' });
            return;
          }
          ok({ coords: { latitude: 1, longitude: 2, accuracy: 80 } });
        },
      },
    };
    const r = await captureGps();
    expect(calls).toBe(2);
    expect(r.status).toBe(GPS_STATUS.OK);
    expect(r.gps.lat).toBe(1);
  });

  test('both attempts fail → timeout/unavailable', async () => {
    global.navigator = {
      geolocation: {
        getCurrentPosition: (_ok, err) => err({ code: 3, message: 'timeout' }),
      },
    };
    const r = await captureGps();
    expect(r.gps).toBeNull();
    expect(r.status).toBe(GPS_STATUS.TIMEOUT);
  });
});

describe('visitFlags GPS behavior', () => {
  test('pending without gps does not flag', () => {
    const v = freshVisit();
    expect(visitFlags(v)).not.toContain('GPS_UNAVAILABLE');
    expect(visitFlags(v)).not.toContain('LOCATION_MISMATCH');
  });

  test('unavailable → GPS_UNAVAILABLE only', () => {
    const v = {
      ...freshVisit(),
      gpsUnavailable: true,
      gpsStatus: GPS_STATUS.DENIED,
      locationMismatch: false,
    };
    expect(visitFlags(v)).toEqual(['GPS_UNAVAILABLE']);
  });

  test('mismatch → LOCATION_MISMATCH only (not unavailable)', () => {
    const v = {
      ...freshVisit(),
      gps: { lat: 1, lng: 2 },
      locationMismatch: true,
      gpsUnavailable: false,
      gpsStatus: GPS_STATUS.MISMATCH,
    };
    expect(visitFlags(v)).toEqual(['LOCATION_MISMATCH']);
  });

  test('ok gps → no location flags', () => {
    const v = {
      ...freshVisit(),
      gps: { lat: 1, lng: 2 },
      gpsStatus: GPS_STATUS.OK,
      gpsUnavailable: false,
      locationMismatch: false,
    };
    expect(visitFlags(v)).toEqual([]);
  });

  test('low accuracy near store → no location flags', () => {
    const v = {
      ...freshVisit(),
      gps: { lat: 1, lng: 2 },
      gpsStatus: GPS_STATUS.LOW_ACCURACY,
      gpsUnavailable: false,
      locationMismatch: false,
    };
    expect(visitFlags(v)).toEqual([]);
  });
});

describe('visitLogic smoke', () => {
  test('freshVisit has gps fields', () => {
    const v = freshVisit();
    expect(v.gpsStatus).toBe('pending');
    expect(v.gps).toBeNull();
    expect(v.locationMismatch).toBe(false);
  });

  test('currentCycleKey shape', () => {
    expect(currentCycleKey()).toMatch(/^\d{4}-Q[1-4]$/);
  });

  test('validateVisit requires check-in answers', () => {
    expect(validateVisit(freshVisit())).toMatch(/Check in|answer|Asking|Selling/i);
  });
});

describe('stores.json geocode coverage', () => {
  test('majority of stores have lat/lng', () => {
    // eslint-disable-next-line global-require
    const stores = require('../../public/data/stores.json');
    const withCoords = stores.filter(
      (s) => Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng))
    ).length;
    expect(withCoords).toBeGreaterThan(2000);
    expect(withCoords / stores.length).toBeGreaterThan(0.8);
  });

  test('Kingman demo store is geocoded', () => {
    const stores = require('../../public/data/stores.json');
    const king = stores.find((s) => String(s.site_number) === '2652036');
    assert(king, 'store 2652036 missing');
    expect(Number.isFinite(king.lat)).toBe(true);
    expect(Number.isFinite(king.lng)).toBe(true);
  });
});
