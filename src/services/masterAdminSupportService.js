import api from "@/lib/api";

export const masterAdminSupportService = {
  getAllTickets: (params) => api.get('/master-admin/support/tickets', { params }),
  getTicketDetails: (id) => api.get(`/master-admin/support/tickets/${id}`),
  updateTicketStatus: (id, status) => api.patch(`/master-admin/support/tickets/${id}/status`, { status }),
  addReply: (id, message) => api.post(`/master-admin/support/tickets/${id}/reply`, { message }),
};
