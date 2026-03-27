/**
 * The Clouds Academy — Axios Instance (api.js)
 *
 * All API calls go through this single instance.
 * It automatically attaches:
 *   - Authorization: Bearer <accessToken>      (from localStorage)
 *   - X-School-Code: <schoolCode>              (from Zustand authStore)
 *   - X-Branch-ID:   <branchId>               (optional, from Zustand authStore)
 *
 * On 401 → tries to refresh token once, then logs out.
 */

import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Access token from cookie (set by backend as non-httpOnly)
    const token = Cookies.get('access_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    // School code — read from localStorage (set after login)
    const schoolCode = localStorage.getItem('school_code');
    if (schoolCode) config.headers['X-School-Code'] = schoolCode;

    // Branch ID — optional, only when school has branches
    const branchId = localStorage.getItem('active_branch_id');
    if (branchId) config.headers['X-Branch-ID'] = branchId;

    // For FormData uploads, remove the default JSON Content-Type so the browser
    // can set multipart/form-data with the correct boundary automatically.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor (auto refresh on 401) ────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue all requests that come in while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data?.data?.access_token;
        if (newToken) {
          Cookies.set('access_token', newToken, { expires: 7 });
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Token refresh failed — clear everything and redirect to login
        Cookies.remove('access_token');
        localStorage.removeItem('school_code');
        localStorage.removeItem('active_branch_id');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
