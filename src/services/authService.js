// /**
//  * Auth API Service
//  * POST /auth/login
//  * POST /auth/logout
//  * POST /auth/refresh
//  * POST /auth/forgot-password
//  * POST /auth/reset-password
//  * GET  /auth/me
//  */

// import api from '@/lib/api';

// /**
//  * Normalize backend camelCase login payload → frontend snake_case shape.
//  * Backend returns: { accessToken, user: { firstName, lastName, userType, schoolId, ... } }
//  * Frontend expects: { access_token, user: { first_name, last_name, role_code, user_type, school_id, ... } }
//  */
// function normalizeLoginResponse(payload) {
//   const { accessToken, user } = payload;
//   return {
//     access_token: accessToken,
//     user: {
//       id: user.id,
//       first_name: user.firstName ?? user.first_name,
//       last_name: user.lastName ?? user.last_name,
//       email: user.email,
//       // role_code comes from role.code (e.g. 'MASTER_ADMIN'); fall back to userType
//       role_code: user.role?.code ?? user.userType ?? user.role_code,
//       user_type: user.userType ?? user.user_type,
//       school_id: user.schoolId ?? user.school_id ?? null,
//       role: user.role ?? null,
//       permissions: user.permissions ?? [],
//       avatar_url: user.avatarUrl ?? user.avatar_url ?? null,
//       institute: user.institute ?? user.school ?? null,
//       // convenience top-level field used by middleware cookie + login redirect
//       institute_type:
//         user.institute?.institute_type ??
//         user.school?.institute_type ??
//         user.institute_type ??
//         null,
//     },
//   };
// }

// export const authService = {
//   // // Login — returns { user, access_token } from REAL backend only. No dummy fallback.
//   // login: async (data) => {
//   //   console.group('%c[Auth] Login attempt', 'color: #6366f1; font-weight: bold');
//   //   console.log('→ Endpoint:', '/auth/login');
//   //   console.log('→ Email:', data.email);
//   //   try {
//   //     const r = await api.post('/auth/login', data);
//   //     console.log('→ Raw response:', r.data);

//   //     // Backend wraps in { success, message, data: { accessToken, user }, timestamp }
//   //     const payload = r.data?.data ?? r.data;
//   //     console.log('→ Unwrapped payload:', payload);

//   //     const result = normalizeLoginResponse(payload);
//   //     console.log('→ Normalized user:', result.user);
//   //     console.log('→ Permissions count:', result.user.permissions?.length ?? 0);
//   //     console.log('→ Permissions:', result.user.permissions);
//   //     console.groupEnd();
//   //     return result;
//   //   } catch (err) {
//   //     const status = err?.response?.status;
//   //     const msg    = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
//   //     console.error('→ Login FAILED — status:', status, '| message:', msg);
//   //     console.error('→ Full error response:', err?.response?.data);
//   //     console.groupEnd();
//   //     // Always re-throw — never silently fall back to dummy data
//   //     throw err;
//   //   }
//   // },

//   // /**
//   //  * Login with email/password
//   //  * Returns accounts list if multiple found
//   //  */
//   // login: async (credentials) => {
//   //   const response = await api.post('/auth/login', credentials);
//   //   return response.data;
//   // },
//   // frontend/src/services/auth.service.js

// // Debug version - log raw response
// getAccountsByEmail: async (email) => {
//   console.log('🔍 Getting accounts for:', email);
//   const response = await api.get(`/auth/accounts?email=${encodeURIComponent(email)}`);
//   console.log('📦 Raw accounts response:', response);
//   console.log('📦 Response data:', response.data);
  
//   // Handle different response structures
//   const result = response.data?.data || response.data;
//   console.log('📦 Processed result:', result);
  
//   return result;
// },

// login: async (credentials) => {
//   console.log('🔐 Login attempt:', credentials);
//   const response = await api.post('/auth/login', credentials);
//   console.log('📦 Raw login response:', response);
//   console.log('📦 Login response data:', response.data);
  
//   // Return the data directly (not response.data.data)
//   return response.data?.data || response.data;
// },

// loginWithAccount: async ({ accountId, password }) => {
//   console.log('🔐 Login with account:', { accountId });
//   const response = await api.post('/auth/login-with-account', { accountId, password });
//   console.log('📦 Raw account login response:', response);
//   return response.data?.data || response.data;
// },

//   /**
//    * Select specific account after multiple account detection
//    */
//   selectAccount: async (data) => {
//     const response = await api.post('/auth/select-account', data);
//     return response.data;
//   },


//   // Logout (clears httpOnly refresh cookie on server)
//   logout: () => api.post('/auth/logout').then((r) => r.data),

//   // Get current user profile with permissions
//   getMe: () => api.get('/auth/me').then((r) => r.data?.data ?? r.data),

//   // Forgot password — sends reset email
//   forgotPassword: (email, schoolCode) =>
//     api.post('/auth/forgot-password', { email, school_code: schoolCode }).then((r) => r.data),

//   // Reset password with token from email
//   resetPassword: (token, newPassword) =>
//     api.post('/auth/reset-password', { token, password: newPassword }).then((r) => r.data),
// };

// frontend/src/services/auth.service.js (COMPLETE FIXED)

import api from '@/lib/api';

/**
 * Normalize login response to always return { user, accessToken }
 */
const normalizeLoginResponse = (response) => {
  console.log('🔄 Normalizing login response:', response);
  
  // If response already has user and accessToken
  if (response.user && response.accessToken) {
    return response;
  }
  
  // If response is wrapped in data
  if (response.data?.user && response.data?.accessToken) {
    return {
      user: response.data.user,
      accessToken: response.data.accessToken
    };
  }
  
  // If response is from accounts endpoint
  if (response.requiresAccountSelection === false && response.singleAccount) {
    return {
      requiresAccountSelection: false,
      singleAccount: response.singleAccount,
      message: response.message
    };
  }
  
  // If multiple accounts
  if (response.accounts && response.accounts.length > 0) {
    return {
      requiresAccountSelection: true,
      accounts: response.accounts,
      message: response.message
    };
  }
  
  return response;
};

export const authService = {
  /**
   * Get accounts by email (without password verification)
   */
  getAccountsByEmail: async (email) => {
    try {
      console.log('🔍 Getting accounts for:', email);
      const response = await api.get(`/auth/accounts?email=${encodeURIComponent(email)}`);
      console.log('📦 Accounts response:', response.data);
      
      // Handle response structure
      const result = response.data?.data || response.data;
      return {
        accounts: result?.accounts || [],
        hasAccounts: result?.hasAccounts || false,
        accountCount: result?.accountCount || 0
      };
    } catch (error) {
      console.error('❌ Error getting accounts:', error);
      return { accounts: [], hasAccounts: false, accountCount: 0 };
    }
  },

  /**
   * Login with email/password
   */
  login: async (credentials) => {
    console.log('🔐 Login attempt:', { email: credentials.email, reg_no: credentials.registration_no });
    const response = await api.post('/auth/login', credentials);
    console.log('📦 Login response:', response.data);
    
    const result = response.data?.data || response.data;
    return normalizeLoginResponse(result);
  },

  /**
   * Login with specific account ID and password
   */
  loginWithAccount: async ({ accountId, password }) => {
    console.log('🔐 Login with account:', accountId);
    const response = await api.post('/auth/login-with-account', { accountId, password });
    console.log('📦 Account login response:', response.data);
    
    const result = response.data?.data || response.data;
    return {
      user: result?.user,
      accessToken: result?.accessToken
    };
  },

  // Logout
  logout: () => api.post('/auth/logout').then(r => r.data),

  // Get current user
  getMe: () => api.get('/auth/me').then(r => r.data?.data || r.data),

  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(r => r.data),

  // Reset password
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }).then(r => r.data),
};

export default authService;