// frontend/src/services/parentPortal.service.js

/**
 * The Clouds Academy - Parent Portal Frontend Service
 */

import api from '@/lib/api';
import { withFallback } from '@/lib/withFallback';

// Dummy data for development
const DUMMY_PARENT_DASHBOARD = {
  parent: {
    id: '1',
    name: 'Mr. Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phone: '+92 300 1234567',
    avatar: null,
    children_count: 2
  },
  children: [
    {
      id: '101',
      name: 'Ali Khan',
      registration_no: 'STU-2024-001',
      class: '10th Grade',
      section: 'A',
      roll_number: '101',
      avatar: null,
      attendance: {
        percentage: 92,
        recent: [
          { date: '22 Mar', status: 'present' },
          { date: '21 Mar', status: 'present' },
          { date: '20 Mar', status: 'absent' }
        ]
      },
      upcoming_assignments: [
        {
          id: 'a1',
          title: 'Algebra Exercise',
          subject: 'Mathematics',
          due_date: '2024-03-25',
          days_left: 2
        }
      ],
      recent_results: [
        {
          exam_name: 'Mid Term 2024',
          percentage: 85,
          subjects_count: 5
        }
      ],
      fee_status: {
        has_due: false,
        total_due: 0,
        next_due_date: null
      },
      alerts: []
    },
    {
      id: '102',
      name: 'Sara Khan',
      registration_no: 'STU-2024-002',
      class: '8th Grade',
      section: 'B',
      roll_number: '205',
      avatar: null,
      attendance: {
        percentage: 78,
        recent: [
          { date: '22 Mar', status: 'present' },
          { date: '21 Mar', status: 'absent' },
          { date: '20 Mar', status: 'present' }
        ]
      },
      upcoming_assignments: [
        {
          id: 'a2',
          title: 'Science Project',
          subject: 'Science',
          due_date: '2024-03-28',
          days_left: 5
        }
      ],
      recent_results: [
        {
          exam_name: 'Mid Term 2024',
          percentage: 92,
          subjects_count: 5
        }
      ],
      fee_status: {
        has_due: true,
        total_due: 5000,
        next_due_date: '2024-03-31',
        next_due_amount: 2500
      },
      alerts: [
        {
          type: 'attendance',
          message: 'Attendance is below 80%',
          severity: 'warning'
        },
        {
          type: 'fee',
          message: 'Fee due of Rs. 5000',
          severity: 'high'
        }
      ]
    }
  ],
  notices: [
    {
      id: 'n1',
      title: 'Parent-Teacher Meeting',
      content: 'Annual parent-teacher meeting on 28th March',
      priority: 'high',
      date: '25 Mar 2024'
    },
    {
      id: 'n2',
      title: 'Summer Vacation Schedule',
      content: 'School will close for summer from 1st June',
      priority: 'medium',
      date: '20 Mar 2024'
    }
  ],
  stats: {
    total_children: 2,
    total_fee_due: 5000,
    has_fee_due: true,
    children_with_low_attendance: 1,
    children_with_pending_assignments: 2
  },
  quick_actions: [
    { label: 'Pay Fees', icon: 'CreditCard', href: '/fees/pay', alert: true },
    { label: 'View Attendance', icon: 'CheckSquare', href: '/attendance' },
    { label: 'Check Results', icon: 'Award', href: '/results' },
    { label: 'Contact Teacher', icon: 'MessageCircle', href: '/messages' }
  ]
};

const DUMMY_CHILD_DETAILS = {
  child: {
    id: '101',
    name: 'Ali Khan',
    registration_no: 'STU-2024-001',
    class: '10th Grade',
    section: 'A',
    roll_number: '101',
    date_of_birth: '2010-05-15',
    blood_group: 'B+'
  },
  attendance: {
    summary: {
      total: 45,
      present: 42,
      absent: 2,
      late: 1,
      percentage: 93
    },
    monthly: [
      { month: 'March 2024', total: 22, present: 20, percentage: 91 },
      { month: 'February 2024', total: 23, present: 22, percentage: 96 }
    ],
    records: [
      { date: '22 Mar 2024', day: 'Friday', subject: 'Mathematics', status: 'present' },
      { date: '21 Mar 2024', day: 'Thursday', subject: 'Physics', status: 'present' }
    ]
  },
  results: [
    {
      exam_name: 'Mid Term 2024',
      date: '2024-03-15',
      subjects: [
        { subject: 'Mathematics', marks: 85, total: 100, grade: 'A' },
        { subject: 'Physics', marks: 78, total: 100, grade: 'B+' },
        { subject: 'Chemistry', marks: 92, total: 100, grade: 'A+' }
      ],
      percentage: 85,
      rank: 8
    }
  ],
  fees: {
    summary: {
      total_paid: 15000,
      total_due: 0,
      paid_count: 3,
      pending_count: 0,
      overdue_count: 0
    },
    vouchers: [
      {
        id: 'v1',
        title: 'Tuition Fee - March 2024',
        amount: 2500,
        due_date: '2024-03-31',
        status: 'pending'
      },
      {
        id: 'v2',
        title: 'Tuition Fee - February 2024',
        amount: 2500,
        due_date: '2024-02-29',
        status: 'paid',
        paid_date: '2024-02-15'
      }
    ]
  },
  assignments: {
    data: [
      {
        id: 'a1',
        title: 'Algebra Exercise 5.2',
        subject: 'Mathematics',
        teacher: 'Mr. John',
        due_date: '2024-03-25',
        status: 'pending'
      },
      {
        id: 'a2',
        title: 'Physics Lab Report',
        subject: 'Physics',
        teacher: 'Ms. Sarah',
        due_date: '2024-03-22',
        status: 'submitted',
        submission: {
          submitted_at: '2024-03-21'
        }
      }
    ],
    pagination: {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  },
  timetable: {
    monday: [
      { time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Mr. John', room: '101' },
      { time: '08:45 - 09:30', subject: 'Physics', teacher: 'Ms. Sarah', room: '102' }
    ],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  }
};

export const parentPortalService = {
  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  getDashboard: () =>
    withFallback(
      () => api.get('/portal/parent/dashboard').then(r => r.data),
      () => ({ data: DUMMY_PARENT_DASHBOARD })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE
  // ─────────────────────────────────────────────────────────────────────────
  getProfile: () =>
    withFallback(
      () => api.get('/portal/parent/profile').then(r => r.data),
      () => ({ data: DUMMY_PARENT_DASHBOARD.parent })
    ),

  updateProfile: (data) =>
    api.put('/portal/parent/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILDREN
  // ─────────────────────────────────────────────────────────────────────────
  getChildren: () =>
    withFallback(
      () => api.get('/portal/parent/children').then(r => r.data),
      () => ({ data: DUMMY_PARENT_DASHBOARD.children })
    ),

  getChildDetails: (childId) =>
    withFallback(
      () => api.get(`/portal/parent/children/${childId}`).then(r => r.data),
      () => ({ data: DUMMY_CHILD_DETAILS })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD ATTENDANCE
  // ─────────────────────────────────────────────────────────────────────────
  getChildAttendance: (childId) =>
    withFallback(
      () => api.get(`/portal/parent/children/${childId}/attendance`).then(r => r.data),
      () => ({ data: DUMMY_CHILD_DETAILS.attendance })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD RESULTS
  // ─────────────────────────────────────────────────────────────────────────
  getChildResults: (childId) =>
    withFallback(
      () => api.get(`/portal/parent/children/${childId}/results`).then(r => r.data),
      () => ({ data: DUMMY_CHILD_DETAILS.results })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD FEES
  // ─────────────────────────────────────────────────────────────────────────
  getChildFees: (childId) =>
    withFallback(
      () => api.get(`/portal/parent/children/${childId}/fees`).then(r => r.data),
      () => ({ data: DUMMY_CHILD_DETAILS.fees })
    ),

  payFee: (voucherId, paymentData) =>
    api.post(`/portal/parent/fees/pay/${voucherId}`, paymentData),

  getPaymentHistory: (filters = {}) =>
    withFallback(
      () => api.get('/portal/parent/payments/history', { params: filters }).then(r => r.data),
      () => ({ 
        data: [
          {
            id: 'v2',
            title: 'Tuition Fee - February 2024',
            amount: 2500,
            paid_at: '2024-02-15',
            student: 'Ali Khan',
            payment_method: 'card'
          }
        ] 
      })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD ASSIGNMENTS
  // ─────────────────────────────────────────────────────────────────────────
  getChildAssignments: (childId, filters = {}, page = 1, limit = 10) =>
    withFallback(
      () => api.get(`/portal/parent/children/${childId}/assignments`, { 
        params: { ...filters, page, limit } 
      }).then(r => r.data),
      () => ({ data: DUMMY_CHILD_DETAILS.assignments })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD TIMETABLE
  // ─────────────────────────────────────────────────────────────────────────
  getChildTimetable: (childId) =>
    withFallback(
      () => api.get(`/portal/parent/children/${childId}/timetable`).then(r => r.data),
      () => ({ data: DUMMY_CHILD_DETAILS.timetable })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // TEACHERS
  // ─────────────────────────────────────────────────────────────────────────
  getChildrenTeachers: () =>
    withFallback(
      () => api.get('/portal/parent/teachers').then(r => r.data),
      () => ({ 
        data: [
          { id: 't1', name: 'Mr. John', subject: 'Mathematics', class: '10th Grade' },
          { id: 't2', name: 'Ms. Sarah', subject: 'Physics', class: '10th Grade' }
        ] 
      })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // NOTICES
  // ─────────────────────────────────────────────────────────────────────────
  getNotices: (limit = 10) =>
    withFallback(
      () => api.get('/portal/parent/notices', { params: { limit } }).then(r => r.data),
      () => ({ data: DUMMY_PARENT_DASHBOARD.notices })
    ),

  // ─────────────────────────────────────────────────────────────────────────
  // LEAVE REQUESTS
  // ─────────────────────────────────────────────────────────────────────────
  getLeaveRequests: (filters = {}, page = 1, limit = 10) =>
    api.get('/portal/parent/leave-requests', { 
      params: { ...filters, page, limit } 
    }).then(r => r.data),

  createLeaveRequest: (data) =>
    api.post('/portal/parent/leave-requests', data).then(r => r.data),

  getLeaveRequestById: (id) =>
    api.get(`/portal/parent/leave-requests/${id}`).then(r => r.data),

  cancelLeaveRequest: (id, data = {}) =>
    api.patch(`/portal/parent/leave-requests/${id}/cancel`, data).then(r => r.data),

  getLeaveStatistics: () =>
    api.get('/portal/parent/leave-requests/statistics').then(r => r.data),

  getLeaveBalance: () =>
    api.get('/portal/parent/leave-balance').then(r => r.data)
};