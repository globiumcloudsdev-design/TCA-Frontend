/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   Portal Dummy Data — Parent Portal + Student Portal         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Parent Login  │ parent@tca.edu.pk   │ parent@123
 *  Student Login │ ali@student.tca     │ student@123
 */

import { DUMMY_STUDENTS, DUMMY_CLASSES, DUMMY_FEES, DUMMY_EXAMS } from './dummyData';

// ──────────────────────────────────────────────────────────────────────────────
// 1 ▸ ANNOUNCEMENTS  (shared for both portals)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_ANNOUNCEMENTS = [
  {
    id: 'ann-001',
    title: 'Mid-Term Exam Schedule Released',
    body: 'The mid-term examination schedule for all classes has been released. Students are advised to prepare thoroughly. Exams will start from 10th March 2026. Hall tickets will be distributed by teachers.',
    category: 'Exam',
    priority: 'high',
    date: '2026-02-25',
    author: 'Principal Office',
  },
  {
    id: 'ann-002',
    title: 'Fee Submission Last Date Extended',
    body: 'Due to multiple requests, the last date for February fee submission has been extended to 15th February 2026. Students with outstanding fees must clear them before the extended date to avoid late fee charges.',
    category: 'Fee',
    priority: 'high',
    date: '2026-02-18',
    author: 'Accounts Department',
  },
  {
    id: 'ann-003',
    title: 'Annual Sports Day Celebration',
    body: 'The Annual Sports Day will be held on 5th March 2026. All students are encouraged to participate in various sports events. Parents are cordially invited to attend and support our students.',
    category: 'Event',
    priority: 'medium',
    date: '2026-02-15',
    author: 'Sports Committee',
  },
  {
    id: 'ann-004',
    title: 'Parent-Teacher Meeting',
    body: 'A Parent-Teacher Meeting (PTM) is scheduled for 20th February 2026 from 9:00 AM to 1:00 PM. All parents are requested to attend to discuss the academic progress of their child.',
    category: 'Meeting',
    priority: 'high',
    date: '2026-02-10',
    author: 'Administration',
  },
  {
    id: 'ann-005',
    title: 'Winter Uniform Mandatory from March',
    body: 'All students must wear complete winter uniform from 1st March 2026 onwards. Students without proper uniform will not be allowed in class. Summer uniform will resume from 1st April 2026.',
    category: 'General',
    priority: 'medium',
    date: '2026-02-08',
    author: 'Administration',
  },
  {
    id: 'ann-006',
    title: 'Public Holiday — Pakistan Day',
    body: 'School will remain closed on 23rd March 2026 in observance of Pakistan Day. Normal school activities will resume on 24th March 2026 (Tuesday).',
    category: 'Holiday',
    priority: 'low',
    date: '2026-02-05',
    author: 'Principal Office',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 2 ▸ EXAM RESULTS  (subject-wise marks for each student)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_EXAM_RESULTS = [
  /* Ali Raza – stu-001 – Class 1 */
  {
    exam_id: 'exam-001',
    student_id: 'stu-001',
    exam: DUMMY_EXAMS[0], // Mid Term
    subjects: [
      { name: 'Mathematics',  marks: 88, total: 100, grade: 'A' },
      { name: 'English',      marks: 75, total: 100, grade: 'B' },
      { name: 'Urdu',         marks: 82, total: 100, grade: 'A' },
      { name: 'Science',      marks: 91, total: 100, grade: 'A+' },
      { name: 'Islamiat',     marks: 78, total: 100, grade: 'B+' },
    ],
    total_marks:   414,
    total_full:    500,
    percentage:    82.8,
    grade:         'A',
    position:      3,
    class_total:   58,
    remarks:       'Excellent performance. Keep it up!',
    published:     true,
  },
  /* Fatima Malik – stu-002 – Class 1 */
  {
    exam_id: 'exam-001',
    student_id: 'stu-002',
    exam: DUMMY_EXAMS[0],
    subjects: [
      { name: 'Mathematics',  marks: 95, total: 100, grade: 'A+' },
      { name: 'English',      marks: 92, total: 100, grade: 'A+' },
      { name: 'Urdu',         marks: 88, total: 100, grade: 'A' },
      { name: 'Science',      marks: 97, total: 100, grade: 'A+' },
      { name: 'Islamiat',     marks: 90, total: 100, grade: 'A+' },
    ],
    total_marks:   462,
    total_full:    500,
    percentage:    92.4,
    grade:         'A+',
    position:      1,
    class_total:   58,
    remarks:       'Outstanding! Class topper. Excellent in all subjects.',
    published:     true,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 3 ▸ PORTAL ATTENDANCE  (per-student, per-month data)
// ──────────────────────────────────────────────────────────────────────────────
function buildAttendance(studentId, presentDays, absentDays, lateDays = []) {
  const days = [];
  // Feb 2026 working days: 2-6, 9-13, 16-20, 23-27
  const workingDays = [2,3,4,5,6,9,10,11,12,13,16,17,18,19,20,23,24,25,26,27];
  workingDays.forEach((d) => {
    let status = 'present';
    if (absentDays.includes(d)) status = 'absent';
    else if (lateDays.includes(d)) status = 'late';
    days.push({ date: `2026-02-${String(d).padStart(2,'0')}`, status });
  });
  return {
    student_id:   studentId,
    month:        'February 2026',
    total_days:   workingDays.length,
    present:      days.filter((d) => d.status === 'present').length,
    absent:       days.filter((d) => d.status === 'absent').length,
    late:         days.filter((d) => d.status === 'late').length,
    percentage:   Math.round((days.filter((d) => d.status === 'present').length / workingDays.length) * 100),
    days,
    monthly_history: [
      { month: 'Sep 2025', present: 22, total: 24, percentage: 92 },
      { month: 'Oct 2025', present: 21, total: 25, percentage: 84 },
      { month: 'Nov 2025', present: 23, total: 24, percentage: 96 },
      { month: 'Dec 2025', present: 18, total: 22, percentage: 82 },
      { month: 'Jan 2026', present: 24, total: 25, percentage: 96 },
      { month: 'Feb 2026', present: days.filter((d) => d.status === 'present').length, total: workingDays.length, percentage: Math.round((days.filter((d) => d.status === 'present').length / workingDays.length) * 100) },
    ],
  };
}

export const DUMMY_PORTAL_ATTENDANCE = {
  'stu-001': buildAttendance('stu-001', null, [10, 18], [3]),
  'stu-002': buildAttendance('stu-002', null, [24], []),
};

// ──────────────────────────────────────────────────────────────────────────────
// 4 ▸ TIMETABLE  (Class 1 — used by ali raza & fatima malik)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_TIMETABLE = {
  'class-001': {
    class: 'Class 1',
    section: 'A',
    schedule: [
      {
        day: 'Monday',
        periods: [
          { time: '08:00–08:45', subject: 'Mathematics',  teacher: 'Hassan Mahmood',  room: 'Room 101' },
          { time: '08:45–09:30', subject: 'English',       teacher: 'Sana Tariq',      room: 'Room 101' },
          { time: '09:30–10:15', subject: 'Urdu',          teacher: 'Adnan Iqbal',     room: 'Room 101' },
          { time: '10:15–10:30', subject: 'Break',         teacher: '',                room: '' },
          { time: '10:30–11:15', subject: 'Science',       teacher: 'Hassan Mahmood',  room: 'Lab 1' },
          { time: '11:15–12:00', subject: 'Islamiat',      teacher: 'Adnan Iqbal',     room: 'Room 101' },
          { time: '12:00–12:45', subject: 'General Knowledge', teacher: 'Sana Tariq', room: 'Room 101' },
        ],
      },
      {
        day: 'Tuesday',
        periods: [
          { time: '08:00–08:45', subject: 'English',       teacher: 'Sana Tariq',      room: 'Room 101' },
          { time: '08:45–09:30', subject: 'Mathematics',   teacher: 'Hassan Mahmood',  room: 'Room 101' },
          { time: '09:30–10:15', subject: 'Computer',      teacher: 'Rabia Nawaz',     room: 'Computer Lab' },
          { time: '10:15–10:30', subject: 'Break',         teacher: '',                room: '' },
          { time: '10:30–11:15', subject: 'Urdu',          teacher: 'Adnan Iqbal',     room: 'Room 101' },
          { time: '11:15–12:00', subject: 'Arts & Crafts', teacher: 'Sana Tariq',      room: 'Room 101' },
          { time: '12:00–12:45', subject: 'Physical Education', teacher: 'Hassan Mahmood', room: 'Ground' },
        ],
      },
      {
        day: 'Wednesday',
        periods: [
          { time: '08:00–08:45', subject: 'Science',       teacher: 'Hassan Mahmood',  room: 'Lab 1' },
          { time: '08:45–09:30', subject: 'Mathematics',   teacher: 'Hassan Mahmood',  room: 'Room 101' },
          { time: '09:30–10:15', subject: 'English',       teacher: 'Sana Tariq',      room: 'Room 101' },
          { time: '10:15–10:30', subject: 'Break',         teacher: '',                room: '' },
          { time: '10:30–11:15', subject: 'Islamiat',      teacher: 'Adnan Iqbal',     room: 'Room 101' },
          { time: '11:15–12:00', subject: 'Urdu',          teacher: 'Adnan Iqbal',     room: 'Room 101' },
          { time: '12:00–12:45', subject: 'General Knowledge', teacher: 'Sana Tariq', room: 'Room 101' },
        ],
      },
      {
        day: 'Thursday',
        periods: [
          { time: '08:00–08:45', subject: 'Mathematics',   teacher: 'Hassan Mahmood',  room: 'Room 101' },
          { time: '08:45–09:30', subject: 'Computer',      teacher: 'Rabia Nawaz',     room: 'Computer Lab' },
          { time: '09:30–10:15', subject: 'Urdu',          teacher: 'Adnan Iqbal',     room: 'Room 101' },
          { time: '10:15–10:30', subject: 'Break',         teacher: '',                room: '' },
          { time: '10:30–11:15', subject: 'Science',       teacher: 'Hassan Mahmood',  room: 'Lab 1' },
          { time: '11:15–12:00', subject: 'English',       teacher: 'Sana Tariq',      room: 'Room 101' },
          { time: '12:00–12:45', subject: 'Arts & Crafts', teacher: 'Sana Tariq',      room: 'Room 101' },
        ],
      },
      {
        day: 'Friday',
        periods: [
          { time: '08:00–08:45', subject: 'Islamiat',      teacher: 'Adnan Iqbal',     room: 'Room 101' },
          { time: '08:45–09:30', subject: 'Mathematics',   teacher: 'Hassan Mahmood',  room: 'Room 101' },
          { time: '09:30–10:15', subject: 'English',       teacher: 'Sana Tariq',      room: 'Room 101' },
          { time: '10:15–10:30', subject: 'Break',         teacher: '',                room: '' },
          { time: '10:30–11:15', subject: 'Science',       teacher: 'Hassan Mahmood',  room: 'Lab 1' },
          { time: '11:15–12:00', subject: 'Physical Education', teacher: 'Hassan Mahmood', room: 'Ground' },
          { time: '12:00–12:30', subject: 'Assembly',      teacher: '',                room: 'Ground' },
        ],
      },
    ],
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// 5 ▸ PARENT ACCOUNTS
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_PARENTS = [
  {
    id: 'parent-001',
    name: 'Muhammad Raza',
    email: 'parent@tca.edu.pk',
    password: 'parent@123',
    phone: '+92-300-9876543',
    occupation: 'Software Engineer',
    address: '12 Main Boulevard, Gulberg, Lahore',
    relation: 'Father',
    portal_type: 'PARENT',
    institute_type: 'academy',
    children: [
      {
        ...DUMMY_STUDENTS[0],
        class_name: 'Class 1 – Section A',
        roll_no: 'TCA-001',
        roll_number: 'TCA-001',
        attendance: DUMMY_PORTAL_ATTENDANCE['stu-001'],
        fees: makeFees('stu-001', [[9,2025,'paid','2025-09-10'],[10,2025,'paid','2025-10-08'],[11,2025,'paid','2025-11-06'],[12,2025,'paid','2025-12-10'],[1,2026,'paid','2026-01-09'],[2,2026,'paid','2026-02-07'],[3,2026,'pending',null]], 3500),
        results: DUMMY_EXAM_RESULTS.filter((r) => r.student_id === 'stu-001'),
        timetable: DUMMY_TIMETABLE['class-001'],
      },
      {
        ...DUMMY_STUDENTS[1],
        class_name: 'Class 1 – Section B',
        roll_no: 'TCA-002',
        roll_number: 'TCA-002',
        attendance: DUMMY_PORTAL_ATTENDANCE['stu-002'],
        fees: makeFees('stu-002', [[9,2025,'paid','2025-09-12'],[10,2025,'paid','2025-10-10'],[11,2025,'paid','2025-11-08'],[12,2025,'paid','2025-12-09'],[1,2026,'paid','2026-01-11'],[2,2026,'pending',null],[3,2026,'pending',null]], 3500),
        results: DUMMY_EXAM_RESULTS.filter((r) => r.student_id === 'stu-002'),
        timetable: DUMMY_TIMETABLE['class-001'],
      },
    ],
  },
  {
    id: 'parent-002',
    name: 'Rabia Khan',
    email: 'parent2@tca.edu.pk',
    password: 'parent@123',
    phone: '+92-321-5544332',
    occupation: 'Doctor',
    address: '45 DHA Phase 5, Lahore',
    relation: 'Mother',
    portal_type: 'PARENT',
    institute_type: 'academy',
    children: [
      {
        ...DUMMY_STUDENTS[2],
        class_name: 'Class 2 – Section A',
        roll_no: 'TCA-003',
        roll_number: 'TCA-003',
        attendance: DUMMY_PORTAL_ATTENDANCE['stu-001'], // reuse
        fees: makeFees('stu-003', [[9,2025,'paid','2025-09-11'],[10,2025,'paid','2025-10-09'],[11,2025,'paid','2025-11-07'],[12,2025,'paid','2025-12-08'],[1,2026,'paid','2026-01-10'],[2,2026,'overdue',null],[3,2026,'pending',null]], 3500),
        results: [],
        timetable: DUMMY_TIMETABLE['class-001'],
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 6 ▸ STUDENT PORTAL USERS  (students who can login to the portal)
// ──────────────────────────────────────────────────────────────────────────────
// Syllabus data for Academy (Class 1) students
const PORTAL_ACADEMY_SYLLABUS = [
  { id:'syl-aca-1',name:'Mathematics',    code:'MATH-1', class_id:'class-001',description:'Number systems, basic arithmetic and geometry.',  syllabus_type:'text',syllabus_content:'Chapter 1: Numbers (1-100)\nChapter 2: Addition\nChapter 3: Subtraction\nChapter 4: Multiplication\nChapter 5: Division\nChapter 6: Fractions\nChapter 7: Basic Measurement\nChapter 8: Shapes & Geometry',is_active:true },
  { id:'syl-aca-2',name:'English Language',code:'ENG-1',  class_id:'class-001',description:'Reading, writing and grammar fundamentals.',       syllabus_type:'text',syllabus_content:'Unit 1: Alphabets & Phonics\nUnit 2: Simple Words & Vocabulary\nUnit 3: Sentence Formation\nUnit 4: Nouns & Verbs\nUnit 5: Reading Comprehension\nUnit 6: Creative Writing\nUnit 7: Punctuation & Grammar',is_active:true },
  { id:'syl-aca-3',name:'Urdu',           code:'URDU-1', class_id:'class-001',description:'Urdu language basics and literature.',              syllabus_type:'text',syllabus_content:'سبق 1: حروف تہجی\nسبق 2: الفاظ بنانا\nسبق 3: جملے بنانا\nسبق 4: کہانیاں\nقواعد: اسم اور فعل',is_active:true },
  { id:'syl-aca-4',name:'Science',         code:'SCI-1',  class_id:'class-001',description:'Introduction to science and the natural world.',    syllabus_type:'text',syllabus_content:'Chapter 1: Plants & Animals\nChapter 2: The Human Body\nChapter 3: Weather & Seasons\nChapter 4: The Water Cycle\nChapter 5: Simple Machines\nChapter 6: Energy & Light',is_active:true },
  { id:'syl-aca-5',name:'Social Studies',  code:'SS-1',   class_id:'class-001',description:'Society, family, community and civic values.',      syllabus_type:'text',syllabus_content:'Unit 1: Me & My Family\nUnit 2: My School\nUnit 3: My Community\nUnit 4: My Country Pakistan\nUnit 5: Maps & Directions\nUnit 6: Festive Occasions & Traditions',is_active:true },
  { id:'syl-aca-6',name:'Islamic Studies', code:'ISL-1',  class_id:'class-001',description:'Basic Islamic teachings and values.',                syllabus_type:'text',syllabus_content:'Chapter 1: Surah Al-Fatiha\nChapter 2: Who is Allah?\nChapter 3: Arkan-e-Islam\nChapter 4: Our Prophet (P.B.U.H)\nChapter 5: Stories of Prophets\nChapter 6: Good Manners & Values',is_active:true },
];

export const DUMMY_STUDENT_PORTAL_USERS = [
  {
    id: 'stu-001',
    first_name: 'Ali',
    last_name: 'Raza',
    email: 'ali@student.tca',
    password: 'student@123',
    roll_number: 'TCA-001',
    class_name: 'Class 1 – Section A',
    class_id: 'class-001',
    branch: 'Main Campus',
    gender: 'male',
    date_of_birth: '2014-03-15',
    guardian_name: 'Muhammad Raza',
    guardian_phone: '+92-300-9876543',
    portal_type: 'STUDENT',
    institute_type: 'academy',
    attendance: DUMMY_PORTAL_ATTENDANCE['stu-001'],
    fees: makeFees('stu-001', [[9,2025,'paid','2025-09-10'],[10,2025,'paid','2025-10-08'],[11,2025,'paid','2025-11-06'],[12,2025,'paid','2025-12-10'],[1,2026,'paid','2026-01-09'],[2,2026,'paid','2026-02-07'],[3,2026,'pending',null]], 3500),
    results: DUMMY_EXAM_RESULTS.filter((r) => r.student_id === 'stu-001'),
    timetable: DUMMY_TIMETABLE['class-001'],
    syllabus: PORTAL_ACADEMY_SYLLABUS,
  },
  {
    id: 'stu-002',
    first_name: 'Fatima',
    last_name: 'Malik',
    email: 'fatima@student.tca',
    password: 'student@123',
    roll_number: 'TCA-002',
    class_name: 'Class 1 – Section B',
    class_id: 'class-001',
    branch: 'Main Campus',
    gender: 'female',
    date_of_birth: '2014-07-22',
    guardian_name: 'Muhammad Raza',
    guardian_phone: '+92-300-9876543',
    portal_type: 'STUDENT',
    institute_type: 'academy',
    attendance: DUMMY_PORTAL_ATTENDANCE['stu-002'],
    fees: makeFees('stu-002', [[9,2025,'paid','2025-09-12'],[10,2025,'paid','2025-10-10'],[11,2025,'paid','2025-11-08'],[12,2025,'paid','2025-12-09'],[1,2026,'paid','2026-01-11'],[2,2026,'pending',null],[3,2026,'pending',null]], 3500),
    results: DUMMY_EXAM_RESULTS.filter((r) => r.student_id === 'stu-002'),
    timetable: DUMMY_TIMETABLE['class-001'],
    syllabus: PORTAL_ACADEMY_SYLLABUS,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 7 ▸ TEACHER PORTAL DATA
// ──────────────────────────────────────────────────────────────────────────────

export const DUMMY_TEACHER_NOTES = [
  { id: 'note-001', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Mathematics', title: 'Chapter 3: Multiplication Tables', description: 'Complete notes on multiplication tables from 1 to 20 with practice exercises.', file_type: 'PDF', file_size: '1.2 MB', uploaded_on: '2026-02-20', teacher_id: 'teacher-001', downloads: 45 },
  { id: 'note-002', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Science',     title: 'Plants and Their Parts',          description: 'Detailed notes on plant anatomy: roots, stem, leaves, flowers with diagrams.', file_type: 'PDF', file_size: '2.1 MB', uploaded_on: '2026-02-18', teacher_id: 'teacher-001', downloads: 38 },
  { id: 'note-003', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Mathematics', title: 'Chapter 4: Division Basics',         description: 'Introduction to division, equal sharing concept with worked examples.', file_type: 'PDF', file_size: '980 KB', uploaded_on: '2026-02-14', teacher_id: 'teacher-001', downloads: 52 },
  { id: 'note-004', class_id: 'class-001', class_name: 'Class 1 – Section B', subject: 'Science',     title: 'Water Cycle Explained',             description: 'The water cycle — evaporation, condensation, precipitation with illustrations.', file_type: 'PDF', file_size: '1.7 MB', uploaded_on: '2026-02-10', teacher_id: 'teacher-001', downloads: 29 },
];

export const DUMMY_TEACHER_ASSIGNMENTS = [
  {
    id: 'asgn-001', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Mathematics',
    title: 'Multiplication Practice — Tables 6 to 10',
    description: 'Complete the worksheet: write multiplication tables 6–10 three times each and solve 20 word problems from the textbook page 45–47.',
    due_date: '2026-03-05', assigned_on: '2026-02-25', total_marks: 20, status: 'active',
    submissions: 32, total_students: 40, teacher_id: 'teacher-001',
  },
  {
    id: 'asgn-002', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Science',
    title: 'Draw & Label: Parts of a Plant',
    description: 'Draw a flowering plant and label all major parts (root, stem, leaf, flower, fruit, seed). Use color pencils and write one line about each part.',
    due_date: '2026-03-03', assigned_on: '2026-02-22', total_marks: 15, status: 'active',
    submissions: 28, total_students: 40, teacher_id: 'teacher-001',
  },
  {
    id: 'asgn-003', class_id: 'class-001', class_name: 'Class 1 – Section B', subject: 'Science',
    title: 'Water Cycle Poster',
    description: 'Create an A4 poster showing the water cycle with all four stages labeled. Write 2 sentences about each stage.',
    due_date: '2026-02-28', assigned_on: '2026-02-18', total_marks: 25, status: 'submitted',
    submissions: 35, total_students: 38, teacher_id: 'teacher-001',
  },
  {
    id: 'asgn-004', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Mathematics',
    title: 'Division Word Problems',
    description: 'Solve 15 division word problems from the worksheet provided in class. Show all working.',
    due_date: '2026-02-20', assigned_on: '2026-02-12', total_marks: 20, status: 'graded',
    submissions: 40, total_students: 40, teacher_id: 'teacher-001',
  },
];

export const DUMMY_TEACHER_HOMEWORK = [
  { id: 'hw-001', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Mathematics', date: '2026-02-27', title: 'Tables Revision',     description: 'Revise tables 1–10 and write each table once in the homework notebook.', due_date: '2026-02-28', teacher_id: 'teacher-001' },
  { id: 'hw-002', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'English',     date: '2026-02-27', title: 'Write 5 Sentences',   description: 'Write 5 meaningful sentences using the new vocabulary words from today\'s lesson.', due_date: '2026-02-28', teacher_id: 'teacher-001' },
  { id: 'hw-003', class_id: 'class-001', class_name: 'Class 1 – Section B', subject: 'Science',     date: '2026-02-26', title: 'Read Chapter 5',      description: 'Read Chapter 5 (Animals and Their Habitats) and answer the review questions at the end.', due_date: '2026-02-27', teacher_id: 'teacher-001' },
  { id: 'hw-004', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Urdu',        date: '2026-02-26', title: 'اسباق کی نظم یاد کریں', description: 'درسی کتاب کی نظم "پھول" صفحہ 38 یاد کریں اور کاپی میں لکھیں۔', due_date: '2026-02-27', teacher_id: 'teacher-001' },
  { id: 'hw-005', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'Mathematics', date: '2026-02-25', title: 'Division Practice',   description: 'Complete page 52 exercises 1 to 10 from the textbook.', due_date: '2026-02-26', teacher_id: 'teacher-001' },
  { id: 'hw-006', class_id: 'class-001', class_name: 'Class 1 – Section A', subject: 'English',     date: '2026-02-24', title: 'Reading Comprehension', description: 'Read the passage on page 67 and answer all comprehension questions.', due_date: '2026-02-25', teacher_id: 'teacher-001' },
];

export const DUMMY_TEACHER_PORTAL_USERS = [
  {
    id: 'teacher-001',
    first_name: 'Hassan',
    last_name: 'Mahmood',
    email: 'hassan@teacher.tca',
    password: 'teacher@123',
    phone: '+92-333-1234567',
    branch: 'Main Campus',
    designation: 'Senior Teacher',
    department: 'Mathematics & Science',
    joining_date: '2020-04-01',
    portal_type: 'TEACHER',
    institute_type: 'academy',
    assigned_classes: [
      { class_id: 'class-001', class_name: 'Class 1 – Section A', subjects: ['Mathematics', 'Science'], total_students: 40 },
      { class_id: 'class-002', class_name: 'Class 1 – Section B', subjects: ['Science'],                 total_students: 38 },
    ],
    notes:       DUMMY_TEACHER_NOTES.filter((n) => n.teacher_id === 'teacher-001'),
    assignments: DUMMY_TEACHER_ASSIGNMENTS.filter((a) => a.teacher_id === 'teacher-001'),
    homework:    DUMMY_TEACHER_HOMEWORK.filter((h) => h.teacher_id === 'teacher-001'),
    attendance_marked_today: false,
    stats: { total_students: 78, notes_uploaded: 4, assignments_active: 2, classes: 2 },
  },
  {
    id: 'teacher-002',
    first_name: 'Sana',
    last_name: 'Tariq',
    email: 'sana@teacher.tca',
    password: 'teacher@123',
    phone: '+92-321-9876543',
    branch: 'Main Campus',
    designation: 'Teacher',
    department: 'English & Languages',
    joining_date: '2021-08-15',
    portal_type: 'TEACHER',
    institute_type: 'academy',
    assigned_classes: [
      { class_id: 'class-001', class_name: 'Class 1 – Section A', subjects: ['English', 'Art & Craft', 'General Knowledge'], total_students: 40 },
    ],
    notes:       [],
    assignments: [],
    homework:    DUMMY_TEACHER_HOMEWORK.filter((h) => h.subject === 'English'),
    attendance_marked_today: true,
    stats: { total_students: 40, notes_uploaded: 0, assignments_active: 0, classes: 1 },
  },
];

// Student list for teacher's classes (reuse from main dummyData)
export const getTeacherStudents = (teacher) => {
  const classIds = teacher.assigned_classes?.map((c) => c.class_id) || [];
  // Return dummy students — in real app filter by classIds
  return DUMMY_STUDENTS.slice(0, 8).map((s, i) => ({
    ...s,
    class_name: i < 4 ? 'Class 1 – Section A' : 'Class 1 – Section B',
    attendance_today: ['present', 'present', 'late', 'present', 'absent', 'present', 'present', 'present'][i] || 'present',
  }));
};

// ──────────────────────────────────────────────────────────────────────────────
// 8 ▸ PER-INSTITUTE-TYPE FULL PORTAL DATA
// ──────────────────────────────────────────────────────────────────────────────

// helpers —————————————————————————————————————————————————————————————————————
function makeFees(studentId, monthEntries, baseAmount) {
  return monthEntries.map(([m, y, status, paidOn]) => ({
    id:         `fee-${studentId}-${y}-${m}`,
    student_id: studentId,
    month:      m,
    year:       y,
    amount:     baseAmount,
    discount:   0,
    status,
    due_date:   `${y}-${String(m).padStart(2,'0')}-15`,
    paid_on:    paidOn || null,
  }));
}

function makeResults(studentId, examName, examDate, subjects, position, classTotal) {
  const total_marks = subjects.reduce((s, sub) => s + sub.marks, 0);
  const total_full  = subjects.length * 100;
  const percentage  = Math.round((total_marks / total_full) * 1000) / 10;
  const grade       = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : 'C';
  return [{
    exam_id:     `exam-${studentId}`,
    student_id:  studentId,
    exam:        { id: `exam-${studentId}`, name: examName, type: 'Mid Term', date: examDate, academic_year: '2025-26' },
    subjects,    total_marks, total_full, percentage, grade, position,
    class_total: classTotal,
    remarks:     percentage >= 90 ? 'Outstanding!' : percentage >= 80 ? 'Excellent performance. Keep it up!' : 'Good effort. Keep improving.',
    published:   true,
  }];
}

// ── SCHOOL ────────────────────────────────────────────────────────────────────
const _SCHOOL = (() => {
  const att1  = buildAttendance('sch-s1', null, [10, 18], [3]);
  const att2  = buildAttendance('sch-s2', null, [24], []);
  const fees1 = makeFees('sch-s1', [[9,2025,'paid','2025-09-12'],[10,2025,'paid','2025-10-10'],[11,2025,'paid','2025-11-08'],[12,2025,'paid','2025-12-09'],[1,2026,'paid','2026-01-11'],[2,2026,'pending',null],[3,2026,'pending',null]], 4500);
  const fees2 = makeFees('sch-s2', [[9,2025,'paid','2025-09-14'],[10,2025,'paid','2025-10-12'],[11,2025,'paid','2025-11-10'],[12,2025,'paid','2025-12-11'],[1,2026,'paid','2026-01-13'],[2,2026,'overdue',null],[3,2026,'pending',null]], 4500);
  const subs1 = [{ name:'Mathematics',marks:82,total:100,grade:'A' },{ name:'Physics',marks:76,total:100,grade:'B+' },{ name:'Chemistry',marks:79,total:100,grade:'B+' },{ name:'English',marks:88,total:100,grade:'A' },{ name:'Urdu',marks:85,total:100,grade:'A' },{ name:'Islamiat',marks:91,total:100,grade:'A+' }];
  const subs2 = [{ name:'Mathematics',marks:91,total:100,grade:'A+' },{ name:'English',marks:87,total:100,grade:'A' },{ name:'Urdu',marks:83,total:100,grade:'A' },{ name:'Science',marks:89,total:100,grade:'A' },{ name:'Pak. Studies',marks:94,total:100,grade:'A+' },{ name:'Islamiat',marks:96,total:100,grade:'A+' }];
  const res1  = makeResults('sch-s1', 'Mid-Term Examination', '2026-02-10', subs1, 5, 55);
  const res2  = makeResults('sch-s2', 'Mid-Term Examination', '2026-02-10', subs2, 2, 48);
  const tt = { class:'Class 9', section:'Section A', schedule:[
    { day:'Monday',    periods:[{time:'08:00–08:45',subject:'Mathematics',teacher:'Rabia Naz',    room:'Room 12'},{time:'08:45–09:30',subject:'English',    teacher:'Nadia Ahmed',  room:'Room 12'},{time:'09:30–10:15',subject:'Physics',    teacher:'Kamran Ali',   room:'Lab 2'  },{time:'10:15–10:30',subject:'Break',      teacher:'',             room:''       },{time:'10:30–11:15',subject:'Chemistry',  teacher:'Salma Iqbal',  room:'Lab 1'  },{time:'11:15–12:00',subject:'Urdu',       teacher:'Tariq Sb.',    room:'Room 12'},{time:'12:00–12:45',subject:'Islamiat',   teacher:'Tariq Sb.',    room:'Room 12'}]},
    { day:'Tuesday',   periods:[{time:'08:00–08:45',subject:'Physics',    teacher:'Kamran Ali',   room:'Lab 2'  },{time:'08:45–09:30',subject:'Mathematics',teacher:'Rabia Naz',    room:'Room 12'},{time:'09:30–10:15',subject:'English',    teacher:'Nadia Ahmed',  room:'Room 12'},{time:'10:15–10:30',subject:'Break',      teacher:'',             room:''       },{time:'10:30–11:15',subject:'Computer',   teacher:'Omer Farooq',  room:'Comp Lab'},{time:'11:15–12:00',subject:'Chemistry',  teacher:'Salma Iqbal',  room:'Lab 1'  },{time:'12:00–12:45',subject:'Mathematics',teacher:'Rabia Naz',    room:'Room 12'}]},
    { day:'Wednesday', periods:[{time:'08:00–08:45',subject:'Urdu',       teacher:'Tariq Sb.',    room:'Room 12'},{time:'08:45–09:30',subject:'Physics',    teacher:'Kamran Ali',   room:'Lab 2'  },{time:'09:30–10:15',subject:'Mathematics',teacher:'Rabia Naz',    room:'Room 12'},{time:'10:15–10:30',subject:'Break',      teacher:'',             room:''       },{time:'10:30–11:15',subject:'English',    teacher:'Nadia Ahmed',  room:'Room 12'},{time:'11:15–12:00',subject:'Islamiat',   teacher:'Tariq Sb.',    room:'Room 12'},{time:'12:00–12:45',subject:'Chemistry',  teacher:'Salma Iqbal',  room:'Lab 1'  }]},
    { day:'Thursday',  periods:[{time:'08:00–08:45',subject:'Mathematics',teacher:'Rabia Naz',    room:'Room 12'},{time:'08:45–09:30',subject:'Chemistry',  teacher:'Salma Iqbal',  room:'Lab 1'  },{time:'09:30–10:15',subject:'Urdu',       teacher:'Tariq Sb.',    room:'Room 12'},{time:'10:15–10:30',subject:'Break',      teacher:'',             room:''       },{time:'10:30–11:15',subject:'Physics',    teacher:'Kamran Ali',   room:'Lab 2'  },{time:'11:15–12:00',subject:'English',    teacher:'Nadia Ahmed',  room:'Room 12'},{time:'12:00–12:45',subject:'Computer',   teacher:'Omer Farooq',  room:'Comp Lab'}]},
    { day:'Friday',    periods:[{time:'08:00–08:45',subject:'Islamiat',   teacher:'Tariq Sb.',    room:'Room 12'},{time:'08:45–09:30',subject:'Mathematics',teacher:'Rabia Naz',    room:'Room 12'},{time:'09:30–10:15',subject:'English',    teacher:'Nadia Ahmed',  room:'Room 12'},{time:'10:15–10:30',subject:'Break',      teacher:'',             room:''       },{time:'10:30–11:15',subject:'Physics',    teacher:'Kamran Ali',   room:'Lab 2'  },{time:'11:15–12:00',subject:'Chemistry',  teacher:'Salma Iqbal',  room:'Lab 1'  },{time:'12:00–12:30',subject:'Assembly',   teacher:'',             room:'Ground' }]},
  ]};
  const child1 = { id:'sch-s1',first_name:'Usman',last_name:'Ali',  class_name:'Class 9 – Section A',roll_no:'SCH-001',roll_number:'SCH-001',gender:'male',  date_of_birth:'2011-05-12',attendance:att1,fees:fees1,results:res1,timetable:tt };
  const child2 = { id:'sch-s2',first_name:'Hira', last_name:'Ahmed', class_name:'Class 7 – Section B',roll_no:'SCH-002',roll_number:'SCH-002',gender:'female',date_of_birth:'2013-09-20',attendance:att2,fees:fees2,results:res2,timetable:tt };
  const schSyl = [
    { id:'syl-sch-1',name:'Mathematics',code:'MATH-9', class_id:'sch-c1',description:'Algebra, geometry and trigonometry for Class 9.',syllabus_type:'text',syllabus_content:'Chapter 1: Real & Complex Numbers\nChapter 2: Logarithms\nChapter 3: Algebraic Expressions & Formulas\nChapter 4: Factorization\nChapter 5: Linear Equations & Inequalities\nChapter 6: Coordinate Geometry\nChapter 7: Linear Graphs\nChapter 8: Congruent Triangles\nChapter 9: Parallelograms & Triangles\nChapter 10: Pythagoras Theorem',is_active:true },
    { id:'syl-sch-2',name:'Physics',    code:'PHY-9',  class_id:'sch-c1',description:'Physical quantities, kinematics and energy.',syllabus_type:'text',syllabus_content:'Chapter 1: Physical Quantities & Measurement\nChapter 2: Kinematics\nChapter 3: Dynamics\nChapter 4: Turning Effect of Forces\nChapter 5: Gravitation\nChapter 6: Work & Energy\nChapter 7: Properties of Matter\nChapter 8: Thermal Properties of Matter',is_active:true },
    { id:'syl-sch-3',name:'Chemistry',  code:'CHEM-9', class_id:'sch-c1',description:'Fundamental concepts of chemistry.',syllabus_type:'text',syllabus_content:'Chapter 1: Fundamentals of Chemistry\nChapter 2: Structure of Atoms\nChapter 3: Periodic Table & Periodicity\nChapter 4: Structure of Molecules\nChapter 5: Physical States of Matter\nChapter 6: Solutions\nChapter 7: Electrochemistry\nChapter 8: Chemical Reactivity',is_active:true },
    { id:'syl-sch-4',name:'English',    code:'ENG-9',  class_id:'sch-c1',description:'Grammar, writing and comprehension.',syllabus_type:'text',syllabus_content:'Unit 1: Characters & People\nUnit 2: Science & Technology\nUnit 3: Humour\nUnit 4: Nature\nUnit 5: Health\nUnit 6: Sports\nUnit 7: Culture & Society\nUnit 8: Environment\nGrammar: Tenses, Active-Passive Voice, Direct-Indirect Speech',is_active:true },
    { id:'syl-sch-5',name:'Urdu',       code:'URDU-9', class_id:'sch-c1',description:'Urdu language and literature.',syllabus_type:'text',syllabus_content:'نثر: افسانے اور مضامین\nنظم: حمد، نعت، غزل\nقواعد: جملے کی اقسام، فعل، اسم، صفت\nمضمون نویسی\nخط نویسی',is_active:true },
    { id:'syl-sch-6',name:'Islamiat',   code:'ISL-9',  class_id:'sch-c1',description:'Islamic studies and Quran.',syllabus_type:'text',syllabus_content:'Quran: Al-Hujurat (49), Al-Jumuah (62)\nHadith: Truthfulness, Knowledge, Brotherhood\nFiqh: Wudu, Salah, Sawm, Zakat, Hajj\nSeerah: Battle of Badr, Conquest of Makkah\nIslamic Ethics & Values',is_active:true },
  ];
  return {
    parent: { id:'parent-sch',name:'Ahmed Khan',email:'parent@school.edu',password:'parent@123',phone:'+92-311-2233445',occupation:'Engineer',address:'House 14, Johar Town, Lahore',relation:'Father',portal_type:'PARENT',institute_type:'school',children:[child1,child2] },
    student: { id:'sch-s1',first_name:'Usman',last_name:'Ali',email:'student@school.edu',password:'student@123',roll_number:'SCH-001',roll_no:'SCH-001',class_name:'Class 9 – Section A',class_id:'sch-c1',branch:'Main Campus',gender:'male',date_of_birth:'2011-05-12',guardian_name:'Ahmed Khan',guardian_phone:'+92-311-2233445',portal_type:'STUDENT',institute_type:'school',attendance:att1,fees:fees1,results:res1,timetable:tt,syllabus:schSyl },
    teacher: { id:'sch-t1',first_name:'Rabia',last_name:'Naz',email:'teacher@school.edu',password:'teacher@123',phone:'+92-322-5544332',branch:'Main Campus',designation:'Senior Teacher',department:'Mathematics',joining_date:'2018-04-01',portal_type:'TEACHER',institute_type:'school',assigned_classes:[{ class_id:'sch-c1',class_name:'Class 9 – Section A',subjects:['Mathematics','Computer'],total_students:42 },{ class_id:'sch-c2',class_name:'Class 9 – Section B',subjects:['Mathematics'],total_students:40 }],notes:[{ id:'sn1',class_id:'sch-c1',class_name:'Class 9 – Section A',subject:'Mathematics',title:'Chapter 2: Linear Equations',description:'Complete notes on solving linear equations with examples.',file_type:'PDF',file_size:'1.1 MB',uploaded_on:'2026-02-22',teacher_id:'sch-t1',downloads:38 },{ id:'sn2',class_id:'sch-c1',class_name:'Class 9 – Section A',subject:'Mathematics',title:'Chapter 3: Geometry Basics',description:'Lines, angles and triangles with worked problems.',file_type:'PDF',file_size:'900 KB',uploaded_on:'2026-02-15',teacher_id:'sch-t1',downloads:30 }],assignments:[{ id:'sa1',class_id:'sch-c1',class_name:'Class 9 – Section A',subject:'Mathematics',title:'Linear Equations Practice',description:'Solve 15 problems from the worksheet.',due_date:'2026-03-06',assigned_on:'2026-02-27',total_marks:20,status:'active',submissions:35,total_students:42,teacher_id:'sch-t1' }],homework:[{ id:'sh1',class_id:'sch-c1',class_name:'Class 9 – Section A',subject:'Mathematics',date:'2026-02-27',title:'Revision: Chapters 1–2',description:'Revise chapters 1 and 2 for the upcoming test.',due_date:'2026-02-28',teacher_id:'sch-t1' },{ id:'sh2',class_id:'sch-c1',class_name:'Class 9 – Section A',subject:'Mathematics',date:'2026-02-26',title:'Practice Exercise 5',description:'Complete exercise 5 from textbook page 48.',due_date:'2026-02-27',teacher_id:'sch-t1' }],attendance_marked_today:false,stats:{ total_students:82,notes_uploaded:2,assignments_active:1,classes:2 } },
  };
})();

// ── COACHING ──────────────────────────────────────────────────────────────────
const _COACHING = (() => {
  const att1  = buildAttendance('cch-s1', null, [12, 19], [5]);
  const fees1 = makeFees('cch-s1', [[10,2025,'paid','2025-10-05'],[11,2025,'paid','2025-11-06'],[12,2025,'paid','2025-12-04'],[1,2026,'paid','2026-01-07'],[2,2026,'pending',null],[3,2026,'pending',null]], 3500);
  const subs1 = [{ name:'Physics',marks:77,total:100,grade:'B+' },{ name:'Chemistry',marks:82,total:100,grade:'A' },{ name:'Mathematics',marks:88,total:100,grade:'A' }];
  const res1  = makeResults('cch-s1', 'Monthly Test – February', '2026-02-20', subs1, 4, 30);
  const tt = { class:'Physics Batch A', section:'Morning', schedule:[
    { day:'Monday',    periods:[{time:'09:00–10:30',subject:'Physics',    teacher:'Imran Butt',   room:'Room 3'},{time:'10:30–12:00',subject:'Mathematics',teacher:'Zaid Anwar',  room:'Room 3'}]},
    { day:'Tuesday',   periods:[{time:'09:00–10:30',subject:'Chemistry',  teacher:'Sobia Akhtar', room:'Lab A' },{time:'10:30–12:00',subject:'Physics',    teacher:'Imran Butt',   room:'Room 3'}]},
    { day:'Wednesday', periods:[{time:'09:00–10:30',subject:'Mathematics',teacher:'Zaid Anwar',  room:'Room 3'},{time:'10:30–12:00',subject:'Chemistry',  teacher:'Sobia Akhtar', room:'Lab A' }]},
    { day:'Thursday',  periods:[{time:'09:00–10:30',subject:'Physics',    teacher:'Imran Butt',   room:'Room 3'},{time:'10:30–12:00',subject:'Mathematics',teacher:'Zaid Anwar',  room:'Room 3'}]},
    { day:'Friday',    periods:[{time:'09:00–10:30',subject:'Chemistry',  teacher:'Sobia Akhtar', room:'Lab A' },{time:'10:30–11:30',subject:'Revision',   teacher:'Imran Butt',   room:'Room 3'}]},
  ]};
  const child1 = { id:'cch-s1',first_name:'Bilal',last_name:'Hassan',class_name:'Physics Batch A – Morning',roll_no:'CCH-001',roll_number:'CCH-001',gender:'male',date_of_birth:'2008-08-14',attendance:att1,fees:fees1,results:res1,timetable:tt };
  const cchSyl = [
    { id:'syl-cch-1',name:'Physics',    code:'PHY-ENT',  class_id:'cch-c1',description:'Entry test physics covering all major topics.',syllabus_type:'text',syllabus_content:'Module 1: Mechanics & Kinematics\nModule 2: Dynamics & Newton Laws\nModule 3: Circular Motion & Gravitation\nModule 4: Work, Power & Energy\nModule 5: Waves & Sound\nModule 6: Optics & Light\nModule 7: Electricity & Magnetism\nModule 8: Modern Physics\nModule 9: Practice MCQs (MDCAT/ECAT)',is_active:true },
    { id:'syl-cch-2',name:'Chemistry',  code:'CHEM-ENT', class_id:'cch-c1',description:'Entry test chemistry for MDCAT/ECAT.',syllabus_type:'text',syllabus_content:'Module 1: Atomic Structure\nModule 2: Periodic Properties\nModule 3: Chemical Bonding\nModule 4: States of Matter\nModule 5: Chemical Energetics\nModule 6: Chemical Equilibrium\nModule 7: Acids, Bases & Salts\nModule 8: Electrochemistry\nModule 9: Organic Chemistry\nModule 10: Biomolecules',is_active:true },
    { id:'syl-cch-3',name:'Mathematics',code:'MATH-ENT', class_id:'cch-c1',description:'Entry test mathematics for ECAT/NTS.',syllabus_type:'text',syllabus_content:'Module 1: Number Systems & Sets\nModule 2: Algebra & Functions\nModule 3: Trigonometry\nModule 4: Coordinate Geometry\nModule 5: Differentiation & Integration\nModule 6: Vectors & Matrices\nModule 7: Statistics & Probability\nModule 8: Practice MCQs',is_active:true },
  ];
  return {
    parent: { id:'parent-cch',name:'Sara Ahmed',email:'parent@coaching.edu',password:'parent@123',phone:'+92-333-9988776',occupation:'Homemaker',address:'22 Model Town, Lahore',relation:'Mother',portal_type:'PARENT',institute_type:'coaching',children:[child1] },
    student: { id:'cch-s1',first_name:'Bilal',last_name:'Hassan',email:'student@coaching.edu',password:'student@123',roll_number:'CCH-001',roll_no:'CCH-001',class_name:'Physics Batch A – Morning',class_id:'cch-c1',branch:'Main Center',gender:'male',date_of_birth:'2008-08-14',guardian_name:'Sara Ahmed',guardian_phone:'+92-333-9988776',portal_type:'STUDENT',institute_type:'coaching',attendance:att1,fees:fees1,results:res1,timetable:tt,syllabus:cchSyl },
    teacher: { id:'cch-t1',first_name:'Imran',last_name:'Butt',email:'instructor@coaching.edu',password:'teacher@123',phone:'+92-300-7766554',branch:'Main Center',designation:'Senior Instructor',department:'Physics',joining_date:'2019-09-01',portal_type:'TEACHER',institute_type:'coaching',assigned_classes:[{ class_id:'cch-c1',class_name:'Physics Batch A – Morning',subjects:['Physics'],total_students:28 },{ class_id:'cch-c2',class_name:'Physics Batch B – Evening',subjects:['Physics'],total_students:32 }],notes:[{ id:'cn1',class_id:'cch-c1',class_name:'Physics Batch A',subject:'Physics',title:'Mechanics – Chapter 4 Notes',description:"Complete coverage of Newton's laws with solved problems.",file_type:'PDF',file_size:'1.5 MB',uploaded_on:'2026-02-21',teacher_id:'cch-t1',downloads:25 }],assignments:[{ id:'ca1',class_id:'cch-c1',class_name:'Physics Batch A',subject:'Physics',title:'Mechanics Practice Set 3',description:"Solve all problems from today's worksheet.",due_date:'2026-03-07',assigned_on:'2026-02-28',total_marks:25,status:'active',submissions:20,total_students:28,teacher_id:'cch-t1' }],homework:[{ id:'ch1',class_id:'cch-c1',class_name:'Physics Batch A',subject:'Physics',date:'2026-02-27',title:'Read Section 4.3',description:'Read section 4.3 and summarize key formulas.',due_date:'2026-02-28',teacher_id:'cch-t1' }],attendance_marked_today:false,stats:{ total_students:60,notes_uploaded:1,assignments_active:1,classes:2 } },
  };
})();

// ── COLLEGE ───────────────────────────────────────────────────────────────────
const _COLLEGE = (() => {
  const att1  = buildAttendance('clg-s1', null, [4, 13], []);
  const fees1 = makeFees('clg-s1', [[9,2025,'paid','2025-09-08'],[10,2025,'paid','2025-10-09'],[11,2025,'paid','2025-11-07'],[12,2025,'paid','2025-12-08'],[1,2026,'paid','2026-01-10'],[2,2026,'paid','2026-02-12'],[3,2026,'pending',null]], 6000);
  const subs1 = [{ name:'Physics',marks:85,total:100,grade:'A' },{ name:'Chemistry',marks:79,total:100,grade:'B+' },{ name:'Biology',marks:88,total:100,grade:'A' },{ name:'English',marks:74,total:100,grade:'B+' },{ name:'Mathematics',marks:91,total:100,grade:'A+' },{ name:'Urdu',marks:80,total:100,grade:'A' }];
  const res1  = makeResults('clg-s1', 'First Terminal Exam', '2026-02-15', subs1, 3, 62);
  const tt = { class:'FSc Year 1', section:'Section A', schedule:[
    { day:'Monday',    periods:[{time:'08:00–08:50',subject:'Physics',    teacher:'Tariq Mehmood',room:'Room 5'},{time:'08:50–09:40',subject:'Mathematics',teacher:'Asma Baig',    room:'Room 5'},{time:'09:40–10:30',subject:'Chemistry',  teacher:'Haris Shah',   room:'Lab B' },{time:'10:30–10:45',subject:'Break',      teacher:'',             room:''      },{time:'10:45–11:35',subject:'English',    teacher:'Faisal Raza',  room:'Room 5'},{time:'11:35–12:25',subject:'Biology',    teacher:'Nadia Jamil',  room:'Lab C' }]},
    { day:'Tuesday',   periods:[{time:'08:00–08:50',subject:'Mathematics',teacher:'Asma Baig',    room:'Room 5'},{time:'08:50–09:40',subject:'Biology',    teacher:'Nadia Jamil',  room:'Lab C' },{time:'09:40–10:30',subject:'Physics',    teacher:'Tariq Mehmood',room:'Room 5'},{time:'10:30–10:45',subject:'Break',      teacher:'',             room:''      },{time:'10:45–11:35',subject:'Urdu',       teacher:'Faisal Raza',  room:'Room 5'},{time:'11:35–12:25',subject:'Chemistry',  teacher:'Haris Shah',   room:'Lab B' }]},
    { day:'Wednesday', periods:[{time:'08:00–08:50',subject:'Chemistry',  teacher:'Haris Shah',   room:'Lab B' },{time:'08:50–09:40',subject:'Physics',    teacher:'Tariq Mehmood',room:'Room 5'},{time:'09:40–10:30',subject:'Mathematics',teacher:'Asma Baig',    room:'Room 5'},{time:'10:30–10:45',subject:'Break',      teacher:'',             room:''      },{time:'10:45–11:35',subject:'Biology',    teacher:'Nadia Jamil',  room:'Lab C' },{time:'11:35–12:25',subject:'English',    teacher:'Faisal Raza',  room:'Room 5'}]},
    { day:'Thursday',  periods:[{time:'08:00–08:50',subject:'English',    teacher:'Faisal Raza',  room:'Room 5'},{time:'08:50–09:40',subject:'Chemistry',  teacher:'Haris Shah',   room:'Lab B' },{time:'09:40–10:30',subject:'Biology',    teacher:'Nadia Jamil',  room:'Lab C' },{time:'10:30–10:45',subject:'Break',      teacher:'',             room:''      },{time:'10:45–11:35',subject:'Physics',    teacher:'Tariq Mehmood',room:'Room 5'},{time:'11:35–12:25',subject:'Mathematics',teacher:'Asma Baig',    room:'Room 5'}]},
    { day:'Friday',    periods:[{time:'08:00–08:50',subject:'Biology',    teacher:'Nadia Jamil',  room:'Lab C' },{time:'08:50–09:40',subject:'Urdu',       teacher:'Faisal Raza',  room:'Room 5'},{time:'09:40–10:30',subject:'Physics',    teacher:'Tariq Mehmood',room:'Room 5'},{time:'10:30–10:45',subject:'Break',      teacher:'',             room:''      },{time:'10:45–11:35',subject:'Mathematics',teacher:'Asma Baig',    room:'Room 5'},{time:'11:35–12:00',subject:'Assembly',   teacher:'',             room:'Hall'  }]},
  ]};
  const child1 = { id:'clg-s1',first_name:'Zara',last_name:'Malik',class_name:'FSc Year 1 – Section A',roll_no:'CLG-001',roll_number:'CLG-001',gender:'female',date_of_birth:'2009-02-28',attendance:att1,fees:fees1,results:res1,timetable:tt };
  const clgSyl = [
    { id:'syl-clg-1',name:'Physics',    code:'PHY-11',  class_id:'clg-c1',description:'FSc Part 1 Physics — mechanics, waves and thermodynamics.',syllabus_type:'text',syllabus_content:'Chapter 1: Measurements\nChapter 2: Vectors & Equilibrium\nChapter 3: Motion & Force\nChapter 4: Work & Energy\nChapter 5: Circular Motion\nChapter 6: Fluid Dynamics\nChapter 7: Oscillations\nChapter 8: Waves\nChapter 9: Physical & Geometric Optics\nChapter 10: Thermodynamics',is_active:true },
    { id:'syl-clg-2',name:'Chemistry',  code:'CHEM-11', class_id:'clg-c1',description:'FSc Part 1 Chemistry — atomic structure and bonding.',syllabus_type:'text',syllabus_content:'Chapter 1: Basic Concepts\nChapter 2: Experimental Techniques\nChapter 3: Gases\nChapter 4: Liquids & Solids\nChapter 5: Atomic Structure\nChapter 6: Chemical Bonding\nChapter 7: Thermochemistry\nChapter 8: Chemical Equilibrium\nChapter 9: Solutions\nChapter 10: Electrochemistry',is_active:true },
    { id:'syl-clg-3',name:'Biology',    code:'BIO-11',  class_id:'clg-c1',description:'FSc Part 1 Biology — cell biology and diversity.',syllabus_type:'text',syllabus_content:'Chapter 1: Introduction to Biology\nChapter 2: Biological Molecules\nChapter 3: Enzymes\nChapter 4: The Cell\nChapter 5: Variety of Life\nChapter 6: Kingdom Prokaryotae\nChapter 7: Kingdom Protoctista\nChapter 8: Fungi\nChapter 9: Kingdom Plantae\nChapter 10: Kingdom Animalia',is_active:true },
    { id:'syl-clg-4',name:'English',    code:'ENG-11',  class_id:'clg-c1',description:'FSc Part 1 English — writing and comprehension.',syllabus_type:'text',syllabus_content:'Comprehension: Short passages & Q&A\nWriting: Essays, Letters, Stories\nGrammar: Correction of sentences, Fill in blanks\nTranslation: Urdu to English\nPrecis Writing\nDialogue Writing',is_active:true },
    { id:'syl-clg-5',name:'Mathematics',code:'MATH-11', class_id:'clg-c1',description:'FSc Part 1 Mathematics — algebra and calculus.',syllabus_type:'text',syllabus_content:'Chapter 1: Complex Numbers\nChapter 2: Matrices & Determinants\nChapter 3: Vectors\nChapter 4: Sequences & Series\nChapter 5: Permutations & Combinations\nChapter 6: Binomial Theorem\nChapter 7: Trigonometry\nChapter 8: Functions & Limits\nChapter 9: Differentiation\nChapter 10: Integration',is_active:true },
    { id:'syl-clg-6',name:'Urdu',       code:'URDU-11', class_id:'clg-c1',description:'FSc Part 1 Urdu language and literature.',syllabus_type:'text',syllabus_content:'نثر: افسانے اور مضامین\nنظم: غزلیں اور نظمیں\nسرگزشت: خودنوشت\nقواعد: جملہ سازی، محاورے\nمضمون نویسی\nخط نویسی',is_active:true },
  ];
  return {
    parent: { id:'parent-clg',name:'Dr. Khalid Siddiqui',email:'parent@college.edu',password:'parent@123',phone:'+92-321-6677889',occupation:'Doctor',address:'8 Cantt View, Rawalpindi',relation:'Father',portal_type:'PARENT',institute_type:'college',children:[child1] },
    student: { id:'clg-s1',first_name:'Zara',last_name:'Malik',email:'student@college.edu',password:'student@123',roll_number:'CLG-001',roll_no:'CLG-001',class_name:'FSc Year 1 – Section A',class_id:'clg-c1',branch:'Main Campus',gender:'female',date_of_birth:'2009-02-28',guardian_name:'Dr. Khalid Siddiqui',guardian_phone:'+92-321-6677889',portal_type:'STUDENT',institute_type:'college',attendance:att1,fees:fees1,results:res1,timetable:tt,syllabus:clgSyl },
    teacher: { id:'clg-t1',first_name:'Tariq',last_name:'Mehmood',email:'lecturer@college.edu',password:'teacher@123',phone:'+92-315-4433221',branch:'Main Campus',designation:'Senior Lecturer',department:'Physics',joining_date:'2017-07-01',portal_type:'TEACHER',institute_type:'college',assigned_classes:[{ class_id:'clg-c1',class_name:'FSc Year 1 – Section A',subjects:['Physics'],total_students:55 },{ class_id:'clg-c2',class_name:'FSc Year 1 – Section B',subjects:['Physics'],total_students:52 }],notes:[{ id:'cln1',class_id:'clg-c1',class_name:'FSc Year 1 – Section A',subject:'Physics',title:'Chapter 3: Forces & Motion',description:'Lecture notes with diagrams and derivations.',file_type:'PDF',file_size:'1.8 MB',uploaded_on:'2026-02-23',teacher_id:'clg-t1',downloads:50 },{ id:'cln2',class_id:'clg-c1',class_name:'FSc Year 1 – Section A',subject:'Physics',title:'Chapter 4: Work, Power & Energy',description:'Key formulas, examples and exercise solutions.',file_type:'PDF',file_size:'1.3 MB',uploaded_on:'2026-02-18',teacher_id:'clg-t1',downloads:44 }],assignments:[{ id:'cla1',class_id:'clg-c1',class_name:'FSc Year 1 – Section A',subject:'Physics',title:'Forces & Motion Problems',description:'Solve the 10 assigned numericals from the textbook.',due_date:'2026-03-05',assigned_on:'2026-02-26',total_marks:30,status:'active',submissions:40,total_students:55,teacher_id:'clg-t1' }],homework:[{ id:'clh1',class_id:'clg-c1',class_name:'FSc Year 1 – Section A',subject:'Physics',date:'2026-02-27',title:'Derivation Practice',description:'Write derivations of all formulas from Chapter 3.',due_date:'2026-02-28',teacher_id:'clg-t1' }],attendance_marked_today:true,stats:{ total_students:107,notes_uploaded:2,assignments_active:1,classes:2 } },
  };
})();

// ── UNIVERSITY ────────────────────────────────────────────────────────────────
const _UNIVERSITY = (() => {
  const att1  = buildAttendance('uni-s1', null, [6, 20], [16]);
  const fees1 = makeFees('uni-s1', [[9,2025,'paid','2025-09-02'],[10,2025,'paid','2025-10-01'],[11,2025,'paid','2025-11-03'],[12,2025,'paid','2025-12-02'],[1,2026,'paid','2026-01-05'],[2,2026,'paid','2026-02-04'],[3,2026,'pending',null]], 18000);
  const subs1 = [{ name:'Data Structures',marks:72,total:100,grade:'B+' },{ name:'OOP (Java)',marks:81,total:100,grade:'A' },{ name:'Database Systems',marks:68,total:100,grade:'B' },{ name:'Computer Networks',marks:76,total:100,grade:'B+' },{ name:'Discrete Mathematics',marks:65,total:100,grade:'B' }];
  const res1  = makeResults('uni-s1', 'Mid-Semester Exam', '2026-02-18', subs1, 12, 75);
  const tt = { class:'BS-CS', section:'Semester 4', schedule:[
    { day:'Monday',    periods:[{time:'08:30–10:00',subject:'Data Structures',   teacher:'Prof. Hassan Ali', room:'CS Lab 1'},{time:'14:00–15:30',subject:'Database Systems',  teacher:'Dr. Umer Sheikh',  room:'Room 301'}]},
    { day:'Tuesday',   periods:[{time:'10:00–11:30',subject:'OOP (Java)',         teacher:'Ms. Amna Rauf',   room:'CS Lab 2'},{time:'13:00–14:30',subject:'Computer Networks', teacher:'Dr. Bilal Niazi',  room:'Room 305'}]},
    { day:'Wednesday', periods:[{time:'08:30–10:00',subject:'Discrete Mathematics',teacher:'Dr. Samina Aziz', room:'Room 302'},{time:'11:00–12:30',subject:'Data Structures',   teacher:'Prof. Hassan Ali', room:'CS Lab 1'}]},
    { day:'Thursday',  periods:[{time:'09:00–10:30',subject:'Database Systems',  teacher:'Dr. Umer Sheikh',  room:'Room 301'},{time:'13:00–14:30',subject:'OOP (Java)',         teacher:'Ms. Amna Rauf',   room:'CS Lab 2'}]},
    { day:'Friday',    periods:[{time:'10:00–11:30',subject:'Computer Networks', teacher:'Dr. Bilal Niazi',  room:'Room 305'},{time:'12:00–13:00',subject:'Discrete Mathematics',teacher:'Dr. Samina Aziz', room:'Room 302'}]},
  ]};
  const child1 = { id:'uni-s1',first_name:'Hamza',last_name:'Nawaz',class_name:'BS-CS Semester 4',roll_no:'UNI-CS4-001',roll_number:'UNI-CS4-001',gender:'male',date_of_birth:'2004-11-03',attendance:att1,fees:fees1,results:res1,timetable:tt };
  const uniSyl = [
    { id:'syl-uni-1',name:'Data Structures',    code:'CS-301',class_id:'uni-c1',description:'Fundamental data structures and algorithms.',syllabus_type:'text',syllabus_content:'Week 1-2: Arrays & Linked Lists\nWeek 3-4: Stacks & Queues\nWeek 5-6: Trees (BST, AVL)\nWeek 7-8: Heaps & Priority Queues\nWeek 9-10: Graphs & Traversals (BFS, DFS)\nWeek 11-12: Hashing & Hash Tables\nWeek 13-14: Sorting Algorithms\nWeek 15-16: Complexity Analysis',is_active:true },
    { id:'syl-uni-2',name:'OOP (Java)',          code:'CS-302',class_id:'uni-c1',description:'Object-oriented programming using Java.',syllabus_type:'text',syllabus_content:'Week 1-2: Java Fundamentals & JVM\nWeek 3-4: Classes, Objects & Constructors\nWeek 5-6: Inheritance & Polymorphism\nWeek 7-8: Abstract Classes & Interfaces\nWeek 9-10: Exception Handling\nWeek 11-12: Collections Framework\nWeek 13-14: File I/O & Serialization\nWeek 15-16: Generics & Lambda',is_active:true },
    { id:'syl-uni-3',name:'Database Systems',    code:'CS-303',class_id:'uni-c1',description:'Relational databases and SQL.',syllabus_type:'text',syllabus_content:'Week 1-2: Introduction to DBMS\nWeek 3-4: Entity-Relationship Model\nWeek 5-6: Relational Model & Keys\nWeek 7-8: SQL DDL & DML\nWeek 9-10: Advanced SQL Joins & Aggregates\nWeek 11-12: Normalization (1NF-3NF/BCNF)\nWeek 13-14: Transactions & Concurrency\nWeek 15-16: Indexing & Query Optimization',is_active:true },
    { id:'syl-uni-4',name:'Computer Networks',   code:'CS-304',class_id:'uni-c1',description:'Network fundamentals and protocols.',syllabus_type:'text',syllabus_content:'Week 1-2: Network Models (OSI/TCP-IP)\nWeek 3-4: Physical & Data Link Layer\nWeek 5-6: Network Layer & IP Addressing\nWeek 7-8: Routing Algorithms\nWeek 9-10: Transport Layer (TCP/UDP)\nWeek 11-12: Application Layer Protocols\nWeek 13-14: Network Security\nWeek 15-16: Wireless Networks',is_active:true },
    { id:'syl-uni-5',name:'Discrete Mathematics',code:'CS-305',class_id:'uni-c1',description:'Mathematical foundations of computer science.',syllabus_type:'text',syllabus_content:'Week 1-2: Logic & Propositional Calculus\nWeek 3-4: Predicate Logic & Quantifiers\nWeek 5-6: Set Theory\nWeek 7-8: Relations & Functions\nWeek 9-10: Graph Theory\nWeek 11-12: Trees & Matrices\nWeek 13-14: Counting & Combinatorics\nWeek 15-16: Probability & Boolean Algebra',is_active:true },
  ];
  return {
    parent: { id:'parent-uni',name:'Mrs. Farida Nawaz',email:'parent@uni.edu',password:'parent@123',phone:'+92-346-8899001',occupation:'Retired Teacher',address:'33 Shahrah-e-Faisal, Karachi',relation:'Mother',portal_type:'PARENT',institute_type:'university',children:[child1] },
    student: { id:'uni-s1',first_name:'Hamza',last_name:'Nawaz',email:'student@uni.edu',password:'student@123',roll_number:'UNI-CS4-001',roll_no:'UNI-CS4-001',class_name:'BS-CS Semester 4',class_id:'uni-c1',branch:'Main Campus',gender:'male',date_of_birth:'2004-11-03',guardian_name:'Mrs. Farida Nawaz',guardian_phone:'+92-346-8899001',portal_type:'STUDENT',institute_type:'university',attendance:att1,fees:fees1,results:res1,timetable:tt,syllabus:uniSyl },
    teacher: { id:'uni-t1',first_name:'Hassan',last_name:'Ali',email:'professor@uni.edu',password:'teacher@123',phone:'+92-301-2233444',branch:'Main Campus',designation:'Associate Professor',department:'Computer Science',joining_date:'2015-02-01',portal_type:'TEACHER',institute_type:'university',assigned_classes:[{ class_id:'uni-c1',class_name:'BS-CS Semester 4',subjects:['Data Structures'],total_students:65 },{ class_id:'uni-c2',class_name:'BS-SE Semester 4',subjects:['Data Structures','Algorithms'],total_students:55 }],notes:[{ id:'un1',class_id:'uni-c1',class_name:'BS-CS Semester 4',subject:'Data Structures',title:'Topic 5: Trees and Graphs',description:'Lecture slides covering BST, AVL trees and graph traversal.',file_type:'PDF',file_size:'2.5 MB',uploaded_on:'2026-02-24',teacher_id:'uni-t1',downloads:60 },{ id:'un2',class_id:'uni-c1',class_name:'BS-CS Semester 4',subject:'Data Structures',title:'Topic 6: Hashing',description:'Hash tables, collision resolution and complexity analysis.',file_type:'PDF',file_size:'1.6 MB',uploaded_on:'2026-02-17',teacher_id:'uni-t1',downloads:55 }],assignments:[{ id:'ua1',class_id:'uni-c1',class_name:'BS-CS Semester 4',subject:'Data Structures',title:'Assignment 3: BST Implementation',description:'Implement a Binary Search Tree in C++ with insert, delete, search and traversal.',due_date:'2026-03-10',assigned_on:'2026-02-25',total_marks:50,status:'active',submissions:38,total_students:65,teacher_id:'uni-t1' }],homework:[{ id:'uh1',class_id:'uni-c1',class_name:'BS-CS Semester 4',subject:'Data Structures',date:'2026-02-27',title:'Practice: Graph Traversal',description:'Trace BFS and DFS on the 5 graphs from the handout.',due_date:'2026-02-28',teacher_id:'uni-t1' }],attendance_marked_today:false,stats:{ total_students:120,notes_uploaded:2,assignments_active:1,classes:2 } },
  };
})();

const DEMO_INSTITUTE_DATA = {
  school:     _SCHOOL,
  coaching:   _COACHING,
  college:    _COLLEGE,
  university: _UNIVERSITY,
};

// Combined teacher homework & assignment pools (all institute types)
// Used by student portal pages as fallback when student.homework/assignments is absent
export const PORTAL_ALL_TEACHER_HW = [
  ..._SCHOOL.teacher.homework,
  ..._COACHING.teacher.homework,
  ..._COLLEGE.teacher.homework,
  ..._UNIVERSITY.teacher.homework,
  ...DUMMY_TEACHER_HOMEWORK,
];
export const PORTAL_ALL_TEACHER_ASSIGNMENTS = [
  ..._SCHOOL.teacher.assignments,
  ..._COACHING.teacher.assignments,
  ..._COLLEGE.teacher.assignments,
  ..._UNIVERSITY.teacher.assignments,
  ...DUMMY_TEACHER_ASSIGNMENTS,
];

// ──────────────────────────────────────────────────────────────────────────────
// 9 ▸ QUICK DEMO ACCOUNTS  (one per institute_type × portal_role)
// ──────────────────────────────────────────────────────────────────────────────
export const PORTAL_DEMO_ACCOUNTS = [
  // ── School
  { institute_type: 'school',     role: 'PARENT',  name: 'Ahmed Khan',          sub: 'Parent of Usman',           email: 'parent@school.edu',       password: 'parent@123'  },
  { institute_type: 'school',     role: 'STUDENT', name: 'Usman Ali',           sub: 'Class 9 – Section A',       email: 'student@school.edu',      password: 'student@123' },
  { institute_type: 'school',     role: 'TEACHER', name: 'Rabia Naz',           sub: 'Mathematics Teacher',        email: 'teacher@school.edu',      password: 'teacher@123' },
  // ── Coaching
  { institute_type: 'coaching',   role: 'PARENT',  name: 'Sara Ahmed',          sub: 'Parent of Bilal',           email: 'parent@coaching.edu',     password: 'parent@123'  },
  { institute_type: 'coaching',   role: 'STUDENT', name: 'Bilal Hassan',        sub: 'Batch A – Morning',         email: 'student@coaching.edu',    password: 'student@123' },
  { institute_type: 'coaching',   role: 'TEACHER', name: 'Imran Butt',          sub: 'Physics Instructor',        email: 'instructor@coaching.edu', password: 'teacher@123' },
  // ── Academy  (maps to real full-data accounts)
  { institute_type: 'academy',    role: 'PARENT',  name: 'Muhammad Raza',       sub: 'Parent of Ali & Fatima',    email: 'parent@tca.edu.pk',       password: 'parent@123'  },
  { institute_type: 'academy',    role: 'STUDENT', name: 'Ali Raza',            sub: 'Class 1 – Section A',       email: 'ali@student.tca',         password: 'student@123' },
  { institute_type: 'academy',    role: 'TEACHER', name: 'Hassan Mahmood',      sub: 'Maths & Science Teacher',   email: 'hassan@teacher.tca',      password: 'teacher@123' },
  // ── College
  { institute_type: 'college',    role: 'PARENT',  name: 'Dr. Khalid Siddiqui', sub: 'Parent of Zara',           email: 'parent@college.edu',      password: 'parent@123'  },
  { institute_type: 'college',    role: 'STUDENT', name: 'Zara Malik',          sub: 'FSc Year 1',                email: 'student@college.edu',     password: 'student@123' },
  { institute_type: 'college',    role: 'TEACHER', name: 'Tariq Mehmood',       sub: 'Physics Lecturer',          email: 'lecturer@college.edu',    password: 'teacher@123' },
  // ── University
  { institute_type: 'university', role: 'PARENT',  name: 'Mrs. Farida Nawaz',   sub: 'Parent of Hamza',          email: 'parent@uni.edu',          password: 'parent@123'  },
  { institute_type: 'university', role: 'STUDENT', name: 'Hamza Nawaz',         sub: 'BS-CS Semester 4',          email: 'student@uni.edu',         password: 'student@123' },
  { institute_type: 'university', role: 'TEACHER', name: 'Prof. Hassan Ali',    sub: 'Data Structures Professor', email: 'professor@uni.edu',       password: 'teacher@123' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 9 ▸ PORTAL LOGIN HELPER
// ──────────────────────────────────────────────────────────────────────────────
export function dummyPortalLogin({ email, password, type }) {
  const em = email.trim().toLowerCase();

  if (type === 'PARENT') {
    const parent = DUMMY_PARENTS.find((p) => p.email.toLowerCase() === em && p.password === password);
    if (parent) return { user: parent, portal_type: 'PARENT', institute_type: parent.institute_type || 'school', token: `portal-parent-${parent.id}` };
  }
  if (type === 'STUDENT') {
    const student = DUMMY_STUDENT_PORTAL_USERS.find((s) => s.email.toLowerCase() === em && s.password === password);
    if (student) return { user: student, portal_type: 'STUDENT', institute_type: student.institute_type || 'school', token: `portal-student-${student.id}` };
  }
  if (type === 'TEACHER') {
    const teacher = DUMMY_TEACHER_PORTAL_USERS.find((t) => t.email.toLowerCase() === em && t.password === password);
    if (teacher) return { user: teacher, portal_type: 'TEACHER', institute_type: teacher.institute_type || 'school', token: `portal-teacher-${teacher.id}` };
  }

  // Fallback — per-institute-type full demo data
  const demo = PORTAL_DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === em && a.password === password && a.role === type);
  if (demo) {
    const instData = DEMO_INSTITUTE_DATA[demo.institute_type];
    if (instData) {
      const roleKey = demo.role === 'PARENT' ? 'parent' : demo.role === 'STUDENT' ? 'student' : 'teacher';
      return {
        user:           instData[roleKey],
        portal_type:    demo.role,
        institute_type: demo.institute_type,
        token: `portal-${demo.role.toLowerCase()}-${demo.institute_type}`,
      };
    }
  }

  throw new Error('Invalid credentials. Check your email and password.');
}
