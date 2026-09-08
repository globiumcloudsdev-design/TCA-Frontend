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
import {
  isBranchAdmin,
  isMainBranchUser,
  getAssignedBranch,
  clearAuthData,
  getRefreshToken,
  setRefreshToken,
  setAccessToken
} from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 120 seconds default timeout across the app
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

    // Guarantee a safe minimum timeout of at least 60 seconds for ANY request across the app,
    // preventing hardcoded low timeouts (e.g. 5s, 10s, 15s in legacy services) from aborting prematurely.
    if (!config.timeout || config.timeout < 60000) {
      config.timeout = 60000;
    }

    // Automatically elevate timeout for heavy operations across the complete app
    const urlLower = url.toLowerCase();
    const isHeavyOperation =
      urlLower.includes('bulk') ||
      urlLower.includes('import') ||
      urlLower.includes('export') ||
      urlLower.includes('upload') ||
      urlLower.includes('generate') ||
      urlLower.includes('report') ||
      urlLower.includes('backup') ||
      urlLower.includes('sync') ||
      urlLower.includes('voucher') ||
      urlLower.includes('fee') ||
      urlLower.includes('defaulter') ||
      urlLower.includes('attendance');

    if (isHeavyOperation) {
      config.timeout = Math.max(config.timeout || 0, 300000); // 5 minutes for heavy operations
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

      const storedRefreshToken =
        getRefreshToken() ||
        Cookies.get('refreshToken') ||
        Cookies.get('refresh_token') ||
        (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);

      // If no refresh token exists at all, do not attempt network refresh
      if (!storedRefreshToken) {
        clearAuthData();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {
            refreshToken: storedRefreshToken,
            refresh_token: storedRefreshToken
          },
          { withCredentials: true }
        );
        const newToken = data?.data?.access_token || data?.data?.accessToken;
        const newRefreshToken = data?.data?.refresh_token || data?.data?.refreshToken;
        if (newToken) {
          setAccessToken(newToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          throw new Error('No access token received from refresh-token');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Token refresh failed — clean wipe everything and redirect to login
        clearAuthData();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutMsg = 'Operation timed out. The server is taking longer than expected to respond. If importing large data, please try again.';
      if (error.response?.data) {
        error.response.data.message = timeoutMsg;
      } else {
        error.message = timeoutMsg;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
