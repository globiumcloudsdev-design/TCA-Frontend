// // frontend/src/services/teacherPortal.service.js

// /**
//  * The Clouds Academy - Teacher Portal Frontend Service
//  * 
//  * Teacher ke saare API calls ek hi jagah:
//  * - Dashboard
//  * - Profile
//  * - Classes
//  * - Students
//  * - Assignments (CRUD)
//  * - Attendance
//  * - Timetable
//  * - Results/Grades
//  * - Notices
//  */

// import api from '@/lib/api';
// import { withFallback } from '@/lib/withFallback';

// // ─────────────────────────────────────────────────────────────────────────────
// // DUMMY DATA FOR DEVELOPMENT
// // ─────────────────────────────────────────────────────────────────────────────

// const DUMMY_TEACHER_DASHBOARD = {
//   teacher: {
//     id: '1',
//     name: 'Mr. John Smith',
//     first_name: 'John',
//     last_name: 'Smith',
//     email: 'john.smith@example.com',
//     phone: '+92 300 1234567',
//     avatar: null,
//     registration_no: 'TCH-2024-001',
//     role: 'Senior Teacher',
//     details: {
//       qualification: 'M.Sc. Mathematics',
//       specialization: 'Algebra',
//       experience_years: 8,
//       subjects: ['Mathematics', 'Physics']
//     }
//   },
//   today_schedule: [
//     {
//       id: 's1',
//       time: '08:00 - 08:45',
//       subject: 'Mathematics',
//       class: '10-A',
//       room: '101',
//       status: 'upcoming'
//     },
//     {
//       id: 's2',
//       time: '09:00 - 09:45',
//       subject: 'Physics',
//       class: '10-B',
//       room: '102',
//       status: 'upcoming'
//     },
//     {
//       id: 's3',
//       time: '10:00 - 10:45',
//       subject: 'Mathematics',
//       class: '9-A',
//       room: '103',
//       status: 'upcoming'
//     }
//   ],
//   my_classes: [
//     {
//       id: 'c1',
//       name: '10-A',
//       type: 'class',
//       subjects: ['Mathematics', 'Physics'],
//       student_count: 35,
//       schedule: [
//         { day: 'monday', time: '08:00 - 08:45', subject: 'Mathematics', room: '101' },
//         { day: 'wednesday', time: '08:00 - 08:45', subject: 'Mathematics', room: '101' }
//       ]
//     },
//     {
//       id: 'c2',
//       name: '10-B',
//       type: 'class',
//       subjects: ['Physics'],
//       student_count: 32,
//       schedule: [
//         { day: 'tuesday', time: '09:00 - 09:45', subject: 'Physics', room: '102' }
//       ]
//     },
//     {
//       id: 'c3',
//       name: '9-A',
//       type: 'class',
//       subjects: ['Mathematics'],
//       student_count: 38,
//       schedule: [
//         { day: 'monday', time: '10:00 - 10:45', subject: 'Mathematics', room: '103' }
//       ]
//     }
//   ],
//   my_students: [
//     {
//       id: 's101',
//       name: 'Ali Khan',
//       registration_no: 'STU-2024-001',
//       avatar: null,
//       class: '10-A',
//       section: 'A',
//       attendance_percentage: 95
//     },
//     {
//       id: 's102',
//       name: 'Sara Ahmed',
//       registration_no: 'STU-2024-002',
//       avatar: null,
//       class: '10-A',
//       section: 'A',
//       attendance_percentage: 88
//     },
//     {
//       id: 's103',
//       name: 'Bilal Hassan',
//       registration_no: 'STU-2024-003',
//       avatar: null,
//       class: '10-A',
//       section: 'A',
//       attendance_percentage: 92
//     }
//   ],
//   recent_assignments: [
//     {
//       id: 'a1',
//       title: 'Algebra Exercise 5.2',
//       subject: 'Mathematics',
//       class: '10-A',
//       due_date: '2024-03-25',
//       total_students: 35,
//       submitted: 28,
//       pending: 7,
//       status: 'published'
//     },
//     {
//       id: 'a2',
//       title: 'Physics Lab Report',
//       subject: 'Physics',
//       class: '10-B',
//       due_date: '2024-03-22',
//       total_students: 32,
//       submitted: 30,
//       pending: 2,
//       status: 'published'
//     }
//   ],
//   pending_work: [
//     {
//       id: 'a1',
//       title: 'Algebra Exercise 5.2',
//       subject: 'Mathematics',
//       pending_count: 7,
//       due_date: '2024-03-25'
//     },
//     {
//       id: 'a2',
//       title: 'Physics Lab Report',
//       subject: 'Physics',
//       pending_count: 2,
//       due_date: '2024-03-22'
//     }
//   ],
//   recent_activity: [
//     {
//       id: 1,
//       type: 'assignment',
//       title: 'Created new assignment: Algebra Exercise',
//       time: '2 hours ago',
//       icon: 'FileText'
//     },
//     {
//       id: 2,
//       type: 'attendance',
//       title: 'Marked attendance for Class 10-A',
//       time: 'Yesterday',
//       icon: 'CheckSquare'
//     },
//     {
//       id: 3,
//       type: 'grade',
//       title: 'Graded 15 Physics submissions',
//       time: '2 days ago',
//       icon: 'Award'
//     }
//   ],
//   statistics: {
//     total_students: 105,
//     total_classes: 3,
//     total_assignments: 15,
//     published_assignments: 12,
//     draft_assignments: 3,
//     attendance_rate: 92
//   },
//   quick_actions: [
//     { label: 'Mark Attendance', icon: 'CheckSquare', href: '/attendance/mark', count: 3 },
//     { label: 'Create Assignment', icon: 'FileText', href: '/assignments/create' },
//     { label: 'Grade Submissions', icon: 'Award', href: '/assignments/grade', count: 9 },
//     { label: 'View Timetable', icon: 'Calendar', href: '/timetable' }
//   ]
// };

// const DUMMY_TEACHER_PROFILE = {
//   id: '1',
//   first_name: 'John',
//   last_name: 'Smith',
//   email: 'john.smith@example.com',
//   phone: '+92 300 1234567',
//   registration_no: 'TCH-2024-001',
//   avatar: null,
//   role: 'Senior Teacher',
//   details: {
//     employee_id: 'EMP-001',
//     qualification: 'M.Sc. Mathematics',
//     specialization: 'Algebra',
//     experience_years: 8,
//     previous_institution: 'City School',
//     subjects: ['Mathematics', 'Physics'],
//     joining_date: '2022-01-15',
//     contract_start_date: '2022-01-15',
//     contract_end_date: '2024-12-31',
//     designation: 'Senior Teacher',
//     department: 'Science',
//     employment_type: 'permanent',
//     salary: 80000,
//     bank_name: 'HBL',
//     bank_account_no: '12345678901',
//     bank_branch: 'Main Branch',
//     emergency_contact_name: 'Mrs. Smith',
//     emergency_contact_relation: 'Spouse',
//     emergency_contact_phone: '+92 321 7654321',
//     present_address: '123 Street, Islamabad',
//     permanent_address: '456 Street, Lahore',
//     city: 'Islamabad',
//     date_of_birth: '1985-05-15',
//     gender: 'male',
//     blood_group: 'O+',
//     religion: 'Islam',
//     nationality: 'Pakistani',
//     cnic: '12345-6789012-3',
//     status: 'active'
//   },
//   documents: [
//     {
//       id: 'd1',
//       type: 'cnic',
//       title: 'CNIC Front',
//       file_name: 'cnic_front.jpg',
//       file_url: '/uploads/cnic_front.jpg',
//       uploaded_at: '2022-01-15'
//     }
//   ],
//   created_at: '2022-01-15'
// };

// const DUMMY_CLASS_DETAILS = {
//   id: 'c1',
//   name: '10-A',
//   type: 'class',
//   subjects: ['Mathematics', 'Physics'],
//   students: [
//     {
//       id: 's101',
//       name: 'Ali Khan',
//       registration_no: 'STU-2024-001',
//       avatar: null,
//       roll_number: '101',
//       attendance_percentage: 95
//     },
//     {
//       id: 's102',
//       name: 'Sara Ahmed',
//       registration_no: 'STU-2024-002',
//       avatar: null,
//       roll_number: '102',
//       attendance_percentage: 88
//     },
//     {
//       id: 's103',
//       name: 'Bilal Hassan',
//       registration_no: 'STU-2024-003',
//       avatar: null,
//       roll_number: '103',
//       attendance_percentage: 92
//     }
//   ],
//   schedule: [
//     { day: 'monday', time: '08:00 - 08:45', subject: 'Mathematics', room: '101' },
//     { day: 'wednesday', time: '08:00 - 08:45', subject: 'Mathematics', room: '101' },
//     { day: 'tuesday', time: '09:00 - 09:45', subject: 'Physics', room: '102' }
//   ]
// };

// const DUMMY_STUDENT_DETAILS = {
//   profile: {
//     id: 's101',
//     name: 'Ali Khan',
//     first_name: 'Ali',
//     last_name: 'Khan',
//     registration_no: 'STU-2024-001',
//     avatar: null,
//     class: '10-A',
//     section: 'A',
//     roll_number: '101',
//     date_of_birth: '2010-05-15',
//     gender: 'male',
//     blood_group: 'B+',
//     guardian_name: 'Mr. Ahmed Khan',
//     guardian_phone: '+92 300 1234567',
//     guardian_email: 'ahmed.khan@example.com',
//     address: 'House 123, Street 5, Islamabad'
//   },
//   attendance: {
//     summary: {
//       total: 45,
//       present: 42,
//       absent: 2,
//       late: 1,
//       percentage: 93
//     },
//     subject_wise: [
//       { subject: 'Mathematics', total: 15, present: 14, percentage: 93 },
//       { subject: 'Physics', total: 15, present: 13, percentage: 86 },
//       { subject: 'Chemistry', total: 15, present: 15, percentage: 100 }
//     ],
//     recent: [
//       { date: '22 Mar 2024', subject: 'Mathematics', status: 'present' },
//       { date: '21 Mar 2024', subject: 'Physics', status: 'present' },
//       { date: '20 Mar 2024', subject: 'Chemistry', status: 'absent' }
//     ]
//   },
//   assignments: [
//     {
//       id: 'a1',
//       title: 'Algebra Exercise 5.2',
//       subject: 'Mathematics',
//       due_date: '2024-03-25',
//       status: 'submitted',
//       submitted_at: '2024-03-23',
//       marks: null
//     },
//     {
//       id: 'a2',
//       title: 'Physics Lab Report',
//       subject: 'Physics',
//       due_date: '2024-03-22',
//       status: 'graded',
//       submitted_at: '2024-03-21',
//       marks: 14,
//       total_marks: 15,
//       feedback: 'Good work!'
//     }
//   ],
//   results: [
//     {
//       exam: 'Mid Term 2024',
//       subjects: [
//         { name: 'Mathematics', marks: 85, total: 100, grade: 'A' },
//         { name: 'Physics', marks: 78, total: 100, grade: 'B+' }
//       ],
//       percentage: 81.5
//     }
//   ]
// };

// const DUMMY_ASSIGNMENTS = {
//   data: [
//     {
//       id: 'a1',
//       title: 'Algebra Exercise 5.2',
//       description: 'Solve questions 1-15 from chapter 5',
//       subject: 'Mathematics',
//       class: '10-A',
//       due_date: '2024-03-25',
//       total_marks: 20,
//       attachments: [
//         { id: 'att1', name: 'worksheet.pdf', url: '/uploads/worksheet.pdf' }
//       ],
//       stats: {
//         total_students: 35,
//         submitted: 28,
//         pending: 7,
//         graded: 15,
//         average_score: 16.5
//       },
//       is_published: true,
//       created_at: '2024-03-20'
//     },
//     {
//       id: 'a2',
//       title: 'Physics Lab Report',
//       description: 'Write lab report for refraction experiment',
//       subject: 'Physics',
//       class: '10-B',
//       due_date: '2024-03-22',
//       total_marks: 15,
//       attachments: [],
//       stats: {
//         total_students: 32,
//         submitted: 30,
//         pending: 2,
//         graded: 25,
//         average_score: 12.5
//       },
//       is_published: true,
//       created_at: '2024-03-18'
//     }
//   ],
//   pagination: {
//     total: 2,
//     page: 1,
//     limit: 10,
//     totalPages: 1
//   }
// };

// const DUMMY_ASSIGNMENT_WITH_SUBMISSIONS = {
//   id: 'a1',
//   title: 'Algebra Exercise 5.2',
//   description: 'Solve questions 1-15 from chapter 5',
//   subject: 'Mathematics',
//   class: '10-A',
//   due_date: '2024-03-25',
//   total_marks: 20,
//   attachments: [
//     { id: 'att1', name: 'worksheet.pdf', url: '/uploads/worksheet.pdf' }
//   ],
//   stats: {
//     total_students: 35,
//     submitted: 28,
//     pending: 7,
//     graded: 15,
//     average_score: 16.5
//   },
//   submissions: [
//     {
//       id: 'sub1',
//       student: {
//         id: 's101',
//         name: 'Ali Khan',
//         registration_no: 'STU-2024-001',
//         avatar: null
//       },
//       submitted_at: '2024-03-23',
//       files: [
//         { name: 'assignment.pdf', url: '/uploads/assignment.pdf' }
//       ],
//       marks: 18,
//       feedback: 'Well done!',
//       status: 'graded'
//     },
//     {
//       id: 'sub2',
//       student: {
//         id: 's102',
//         name: 'Sara Ahmed',
//         registration_no: 'STU-2024-002',
//         avatar: null
//       },
//       submitted_at: '2024-03-24',
//       files: [
//         { name: 'algebra_solution.pdf', url: '/uploads/algebra_solution.pdf' }
//       ],
//       marks: null,
//       feedback: null,
//       status: 'submitted'
//     }
//   ]
// };

// const DUMMY_TIMETABLE = {
//   week: {
//     start: '2024-03-18',
//     end: '2024-03-24'
//   },
//   schedule: {
//     monday: [
//       { period: 1, time: '08:00 - 08:45', subject: 'Mathematics', class: '10-A', room: '101' },
//       { period: 2, time: '08:45 - 09:30', subject: 'Mathematics', class: '9-A', room: '103' }
//     ],
//     tuesday: [
//       { period: 3, time: '09:30 - 10:15', subject: 'Physics', class: '10-B', room: '102' }
//     ],
//     wednesday: [
//       { period: 1, time: '08:00 - 08:45', subject: 'Mathematics', class: '10-A', room: '101' }
//     ],
//     thursday: [],
//     friday: [],
//     saturday: []
//   }
// };

// const DUMMY_ATTENDANCE = {
//   date: '2024-03-25',
//   class: '10-A',
//   subject: 'Mathematics',
//   records: [
//     { student_id: 's101', name: 'Ali Khan', status: 'present' },
//     { student_id: 's102', name: 'Sara Ahmed', status: 'present' },
//     { student_id: 's103', name: 'Bilal Hassan', status: 'absent' },
//     { student_id: 's104', name: 'Fatima Khan', status: 'late' },
//     { student_id: 's105', name: 'Usman Ali', status: 'present' }
//   ],
//   summary: {
//     total: 35,
//     present: 28,
//     absent: 5,
//     late: 2,
//     percentage: 80
//   }
// };

// const DUMMY_NOTICES = [
//   {
//     id: 'n1',
//     title: 'Staff Meeting',
//     content: 'Monthly staff meeting on Friday at 2 PM',
//     priority: 'high',
//     date: '25 Mar 2024',
//     created_by: 'Principal'
//   },
//   {
//     id: 'n2',
//     title: 'Exam Schedule',
//     content: 'Mid-term exams schedule released',
//     priority: 'medium',
//     date: '24 Mar 2024',
//     created_by: 'Exam Department'
//   },
//   {
//     id: 'n3',
//     title: 'Holiday Notice',
//     content: 'School will remain closed on 23rd March',
//     priority: 'low',
//     date: '20 Mar 2024',
//     created_by: 'Admin'
//   }
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // TEACHER PORTAL SERVICE
// // ─────────────────────────────────────────────────────────────────────────────

// export const teacherPortalService = {
//   // ─────────────────────────────────────────────────────────────────────────
//   // DASHBOARD
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Get teacher dashboard with all data
//    */
//   getDashboard: () =>
//     withFallback(
//       () => api.get('/portal/teacher/dashboard').then(r => r.data),
//       () => ({ data: DUMMY_TEACHER_DASHBOARD })
//     ),

//   // ─────────────────────────────────────────────────────────────────────────
//   // PROFILE
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Get teacher profile
//    */
//   getProfile: () =>
//     withFallback(
//       () => api.get('/portal/teacher/profile').then(r => r.data),
//       () => ({ data: DUMMY_TEACHER_PROFILE })
//     ),

//   /**
//    * Update teacher profile
//    * @param {FormData} formData - Form data with profile fields and avatar
//    */
//   updateProfile: (formData) =>
//     api.put('/portal/teacher/profile', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     }),

//   // ─────────────────────────────────────────────────────────────────────────
//   // CLASSES
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Get all classes taught by teacher
//    */
//   getMyClasses: () =>
//     withFallback(
//       () => api.get('/portal/teacher/classes').then(r => r.data),
//       () => ({ data: DUMMY_TEACHER_DASHBOARD.my_classes })
//     ),

//   /**
//    * Get specific class details with students
//    * @param {string} classId - Class ID
//    */
//   getClassDetails: (classId) =>
//     withFallback(
//       () => api.get(`/portal/teacher/classes/${classId}`).then(r => r.data),
//       () => ({ data: DUMMY_CLASS_DETAILS })
//     ),

//   // ─────────────────────────────────────────────────────────────────────────
//   // STUDENTS
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Get all students taught by teacher
//    * @param {Object} filters - Search filters
//    * @param {number} page - Page number
//    * @param {number} limit - Items per page
//    */
//   getMyStudents: (filters = {}, page = 1, limit = 20) =>
//     withFallback(
//       () => api.get('/portal/teacher/students', { 
//         params: { ...filters, page, limit } 
//       }).then(r => r.data),
//       () => ({ 
//         data: { 
//           data: DUMMY_TEACHER_DASHBOARD.my_students,
//           pagination: { total: 3, page, limit, totalPages: 1 }
//         } 
//       })
//     ),

//   /**
//    * Get detailed information about a specific student
//    * @param {string} studentId - Student ID
//    */
//   getStudentDetails: (studentId) =>
//     withFallback(
//       () => api.get(`/portal/teacher/students/${studentId}`).then(r => r.data),
//       () => ({ data: DUMMY_STUDENT_DETAILS })
//     ),

//   // ─────────────────────────────────────────────────────────────────────────
//   // ASSIGNMENTS
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Create a new assignment
//    * @param {FormData} formData - Assignment data with attachments
//    */
//   createAssignment: (formData) =>
//     api.post('/portal/teacher/assignments', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     }),

//   /**
//    * Get all assignments created by teacher
//    * @param {Object} filters - Filter by type, subject, status
//    * @param {number} page - Page number
//    * @param {number} limit - Items per page
//    */
//   getMyAssignments: (filters = {}, page = 1, limit = 10) =>
//     withFallback(
//       () => api.get('/portal/teacher/assignments', { 
//         params: { ...filters, page, limit } 
//       }).then(r => r.data),
//       () => ({ data: DUMMY_ASSIGNMENTS })
//     ),

//   /**
//    * Get assignment details with student submissions
//    * @param {string} assignmentId - Assignment ID
//    */
//   getAssignmentDetails: (assignmentId) =>
//     withFallback(
//       () => api.get(`/portal/teacher/assignments/${assignmentId}`).then(r => r.data),
//       () => ({ data: DUMMY_ASSIGNMENT_WITH_SUBMISSIONS })
//     ),

//   /**
//    * Update an assignment
//    * @param {string} assignmentId - Assignment ID
//    * @param {FormData} formData - Updated assignment data
//    */
//   updateAssignment: (assignmentId, formData) =>
//     api.put(`/portal/teacher/assignments/${assignmentId}`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     }),

//   /**
//    * Delete an assignment
//    * @param {string} assignmentId - Assignment ID
//    */
//   deleteAssignment: (assignmentId) =>
//     api.delete(`/portal/teacher/assignments/${assignmentId}`),

//   /**
//    * Get submissions for an assignment
//    * @param {string} assignmentId - Assignment ID
//    */
//   getAssignmentSubmissions: (assignmentId) =>
//     withFallback(
//       () => api.get(`/portal/teacher/assignments/${assignmentId}/submissions`).then(r => r.data),
//       () => ({ data: DUMMY_ASSIGNMENT_WITH_SUBMISSIONS.submissions })
//     ),

//   /**
//    * Grade a student submission
//    * @param {string} submissionId - Submission ID
//    * @param {Object} gradeData - { marks, feedback }
//    */
//   gradeSubmission: (submissionId, gradeData) =>
//     api.post(`/portal/teacher/submissions/${submissionId}/grade`, gradeData),

//   // ─────────────────────────────────────────────────────────────────────────
//   // ATTENDANCE
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Mark attendance for a class
//    * @param {Object} attendanceData - { class_id, date, subject, attendance: [{ student_id, status }] }
//    */
//   markAttendance: (attendanceData) =>
//     api.post('/portal/teacher/attendance/mark', attendanceData),

//   /**
//    * Get attendance for a specific class and date
//    * @param {string} classId - Class ID
//    * @param {string} date - Date (YYYY-MM-DD)
//    */
//   getClassAttendance: (classId, date) =>
//     withFallback(
//       () => api.get(`/portal/teacher/attendance/class/${classId}`, { params: { date } }).then(r => r.data),
//       () => ({ data: DUMMY_ATTENDANCE })
//     ),

//   /**
//    * Get attendance for a specific student
//    * @param {string} studentId - Student ID
//    */
//   getStudentAttendance: (studentId) =>
//     withFallback(
//       () => api.get(`/portal/teacher/attendance/student/${studentId}`).then(r => r.data),
//       () => ({ data: DUMMY_STUDENT_DETAILS.attendance })
//     ),

//   // ─────────────────────────────────────────────────────────────────────────
//   // TIMETABLE
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Get teacher's weekly timetable
//    * @param {string} week - Week start date (YYYY-MM-DD)
//    */
//   getMyTimetable: (week = null) =>
//     withFallback(
//       () => api.get('/portal/teacher/timetable', { params: { week } }).then(r => r.data),
//       () => ({ data: DUMMY_TIMETABLE })
//     ),

//   // ─────────────────────────────────────────────────────────────────────────
//   // NOTICES
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Get notices for teachers
//    * @param {number} limit - Number of notices to fetch
//    */
//   getNotices: (limit = 10) =>
//     withFallback(
//       () => api.get('/portal/teacher/notices', { params: { limit } }).then(r => r.data),
//       () => ({ data: DUMMY_NOTICES })
//     ),

//   // ─────────────────────────────────────────────────────────────────────────
//   // UTILITY FUNCTIONS
//   // ─────────────────────────────────────────────────────────────────────────
  
//   /**
//    * Prepare FormData for assignment creation/update
//    * @param {Object} data - Assignment data
//    * @param {File[]} files - Array of file attachments
//    */
//   prepareAssignmentFormData: (data, files = []) => {
//     const formData = new FormData();
    
//     // Add all text fields
//     Object.keys(data).forEach(key => {
//       if (key !== 'attachments' && data[key] !== undefined && data[key] !== null) {
//         if (typeof data[key] === 'object') {
//           formData.append(key, JSON.stringify(data[key]));
//         } else {
//           formData.append(key, data[key]);
//         }
//       }
//     });

//     // Add files
//     files.forEach((file, index) => {
//       formData.append('attachments', file);
//     });

//     return formData;
//   },

//   /**
//    * Prepare FormData for profile update
//    * @param {Object} data - Profile data
//    * @param {File} avatar - Avatar file
//    */
//   prepareProfileFormData: (data, avatar = null) => {
//     const formData = new FormData();
    
//     Object.keys(data).forEach(key => {
//       if (data[key] !== undefined && data[key] !== null) {
//         if (typeof data[key] === 'object') {
//           formData.append(key, JSON.stringify(data[key]));
//         } else {
//           formData.append(key, data[key]);
//         }
//       }
//     });

//     if (avatar) {
//       formData.append('avatar', avatar);
//     }

//     return formData;
//   },

//   /**
//    * Prepare attendance data for marking
//    * @param {string} classId - Class ID
//    * @param {string} date - Date
//    * @param {string} subject - Subject name
//    * @param {Array} studentStatuses - [{ student_id, status }]
//    */
//   prepareAttendanceData: (classId, date, subject, studentStatuses) => ({
//     class_id: classId,
//     date,
//     subject,
//     attendance: studentStatuses
//   })
// };






// src/services/teacherPortal.service.js

import api from '@/lib/api';

const unwrap = (response) => response?.data;

export const teacherPortalService = {
  // Dashboard
  getDashboard: () => api.get('/portal/teacher/dashboard').then(unwrap),
  
  // Profile
  getProfile: () => api.get('/portal/teacher/profile').then(unwrap),
  updateProfile: (data) => api.put('/portal/teacher/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(unwrap),
  
  // Classes
  getMyClasses: () => api.get('/portal/teacher/classes').then(unwrap),
  getClassDetails: (classId) => api.get(`/portal/teacher/classes/${classId}`).then(unwrap),
  
  // Students
  getMyStudents: (filters = {}, page = 1, limit = 20) =>
    api.get('/portal/teacher/students', { params: { ...filters, page, limit } }).then(unwrap),
  getStudentDetails: (studentId) => api.get(`/portal/teacher/students/${studentId}`).then(unwrap),
  
  // Assignments
  getAssignments: (filters = {}, page = 1, limit = 10) =>
    api.get('/portal/teacher/assignments', { params: { ...filters, page, limit } }).then(unwrap),
  
  createAssignment: (formData) =>
    api.post('/portal/teacher/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(unwrap),
  
  updateAssignment: (assignmentId, formData) =>
    api.put(`/portal/teacher/assignments/${assignmentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(unwrap),
  
  deleteAssignment: (assignmentId) =>
    api.delete(`/portal/teacher/assignments/${assignmentId}`).then(unwrap),
  
  getAssignmentSubmissions: (assignmentId) =>
    api.get(`/portal/teacher/assignments/${assignmentId}/submissions`).then(unwrap),
  
  gradeSubmission: (submissionId, data) =>
    api.post(`/portal/teacher/submissions/${submissionId}/grade`, data).then(unwrap),
  
  // Helper to prepare form data
  prepareAssignmentFormData: (data, files) => {
    const formData = new FormData();
    
    // Add all fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null && key !== 'remove_attachments') {
        formData.append(key, data[key]);
      }
    });
    
    // Add files
    if (files?.length) {
      files.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    return formData;
  },

    
  /**
   * Mark attendance for a class
   * @param {Object} attendanceData - { class_id, date, subject, attendance: [{ student_id, status }] }
   */
  markAttendance: (attendanceData) =>
    api.post('/portal/teacher/attendance/mark', attendanceData),

  /**
   * Get attendance for a specific class and date
   * @param {string} classId - Class ID
   * @param {string} date - Date (YYYY-MM-DD)
   */
  getClassAttendance: (classId, date) =>
    withFallback(
      () => api.get(`/portal/teacher/attendance/class/${classId}`, { params: { date } }).then(r => r.data),
      () => ({ data: DUMMY_ATTENDANCE })
    ),

  /**
   * Get attendance for a specific student
   * @param {string} studentId - Student ID
   */
  getStudentAttendance: (studentId) =>
    withFallback(
      () => api.get(`/portal/teacher/attendance/student/${studentId}`).then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DETAILS.attendance })
    ),

  
  // Attendance
  // getAttendance: (filters = {}) =>
  //   api.get('/portal/teacher/attendance', { params: filters }).then(unwrap),
  // markAttendance: (data) => api.post('/portal/teacher/attendance', data).then(unwrap),
  
  // Timetable
  getMyTimetable: (week = null) =>
    api.get('/portal/teacher/timetable', { params: { week } }).then(unwrap),
  
  // Notices
  getNotices: (limit = 10) => api.get('/portal/teacher/notices', { params: { limit } }).then(unwrap)
};

export default teacherPortalService;