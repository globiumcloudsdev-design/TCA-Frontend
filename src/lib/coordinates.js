/**
 * Coordinate helpers for the "Campus location for attendance" settings.
 */

const inRange = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

/**
 * Parse a pasted location. Accepts:
 *   "24.9445, 66.9391"  ·  "24.9445 66.9391"  ·  "24.9445;66.9391"  ·  "(24.9445, 66.9391)"
 *   "24.9445 N, 66.9391 E" (S / W make the value negative)
 *   a Google Maps link containing "@lat,lng" or "?q=lat,lng" / "ll=lat,lng"
 * @returns {{ latitude: number, longitude: number } | null}  null when it can't be read or is out of range
 */
export function parseCoordinates(input) {
  if (typeof input !== 'string') return null;
  let text = input.trim();
  if (!text) return null;

  // Google Maps URLs
  const urlMatch = text.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) || text.match(/[?&](?:q|ll|query)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i);
  if (urlMatch) {
    const lat = Number(urlMatch[1]);
    const lng = Number(urlMatch[2]);
    return inRange(lat, lng) ? { latitude: lat, longitude: lng } : null;
  }

  text = text.replace(/[()\[\]]/g, ' ');
  const m = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*°?\s*([NSns])?\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EWew])?\s*$/);
  if (!m) return null;
  let lat = Number(m[1]);
  let lng = Number(m[3]);
  if (m[2] && m[2].toUpperCase() === 'S') lat = -Math.abs(lat);
  if (m[4] && m[4].toUpperCase() === 'W') lng = -Math.abs(lng);
  return inRange(lat, lng) ? { latitude: lat, longitude: lng } : null;
}

/** Radius rules for the attendance geofence: 10–500 metres (default 50). */
export const RADIUS_MIN = 10;
export const RADIUS_MAX = 500;
export const RADIUS_DEFAULT = 50;

export function validateRadius(value) {
  if (value === '' || value === null || value === undefined) return { ok: false, error: `Enter a radius between ${RADIUS_MIN} and ${RADIUS_MAX} metres` };
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < RADIUS_MIN || n > RADIUS_MAX) {
    return { ok: false, error: `Radius must be a whole number between ${RADIUS_MIN} and ${RADIUS_MAX} metres` };
  }
  return { ok: true, error: null };
}

export const hasCoordinates = (location) =>
  location && location.latitude !== null && location.latitude !== undefined && location.latitude !== '' && location.longitude !== null && location.longitude !== undefined && location.longitude !== '' &&
  Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude));

export const googleMapsUrl = (lat, lng) => `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`.replace('%2C', ',');
