// frontend/src/services/settingService.js
import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

const BASE_URL = '/settings';

export const settingService = {
    /**
     * Get all settings for current institute
     */
    getSettings: async () => {
        const response = await api.get(BASE_URL);
        return response.data;
    },

    /**
     * Update general settings (name, tagline, description, contact, address, social)
     */
    updateGeneralSettings: async (data) => {
        const response = await api.put(`${BASE_URL}/general`, data);
        return response.data;
    },

    /**
     * Update academic settings (session, grading, language, etc.)
     */
    updateAcademicSettings: async (data) => {
        const response = await api.put(`${BASE_URL}/academic`, data);
        return response.data;
    },

    /**
     * Update timings/schedule (working hours, breaks, holidays)
     */
    updateTimingsSettings: async (data) => {
        const response = await api.put(`${BASE_URL}/timings`, data);
        return response.data;
    },

    /**
     * Update finance settings (currency, tax, fees, payment)
     */
    updateFinanceSettings: async (data) => {
        const response = await api.put(`${BASE_URL}/finance`, data);
        return response.data;
    },

    /**
     * Update communication settings (notifications, alerts, portals)
     */
    updateCommunicationSettings: async (data) => {
        const response = await api.put(`${BASE_URL}/communication`, data);
        return response.data;
    },

    /**
     * Update appearance settings (colors, logo, favicon, branding)
     */
    updateAppearanceSettings: async (data, logoFile = null, faviconFile = null) => {
        const formData = new FormData();
        
        // Append JSON data as string
        formData.append('data', JSON.stringify(data));
        
        if (logoFile) {
            formData.append('logo', logoFile);
        }
        if (faviconFile) {
            formData.append('favicon', faviconFile);
        }
        
        const response = await api.put(`${BASE_URL}/appearance`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Update security settings (2FA, password policy, session)
     */
    updateSecuritySettings: async (data) => {
        const response = await api.put(`${BASE_URL}/security`, data);
        return response.data;
    },

    /**
     * Update module toggles (enable/disable features)
     */
    updateModuleSettings: async (data) => {
        const response = await api.put(`${BASE_URL}/modules`, data);
        return response.data;
    },

    /**
     * Update footer settings (invoice footer, certificates)
     */
    updateFooterSettings: async (data) => {
        const response = await api.put(`${BASE_URL}/footer`, data);
        return response.data;
    },

    /**
     * Bulk update multiple sections at once
     */
    bulkUpdateSettings: async (updates) => {
        const response = await api.post(`${BASE_URL}/bulk`, updates);
        return response.data;
    },

    /**
     * Reset a specific settings section to default
     */
    resetSettingsSection: async (section) => {
        const response = await api.delete(`${BASE_URL}/reset/${section}`);
        return response.data;
    },
        /**
     * Refresh user data from server (to get updated institute info)
     */
    refreshUserData: async () => {
        const response = await api.get('/auth/refresh-data');
        return response.data;
    },
};

export default settingService;