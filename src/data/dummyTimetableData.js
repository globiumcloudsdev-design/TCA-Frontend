// src/data/dummyTimetableData.js (COMPLETE FIXED VERSION)

/**
 * Complete Timetable Dummy Data for Testing
 * Supports all institute types: School, Coaching, Academy, College, University
 */

// ──────────────────────────────────────────────────────────────────────────────
// 1 ▸ ACADEMIC YEARS
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_ACADEMIC_YEARS = [
  { id: 'ay-001', name: '2025-2026', start_date: '2025-04-01', end_date: '2026-03-31', is_current: true },
  { id: 'ay-002', name: '2024-2025', start_date: '2024-04-01', end_date: '2025-03-31', is_current: false },
  { id: 'ay-003', name: '2026-2027', start_date: '2026-04-01', end_date: '2027-03-31', is_current: false },
  { id: 'ay-004', name: '2023-2024', start_date: '2023-04-01', end_date: '2024-03-31', is_current: false },
  { id: 'ay-005', name: '2022-2023', start_date: '2022-04-01', end_date: '2023-03-31', is_current: false },
  { id: 'ay-006', name: '2021-2022', start_date: '2021-04-01', end_date: '2022-03-31', is_current: false }
];

// ──────────────────────────────────────────────────────────────────────────────
// 2 ▸ CLASSES (School)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_CLASSES = [
  { id: 'cls-001', name: 'Class 1', grade_level: 1, section_count: 2, student_count: 45 },
  { id: 'cls-002', name: 'Class 2', grade_level: 2, section_count: 2, student_count: 48 },
  { id: 'cls-003', name: 'Class 3', grade_level: 3, section_count: 2, student_count: 52 },
  { id: 'cls-004', name: 'Class 4', grade_level: 4, section_count: 2, student_count: 50 },
  { id: 'cls-005', name: 'Class 5', grade_level: 5, section_count: 2, student_count: 55 },
  { id: 'cls-006', name: 'Class 6', grade_level: 6, section_count: 2, student_count: 60 },
  { id: 'cls-007', name: 'Class 7', grade_level: 7, section_count: 2, student_count: 58 },
  { id: 'cls-008', name: 'Class 8', grade_level: 8, section_count: 2, student_count: 62 },
  { id: 'cls-009', name: 'Class 9', grade_level: 9, section_count: 3, student_count: 75 },
  { id: 'cls-010', name: 'Class 10', grade_level: 10, section_count: 3, student_count: 78 }
];

// ──────────────────────────────────────────────────────────────────────────────
// 3 ▸ SECTIONS (School)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_SECTIONS = [
  { id: 'sec-001', class_id: 'cls-001', name: 'A', room_number: '101', student_count: 23 },
  { id: 'sec-002', class_id: 'cls-001', name: 'B', room_number: '102', student_count: 22 },
  { id: 'sec-003', class_id: 'cls-002', name: 'A', room_number: '103', student_count: 24 },
  { id: 'sec-004', class_id: 'cls-002', name: 'B', room_number: '104', student_count: 24 },
  { id: 'sec-005', class_id: 'cls-003', name: 'A', room_number: '105', student_count: 26 },
  { id: 'sec-006', class_id: 'cls-003', name: 'B', room_number: '106', student_count: 26 },
  { id: 'sec-007', class_id: 'cls-004', name: 'A', room_number: '107', student_count: 25 },
  { id: 'sec-008', class_id: 'cls-004', name: 'B', room_number: '108', student_count: 25 },
  { id: 'sec-009', class_id: 'cls-005', name: 'A', room_number: '201', student_count: 28 },
  { id: 'sec-010', class_id: 'cls-005', name: 'B', room_number: '202', student_count: 27 },
  { id: 'sec-011', class_id: 'cls-006', name: 'A', room_number: '203', student_count: 30 },
  { id: 'sec-012', class_id: 'cls-006', name: 'B', room_number: '204', student_count: 30 },
  { id: 'sec-013', class_id: 'cls-007', name: 'A', room_number: '205', student_count: 29 },
  { id: 'sec-014', class_id: 'cls-007', name: 'B', room_number: '206', student_count: 29 },
  { id: 'sec-015', class_id: 'cls-008', name: 'A', room_number: '207', student_count: 31 },
  { id: 'sec-016', class_id: 'cls-008', name: 'B', room_number: '208', student_count: 31 }
];

// ──────────────────────────────────────────────────────────────────────────────
// 4 ▸ COURSES (Coaching)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_COURSES = [
  { id: 'crs-001', name: 'MDCAT Preparatory Course', code: 'MDCAT-2026', duration_months: 6, fee: 45000 },
  { id: 'crs-002', name: 'ECAT Engineering Entry Test', code: 'ECAT-2026', duration_months: 4, fee: 35000 },
  { id: 'crs-003', name: 'CSS Competitive Exam Prep', code: 'CSS-2027', duration_months: 12, fee: 120000 },
  { id: 'crs-004', name: 'NTS General Test Prep', code: 'NTS-2026', duration_months: 3, fee: 18000 }
];

// ──────────────────────────────────────────────────────────────────────────────
// 5 ▸ BATCHES (Coaching/Academy)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_BATCHES = [
  { id: 'batch-001', course_id: 'crs-001', name: 'MDCAT Morning Batch', code: 'MDCAT-M-01', start_date: '2026-01-15', end_date: '2026-07-15', schedule: 'Mon-Wed-Fri, 8-11 AM', room: 'Hall A' },
  { id: 'batch-002', course_id: 'crs-001', name: 'MDCAT Evening Batch', code: 'MDCAT-E-01', start_date: '2026-01-15', end_date: '2026-07-15', schedule: 'Tue-Thu-Sat, 5-8 PM', room: 'Hall B' },
  { id: 'batch-003', course_id: 'crs-002', name: 'ECAT Weekend Batch', code: 'ECAT-W-01', start_date: '2026-02-01', end_date: '2026-06-01', schedule: 'Sat-Sun, 9 AM-3 PM', room: 'Hall C' },
  { id: 'batch-004', course_id: 'crs-003', name: 'CSS Morning Batch', code: 'CSS-M-01', start_date: '2026-01-10', end_date: '2026-12-20', schedule: 'Mon-Thu, 8 AM-12 PM', room: 'Hall D' }
];

// ──────────────────────────────────────────────────────────────────────────────
// 6 ▸ PROGRAMS (Academy/College)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_PROGRAMS = [
  { id: 'prog-001', name: 'Full Stack Web Development', code: 'FSWD-2026', duration_months: 6, modules: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'] },
  { id: 'prog-002', name: 'Data Science & AI', code: 'DSAI-2026', duration_months: 8, modules: ['Python', 'ML', 'Deep Learning'] },
  { id: 'prog-003', name: 'BS Computer Science', code: 'BSCS', duration_years: 4, total_semesters: 8 },
  { id: 'prog-004', name: 'BS Software Engineering', code: 'BSSE', duration_years: 4, total_semesters: 8 }
];

// ──────────────────────────────────────────────────────────────────────────────
// 7 ▸ DEPARTMENTS (College/University)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_DEPARTMENTS = [
  { id: 'dept-001', name: 'Computer Science', code: 'CS', faculty: 'Computing' },
  { id: 'dept-002', name: 'Software Engineering', code: 'SE', faculty: 'Computing' },
  { id: 'dept-003', name: 'Electrical Engineering', code: 'EE', faculty: 'Engineering' },
  { id: 'dept-004', name: 'Business Administration', code: 'BA', faculty: 'Management' }
];

// ──────────────────────────────────────────────────────────────────────────────
// 8 ▸ SEMESTERS (College/University)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_SEMESTERS = [
  { id: 'sem-001', name: 'Semester 1', semester_no: 1, program_id: 'prog-003', credit_hours: 18, is_current: true },
  { id: 'sem-002', name: 'Semester 2', semester_no: 2, program_id: 'prog-003', credit_hours: 18, is_current: false },
  { id: 'sem-003', name: 'Semester 3', semester_no: 3, program_id: 'prog-003', credit_hours: 18, is_current: false },
  { id: 'sem-004', name: 'Semester 1', semester_no: 1, program_id: 'prog-004', credit_hours: 18, is_current: true }
];

// ──────────────────────────────────────────────────────────────────────────────
// 9 ▸ TEACHERS
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_TEACHERS = [
  // School Teachers
  { id: 'tch-001', first_name: 'Hassan', last_name: 'Mahmood', email: 'hassan.m@school.edu', subjects: ['Mathematics', 'Physics'] },
  { id: 'tch-002', first_name: 'Sana', last_name: 'Tariq', email: 'sana.t@school.edu', subjects: ['English', 'Urdu'] },
  { id: 'tch-003', first_name: 'Adnan', last_name: 'Iqbal', email: 'adnan.i@school.edu', subjects: ['Chemistry', 'Biology'] },
  { id: 'tch-004', first_name: 'Rabia', last_name: 'Nawaz', email: 'rabia.n@school.edu', subjects: ['Computer', 'Islamiat'] },
  { id: 'tch-005', first_name: 'Nadia', last_name: 'Rehman', email: 'nadia.r@school.edu', subjects: ['History', 'Geography'] },
  
  // Coaching Teachers
  { id: 'tch-006', first_name: 'Dr. Khalid', last_name: 'Mehmood', email: 'dr.khalid@coaching.pk', subjects: ['Physics (MDCAT)'] },
  { id: 'tch-007', first_name: 'Prof. Naila', last_name: 'Rashid', email: 'naila.r@coaching.pk', subjects: ['Chemistry (MDCAT)'] },
  { id: 'tch-008', first_name: 'Dr. Sana', last_name: 'Malik', email: 'sana.m@coaching.pk', subjects: ['Biology (MDCAT)'] },
  
  // Academy Teachers
  { id: 'tch-009', first_name: 'Ali', last_name: 'Raza', email: 'ali.r@academy.pk', subjects: ['Web Development'] },
  { id: 'tch-010', first_name: 'Fatima', last_name: 'Ahmed', email: 'fatima.a@academy.pk', subjects: ['Data Science'] },
  
  // College/University Teachers
  { id: 'tch-011', first_name: 'Prof. Imran', last_name: 'Khan', email: 'imran.k@college.pk', subjects: ['Programming', 'Algorithms'] },
  { id: 'tch-012', first_name: 'Dr. Samina', last_name: 'Tariq', email: 'samina.t@college.pk', subjects: ['Database', 'Networking'] }
];

// ──────────────────────────────────────────────────────────────────────────────
// 10 ▸ SUBJECTS
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_SUBJECTS = [
  { id: 'sub-001', name: 'Mathematics', code: 'MATH-01' },
  { id: 'sub-002', name: 'Physics', code: 'PHY-01' },
  { id: 'sub-003', name: 'Chemistry', code: 'CHEM-01' },
  { id: 'sub-004', name: 'Biology', code: 'BIO-01' },
  { id: 'sub-005', name: 'English', code: 'ENG-01' },
  { id: 'sub-006', name: 'Urdu', code: 'URD-01' },
  { id: 'sub-007', name: 'Computer Science', code: 'CS-01' },
  { id: 'sub-008', name: 'Islamiat', code: 'ISL-01' },
  { id: 'sub-009', name: 'Pakistan Studies', code: 'PST-01' },
  { id: 'sub-010', name: 'Economics', code: 'ECO-01' },
  { id: 'sub-011', name: 'History', code: 'HIS-01' },
  { id: 'sub-012', name: 'Geography', code: 'GEO-01' }
];

// ──────────────────────────────────────────────────────────────────────────────
// 11 ▸ COMPLETE TIMETABLES (Different Types)
// ──────────────────────────────────────────────────────────────────────────────

// School Timetable (Class 1 - Section A)
export const DUMMY_TIMETABLE_SCHOOL = {
  id: 'tt-sch-001',
  name: 'Class 1 - Section A Timetable',
  entity_type: 'school',
  entity_ids: { class_id: 'cls-001', section_id: 'sec-001' },
  academic_year_id: 'ay-001',
  is_active: true,
  effective_from: '2025-04-01',
  effective_to: '2026-03-31',
  period_config: {
    total_periods: 8,
    periods: [
      { period: 1, start_time: '08:00', end_time: '08:40', name: 'Period 1' },
      { period: 2, start_time: '08:40', end_time: '09:20', name: 'Period 2' },
      { period: 3, start_time: '09:20', end_time: '10:00', name: 'Period 3' },
      { period: 4, start_time: '10:30', end_time: '11:10', name: 'Period 4' },
      { period: 5, start_time: '11:10', end_time: '11:50', name: 'Period 5' },
      { period: 6, start_time: '11:50', end_time: '12:30', name: 'Period 6' },
      { period: 7, start_time: '13:30', end_time: '14:10', name: 'Period 7' },
      { period: 8, start_time: '14:10', end_time: '14:50', name: 'Period 8' }
    ],
    breaks: [
      { name: 'Break', start_time: '10:00', end_time: '10:30' },
      { name: 'Lunch', start_time: '12:30', end_time: '13:30' }
    ]
  },
  slots: [
    // Monday
    { id: 'slot-001', day: 'monday', period: 1, subject_id: 'sub-001', subject_name: 'Mathematics', teacher_id: 'tch-001', teacher_name: 'Hassan Mahmood', room_no: '101' },
    { id: 'slot-002', day: 'monday', period: 2, subject_id: 'sub-005', subject_name: 'English', teacher_id: 'tch-002', teacher_name: 'Sana Tariq', room_no: '101' },
    { id: 'slot-003', day: 'monday', period: 3, subject_id: 'sub-006', subject_name: 'Urdu', teacher_id: 'tch-002', teacher_name: 'Sana Tariq', room_no: '101' },
    { id: 'slot-004', day: 'monday', period: 4, subject_id: 'sub-004', subject_name: 'Biology', teacher_id: 'tch-003', teacher_name: 'Adnan Iqbal', room_no: '101' },
    { id: 'slot-005', day: 'monday', period: 5, subject_id: 'sub-008', subject_name: 'Islamiat', teacher_id: 'tch-004', teacher_name: 'Rabia Nawaz', room_no: '101' },
    { id: 'slot-006', day: 'monday', period: 6, subject_id: 'sub-007', subject_name: 'Computer', teacher_id: 'tch-004', teacher_name: 'Rabia Nawaz', room_no: '101' },
    
    // Tuesday
    { id: 'slot-007', day: 'tuesday', period: 1, subject_id: 'sub-001', subject_name: 'Mathematics', teacher_id: 'tch-001', teacher_name: 'Hassan Mahmood', room_no: '101' },
    { id: 'slot-008', day: 'tuesday', period: 2, subject_id: 'sub-002', subject_name: 'Physics', teacher_id: 'tch-001', teacher_name: 'Hassan Mahmood', room_no: '101' },
    { id: 'slot-009', day: 'tuesday', period: 3, subject_id: 'sub-005', subject_name: 'English', teacher_id: 'tch-002', teacher_name: 'Sana Tariq', room_no: '101' },
    { id: 'slot-010', day: 'tuesday', period: 4, subject_id: 'sub-003', subject_name: 'Chemistry', teacher_id: 'tch-003', teacher_name: 'Adnan Iqbal', room_no: '101' },
    { id: 'slot-011', day: 'tuesday', period: 5, subject_id: 'sub-009', subject_name: 'Pakistan Studies', teacher_id: 'tch-005', teacher_name: 'Nadia Rehman', room_no: '101' },
    { id: 'slot-012', day: 'tuesday', period: 6, subject_id: 'sub-007', subject_name: 'Computer', teacher_id: 'tch-004', teacher_name: 'Rabia Nawaz', room_no: '101' },
    
    // Wednesday
    { id: 'slot-013', day: 'wednesday', period: 1, subject_id: 'sub-001', subject_name: 'Mathematics', teacher_id: 'tch-001', teacher_name: 'Hassan Mahmood', room_no: '101' },
    { id: 'slot-014', day: 'wednesday', period: 2, subject_id: 'sub-005', subject_name: 'English', teacher_id: 'tch-002', teacher_name: 'Sana Tariq', room_no: '101' },
    { id: 'slot-015', day: 'wednesday', period: 3, subject_id: 'sub-006', subject_name: 'Urdu', teacher_id: 'tch-002', teacher_name: 'Sana Tariq', room_no: '101' },
    { id: 'slot-016', day: 'wednesday', period: 4, subject_id: 'sub-004', subject_name: 'Biology', teacher_id: 'tch-003', teacher_name: 'Adnan Iqbal', room_no: '101' },
    { id: 'slot-017', day: 'wednesday', period: 5, subject_id: 'sub-008', subject_name: 'Islamiat', teacher_id: 'tch-004', teacher_name: 'Rabia Nawaz', room_no: '101' },
    { id: 'slot-018', day: 'wednesday', period: 6, subject_id: 'sub-002', subject_name: 'Physics', teacher_id: 'tch-001', teacher_name: 'Hassan Mahmood', room_no: '101' },
    
    // Thursday
    { id: 'slot-019', day: 'thursday', period: 1, subject_id: 'sub-001', subject_name: 'Mathematics', teacher_id: 'tch-001', teacher_name: 'Hassan Mahmood', room_no: '101' },
    { id: 'slot-020', day: 'thursday', period: 2, subject_id: 'sub-002', subject_name: 'Physics', teacher_id: 'tch-001', teacher_name: 'Hassan Mahmood', room_no: '101' },
    { id: 'slot-021', day: 'thursday', period: 3, subject_id: 'sub-003', subject_name: 'Chemistry', teacher_id: 'tch-003', teacher_name: 'Adnan Iqbal', room_no: '101' },
    { id: 'slot-022', day: 'thursday', period: 4, subject_id: 'sub-004', subject_name: 'Biology', teacher_id: 'tch-003', teacher_name: 'Adnan Iqbal', room_no: '101' },
    { id: 'slot-023', day: 'thursday', period: 5, subject_id: 'sub-005', subject_name: 'English', teacher_id: 'tch-002', teacher_name: 'Sana Tariq', room_no: '101' },
    { id: 'slot-024', day: 'thursday', period: 6, subject_id: 'sub-006', subject_name: 'Urdu', teacher_id: 'tch-002', teacher_name: 'Sana Tariq', room_no: '101' },
    
    // Friday
    { id: 'slot-025', day: 'friday', period: 1, subject_id: 'sub-001', subject_name: 'Mathematics', teacher_id: 'tch-001', teacher_name: 'Hassan Mahmood', room_no: '101' },
    { id: 'slot-026', day: 'friday', period: 2, subject_id: 'sub-008', subject_name: 'Islamiat', teacher_id: 'tch-004', teacher_name: 'Rabia Nawaz', room_no: '101' },
    { id: 'slot-027', day: 'friday', period: 3, subject_id: 'sub-009', subject_name: 'Pakistan Studies', teacher_id: 'tch-005', teacher_name: 'Nadia Rehman', room_no: '101' },
    { id: 'slot-028', day: 'friday', period: 4, subject_id: 'sub-007', subject_name: 'Computer', teacher_id: 'tch-004', teacher_name: 'Rabia Nawaz', room_no: '101' },
    { id: 'slot-029', day: 'friday', period: 5, subject_id: 'sub-005', subject_name: 'English', teacher_id: 'tch-002', teacher_name: 'Sana Tariq', room_no: '101' }
  ]
};

// Coaching Timetable (MDCAT Morning Batch)
export const DUMMY_TIMETABLE_COACHING = {
  id: 'tt-coach-001',
  name: 'MDCAT Morning Batch Timetable',
  entity_type: 'coaching',
  entity_ids: { course_id: 'crs-001', batch_id: 'batch-001' },
  academic_year_id: 'ay-001',
  is_active: true,
  effective_from: '2026-01-15',
  effective_to: '2026-07-15',
  period_config: {
    total_periods: 4,
    periods: [
      { period: 1, start_time: '08:00', end_time: '09:30', name: 'Session 1' },
      { period: 2, start_time: '09:45', end_time: '11:15', name: 'Session 2' },
      { period: 3, start_time: '11:30', end_time: '13:00', name: 'Session 3' },
      { period: 4, start_time: '14:00', end_time: '15:30', name: 'Session 4' }
    ],
    breaks: [
      { name: 'Morning Break', start_time: '09:30', end_time: '09:45' },
      { name: 'Lunch', start_time: '13:00', end_time: '14:00' }
    ]
  },
  slots: [
    { id: 'slot-c-001', day: 'monday', period: 1, subject_id: 'sub-002', subject_name: 'Physics', teacher_id: 'tch-006', teacher_name: 'Dr. Khalid Mehmood', room_no: 'Hall A' },
    { id: 'slot-c-002', day: 'monday', period: 2, subject_id: 'sub-003', subject_name: 'Chemistry', teacher_id: 'tch-007', teacher_name: 'Prof. Naila Rashid', room_no: 'Hall A' },
    { id: 'slot-c-003', day: 'monday', period: 3, subject_id: 'sub-004', subject_name: 'Biology', teacher_id: 'tch-008', teacher_name: 'Dr. Sana Malik', room_no: 'Hall A' },
    
    { id: 'slot-c-004', day: 'wednesday', period: 1, subject_id: 'sub-003', subject_name: 'Chemistry', teacher_id: 'tch-007', teacher_name: 'Prof. Naila Rashid', room_no: 'Hall A' },
    { id: 'slot-c-005', day: 'wednesday', period: 2, subject_id: 'sub-004', subject_name: 'Biology', teacher_id: 'tch-008', teacher_name: 'Dr. Sana Malik', room_no: 'Hall A' },
    { id: 'slot-c-006', day: 'wednesday', period: 3, subject_id: 'sub-002', subject_name: 'Physics', teacher_id: 'tch-006', teacher_name: 'Dr. Khalid Mehmood', room_no: 'Hall A' },
    
    { id: 'slot-c-007', day: 'friday', period: 1, subject_id: 'sub-004', subject_name: 'Biology', teacher_id: 'tch-008', teacher_name: 'Dr. Sana Malik', room_no: 'Hall A' },
    { id: 'slot-c-008', day: 'friday', period: 2, subject_id: 'sub-002', subject_name: 'Physics', teacher_id: 'tch-006', teacher_name: 'Dr. Khalid Mehmood', room_no: 'Hall A' },
    { id: 'slot-c-009', day: 'friday', period: 3, subject_id: 'sub-003', subject_name: 'Chemistry', teacher_id: 'tch-007', teacher_name: 'Prof. Naila Rashid', room_no: 'Hall A' }
  ]
};

// Academy Timetable (Web Development Batch)
export const DUMMY_TIMETABLE_ACADEMY = {
  id: 'tt-aca-001',
  name: 'FSWD Batch 2026-01 Timetable',
  entity_type: 'academy',
  entity_ids: { program_id: 'prog-001', batch_id: 'batch-004' },
  academic_year_id: 'ay-001',
  is_active: true,
  effective_from: '2026-01-10',
  effective_to: '2026-07-10',
  period_config: {
    total_periods: 2,
    periods: [
      { period: 1, start_time: '14:00', end_time: '16:30', name: 'Module 1' },
      { period: 2, start_time: '17:00', end_time: '19:30', name: 'Module 2' }
    ],
    breaks: [
      { name: 'Evening Break', start_time: '16:30', end_time: '17:00' }
    ]
  },
  slots: [
    { id: 'slot-a-001', day: 'monday', period: 1, subject_id: 'sub-011', subject_name: 'HTML/CSS', teacher_id: 'tch-009', teacher_name: 'Ali Raza', room_no: 'Lab 1' },
    { id: 'slot-a-002', day: 'tuesday', period: 1, subject_id: 'sub-011', subject_name: 'HTML/CSS', teacher_id: 'tch-009', teacher_name: 'Ali Raza', room_no: 'Lab 1' },
    { id: 'slot-a-003', day: 'wednesday', period: 1, subject_id: 'sub-011', subject_name: 'HTML/CSS', teacher_id: 'tch-009', teacher_name: 'Ali Raza', room_no: 'Lab 1' },
    { id: 'slot-a-004', day: 'thursday', period: 2, subject_id: 'sub-011', subject_name: 'HTML/CSS', teacher_id: 'tch-009', teacher_name: 'Ali Raza', room_no: 'Lab 1' }
  ]
};

// College Timetable (BS CS Semester 1)
export const DUMMY_TIMETABLE_COLLEGE = {
  id: 'tt-col-001',
  name: 'BS CS Semester 1 Timetable',
  entity_type: 'college',
  entity_ids: { department_id: 'dept-001', program_id: 'prog-003', semester_id: 'sem-001' },
  academic_year_id: 'ay-001',
  is_active: true,
  effective_from: '2025-09-01',
  effective_to: '2026-01-31',
  period_config: {
    total_periods: 6,
    periods: [
      { period: 1, start_time: '08:30', end_time: '10:00', name: 'Lecture 1' },
      { period: 2, start_time: '10:15', end_time: '11:45', name: 'Lecture 2' },
      { period: 3, start_time: '12:00', end_time: '13:30', name: 'Lecture 3' },
      { period: 4, start_time: '14:30', end_time: '16:00', name: 'Lecture 4' },
      { period: 5, start_time: '16:15', end_time: '17:45', name: 'Lab' },
      { period: 6, start_time: '18:00', end_time: '19:30', name: 'Tutorial' }
    ],
    breaks: [
      { name: 'Morning Break', start_time: '10:00', end_time: '10:15' },
      { name: 'Lunch', start_time: '13:30', end_time: '14:30' }
    ]
  },
  slots: [
    { id: 'slot-l-001', day: 'monday', period: 1, subject_id: 'sub-001', subject_name: 'Programming Fundamentals', teacher_id: 'tch-011', teacher_name: 'Prof. Imran Khan', room_no: 'Room 301' },
    { id: 'slot-l-002', day: 'monday', period: 2, subject_id: 'sub-001', subject_name: 'Programming Fundamentals', teacher_id: 'tch-011', teacher_name: 'Prof. Imran Khan', room_no: 'Room 301' },
    { id: 'slot-l-003', day: 'tuesday', period: 3, subject_id: 'sub-012', subject_name: 'Database Systems', teacher_id: 'tch-012', teacher_name: 'Dr. Samina Tariq', room_no: 'Room 302' },
    { id: 'slot-l-004', day: 'wednesday', period: 4, subject_id: 'sub-001', subject_name: 'Programming Lab', teacher_id: 'tch-011', teacher_name: 'Prof. Imran Khan', room_no: 'Lab 3' },
    { id: 'slot-l-005', day: 'thursday', period: 2, subject_id: 'sub-012', subject_name: 'Database Systems', teacher_id: 'tch-012', teacher_name: 'Dr. Samina Tariq', room_no: 'Room 302' }
  ]
};

// Combined Timetables Array
export const DUMMY_TIMETABLES = [
  DUMMY_TIMETABLE_SCHOOL,
  DUMMY_TIMETABLE_COACHING,
  DUMMY_TIMETABLE_ACADEMY,
  DUMMY_TIMETABLE_COLLEGE,
  {
    id: 'tt-sch-002',
    name: 'Class 2 - Section A Timetable',
    entity_type: 'school',
    entity_ids: { class_id: 'cls-002', section_id: 'sec-003' },
    academic_year_id: 'ay-001',
    is_active: true,
    effective_from: '2025-04-01',
    effective_to: '2026-03-31',
    period_config: DUMMY_TIMETABLE_SCHOOL.period_config,
    slots: DUMMY_TIMETABLE_SCHOOL.slots.map(s => ({ ...s, room_no: '103' }))
  },
  {
    id: 'tt-sch-003',
    name: 'Class 3 - Section A Timetable',
    entity_type: 'school',
    entity_ids: { class_id: 'cls-003', section_id: 'sec-005' },
    academic_year_id: 'ay-001',
    is_active: true,
    effective_from: '2025-04-01',
    effective_to: '2026-03-31',
    period_config: DUMMY_TIMETABLE_SCHOOL.period_config,
    slots: DUMMY_TIMETABLE_SCHOOL.slots.map(s => ({ ...s, room_no: '105' }))
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// 12 ▸ ENTITIES RESPONSE (for dropdowns) - FIXED WITH ACADEMIC YEARS
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_ENTITIES_RESPONSE = {
  academicYears: DUMMY_ACADEMIC_YEARS,
  classes: DUMMY_CLASSES.map(c => ({
    id: c.id,
    name: c.name,
    sections: DUMMY_SECTIONS.filter(s => s.class_id === c.id)
  })),
  sections: DUMMY_SECTIONS,
  courses: DUMMY_COURSES,
  batches: DUMMY_BATCHES,
  programs: DUMMY_PROGRAMS,
  departments: DUMMY_DEPARTMENTS,
  semesters: DUMMY_SEMESTERS,
  teachers: DUMMY_TEACHERS.map(t => ({
    id: t.id,
    first_name: t.first_name,
    last_name: t.last_name,
    name: `${t.first_name} ${t.last_name}`
  })),
  subjects: DUMMY_SUBJECTS
};

// ──────────────────────────────────────────────────────────────────────────────
// 13 ▸ TIMETABLE SERVICE WITH FALLBACK - FIXED
// ──────────────────────────────────────────────────────────────────────────────
export const timetableService = {
  /**
   * Get entities for dropdowns
   */
  getEntities: async (academicYearId) => {
    console.log('📥 Fetching entities for academic year:', academicYearId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: DUMMY_ENTITIES_RESPONSE
    };
  },

  /**
   * Get all timetables
   */
  getAll: async (params = {}) => {
    console.log('📥 Fetching timetables with params:', params);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let timetables = [...DUMMY_TIMETABLES];
    
    // Apply filters
    if (params.academic_year_id) {
      timetables = timetables.filter(t => t.academic_year_id === params.academic_year_id);
    }
    
    if (params.entity_type) {
      timetables = timetables.filter(t => t.entity_type === params.entity_type);
    }
    
    if (params.class_id) {
      timetables = timetables.filter(t => t.entity_ids.class_id === params.class_id);
    }
    
    if (params.section_id) {
      timetables = timetables.filter(t => t.entity_ids.section_id === params.section_id);
    }
    
    if (params.course_id) {
      timetables = timetables.filter(t => t.entity_ids.course_id === params.course_id);
    }
    
    if (params.batch_id) {
      timetables = timetables.filter(t => t.entity_ids.batch_id === params.batch_id);
    }
    
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      success: true,
      data: timetables.slice(start, end),
      pagination: {
        total: timetables.length,
        page,
        limit,
        totalPages: Math.ceil(timetables.length / limit)
      }
    };
  },

  /**
   * Get timetable by ID
   */
  getById: async (id) => {
    console.log('📥 Fetching timetable by ID:', id);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const timetable = DUMMY_TIMETABLES.find(t => t.id === id);
    
    if (!timetable) {
      throw new Error('Timetable not found');
    }
    
    return {
      success: true,
      data: timetable
    };
  },

  /**
   * Create timetable
   */
  create: async (data) => {
    console.log('📝 Creating timetable:', data);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newTimetable = {
      id: `tt-${Date.now()}`,
      ...data,
      slots: data.slots || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to dummy data (in memory only)
    DUMMY_TIMETABLES.push(newTimetable);
    
    return {
      success: true,
      data: newTimetable,
      message: 'Timetable created successfully'
    };
  },

  /**
   * Update timetable
   */
  update: async (id, data) => {
    console.log('📝 Updating timetable:', id, data);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = DUMMY_TIMETABLES.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Timetable not found');
    }
    
    const updatedTimetable = {
      ...DUMMY_TIMETABLES[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    DUMMY_TIMETABLES[index] = updatedTimetable;
    
    return {
      success: true,
      data: updatedTimetable,
      message: 'Timetable updated successfully'
    };
  },

  /**
   * Delete timetable
   */
  delete: async (id) => {
    console.log('🗑️ Deleting timetable:', id);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = DUMMY_TIMETABLES.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Timetable not found');
    }
    
    DUMMY_TIMETABLES.splice(index, 1);
    
    return {
      success: true,
      message: 'Timetable deleted successfully'
    };
  },

  /**
   * Toggle timetable status
   */
  toggleStatus: async (id, isActive) => {
    console.log('🔄 Toggling timetable status:', id, isActive);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = DUMMY_TIMETABLES.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Timetable not found');
    }
    
    DUMMY_TIMETABLES[index].is_active = isActive;
    
    return {
      success: true,
      data: { id, is_active: isActive },
      message: `Timetable ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  },

  /**
   * Check teacher conflict
   */
  checkConflict: async (data) => {
    console.log('🔍 Checking teacher conflict:', data);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { teacher_id, day, period, start_time, end_time, exclude_id } = data;
    
    // Check all timetables
    let hasConflict = false;
    
    for (const timetable of DUMMY_TIMETABLES) {
      if (!timetable.is_active) continue;
      
      const conflict = timetable.slots.some(slot => 
        slot.teacher_id === teacher_id &&
        slot.day === day &&
        ((slot.period === period) || 
         (slot.start_time && slot.end_time && start_time && end_time &&
          ((start_time >= slot.start_time && start_time < slot.end_time) ||
           (end_time > slot.start_time && end_time <= slot.end_time)))) &&
        slot.id !== exclude_id
      );
      
      if (conflict) {
        hasConflict = true;
        break;
      }
    }
    
    return {
      success: true,
      data: { hasConflict }
    };
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// 14 ▸ EXPORT ALL
// ──────────────────────────────────────────────────────────────────────────────
export default {
  DUMMY_ACADEMIC_YEARS,
  DUMMY_CLASSES,
  DUMMY_SECTIONS,
  DUMMY_COURSES,
  DUMMY_BATCHES,
  DUMMY_PROGRAMS,
  DUMMY_DEPARTMENTS,
  DUMMY_SEMESTERS,
  DUMMY_TEACHERS,
  DUMMY_SUBJECTS,
  DUMMY_TIMETABLES,
  DUMMY_TIMETABLE_SCHOOL,
  DUMMY_TIMETABLE_COACHING,
  DUMMY_TIMETABLE_ACADEMY,
  DUMMY_TIMETABLE_COLLEGE,
  DUMMY_ENTITIES_RESPONSE,
  timetableService
};


