/** Field GPS capture + store proximity checks. */

export const GPS_HIGH_ACCURACY_MS = 12000;
export const GPS_FALLBACK_MS = 8000;
/** Soft warning when fix is coarse (still usable). */
export const GPS_LOW_ACCURACY_M = 100;
/** Flag LOCATION_MISMATCH beyond this distance from store (when store has coords). */
export const MISMATCH_RADIUS_M = 500;

export const GPS_STATUS = {
  PENDING: 'pending',
  OK: 'ok',
  LOW_ACCURACY: 'low_accuracy',
  MISMATCH: 'mismatch',
  UNAVAILABLE: 'unavailable',
  DENIED: 'denied',
  TIMEOUT: 'timeout',
  UNSUPPORTED: 'unsupported',
};

function positionErrorCode(err) {
  if (!err) return GPS_STATUS.UNAVAILABLE;
  if (err.code === 1) return GPS_STATUS.DENIED;
  if (err.code === 3) return GPS_STATUS.TIMEOUT;
  return GPS_STATUS.UNAVAILABLE;
}

function getCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(Object.assign(new Error('unsupported'), { code: 0 }));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Capture device GPS. Tries high accuracy first, then a lower-accuracy fallback.
 * Never blocks the visit UI — callers should run this in the background.
 */
export async function captureGps() {
  if (!navigator.geolocation) {
    return { gps: null, status: GPS_STATUS.UNSUPPORTED, error: 'Geolocation unsupported' };
  }

  try {
    const pos = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: GPS_HIGH_ACCURACY_MS,
      maximumAge: 0,
    });
    return {
      gps: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        at: new Date().toISOString(),
      },
      status: GPS_STATUS.OK,
      error: null,
    };
  } catch (firstErr) {
    if (firstErr?.code === 1) {
      return { gps: null, status: GPS_STATUS.DENIED, error: firstErr.message || 'Permission denied' };
    }
    try {
      const pos = await getCurrentPosition({
        enableHighAccuracy: false,
        timeout: GPS_FALLBACK_MS,
        maximumAge: 60000,
      });
      return {
        gps: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          at: new Date().toISOString(),
        },
        status: GPS_STATUS.OK,
        error: null,
      };
    } catch (secondErr) {
      return {
        gps: null,
        status: positionErrorCode(secondErr),
        error: secondErr?.message || firstErr?.message || 'GPS failed',
      };
    }
  }
}

/** Haversine distance in meters. */
export function distanceMeters(a, b) {
  if (
    a == null ||
    b == null ||
    a.lat == null ||
    a.lng == null ||
    b.lat == null ||
    b.lng == null
  ) {
    return null;
  }
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function storeCoords(store) {
  if (!store) return null;
  const lat = Number(store.lat ?? store.latitude);
  const lng = Number(store.lng ?? store.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/**
 * Combine a GPS capture with optional store coordinates.
 * LOCATION_MISMATCH only when store coords exist and distance exceeds radius.
 */
export function evaluateLocation(capture, store) {
  const { gps, status: captureStatus, error } = capture || {};
  const storeLoc = storeCoords(store);

  if (!gps) {
    return {
      gps: null,
      gpsStatus: captureStatus || GPS_STATUS.UNAVAILABLE,
      gpsUnavailable: true,
      locationMismatch: false,
      gpsDistanceM: null,
      gpsError: error || null,
      storeHasCoords: !!storeLoc,
    };
  }

  const distanceM = storeLoc ? distanceMeters(gps, storeLoc) : null;
  const inaccurate =
    Number.isFinite(gps.accuracy) && gps.accuracy > GPS_LOW_ACCURACY_M;
  const mismatched =
    distanceM != null && distanceM > MISMATCH_RADIUS_M;

  let gpsStatus = GPS_STATUS.OK;
  if (mismatched) gpsStatus = GPS_STATUS.MISMATCH;
  else if (inaccurate) gpsStatus = GPS_STATUS.LOW_ACCURACY;

  return {
    gps: {
      ...gps,
      distanceM: distanceM != null ? Math.round(distanceM) : null,
      storeLat: storeLoc?.lat ?? null,
      storeLng: storeLoc?.lng ?? null,
    },
    gpsStatus,
    gpsUnavailable: false,
    locationMismatch: mismatched,
    gpsDistanceM: distanceM != null ? Math.round(distanceM) : null,
    gpsError: null,
    storeHasCoords: !!storeLoc,
  };
}

export function formatDistance(meters) {
  if (meters == null || !Number.isFinite(meters)) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1609.344).toFixed(1)} mi`;
}

export function locationBannerCopy(v) {
  const status = v?.gpsStatus || GPS_STATUS.PENDING;
  const dist = formatDistance(v?.gpsDistanceM);

  switch (status) {
    case GPS_STATUS.PENDING:
      return {
        tone: 'info',
        title: 'Getting GPS…',
        body: 'Visit is not blocked. Location continues in the background.',
      };
    case GPS_STATUS.OK:
      return {
        tone: 'ok',
        title: dist ? `Location verified · ${dist} from store` : 'GPS captured',
        body: 'Coordinates will be saved with this visit.',
      };
    case GPS_STATUS.LOW_ACCURACY:
      return {
        tone: 'info',
        title: dist
          ? `GPS captured (low accuracy) · ${dist} from store`
          : 'GPS captured (low accuracy)',
        body: 'Fix is coarse but usable. Move near a window or outdoors and retry if needed.',
      };
    case GPS_STATUS.MISMATCH:
      return {
        tone: 'warn',
        title: dist
          ? `Location mismatch · ${dist} from store`
          : 'Location mismatch',
        body: 'Outside the expected store radius. Visit flagged LOCATION_MISMATCH (not blocked).',
      };
    case GPS_STATUS.DENIED:
      return {
        tone: 'warn',
        title: 'Location permission denied',
        body: 'Enable location for this site, then retry. Visit will be flagged GPS_UNAVAILABLE.',
      };
    case GPS_STATUS.TIMEOUT:
      return {
        tone: 'warn',
        title: 'GPS timed out',
        body: 'Could not get a fix in time. Retry outdoors. Visit will be flagged GPS_UNAVAILABLE.',
      };
    case GPS_STATUS.UNSUPPORTED:
      return {
        tone: 'warn',
        title: 'GPS not supported on this device',
        body: 'Use a phone with location services. Visit will be flagged GPS_UNAVAILABLE.',
      };
    case GPS_STATUS.UNAVAILABLE:
    default:
      return {
        tone: 'warn',
        title: 'GPS unavailable',
        body: 'No coordinates for this visit yet. Retry recommended. Flagged GPS_UNAVAILABLE if submitted without a fix.',
      };
  }
}
