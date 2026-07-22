import api from "@/lib/api";

export const supportService = {
  createTicket: (data) => api.post('/support', data),
  getMyTickets: () => api.get('/support'),
  getTicketDetails: (id) => api.get(`/support/${id}`),
  addReply: (id, message) => api.post(`/support/${id}/reply`, { message }),
};
