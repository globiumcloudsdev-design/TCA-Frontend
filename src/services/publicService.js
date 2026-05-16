import api from '@/lib/api';

export const publicService = {
  /**
   * Fetch published pricing plans for the landing page
   */
  getPricingPlans: () => 
    api.get('/public/pricing-plans').then((r) => r.data?.data ?? r.data),

  /**
   * Check platform maintenance status (public)
   */
  getPlatformStatus: () =>
    api.get('/public/platform-status').then((r) => r.data),
};
