/**
 * User Management API Service
 * GET    /users
 * POST   /users
 * GET    /users/:id
 * PUT    /users/:id
 * PATCH  /users/:id/assign-role
 * PATCH  /users/:id/status          (activate / deactivate)
 * DELETE /users/:id
 */

import api from '@/lib/api';

export const userService = {
  getProfile: () => api.get('/users/profile').then(r => r.data?.data || r.data),
  updateProfile: (formData) =>
    api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data?.data || r.data)
};