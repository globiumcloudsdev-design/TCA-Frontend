/**
 * School API Service
 * GET    /schools/profile
 * PATCH  /schools/settings
 * PATCH  /schools/assign-role
 * DELETE /schools/assign-role
 */

import api from '@/lib/api';

export const schoolService = {
  // Get school profile with assigned role + permissions
  getProfile: () => api.get('/schools/profile').then((r) => r.data),

  // Update general settings (name, has_branches, etc.)
  updateSettings: (body) => api.patch('/schools/settings', body).then((r) => r.data),

  // Assign a role to the school (school-level permission access)
  assignRole: (roleId) =>
    api.patch('/schools/assign-role', { role_id: roleId }).then((r) => r.data),

  // Remove school's role
  removeRole: () => api.delete('/schools/assign-role').then((r) => r.data),
};
