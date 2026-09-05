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
import { isBranchAdmin, isMainBranchUser, getAssignedBranch, clearAuthData } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 45000, // 45 seconds timeout to prevent hanging connections
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
    const schoolCode = typeof window !== 'undefined' ? localStorage.getItem('school_code') : null;
    if (schoolCode) config.headers['X-School-Code'] = schoolCode;

    // Avoid custom header X-Branch-ID to prevent CORS preflight rejection on remote servers.
    delete config.headers['X-Branch-ID'];
    delete config.headers['x-branch-id'];

    const url = String(config.url || '');
    const isGlobalEndpoint =
      url.includes('/subscription-plans') ||
      url.includes('/master-admin') ||
      url.includes('/auth/') ||
      url.includes('/public/') ||
      url.includes('/branches') ||
      url.includes('/settings') ||
      url.includes('/roles');

    // Resolve active branch securely
    let branchId = typeof window !== 'undefined' ? localStorage.getItem('active_branch_id') : null;

    // Branch Admin role isolation
    if (typeof window !== 'undefined') {
      try {
        const authRaw = localStorage.getItem('clouds-auth');
        if (authRaw && typeof authRaw === 'string' && authRaw.trim().startsWith('{')) {
          const authData = JSON.parse(authRaw)?.state?.user;
          if (authData) {
            // Main Branch User = Super Admin (Never restricted, allowed global access)
            if (isMainBranchUser(authData)) {
              // branchId remains whatever active_branch_id has (or null for "all")
            } else if (isBranchAdmin(authData)) {
              // Non-Main Branch Admin: Strictly locked to their assigned branch
              const assigned = getAssignedBranch(authData);
              branchId = assigned?.id || authData.branch?.id || authData.branch_id;
            }
          }
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }

    // Sanitize config.params if client explicitly passed branch_id as 'all' or 'null'
    if (config.params && (config.params.branch_id === 'all' || config.params.branch_id === 'null' || config.params.branch_id === 'undefined')) {
      delete config.params.branch_id;
    }

    // Attach branch_id to query params for branch-scoped endpoints
    if (branchId && branchId !== 'all' && branchId !== 'null' && !isGlobalEndpoint) {
      if (!config.params) config.params = {};
      if (config.params.branch_id === undefined) {
        config.params.branch_id = branchId;
      }
    }

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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/logout') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
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
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = data?.data?.access_token;
        if (newToken) {
          Cookies.set('access_token', newToken, { expires: 7, path: '/' });
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Token refresh failed — clean wipe everything and redirect to login
        clearAuthData();
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
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
