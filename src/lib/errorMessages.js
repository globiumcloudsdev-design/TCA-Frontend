/**
 * Central error → plain-language message helper.
 *
 * Users must never see routes, URLs, query strings, UUIDs, stack traces or SQL.
 * `humanizeAxiosError` is called once by the axios response interceptor (lib/api.js): it logs the technical
 * details to the console and rewrites `error.response.data.message` / `error.message` with a friendly text,
 * so every existing `err.response.data.message` / `err.message` toast becomes friendly automatically.
 * `friendlyMessage(err)` is the explicit helper for new code.
 */

export const MESSAGES = {
  network: "Can't reach the server. Check your internet connection and try again.",
  session: 'Your session has expired. Please sign in again.',
  forbidden: "You don't have permission to do this. Contact your administrator.",
  featureMissing: "This feature isn't available on the server yet. Please contact your administrator.",
  notFound: "We couldn't find this record. It may have been deleted.",
  conflict: "This can't be changed right now because it has already been updated or published.",
  invalid: "Some of the information entered isn't valid. Please check it and try again.",
  tooMany: 'Too many attempts. Please wait a minute and try again.',
  server: 'Something went wrong on our side. Please try again in a moment.',
  generic: 'Something went wrong. Please try again.',
};

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const TECHNICAL_RE =
  /(\broute\b.*\bnot found|https?:\/\/|\/api\/|\/v\d\/|[?&][a-z_]+=|\bat\s+\S+\s+\(|\.(js|ts|jsx|cjs|mjs):\d+|\bselect\b.+\bfrom\b|\binsert\s+into\b|\bupdate\b.+\bset\b|\bsequelize|\bSQLSTATE|\bECONN|\bENOTFOUND|\bETIMEDOUT|\bTypeError|\bReferenceError|\bcannot read propert|\bundefined\b|\bnull\b\s+(value|constraint)|\bviolates\b|\bconstraint\b|[{}]|\bat \w+\.\w+)/i;

/** True if a backend string is NOT safe/clean to show a non-technical user. */
export function isTechnicalText(text) {
  if (typeof text !== 'string') return true;
  const t = text.trim();
  if (!t || t.length > 300) return true;
  return UUID_RE.test(t) || TECHNICAL_RE.test(t);
}

const isRouteNotFound = (text) => /\broute\b.*\bnot found|cannot\s+(get|post|put|patch|delete)\s+\//i.test(String(text || ''));

/** Pull optional field errors ({field: msg} / [{field,message}] / [string]) out of a response body as clean sentences. */
function fieldErrors(data) {
  const raw = data?.errors ?? data?.details;
  const out = [];
  if (Array.isArray(raw)) {
    raw.forEach((e) => {
      const m = typeof e === 'string' ? e : e?.message;
      if (m && !isTechnicalText(m)) out.push(m);
    });
  } else if (raw && typeof raw === 'object') {
    Object.values(raw).forEach((m) => {
      const s = Array.isArray(m) ? m[0] : m;
      if (typeof s === 'string' && !isTechnicalText(s)) out.push(s);
    });
  }
  return out.slice(0, 3);
}

/**
 * Friendly message for any error (axios error, Error, string).
 * @param {object} [opts]  { fallback, keepAuthMessage }  keepAuthMessage: keep a clean 401 text (login screens)
 */
export function friendlyMessage(error, opts = {}) {
  const { fallback = MESSAGES.generic, keepAuthMessage = false } = opts;
  if (typeof error === 'string') return isTechnicalText(error) ? fallback : error;
  if (!error) return fallback;

  const res = error.response;
  if (!res) {
    // No response at all: offline, DNS, CORS, timeout, aborted
    if (error.code || /network|timeout|timed out|failed to fetch|aborted/i.test(String(error.message || ''))) return MESSAGES.network;
    const m = String(error.message || '');
    return m && !isTechnicalText(m) ? m : fallback;
  }

  const status = res.status;
  const raw = res.data?.message ?? res.data?.error ?? (typeof res.data === 'string' ? res.data : '');
  const clean = typeof raw === 'string' && !isTechnicalText(raw) ? raw.trim() : '';

  if (status === 401) return keepAuthMessage && clean ? clean : MESSAGES.session;
  if (status === 403) return clean && !/permission|forbidden|not allowed|access denied/i.test(clean) ? clean : MESSAGES.forbidden;
  if (status === 404) return isRouteNotFound(raw) ? MESSAGES.featureMissing : MESSAGES.notFound;
  if (status === 409) return clean || MESSAGES.conflict;
  if (status === 429) return MESSAGES.tooMany;
  if (status >= 500) return MESSAGES.server;
  if (status === 400 || status === 422) {
    const base = clean || MESSAGES.invalid;
    const extra = fieldErrors(res.data).filter((m) => m !== base);
    return extra.length ? `${base} ${extra.join(' ')}` : base;
  }
  return clean || fallback;
}

/**
 * Called by the axios interceptor. Logs the technical details to the console only, then replaces the
 * user-visible message fields. Idempotent.
 */
export function humanizeAxiosError(error) {
  if (!error || error.__humanized) return error;
  try {
    const url = error.config?.url || '';
    const isAuthEndpoint = /\/auth\/(login|login-with-account|forgot|reset)/i.test(url);
    const message = friendlyMessage(error, { keepAuthMessage: isAuthEndpoint });

    // eslint-disable-next-line no-console
    console.error('[API error]', {
      status: error.response?.status,
      method: error.config?.method,
      url,
      backendMessage: error.response?.data?.message,
      code: error.code,
      technical: error.message,
    });

    error.technicalMessage = error.response?.data?.message || error.message;
    error.message = message;
    if (error.response) {
      if (error.response.data && typeof error.response.data === 'object') {
        error.response.data.message = message;
      } else {
        error.response.data = { message };
      }
    }
    error.__humanized = true;
  } catch (e) {
    // never let the error helper break the request flow
  }
  return error;
}
