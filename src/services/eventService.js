/**
 * Event Service — CRUD for Events with attendance support
 *
 * Usage:
 *   eventService.getAll(filters)           → List events
 *   eventService.getById(id)               → Single event
 *   eventService.create(body)              → Create event
 *   eventService.update(id, body)          → Update event
 *   eventService.delete(id)                → Delete event
 *   eventService.toggleStatus(id, status)  → Change status
 *   eventService.getUpcoming(filters)      → Upcoming events
 *   eventService.getMyEvents()             → Portal: my events
 *   eventService.getAttendanceSummary(id)  → Event attendance report
 *   eventService.markStudentAttendance(...) → Mark student attendance
 *   eventService.markStaffAttendance(...)  → Mark staff attendance
 *   eventService.bulkMarkStudents(...)     → Bulk mark students
 *   eventService.bulkMarkStaff(...)        → Bulk mark staff
 */

import api from "@/lib/api";
import { buildQuery } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Normalize event filters
// ─────────────────────────────────────────────────────────────────────────────
function normalizeFilters(filters = {}) {
  const base = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };

  if (filters.search !== undefined && filters.search !== null && filters.search !== "") {
    base.search = filters.search;
  }
  if (filters.institute_id) base.institute_id = filters.institute_id;
  if (filters.branch_id) base.branch_id = filters.branch_id;
  if (filters.event_type) base.event_type = filters.event_type;
  if (filters.status) base.status = filters.status;
  if (filters.audience_type) base.audience_type = filters.audience_type;
  if (filters.from_date) base.from_date = filters.from_date;
  if (filters.to_date) base.to_date = filters.to_date;
  if (filters.created_by) base.created_by = filters.created_by;

  return base;
}

export const eventService = {
  // ── CRUD ──────────────────────────────────────────────────────────────────

  /**
   * List events — with filters & pagination
   * @param {object} filters
   */
  getAll: (filters = {}) => {
    const normalized = normalizeFilters(filters);
    return api.get(`/events${buildQuery(normalized)}`).then((r) => r.data);
  },

  /**
   * Get single event by ID
   * @param {string} id
   */
  getById: (id) => api.get(`/events/${id}`).then((r) => r.data),

  /**
   * Create new event
   * @param {object} body
   */
  create: (body) => api.post("/events", body).then((r) => r.data),

  /**
   * Update event
   * @param {string} id
   * @param {object} body
   */
  update: (id, body) => api.put(`/events/${id}`, body).then((r) => r.data),

  /**
   * Delete event (soft delete)
   * @param {string} id
   */
  delete: (id) => api.delete(`/events/${id}`).then((r) => r.data),

  /**
   * Toggle event status
   * @param {string} id
   * @param {string} status — draft | scheduled | completed | cancelled
   */
  toggleStatus: (id, status) =>
    api.patch(`/events/${id}/status`, { status }).then((r) => r.data),

  // ── Queries ───────────────────────────────────────────────────────────────

  /**
   * Get upcoming events
   * @param {object} filters — { branch_id, limit }
   */
  getUpcoming: (filters = {}) => {
    const params = {};
    if (filters.branch_id) params.branch_id = filters.branch_id;
    if (filters.limit) params.limit = filters.limit;
    return api.get(`/events/upcoming${buildQuery(params)}`).then((r) => r.data);
  },

  /**
   * Get my events (for portal users)
   */
  getMyEvents: () => api.get("/events/my").then((r) => r.data),

  // ── Event Attendance ──────────────────────────────────────────────────────

  /**
   * Get event attendance summary
   * @param {string} eventId
   */
  getAttendanceSummary: (eventId) =>
    api.get(`/events/${eventId}/attendance`).then((r) => r.data),

  /**
   * Mark student attendance for an event
   * @param {string} eventId
   * @param {object} data — { student_id, status, remarks }
   */
  markStudentAttendance: (eventId, data) =>
    api.post(`/events/${eventId}/attendance/student`, data).then((r) => r.data),

  /**
   * Mark staff attendance for an event
   * @param {string} eventId
   * @param {object} data — { staff_id, status, remarks }
   */
  markStaffAttendance: (eventId, data) =>
    api.post(`/events/${eventId}/attendance/staff`, data).then((r) => r.data),

  /**
   * Bulk mark student attendance for an event
   * @param {string} eventId
   * @param {object} data — { student_ids: [], status }
   */
  bulkMarkStudents: (eventId, data) =>
    api.post(`/events/${eventId}/attendance/students/bulk`, data).then((r) => r.data),

  /**
   * Bulk mark staff attendance for an event
   * @param {string} eventId
   * @param {object} data — { staff_ids: [], status }
   */
  bulkMarkStaff: (eventId, data) =>
    api.post(`/events/${eventId}/attendance/staff/bulk`, data).then((r) => r.data),
};

export default eventService;

