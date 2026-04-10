/**
 * Auth API Service
 * POST /auth/login
 * POST /auth/logout
 * POST /auth/refresh
 * POST /auth/forgot-password
 * POST /auth/reset-password
 * GET  /auth/me
 */
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