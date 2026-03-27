/**
 * withFallback — tries a live API call; on network/server error returns dummy data.
 *
 * Usage:
 *   getAll: (filters) => withFallback(
 *     () => api.get(`/students${buildQuery(filters)}`).then((r) => r.data),
 *     () => paginate(DUMMY_STUDENTS),
 *   ),
 */

/**
 * @param {() => Promise<any>} apiFn    - async function that calls the real API
 * @param {() => any}           fallback - sync/async function that returns dummy data
 * @returns {Promise<any>}
 */
export async function withFallback(apiFn, fallback) {
  try {
    return await apiFn();
  } catch (err) {
    const status = err?.response?.status;
    // 401 = unauthenticated, 403 = forbidden, 422 = validation → let them bubble up
    // 404 here means the server/route doesn't exist (backend not running) → fall back
    if (status === 401 || status === 403 || status === 422) throw err;
    console.warn('[Demo Mode] API unreachable — using dummy data', err?.message ?? err);
    const result = typeof fallback === 'function' ? fallback() : fallback;
    return result instanceof Promise ? await result : result;
  }
}
