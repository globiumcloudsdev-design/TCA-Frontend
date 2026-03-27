
// // src/constants/portalInstituteConfig.js
// /**
//  * portalInstituteConfig.js
//  *
//  * Complete per-institute-type terminology map for all three portals
//  * (Student, Parent, Teacher).
//  *
//  * Includes all possible terms needed across the entire application.
//  *
//  * Usage:
//  *   import { getPortalTerms } from '@/constants/portalInstituteConfig';
//  *   const t = getPortalTerms(instituteType, userType);
//  */

// const CONFIG = {
//   // ── SCHOOL ───────────────────────────────────────────────
//   school: {
//     // Institute identifiers
//     instituteType: 'school',
//     instituteLabel: 'School',
    
//     // Academic terms
//     classLabel: 'Class',
//     classesLabel: 'Classes',
//     batchLabel: 'Section',
//     batchesLabel: 'Sections',
//     subjectLabel: 'Subject',
//     subjectsLabel: 'Subjects',
//     subjectTeacher: 'Subject Teacher',
//     classTeacher: 'Class Teacher',
    
//     // Student related
//     studentLabel: 'Student',
//     studentsLabel: 'Students',
//     rollLabel: 'Roll No.',
//     enrollmentLabel: 'Enrollment No.',
//     admissionLabel: 'Admission',
//     admissionsLabel: 'Admissions',
    
//     // Teacher related
//     teacherLabel: 'Teacher',
//     teachersLabel: 'Teachers',
//     instructorLabel: 'Teacher',
    
//     // Parent related
//     parentLabel: 'Parent',
//     parentsLabel: 'Parents',
//     guardianLabel: 'Guardian',
//     childrenLabel: 'Children',
    
//     // Academic structure
//     academicYear: 'Academic Year',
//     termLabel: 'Term',
//     semesterLabel: 'Term',
//     sessionLabel: 'Session',
    
//     // Exams & Assessment
//     examLabel: 'Exam',
//     examsLabel: 'Exams',
//     testLabel: 'Test',
//     assessmentLabel: 'Assessment',
//     gradeLabel: 'Grade',
//     marksLabel: 'Marks',
//     resultLabel: 'Result',
//     resultsLabel: 'Exam Results',
//     reportCard: 'Report Card',
    
//     // Timetable
//     timetableLabel: 'Timetable',
//     scheduleLabel: 'Schedule',
//     periodLabel: 'Period',
    
//     // Syllabus
//     syllabusLabel: 'Syllabus',
//     curriculumLabel: 'Curriculum',
//     lessonPlan: 'Lesson Plan',
    
//     // Homework & Assignments
//     homeworkLabel: 'Homework',
//     assignmentLabel: 'Assignment',
//     assignmentsLabel: 'Assignments',
//     submissionLabel: 'Submission',
//     dueDateLabel: 'Due Date',
    
//     // Study Material
//     notesLabel: 'Notes',
//     studyMaterial: 'Study Material',
//     resourcesLabel: 'Resources',
    
//     // Attendance
//     attendanceLabel: 'Attendance',
//     presentLabel: 'Present',
//     absentLabel: 'Absent',
//     lateLabel: 'Late',
//     leaveLabel: 'Leave',
    
//     // Fees & Finance
//     feeLabel: 'Fee',
//     feesLabel: 'Fees',
//     feeStructure: 'Fee Structure',
//     feeVoucher: 'Fee Voucher',
//     feeReceipt: 'Fee Receipt',
//     dueDate: 'Due Date',
//     fineLabel: 'Late Fine',
//     discountLabel: 'Scholarship/Discount',
    
//     // Communication
//     announcementLabel: 'Announcement',
//     noticeLabel: 'Notice',
//     circularLabel: 'Circular',
//     messageLabel: 'Message',
//     notificationLabel: 'Notification',
    
//     // Library
//     libraryLabel: 'Library',
//     bookLabel: 'Book',
//     issueLabel: 'Issue',
//     returnLabel: 'Return',
//     fineLabel_library: 'Fine',
    
//     // Transport
//     transportLabel: 'Transport',
//     routeLabel: 'Route',
//     vehicleLabel: 'Vehicle',
//     stopLabel: 'Stop',
    
//     // Hostel
//     hostelLabel: 'Hostel',
//     roomLabel: 'Room',
//     messLabel: 'Mess',
    
//     // Events
//     eventLabel: 'Event',
//     holidayLabel: 'Holiday',
//     celebrationLabel: 'Celebration',
    
//     // Reports
//     reportLabel: 'Report',
//     analyticsLabel: 'Analytics',
//     progressReport: 'Progress Report',
    
//     // Navigation - Parent
//     nav: {
//       overview: 'Overview',
//       myChildren: 'My Children',
//       attendance: 'Attendance',
//       results: 'Exam Results',
//       fees: 'Fees',
//       timetable: 'Timetable',
//       homework: 'Homework',
//       assignments: 'Assignments',
//       studyMaterial: 'Study Material',
//       announcements: 'Announcements',
//       communication: 'Communication',
//       meetings: 'Parent-Teacher Meetings',
//       library: 'Library',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       feedback: 'Feedback',
//     },
    
//     // Navigation - Student
//     nav: {
//       overview: 'Overview',
//       myAttendance: 'My Attendance',
//       myResults: 'My Results',
//       myFees: 'My Fees',
//       myTimetable: 'My Timetable',
//       myClasses: 'My Classes',
//       homework: 'Homework',
//       assignments: 'Assignments',
//       studyMaterial: 'Study Material',
//       syllabus: 'Syllabus',
//       exams: 'Exams',
//       announcements: 'Announcements',
//       library: 'Library',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       achievements: 'Achievements',
//       clubs: 'Clubs & Societies',
//       sports: 'Sports',
//     },
    
//     // Navigation - Teacher
//     nav: {
//       overview: 'Dashboard',
//       myClasses: 'My Classes',
//       myStudents: 'My Students',
//       myTimetable: 'My Timetable',
//       attendance: 'Mark Attendance',
//       selfAttendance: 'My Attendance',
//       homework: 'Homework',
//       assignments: 'Assignments',
//       studyMaterial: 'Upload Material',
//       notes: 'Notes',
//       syllabus: 'Syllabus',
//       exams: 'Manage Exams',
//       examResults: 'Enter Results',
//       announcements: 'Announcements',
//       communication: 'Communicate',
//       meetings: 'Schedule Meetings',
//       reports: 'Reports',
//       library: 'Library Access',
//       transport: 'Transport Info',
//       hostel: 'Hostel Info',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       leave: 'Leave Application',
//       training: 'Training',
//       achievements: 'Achievements',
//       gradebook: 'Gradebook',
//       lessonPlans: 'Lesson Plans',
//     },
    
//     // Common phrases
//     common: {
//       viewAll: 'View All',
//       addNew: 'Add New',
//       edit: 'Edit',
//       delete: 'Delete',
//       download: 'Download',
//       upload: 'Upload',
//       search: 'Search',
//       filter: 'Filter',
//       export: 'Export',
//       import: 'Import',
//       print: 'Print',
//       share: 'Share',
//       save: 'Save',
//       cancel: 'Cancel',
//       confirm: 'Confirm',
//       back: 'Back',
//       next: 'Next',
//       previous: 'Previous',
//       loading: 'Loading...',
//       noData: 'No data found',
//       error: 'Error occurred',
//       success: 'Success',
//       warning: 'Warning',
//       info: 'Information',
//     },
    
//     // Status messages
//     status: {
//       active: 'Active',
//       inactive: 'Inactive',
//       pending: 'Pending',
//       approved: 'Approved',
//       rejected: 'Rejected',
//       completed: 'Completed',
//       upcoming: 'Upcoming',
//       ongoing: 'Ongoing',
//       cancelled: 'Cancelled',
//     },
//   },

//   // ── COACHING CENTER ───────────────────────────────────────
//   coaching: {
//     instituteType: 'coaching',
//     instituteLabel: 'Coaching Center',
    
//     // Academic terms
//     classLabel: 'Batch',
//     classesLabel: 'Batches',
//     batchLabel: 'Group',
//     batchesLabel: 'Groups',
//     subjectLabel: 'Course',
//     subjectsLabel: 'Courses',
//     subjectTeacher: 'Course Instructor',
//     classTeacher: 'Batch Mentor',
    
//     // Student related
//     studentLabel: 'Student',
//     studentsLabel: 'Students',
//     rollLabel: 'Reg. No.',
//     enrollmentLabel: 'Registration No.',
//     admissionLabel: 'Enrollment',
//     admissionsLabel: 'Enrollments',
    
//     // Teacher related
//     teacherLabel: 'Instructor',
//     teachersLabel: 'Instructors',
//     instructorLabel: 'Instructor',
    
//     // Parent related
//     parentLabel: 'Parent',
//     parentsLabel: 'Parents',
//     guardianLabel: 'Guardian',
//     childrenLabel: 'Wards',
    
//     // Academic structure
//     academicYear: 'Session',
//     termLabel: 'Term',
//     semesterLabel: 'Term',
//     sessionLabel: 'Batch Session',
    
//     // Exams & Assessment
//     examLabel: 'Test',
//     examsLabel: 'Tests',
//     testLabel: 'Practice Test',
//     assessmentLabel: 'Assessment',
//     gradeLabel: 'Score',
//     marksLabel: 'Marks',
//     resultLabel: 'Result',
//     resultsLabel: 'Test Results',
//     reportCard: 'Progress Card',
    
//     // Timetable
//     timetableLabel: 'Schedule',
//     scheduleLabel: 'Class Schedule',
//     periodLabel: 'Session',
    
//     // Syllabus
//     syllabusLabel: 'Course Outline',
//     curriculumLabel: 'Curriculum',
//     lessonPlan: 'Lecture Plan',
    
//     // Homework & Assignments
//     homeworkLabel: 'Daily Practice',
//     assignmentLabel: 'Practice Set',
//     assignmentsLabel: 'Practice Sets',
//     submissionLabel: 'Submission',
//     dueDateLabel: 'Due Date',
    
//     // Study Material
//     notesLabel: 'Study Material',
//     studyMaterial: 'Course Material',
//     resourcesLabel: 'Resources',
    
//     // Attendance
//     attendanceLabel: 'Attendance',
//     presentLabel: 'Present',
//     absentLabel: 'Absent',
//     lateLabel: 'Late',
//     leaveLabel: 'Leave',
    
//     // Fees & Finance
//     feeLabel: 'Fee',
//     feesLabel: 'Fees',
//     feeStructure: 'Fee Structure',
//     feeVoucher: 'Fee Voucher',
//     feeReceipt: 'Fee Receipt',
//     dueDate: 'Due Date',
//     fineLabel: 'Late Fine',
//     discountLabel: 'Scholarship',
    
//     // Communication
//     announcementLabel: 'Announcement',
//     noticeLabel: 'Notice',
//     circularLabel: 'Circular',
//     messageLabel: 'Message',
//     notificationLabel: 'Notification',
    
//     // Library
//     libraryLabel: 'Resource Center',
//     bookLabel: 'Book',
//     issueLabel: 'Issue',
//     returnLabel: 'Return',
//     fineLabel_library: 'Fine',
    
//     // Transport
//     transportLabel: 'Transport',
//     routeLabel: 'Route',
//     vehicleLabel: 'Vehicle',
//     stopLabel: 'Stop',
    
//     // Hostel
//     hostelLabel: 'Hostel',
//     roomLabel: 'Room',
//     messLabel: 'Mess',
    
//     // Events
//     eventLabel: 'Event',
//     holidayLabel: 'Holiday',
//     celebrationLabel: 'Celebration',
    
//     // Reports
//     reportLabel: 'Report',
//     analyticsLabel: 'Analytics',
//     progressReport: 'Progress Report',
    
//     // Navigation - Parent
//     nav: {
//       overview: 'Overview',
//       myChildren: 'My Children',
//       attendance: 'Attendance',
//       results: 'Test Results',
//       fees: 'Fees',
//       timetable: 'Schedule',
//       homework: 'Daily Practice',
//       assignments: 'Practice Sets',
//       studyMaterial: 'Study Material',
//       announcements: 'Announcements',
//       communication: 'Communication',
//       meetings: 'Parent Meetings',
//       library: 'Resource Center',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       feedback: 'Feedback',
//     },
    
//     // Navigation - Student
//     nav: {
//       overview: 'Overview',
//       myAttendance: 'My Attendance',
//       myResults: 'My Results',
//       myFees: 'My Fees',
//       myTimetable: 'My Schedule',
//       myClasses: 'My Batches',
//       homework: 'Daily Practice',
//       assignments: 'Practice Sets',
//       studyMaterial: 'Study Material',
//       syllabus: 'Course Outline',
//       exams: 'Tests',
//       announcements: 'Announcements',
//       library: 'Resource Center',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       achievements: 'Achievements',
//       clubs: 'Activities',
//       sports: 'Sports',
//     },
    
//     // Navigation - Teacher
//     nav: {
//       overview: 'Dashboard',
//       myClasses: 'My Batches',
//       myStudents: 'My Students',
//       myTimetable: 'My Schedule',
//       attendance: 'Mark Attendance',
//       selfAttendance: 'My Attendance',
//       homework: 'Create Practice',
//       assignments: 'Create Sets',
//       studyMaterial: 'Upload Material',
//       syllabus: 'Manage Course',
//       exams: 'Manage Tests',
//       examResults: 'Enter Results',
//       announcements: 'Post Announcements',
//       communication: 'Communicate',
//       meetings: 'Schedule Meetings',
//       reports: 'Reports',
//       library: 'Resource Center',
//       transport: 'Transport Info',
//       hostel: 'Hostel Info',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       leave: 'Leave Application',
//       training: 'Training',
//       achievements: 'Achievements',
//       gradebook: 'Gradebook',
//       lessonPlans: 'Lecture Plans',
//     },
    
//     // Common phrases (same as school)
//     common: {
//       viewAll: 'View All',
//       addNew: 'Add New',
//       edit: 'Edit',
//       delete: 'Delete',
//       download: 'Download',
//       upload: 'Upload',
//       search: 'Search',
//       filter: 'Filter',
//       export: 'Export',
//       import: 'Import',
//       print: 'Print',
//       share: 'Share',
//       save: 'Save',
//       cancel: 'Cancel',
//       confirm: 'Confirm',
//       back: 'Back',
//       next: 'Next',
//       previous: 'Previous',
//       loading: 'Loading...',
//       noData: 'No data found',
//       error: 'Error occurred',
//       success: 'Success',
//       warning: 'Warning',
//       info: 'Information',
//     },
    
//     // Status messages (same as school)
//     status: {
//       active: 'Active',
//       inactive: 'Inactive',
//       pending: 'Pending',
//       approved: 'Approved',
//       rejected: 'Rejected',
//       completed: 'Completed',
//       upcoming: 'Upcoming',
//       ongoing: 'Ongoing',
//       cancelled: 'Cancelled',
//     },
//   },

//   // ── ACADEMY ──────────────────────────────────────────────
//   academy: {
//     instituteType: 'academy',
//     instituteLabel: 'Academy',
    
//     // Academic terms
//     classLabel: 'Batch',
//     classesLabel: 'Batches',
//     batchLabel: 'Group',
//     batchesLabel: 'Groups',
//     subjectLabel: 'Course',
//     subjectsLabel: 'Courses',
//     subjectTeacher: 'Course Instructor',
//     classTeacher: 'Batch Coordinator',
    
//     // Student related
//     studentLabel: 'Trainee',
//     studentsLabel: 'Trainees',
//     rollLabel: 'Trainee ID',
//     enrollmentLabel: 'Registration No.',
//     admissionLabel: 'Enrollment',
//     admissionsLabel: 'Enrollments',
    
//     // Teacher related
//     teacherLabel: 'Trainer',
//     teachersLabel: 'Trainers',
//     instructorLabel: 'Trainer',
    
//     // Parent related
//     parentLabel: 'Parent',
//     parentsLabel: 'Parents',
//     guardianLabel: 'Guardian',
//     childrenLabel: 'Wards',
    
//     // Academic structure
//     academicYear: 'Training Year',
//     termLabel: 'Module',
//     semesterLabel: 'Module',
//     sessionLabel: 'Training Session',
    
//     // Exams & Assessment
//     examLabel: 'Assessment',
//     examsLabel: 'Assessments',
//     testLabel: 'Quiz',
//     assessmentLabel: 'Evaluation',
//     gradeLabel: 'Score',
//     marksLabel: 'Marks',
//     resultLabel: 'Result',
//     resultsLabel: 'Assessment Results',
//     reportCard: 'Performance Report',
    
//     // Timetable
//     timetableLabel: 'Schedule',
//     scheduleLabel: 'Training Schedule',
//     periodLabel: 'Session',
    
//     // Syllabus
//     syllabusLabel: 'Course Outline',
//     curriculumLabel: 'Curriculum',
//     lessonPlan: 'Module Plan',
    
//     // Homework & Assignments
//     homeworkLabel: 'Practice Tasks',
//     assignmentLabel: 'Assignment',
//     assignmentsLabel: 'Assignments',
//     submissionLabel: 'Submission',
//     dueDateLabel: 'Due Date',
    
//     // Study Material
//     notesLabel: 'Course Material',
//     studyMaterial: 'Training Material',
//     resourcesLabel: 'Resources',
    
//     // Attendance
//     attendanceLabel: 'Attendance',
//     presentLabel: 'Present',
//     absentLabel: 'Absent',
//     lateLabel: 'Late',
//     leaveLabel: 'Leave',
    
//     // Fees & Finance
//     feeLabel: 'Fee',
//     feesLabel: 'Fees',
//     feeStructure: 'Fee Structure',
//     feeVoucher: 'Fee Voucher',
//     feeReceipt: 'Fee Receipt',
//     dueDate: 'Due Date',
//     fineLabel: 'Late Fine',
//     discountLabel: 'Scholarship',
    
//     // Communication
//     announcementLabel: 'Announcement',
//     noticeLabel: 'Notice',
//     circularLabel: 'Circular',
//     messageLabel: 'Message',
//     notificationLabel: 'Notification',
    
//     // Library
//     libraryLabel: 'Resource Center',
//     bookLabel: 'Book',
//     issueLabel: 'Issue',
//     returnLabel: 'Return',
//     fineLabel_library: 'Fine',
    
//     // Transport
//     transportLabel: 'Transport',
//     routeLabel: 'Route',
//     vehicleLabel: 'Vehicle',
//     stopLabel: 'Stop',
    
//     // Hostel
//     hostelLabel: 'Hostel',
//     roomLabel: 'Room',
//     messLabel: 'Mess',
    
//     // Events
//     eventLabel: 'Event',
//     holidayLabel: 'Holiday',
//     celebrationLabel: 'Celebration',
    
//     // Reports
//     reportLabel: 'Report',
//     analyticsLabel: 'Analytics',
//     progressReport: 'Progress Report',
    
//     // Navigation - Parent
//     nav: {
//       overview: 'Overview',
//       myChildren: 'My Children',
//       attendance: 'Attendance',
//       results: 'Assessment Results',
//       fees: 'Fees',
//       timetable: 'Schedule',
//       homework: 'Practice Tasks',
//       assignments: 'Assignments',
//       studyMaterial: 'Training Material',
//       announcements: 'Announcements',
//       communication: 'Communication',
//       meetings: 'Parent Meetings',
//       library: 'Resource Center',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       feedback: 'Feedback',
//     },
    
//     // Navigation - Student
//     nav: {
//       overview: 'Overview',
//       myAttendance: 'My Attendance',
//       myResults: 'My Results',
//       myFees: 'My Fees',
//       myTimetable: 'My Schedule',
//       myClasses: 'My Batches',
//       homework: 'Practice Tasks',
//       assignments: 'Assignments',
//       studyMaterial: 'Training Material',
//       syllabus: 'Course Outline',
//       exams: 'Assessments',
//       announcements: 'Announcements',
//       library: 'Resource Center',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       achievements: 'Achievements',
//       clubs: 'Activities',
//       sports: 'Sports',
//     },
    
//     // Navigation - Teacher
//     nav: {
//       overview: 'Dashboard',
//       myClasses: 'My Batches',
//       myStudents: 'My Trainees',
//       myTimetable: 'My Schedule',
//       attendance: 'Mark Attendance',
//       selfAttendance: 'My Attendance',
//       homework: 'Create Tasks',
//       assignments: 'Create Assignments',
//       studyMaterial: 'Upload Material',
//       syllabus: 'Manage Course',
//       exams: 'Manage Assessments',
//       examResults: 'Enter Results',
//       announcements: 'Post Announcements',
//       communication: 'Communicate',
//       meetings: 'Schedule Meetings',
//       reports: 'Reports',
//       library: 'Resource Center',
//       transport: 'Transport Info',
//       hostel: 'Hostel Info',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       leave: 'Leave Application',
//       training: 'Training',
//       achievements: 'Achievements',
//       gradebook: 'Gradebook',
//       lessonPlans: 'Module Plans',
//     },
    
//     // Common phrases
//     common: { /* same as school */ },
//     status: { /* same as school */ },
//   },

//   // ── COLLEGE ──────────────────────────────────────────────
//   college: {
//     instituteType: 'college',
//     instituteLabel: 'College',
    
//     // Academic terms
//     classLabel: 'Class',
//     classesLabel: 'Classes',
//     batchLabel: 'Section',
//     batchesLabel: 'Sections',
//     subjectLabel: 'Subject',
//     subjectsLabel: 'Subjects',
//     subjectTeacher: 'Lecturer',
//     classTeacher: 'Class Advisor',
    
//     // Student related
//     studentLabel: 'Student',
//     studentsLabel: 'Students',
//     rollLabel: 'Roll No.',
//     enrollmentLabel: 'College ID',
//     admissionLabel: 'Admission',
//     admissionsLabel: 'Admissions',
    
//     // Teacher related
//     teacherLabel: 'Lecturer',
//     teachersLabel: 'Lecturers',
//     instructorLabel: 'Lecturer',
    
//     // Parent related
//     parentLabel: 'Parent',
//     parentsLabel: 'Parents',
//     guardianLabel: 'Guardian',
//     childrenLabel: 'Children',
    
//     // Academic structure
//     academicYear: 'Academic Year',
//     termLabel: 'Semester',
//     semesterLabel: 'Semester',
//     sessionLabel: 'Session',
    
//     // Exams & Assessment
//     examLabel: 'Exam',
//     examsLabel: 'Exams',
//     testLabel: 'Test',
//     assessmentLabel: 'Assessment',
//     gradeLabel: 'Grade',
//     marksLabel: 'Marks',
//     resultLabel: 'Result',
//     resultsLabel: 'Exam Results',
//     reportCard: 'Transcript',
    
//     // Timetable
//     timetableLabel: 'Timetable',
//     scheduleLabel: 'Class Schedule',
//     periodLabel: 'Period',
    
//     // Syllabus
//     syllabusLabel: 'Syllabus',
//     curriculumLabel: 'Curriculum',
//     lessonPlan: 'Lecture Plan',
    
//     // Homework & Assignments
//     homeworkLabel: 'Homework',
//     assignmentLabel: 'Assignment',
//     assignmentsLabel: 'Assignments',
//     submissionLabel: 'Submission',
//     dueDateLabel: 'Due Date',
    
//     // Study Material
//     notesLabel: 'Lecture Notes',
//     studyMaterial: 'Study Material',
//     resourcesLabel: 'Resources',
    
//     // Attendance
//     attendanceLabel: 'Attendance',
//     presentLabel: 'Present',
//     absentLabel: 'Absent',
//     lateLabel: 'Late',
//     leaveLabel: 'Leave',
    
//     // Fees & Finance
//     feeLabel: 'Fee',
//     feesLabel: 'Fees',
//     feeStructure: 'Fee Structure',
//     feeVoucher: 'Fee Voucher',
//     feeReceipt: 'Fee Receipt',
//     dueDate: 'Due Date',
//     fineLabel: 'Late Fine',
//     discountLabel: 'Scholarship',
    
//     // Communication
//     announcementLabel: 'Announcement',
//     noticeLabel: 'Notice',
//     circularLabel: 'Circular',
//     messageLabel: 'Message',
//     notificationLabel: 'Notification',
    
//     // Library
//     libraryLabel: 'Library',
//     bookLabel: 'Book',
//     issueLabel: 'Issue',
//     returnLabel: 'Return',
//     fineLabel_library: 'Fine',
    
//     // Transport
//     transportLabel: 'Transport',
//     routeLabel: 'Route',
//     vehicleLabel: 'Vehicle',
//     stopLabel: 'Stop',
    
//     // Hostel
//     hostelLabel: 'Hostel',
//     roomLabel: 'Room',
//     messLabel: 'Mess',
    
//     // Events
//     eventLabel: 'Event',
//     holidayLabel: 'Holiday',
//     celebrationLabel: 'Celebration',
    
//     // Reports
//     reportLabel: 'Report',
//     analyticsLabel: 'Analytics',
//     progressReport: 'Progress Report',
    
//     // Navigation - Parent
//     nav: { /* same as school but with college terms */ },
//     nav: {
//       overview: 'Overview',
//       myChildren: 'My Children',
//       attendance: 'Attendance',
//       results: 'Exam Results',
//       fees: 'Fees',
//       timetable: 'Timetable',
//       homework: 'Homework',
//       assignments: 'Assignments',
//       studyMaterial: 'Study Material',
//       announcements: 'Announcements',
//       communication: 'Communication',
//       meetings: 'Parent Meetings',
//       library: 'Library',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       feedback: 'Feedback',
//     },
    
//     // Navigation - Student
//     nav: {
//       overview: 'Overview',
//       myAttendance: 'My Attendance',
//       myResults: 'My Results',
//       myFees: 'My Fees',
//       myTimetable: 'My Timetable',
//       myClasses: 'My Classes',
//       homework: 'Homework',
//       assignments: 'Assignments',
//       studyMaterial: 'Study Material',
//       syllabus: 'Syllabus',
//       exams: 'Exams',
//       announcements: 'Announcements',
//       library: 'Library',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       achievements: 'Achievements',
//       clubs: 'Clubs & Societies',
//       sports: 'Sports',
//     },
    
//     // Navigation - Teacher
//     nav: {
//       overview: 'Dashboard',
//       myClasses: 'My Classes',
//       myStudents: 'My Students',
//       myTimetable: 'My Timetable',
//       attendance: 'Mark Attendance',
//       selfAttendance: 'My Attendance',
//       homework: 'Create Homework',
//       assignments: 'Create Assignments',
//       studyMaterial: 'Upload Notes',
//       syllabus: 'Manage Syllabus',
//       exams: 'Manage Exams',
//       examResults: 'Enter Results',
//       announcements: 'Post Announcements',
//       communication: 'Communicate',
//       meetings: 'Schedule Meetings',
//       reports: 'Reports',
//       library: 'Library',
//       transport: 'Transport Info',
//       hostel: 'Hostel Info',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       leave: 'Leave Application',
//       training: 'Training',
//       achievements: 'Achievements',
//       gradebook: 'Gradebook',
//       lessonPlans: 'Lesson Plans',
//     },
    
//     // Common phrases
//     common: { /* same as school */ },
//     status: { /* same as school */ },
//   },

//   // ── UNIVERSITY ───────────────────────────────────────────
//   university: {
//     instituteType: 'university',
//     instituteLabel: 'University',
    
//     // Academic terms
//     classLabel: 'Program',
//     classesLabel: 'Courses',
//     batchLabel: 'Section',
//     batchesLabel: 'Sections',
//     subjectLabel: 'Course',
//     subjectsLabel: 'Courses',
//     subjectTeacher: 'Professor',
//     classTeacher: 'Faculty Advisor',
    
//     // Student related
//     studentLabel: 'Student',
//     studentsLabel: 'Students',
//     rollLabel: 'Reg. No.',
//     enrollmentLabel: 'Enrollment ID',
//     admissionLabel: 'Admission',
//     admissionsLabel: 'Admissions',
    
//     // Teacher related
//     teacherLabel: 'Professor',
//     teachersLabel: 'Faculty',
//     instructorLabel: 'Professor',
    
//     // Parent related
//     parentLabel: 'Parent',
//     parentsLabel: 'Parents',
//     guardianLabel: 'Guardian',
//     childrenLabel: 'Children',
    
//     // Academic structure
//     academicYear: 'Academic Year',
//     termLabel: 'Semester',
//     semesterLabel: 'Semester',
//     sessionLabel: 'Session',
    
//     // Exams & Assessment
//     examLabel: 'Exam',
//     examsLabel: 'Exams',
//     testLabel: 'Test',
//     assessmentLabel: 'Assessment',
//     gradeLabel: 'GPA',
//     marksLabel: 'Marks',
//     resultLabel: 'Result',
//     resultsLabel: 'Academic Results',
//     reportCard: 'Transcript',
    
//     // Timetable
//     timetableLabel: 'Schedule',
//     scheduleLabel: 'Course Schedule',
//     periodLabel: 'Lecture',
    
//     // Syllabus
//     syllabusLabel: 'Course Outline',
//     curriculumLabel: 'Curriculum',
//     lessonPlan: 'Lecture Plan',
    
//     // Homework & Assignments
//     homeworkLabel: 'Tasks',
//     assignmentLabel: 'Assignment',
//     assignmentsLabel: 'Assignments',
//     submissionLabel: 'Submission',
//     dueDateLabel: 'Due Date',
    
//     // Study Material
//     notesLabel: 'Lecture Notes',
//     studyMaterial: 'Course Material',
//     resourcesLabel: 'Resources',
    
//     // Attendance
//     attendanceLabel: 'Attendance',
//     presentLabel: 'Present',
//     absentLabel: 'Absent',
//     lateLabel: 'Late',
//     leaveLabel: 'Leave',
    
//     // Fees & Finance
//     feeLabel: 'Tuition Fee',
//     feesLabel: 'Tuition Fees',
//     feeStructure: 'Fee Structure',
//     feeVoucher: 'Fee Voucher',
//     feeReceipt: 'Fee Receipt',
//     dueDate: 'Due Date',
//     fineLabel: 'Late Fine',
//     discountLabel: 'Scholarship',
    
//     // Communication
//     announcementLabel: 'Announcement',
//     noticeLabel: 'Notice',
//     circularLabel: 'Circular',
//     messageLabel: 'Message',
//     notificationLabel: 'Notification',
    
//     // Library
//     libraryLabel: 'Library',
//     bookLabel: 'Book',
//     issueLabel: 'Issue',
//     returnLabel: 'Return',
//     fineLabel_library: 'Fine',
    
//     // Transport
//     transportLabel: 'Transport',
//     routeLabel: 'Route',
//     vehicleLabel: 'Vehicle',
//     stopLabel: 'Stop',
    
//     // Hostel
//     hostelLabel: 'Hostel',
//     roomLabel: 'Room',
//     messLabel: 'Mess',
    
//     // Events
//     eventLabel: 'Event',
//     holidayLabel: 'Holiday',
//     celebrationLabel: 'Celebration',
    
//     // Reports
//     reportLabel: 'Report',
//     analyticsLabel: 'Analytics',
//     progressReport: 'Progress Report',
    
//     // Research
//     researchLabel: 'Research',
//     thesisLabel: 'Thesis',
//     publicationLabel: 'Publication',
    
//     // Navigation - Parent
//     nav: {
//       overview: 'Overview',
//       myChildren: 'My Children',
//       attendance: 'Attendance',
//       results: 'Academic Results',
//       fees: 'Tuition Fees',
//       timetable: 'Schedule',
//       homework: 'Tasks',
//       assignments: 'Assignments',
//       studyMaterial: 'Course Material',
//       announcements: 'Announcements',
//       communication: 'Communication',
//       meetings: 'Faculty Meetings',
//       library: 'Library',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       feedback: 'Feedback',
//     },
    
//     // Navigation - Student
//     nav: {
//       overview: 'Dashboard',
//       myAttendance: 'My Attendance',
//       myResults: 'My Results',
//       myFees: 'My Fees',
//       myTimetable: 'My Schedule',
//       myClasses: 'My Courses',
//       homework: 'Tasks',
//       assignments: 'Assignments',
//       studyMaterial: 'Course Material',
//       syllabus: 'Course Outline',
//       exams: 'Exams',
//       announcements: 'Announcements',
//       library: 'Library',
//       transport: 'Transport',
//       hostel: 'Hostel',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       achievements: 'Achievements',
//       clubs: 'Societies',
//       sports: 'Sports',
//       research: 'Research',
//       thesis: 'Thesis',
//     },
    
//     // Navigation - Teacher
//     nav: {
//       overview: 'Dashboard',
//       myClasses: 'My Courses',
//       myStudents: 'My Students',
//       myTimetable: 'My Schedule',
//       attendance: 'Mark Attendance',
//       selfAttendance: 'My Attendance',
//       homework: 'Create Tasks',
//       assignments: 'Create Assignments',
//       studyMaterial: 'Upload Material',
//       syllabus: 'Manage Course',
//       exams: 'Manage Exams',
//       examResults: 'Enter Results',
//       announcements: 'Post Announcements',
//       communication: 'Communicate',
//       meetings: 'Schedule Meetings',
//       reports: 'Reports',
//       research: 'Research',
//       publications: 'Publications',
//       library: 'Library',
//       transport: 'Transport Info',
//       hostel: 'Hostel Info',
//       calendar: 'Calendar',
//       profile: 'Profile',
//       leave: 'Leave Application',
//       training: 'Training',
//       achievements: 'Achievements',
//       gradebook: 'Gradebook',
//       lessonPlans: 'Lecture Plans',
//     },
    
//     // Common phrases
//     common: { /* same as school */ },
//     status: { /* same as school */ },
//   },
// };

// // Default config fallback
// CONFIG.default = CONFIG.school;

// /**
//  * Returns the terminology config for a given institute type and user type.
//  * Falls back to 'school' if no match found.
//  * 
//  * @param {string} instituteType - 'school' | 'coaching' | 'academy' | 'college' | 'university'
//  * @param {string} userType - 'STUDENT' | 'PARENT' | 'TEACHER' (optional, for role-specific terms)
//  */
// export function getPortalTerms(instituteType, userType = null) {
//   const baseConfig = CONFIG[instituteType] || CONFIG.school;
  
//   // If userType is provided, we could return role-specific overrides here
//   // For now, return the base config
  
//   return baseConfig;
// }

// /**
//  * Get institute-specific label for a generic term
//  * @param {string} instituteType 
//  * @param {string} term - e.g., 'class', 'teacher', 'exam'
//  */
// export function getTerm(instituteType, term) {
//   const config = CONFIG[instituteType] || CONFIG.school;
//   return config[term] || config[`${term}Label`] || term;
// }

// /**
//  * Get navigation items for specific user type and institute
//  */
// export function getNavItems(instituteType, userType) {
//   const config = CONFIG[instituteType] || CONFIG.school;
//   const nav = config.nav || {};
//   const role = String(userType || '').toUpperCase();

//   if (role === 'PARENT') {
//     return {
//       overview: nav.overview || config.overviewLabel || 'Overview',
//       myChildren: nav.myChildren || config.childrenLabel || 'My Children',
//       attendance: nav.attendance || config.attendanceLabel || 'Attendance',
//       results: nav.results || config.resultsLabel || 'Results',
//       fees: nav.fees || config.feesLabel || 'Fees',
//       announcements: nav.announcements || config.announcementsLabel || 'Announcements'
//     };
//   }

//   if (role === 'STUDENT') {
//     return {
//       overview: nav.overview || config.overviewLabel || 'Overview',
//       myAttendance: nav.myAttendance || config.attendanceLabel || 'Attendance',
//       exams: nav.exams || config.examsLabel || 'Exams',
//       myTimetable: nav.myTimetable || config.timetableLabel || 'Timetable',
//       syllabus: nav.syllabus || config.syllabusLabel || 'Syllabus',
//       assignments: nav.assignments || config.assignmentsLabel || 'Assignments',
//       homework: nav.homework || config.homeworkLabel || 'Homework',
//       notes: nav.notes || nav.studyMaterial || config.notesLabel || 'Notes',
//       myFees: nav.myFees || config.feesLabel || 'Fees',
//       announcements: nav.announcements || config.announcementsLabel || 'Announcements'
//     };
//   }

//   if (role === 'TEACHER') {
//     return {
//       overview: nav.overview || config.overviewLabel || 'Dashboard',
//       myClasses: nav.myClasses || config.classesLabel || 'My Classes',
//       myStudents: nav.myStudents || config.studentsLabel || 'My Students',
//       myTimetable: nav.myTimetable || config.timetableLabel || 'My Timetable',
//       attendance: nav.attendance || config.attendanceLabel || 'Attendance',
//       homework: nav.homework || config.homeworkLabel || 'Homework',
//       assignments: nav.assignments || config.assignmentsLabel || 'Assignments',
//       notes: nav.notes || config.notesLabel || 'Notes',
//       announcements: nav.announcements || config.announcementsLabel || 'Announcements'
//     };
//   }

//   return nav;
// }


// export default CONFIG;





// src/constants/portalInstituteConfig.js
/**
 * portalInstituteConfig.js
 *
 * Complete per-institute-type terminology map for all three portals
 * (Student, Parent, Teacher).
 *
 * Includes all possible terms needed across the entire application.
 *
 * Usage:
 *   import { getPortalTerms } from '@/constants/portalInstituteConfig';
 *   const t = getPortalTerms(instituteType, userType);
 */

const CONFIG = {
  // ── SCHOOL ───────────────────────────────────────────────
  school: {
    // Institute identifiers
    instituteType: 'school',
    instituteLabel: 'School',
    
    // Academic terms
    classLabel: 'Class',
    classesLabel: 'Classes',
    batchLabel: 'Section',
    batchesLabel: 'Sections',
    subjectLabel: 'Subject',
    subjectsLabel: 'Subjects',
    subjectTeacher: 'Subject Teacher',
    classTeacher: 'Class Teacher',
    
    // Student related
    studentLabel: 'Student',
    studentsLabel: 'Students',
    rollLabel: 'Roll No.',
    enrollmentLabel: 'Enrollment No.',
    admissionLabel: 'Admission',
    admissionsLabel: 'Admissions',
    
    // Teacher related
    teacherLabel: 'Teacher',
    teachersLabel: 'Teachers',
    instructorLabel: 'Teacher',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Children',
    
    // Academic structure
    academicYear: 'Academic Year',
    termLabel: 'Term',
    semesterLabel: 'Term',
    sessionLabel: 'Session',
    
    // Exams & Assessment
    examLabel: 'Exam',
    examsLabel: 'Exams',
    testLabel: 'Test',
    assessmentLabel: 'Assessment',
    gradeLabel: 'Grade',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Exam Results',
    reportCard: 'Report Card',
    
    // Timetable
    timetableLabel: 'Timetable',
    scheduleLabel: 'Schedule',
    periodLabel: 'Period',
    
    // Syllabus
    syllabusLabel: 'Syllabus',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Lesson Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Homework',
    assignmentLabel: 'Assignment',
    assignmentsLabel: 'Assignments',
    submissionLabel: 'Submission',
    submissionsLabel: 'Submissions',
    dueDateLabel: 'Due Date',
    lateSubmissionLabel: 'Late Submission',
    resubmissionLabel: 'Resubmission',
    assignmentDescription: 'Assignment Description',
    assignmentInstructions: 'Instructions',
    assignmentMaterials: 'Materials',
    assignmentAttachments: 'Attachments',
    assignmentGrading: 'Grading',
    assignmentSettings: 'Settings',
    assignmentDifficulty: 'Difficulty Level',
    assignmentEstimatedTime: 'Estimated Time',
    assignmentMaxFiles: 'Maximum Files',
    assignmentMaxFileSize: 'Maximum File Size',
    assignmentAllowLate: 'Allow Late Submissions',
    assignmentLatePenalty: 'Late Submission Penalty',
    assignmentPublishNow: 'Publish Immediately',
    assignmentSaveDraft: 'Save as Draft',
    assignmentGradeNow: 'Grade Now',
    assignmentFeedback: 'Feedback',
    assignmentRemarks: 'Remarks',
    assignmentPassingMarks: 'Passing Marks',
    assignmentTotalMarks: 'Total Marks',
    assignmentGradingType: 'Grading Type',
    assignmentMarksOnly: 'Marks Only',
    assignmentGrades: 'Grades (A-F)',
    assignmentPassFail: 'Pass/Fail',
    assignmentBeginner: 'Beginner',
    assignmentIntermediate: 'Intermediate',
    assignmentAdvanced: 'Advanced',
    assignmentExpert: 'Expert',
    assignmentSubmissionText: 'Submission Text',
    assignmentSubmissionFiles: 'Submission Files',
    assignmentSubmissionHistory: 'Submission History',
    assignmentAttemptNumber: 'Attempt',
    assignmentResubmissionCount: 'Resubmission Count',
    assignmentPlagiarismCheck: 'Plagiarism Check',
    assignmentPeerReview: 'Peer Review',
    assignmentRubric: 'Grading Rubric',
    
    // Assignment Status
    assignmentStatusDraft: 'Draft',
    assignmentStatusPublished: 'Published',
    assignmentStatusPending: 'Pending',
    assignmentStatusSubmitted: 'Submitted',
    assignmentStatusGraded: 'Graded',
    assignmentStatusLate: 'Late',
    assignmentStatusOverdue: 'Overdue',
    assignmentStatusArchived: 'Archived',
    
    // Study Material
    notesLabel: 'Notes',
    studyMaterial: 'Study Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Fee',
    feesLabel: 'Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship/Discount',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Library',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Assignment-specific messages
    assignmentMessages: {
      createSuccess: 'Assignment created successfully!',
      updateSuccess: 'Assignment updated successfully!',
      deleteSuccess: 'Assignment deleted successfully!',
      submitSuccess: 'Assignment submitted successfully!',
      gradeSuccess: 'Submission graded successfully!',
      noFiles: 'No files attached',
      noSubmissions: 'No submissions yet',
      submissionDeadlinePassed: 'Submission deadline has passed',
      lateSubmissionAccepted: 'Late submissions are accepted with penalty',
      maxFilesExceeded: 'Maximum number of files exceeded',
      fileSizeExceeded: 'File size exceeds maximum limit',
      invalidFileType: 'Invalid file type',
      confirmDelete: 'Are you sure you want to delete this assignment?',
      confirmDeleteSubmission: 'Are you sure you want to delete this submission?',
      confirmGrade: 'Are you sure you want to grade this submission?',
      pendingGrading: 'Pending Grading',
      gradingInProgress: 'Grading in Progress',
      gradingCompleted: 'Grading Completed',
      resubmissionAllowed: 'Resubmission allowed',
      resubmissionDeadline: 'Resubmission Deadline',
      plagiarismScore: 'Plagiarism Score',
      peerReviewScore: 'Peer Review Score',
    },
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Exam Results',
      fees: 'Fees',
      timetable: 'Timetable',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Study Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Parent-Teacher Meetings',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Overview',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Timetable',
      myClasses: 'My Classes',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Study Material',
      syllabus: 'Syllabus',
      exams: 'Exams',
      announcements: 'Announcements',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Clubs & Societies',
      sports: 'Sports',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Classes',
      myStudents: 'My Students',
      myTimetable: 'My Timetable',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Upload Material',
      notes: 'Notes',
      syllabus: 'Syllabus',
      exams: 'Manage Exams',
      examResults: 'Enter Results',
      announcements: 'Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      library: 'Library Access',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Lesson Plans',
    },
    
    // Common phrases
    common: {
      viewAll: 'View All',
      addNew: 'Add New',
      edit: 'Edit',
      delete: 'Delete',
      download: 'Download',
      upload: 'Upload',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      print: 'Print',
      share: 'Share',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      loading: 'Loading...',
      noData: 'No data found',
      error: 'Error occurred',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
    },
    
    // Status messages
    status: {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      cancelled: 'Cancelled',
    },
  },

  // ── COACHING CENTER ───────────────────────────────────────
  coaching: {
    instituteType: 'coaching',
    instituteLabel: 'Coaching Center',
    
    // Academic terms
    classLabel: 'Batch',
    classesLabel: 'Batches',
    batchLabel: 'Group',
    batchesLabel: 'Groups',
    subjectLabel: 'Course',
    subjectsLabel: 'Courses',
    subjectTeacher: 'Course Instructor',
    classTeacher: 'Batch Mentor',
    
    // Student related
    studentLabel: 'Student',
    studentsLabel: 'Students',
    rollLabel: 'Reg. No.',
    enrollmentLabel: 'Registration No.',
    admissionLabel: 'Enrollment',
    admissionsLabel: 'Enrollments',
    
    // Teacher related
    teacherLabel: 'Instructor',
    teachersLabel: 'Instructors',
    instructorLabel: 'Instructor',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Wards',
    
    // Academic structure
    academicYear: 'Session',
    termLabel: 'Term',
    semesterLabel: 'Term',
    sessionLabel: 'Batch Session',
    
    // Exams & Assessment
    examLabel: 'Test',
    examsLabel: 'Tests',
    testLabel: 'Practice Test',
    assessmentLabel: 'Assessment',
    gradeLabel: 'Score',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Test Results',
    reportCard: 'Progress Card',
    
    // Timetable
    timetableLabel: 'Schedule',
    scheduleLabel: 'Class Schedule',
    periodLabel: 'Session',
    
    // Syllabus
    syllabusLabel: 'Course Outline',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Lecture Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Daily Practice',
    assignmentLabel: 'Practice Set',
    assignmentsLabel: 'Practice Sets',
    submissionLabel: 'Submission',
    submissionsLabel: 'Submissions',
    dueDateLabel: 'Due Date',
    lateSubmissionLabel: 'Late Submission',
    resubmissionLabel: 'Resubmission',
    assignmentDescription: 'Practice Set Description',
    assignmentInstructions: 'Instructions',
    assignmentMaterials: 'Materials',
    assignmentAttachments: 'Attachments',
    assignmentGrading: 'Grading',
    assignmentSettings: 'Settings',
    assignmentDifficulty: 'Difficulty Level',
    assignmentEstimatedTime: 'Estimated Time',
    assignmentMaxFiles: 'Maximum Files',
    assignmentMaxFileSize: 'Maximum File Size',
    assignmentAllowLate: 'Allow Late Submissions',
    assignmentLatePenalty: 'Late Submission Penalty',
    assignmentPublishNow: 'Publish Immediately',
    assignmentSaveDraft: 'Save as Draft',
    assignmentGradeNow: 'Grade Now',
    assignmentFeedback: 'Feedback',
    assignmentRemarks: 'Remarks',
    assignmentPassingMarks: 'Passing Marks',
    assignmentTotalMarks: 'Total Marks',
    assignmentGradingType: 'Grading Type',
    assignmentMarksOnly: 'Marks Only',
    assignmentGrades: 'Grades (A-F)',
    assignmentPassFail: 'Pass/Fail',
    assignmentBeginner: 'Beginner',
    assignmentIntermediate: 'Intermediate',
    assignmentAdvanced: 'Advanced',
    assignmentExpert: 'Expert',
    assignmentSubmissionText: 'Submission Text',
    assignmentSubmissionFiles: 'Submission Files',
    assignmentSubmissionHistory: 'Submission History',
    assignmentAttemptNumber: 'Attempt',
    assignmentResubmissionCount: 'Resubmission Count',
    
    // Assignment Status
    assignmentStatusDraft: 'Draft',
    assignmentStatusPublished: 'Published',
    assignmentStatusPending: 'Pending',
    assignmentStatusSubmitted: 'Submitted',
    assignmentStatusGraded: 'Graded',
    assignmentStatusLate: 'Late',
    assignmentStatusOverdue: 'Overdue',
    assignmentStatusArchived: 'Archived',
    
    // Assignment-specific messages
    assignmentMessages: {
      createSuccess: 'Practice set created successfully!',
      updateSuccess: 'Practice set updated successfully!',
      deleteSuccess: 'Practice set deleted successfully!',
      submitSuccess: 'Practice set submitted successfully!',
      gradeSuccess: 'Submission graded successfully!',
      noFiles: 'No files attached',
      noSubmissions: 'No submissions yet',
      submissionDeadlinePassed: 'Submission deadline has passed',
      lateSubmissionAccepted: 'Late submissions are accepted with penalty',
      maxFilesExceeded: 'Maximum number of files exceeded',
      fileSizeExceeded: 'File size exceeds maximum limit',
      invalidFileType: 'Invalid file type',
      confirmDelete: 'Are you sure you want to delete this practice set?',
      confirmDeleteSubmission: 'Are you sure you want to delete this submission?',
      confirmGrade: 'Are you sure you want to grade this submission?',
      pendingGrading: 'Pending Grading',
      gradingInProgress: 'Grading in Progress',
      gradingCompleted: 'Grading Completed',
      resubmissionAllowed: 'Resubmission allowed',
      resubmissionDeadline: 'Resubmission Deadline',
    },
    
    // Study Material
    notesLabel: 'Study Material',
    studyMaterial: 'Course Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Fee',
    feesLabel: 'Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Resource Center',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Test Results',
      fees: 'Fees',
      timetable: 'Schedule',
      homework: 'Daily Practice',
      assignments: 'Practice Sets',
      studyMaterial: 'Study Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Parent Meetings',
      library: 'Resource Center',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Overview',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Schedule',
      myClasses: 'My Batches',
      homework: 'Daily Practice',
      assignments: 'Practice Sets',
      studyMaterial: 'Study Material',
      syllabus: 'Course Outline',
      exams: 'Tests',
      announcements: 'Announcements',
      library: 'Resource Center',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Activities',
      sports: 'Sports',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Batches',
      myStudents: 'My Students',
      myTimetable: 'My Schedule',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Practice',
      assignments: 'Create Sets',
      studyMaterial: 'Upload Material',
      syllabus: 'Manage Course',
      exams: 'Manage Tests',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      library: 'Resource Center',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Lecture Plans',
    },
    
    // Common phrases (inherited after CONFIG initialization)
    common: {},
    status: {},
  },

  // ── ACADEMY ──────────────────────────────────────────────
  academy: {
    instituteType: 'academy',
    instituteLabel: 'Academy',
    
    // Academic terms
    classLabel: 'Batch',
    classesLabel: 'Batches',
    batchLabel: 'Group',
    batchesLabel: 'Groups',
    subjectLabel: 'Course',
    subjectsLabel: 'Courses',
    subjectTeacher: 'Course Instructor',
    classTeacher: 'Batch Coordinator',
    
    // Student related
    studentLabel: 'Trainee',
    studentsLabel: 'Trainees',
    rollLabel: 'Trainee ID',
    enrollmentLabel: 'Registration No.',
    admissionLabel: 'Enrollment',
    admissionsLabel: 'Enrollments',
    
    // Teacher related
    teacherLabel: 'Trainer',
    teachersLabel: 'Trainers',
    instructorLabel: 'Trainer',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Wards',
    
    // Academic structure
    academicYear: 'Training Year',
    termLabel: 'Module',
    semesterLabel: 'Module',
    sessionLabel: 'Training Session',
    
    // Exams & Assessment
    examLabel: 'Assessment',
    examsLabel: 'Assessments',
    testLabel: 'Quiz',
    assessmentLabel: 'Evaluation',
    gradeLabel: 'Score',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Assessment Results',
    reportCard: 'Performance Report',
    
    // Timetable
    timetableLabel: 'Schedule',
    scheduleLabel: 'Training Schedule',
    periodLabel: 'Session',
    
    // Syllabus
    syllabusLabel: 'Course Outline',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Module Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Practice Tasks',
    assignmentLabel: 'Assignment',
    assignmentsLabel: 'Assignments',
    submissionLabel: 'Submission',
    submissionsLabel: 'Submissions',
    dueDateLabel: 'Due Date',
    lateSubmissionLabel: 'Late Submission',
    resubmissionLabel: 'Resubmission',
    assignmentDescription: 'Assignment Description',
    assignmentInstructions: 'Instructions',
    assignmentMaterials: 'Materials',
    assignmentAttachments: 'Attachments',
    assignmentGrading: 'Grading',
    assignmentSettings: 'Settings',
    assignmentDifficulty: 'Difficulty Level',
    assignmentEstimatedTime: 'Estimated Time',
    assignmentMaxFiles: 'Maximum Files',
    assignmentMaxFileSize: 'Maximum File Size',
    assignmentAllowLate: 'Allow Late Submissions',
    assignmentLatePenalty: 'Late Submission Penalty',
    assignmentPublishNow: 'Publish Immediately',
    assignmentSaveDraft: 'Save as Draft',
    assignmentGradeNow: 'Grade Now',
    assignmentFeedback: 'Feedback',
    assignmentRemarks: 'Remarks',
    assignmentPassingMarks: 'Passing Marks',
    assignmentTotalMarks: 'Total Marks',
    assignmentGradingType: 'Grading Type',
    assignmentMarksOnly: 'Marks Only',
    assignmentGrades: 'Grades (A-F)',
    assignmentPassFail: 'Pass/Fail',
    assignmentBeginner: 'Beginner',
    assignmentIntermediate: 'Intermediate',
    assignmentAdvanced: 'Advanced',
    assignmentExpert: 'Expert',
    assignmentSubmissionText: 'Submission Text',
    assignmentSubmissionFiles: 'Submission Files',
    assignmentSubmissionHistory: 'Submission History',
    assignmentAttemptNumber: 'Attempt',
    assignmentResubmissionCount: 'Resubmission Count',
    
    // Assignment Status
    assignmentStatusDraft: 'Draft',
    assignmentStatusPublished: 'Published',
    assignmentStatusPending: 'Pending',
    assignmentStatusSubmitted: 'Submitted',
    assignmentStatusGraded: 'Graded',
    assignmentStatusLate: 'Late',
    assignmentStatusOverdue: 'Overdue',
    assignmentStatusArchived: 'Archived',
    
    // Assignment-specific messages
    assignmentMessages: {
      createSuccess: 'Assignment created successfully!',
      updateSuccess: 'Assignment updated successfully!',
      deleteSuccess: 'Assignment deleted successfully!',
      submitSuccess: 'Assignment submitted successfully!',
      gradeSuccess: 'Submission graded successfully!',
      noFiles: 'No files attached',
      noSubmissions: 'No submissions yet',
      submissionDeadlinePassed: 'Submission deadline has passed',
      lateSubmissionAccepted: 'Late submissions are accepted with penalty',
      maxFilesExceeded: 'Maximum number of files exceeded',
      fileSizeExceeded: 'File size exceeds maximum limit',
      invalidFileType: 'Invalid file type',
      confirmDelete: 'Are you sure you want to delete this assignment?',
      confirmDeleteSubmission: 'Are you sure you want to delete this submission?',
      confirmGrade: 'Are you sure you want to grade this submission?',
      pendingGrading: 'Pending Grading',
      gradingInProgress: 'Grading in Progress',
      gradingCompleted: 'Grading Completed',
      resubmissionAllowed: 'Resubmission allowed',
      resubmissionDeadline: 'Resubmission Deadline',
    },
    
    // Study Material
    notesLabel: 'Course Material',
    studyMaterial: 'Training Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Fee',
    feesLabel: 'Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Resource Center',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Assessment Results',
      fees: 'Fees',
      timetable: 'Schedule',
      homework: 'Practice Tasks',
      assignments: 'Assignments',
      studyMaterial: 'Training Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Parent Meetings',
      library: 'Resource Center',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Overview',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Schedule',
      myClasses: 'My Batches',
      homework: 'Practice Tasks',
      assignments: 'Assignments',
      studyMaterial: 'Training Material',
      syllabus: 'Course Outline',
      exams: 'Assessments',
      announcements: 'Announcements',
      library: 'Resource Center',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Activities',
      sports: 'Sports',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Batches',
      myStudents: 'My Trainees',
      myTimetable: 'My Schedule',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Tasks',
      assignments: 'Create Assignments',
      studyMaterial: 'Upload Material',
      syllabus: 'Manage Course',
      exams: 'Manage Assessments',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      library: 'Resource Center',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Module Plans',
    },
    
    // Common phrases (inherited after CONFIG initialization)
    common: {},
    status: {},
  },

  // ── COLLEGE ──────────────────────────────────────────────
  college: {
    instituteType: 'college',
    instituteLabel: 'College',
    
    // Academic terms
    classLabel: 'Class',
    classesLabel: 'Classes',
    batchLabel: 'Section',
    batchesLabel: 'Sections',
    subjectLabel: 'Subject',
    subjectsLabel: 'Subjects',
    subjectTeacher: 'Lecturer',
    classTeacher: 'Class Advisor',
    
    // Student related
    studentLabel: 'Student',
    studentsLabel: 'Students',
    rollLabel: 'Roll No.',
    enrollmentLabel: 'College ID',
    admissionLabel: 'Admission',
    admissionsLabel: 'Admissions',
    
    // Teacher related
    teacherLabel: 'Lecturer',
    teachersLabel: 'Lecturers',
    instructorLabel: 'Lecturer',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Children',
    
    // Academic structure
    academicYear: 'Academic Year',
    termLabel: 'Semester',
    semesterLabel: 'Semester',
    sessionLabel: 'Session',
    
    // Exams & Assessment
    examLabel: 'Exam',
    examsLabel: 'Exams',
    testLabel: 'Test',
    assessmentLabel: 'Assessment',
    gradeLabel: 'Grade',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Exam Results',
    reportCard: 'Transcript',
    
    // Timetable
    timetableLabel: 'Timetable',
    scheduleLabel: 'Class Schedule',
    periodLabel: 'Period',
    
    // Syllabus
    syllabusLabel: 'Syllabus',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Lecture Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Homework',
    assignmentLabel: 'Assignment',
    assignmentsLabel: 'Assignments',
    submissionLabel: 'Submission',
    submissionsLabel: 'Submissions',
    dueDateLabel: 'Due Date',
    lateSubmissionLabel: 'Late Submission',
    resubmissionLabel: 'Resubmission',
    assignmentDescription: 'Assignment Description',
    assignmentInstructions: 'Instructions',
    assignmentMaterials: 'Materials',
    assignmentAttachments: 'Attachments',
    assignmentGrading: 'Grading',
    assignmentSettings: 'Settings',
    assignmentDifficulty: 'Difficulty Level',
    assignmentEstimatedTime: 'Estimated Time',
    assignmentMaxFiles: 'Maximum Files',
    assignmentMaxFileSize: 'Maximum File Size',
    assignmentAllowLate: 'Allow Late Submissions',
    assignmentLatePenalty: 'Late Submission Penalty',
    assignmentPublishNow: 'Publish Immediately',
    assignmentSaveDraft: 'Save as Draft',
    assignmentGradeNow: 'Grade Now',
    assignmentFeedback: 'Feedback',
    assignmentRemarks: 'Remarks',
    assignmentPassingMarks: 'Passing Marks',
    assignmentTotalMarks: 'Total Marks',
    assignmentGradingType: 'Grading Type',
    assignmentMarksOnly: 'Marks Only',
    assignmentGrades: 'Grades (A-F)',
    assignmentPassFail: 'Pass/Fail',
    assignmentBeginner: 'Beginner',
    assignmentIntermediate: 'Intermediate',
    assignmentAdvanced: 'Advanced',
    assignmentExpert: 'Expert',
    assignmentSubmissionText: 'Submission Text',
    assignmentSubmissionFiles: 'Submission Files',
    assignmentSubmissionHistory: 'Submission History',
    assignmentAttemptNumber: 'Attempt',
    assignmentResubmissionCount: 'Resubmission Count',
    
    // Assignment Status
    assignmentStatusDraft: 'Draft',
    assignmentStatusPublished: 'Published',
    assignmentStatusPending: 'Pending',
    assignmentStatusSubmitted: 'Submitted',
    assignmentStatusGraded: 'Graded',
    assignmentStatusLate: 'Late',
    assignmentStatusOverdue: 'Overdue',
    assignmentStatusArchived: 'Archived',
    
    // Assignment-specific messages
    assignmentMessages: {
      createSuccess: 'Assignment created successfully!',
      updateSuccess: 'Assignment updated successfully!',
      deleteSuccess: 'Assignment deleted successfully!',
      submitSuccess: 'Assignment submitted successfully!',
      gradeSuccess: 'Submission graded successfully!',
      noFiles: 'No files attached',
      noSubmissions: 'No submissions yet',
      submissionDeadlinePassed: 'Submission deadline has passed',
      lateSubmissionAccepted: 'Late submissions are accepted with penalty',
      maxFilesExceeded: 'Maximum number of files exceeded',
      fileSizeExceeded: 'File size exceeds maximum limit',
      invalidFileType: 'Invalid file type',
      confirmDelete: 'Are you sure you want to delete this assignment?',
      confirmDeleteSubmission: 'Are you sure you want to delete this submission?',
      confirmGrade: 'Are you sure you want to grade this submission?',
      pendingGrading: 'Pending Grading',
      gradingInProgress: 'Grading in Progress',
      gradingCompleted: 'Grading Completed',
      resubmissionAllowed: 'Resubmission allowed',
      resubmissionDeadline: 'Resubmission Deadline',
    },
    
    // Study Material
    notesLabel: 'Lecture Notes',
    studyMaterial: 'Study Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Fee',
    feesLabel: 'Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Library',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Exam Results',
      fees: 'Fees',
      timetable: 'Timetable',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Study Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Parent Meetings',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Overview',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Timetable',
      myClasses: 'My Classes',
      homework: 'Homework',
      assignments: 'Assignments',
      studyMaterial: 'Study Material',
      syllabus: 'Syllabus',
      exams: 'Exams',
      announcements: 'Announcements',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Clubs & Societies',
      sports: 'Sports',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Classes',
      myStudents: 'My Students',
      myTimetable: 'My Timetable',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Homework',
      assignments: 'Create Assignments',
      studyMaterial: 'Upload Notes',
      syllabus: 'Manage Syllabus',
      exams: 'Manage Exams',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      library: 'Library',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Lesson Plans',
    },
    
    // Common phrases (inherited after CONFIG initialization)
    common: {},
    status: {},
  },

  // ── UNIVERSITY ───────────────────────────────────────────
  university: {
    instituteType: 'university',
    instituteLabel: 'University',
    
    // Academic terms
    classLabel: 'Program',
    classesLabel: 'Courses',
    batchLabel: 'Section',
    batchesLabel: 'Sections',
    subjectLabel: 'Course',
    subjectsLabel: 'Courses',
    subjectTeacher: 'Professor',
    classTeacher: 'Faculty Advisor',
    
    // Student related
    studentLabel: 'Student',
    studentsLabel: 'Students',
    rollLabel: 'Reg. No.',
    enrollmentLabel: 'Enrollment ID',
    admissionLabel: 'Admission',
    admissionsLabel: 'Admissions',
    
    // Teacher related
    teacherLabel: 'Professor',
    teachersLabel: 'Faculty',
    instructorLabel: 'Professor',
    
    // Parent related
    parentLabel: 'Parent',
    parentsLabel: 'Parents',
    guardianLabel: 'Guardian',
    childrenLabel: 'Children',
    
    // Academic structure
    academicYear: 'Academic Year',
    termLabel: 'Semester',
    semesterLabel: 'Semester',
    sessionLabel: 'Session',
    
    // Exams & Assessment
    examLabel: 'Exam',
    examsLabel: 'Exams',
    testLabel: 'Test',
    assessmentLabel: 'Assessment',
    gradeLabel: 'GPA',
    marksLabel: 'Marks',
    resultLabel: 'Result',
    resultsLabel: 'Academic Results',
    reportCard: 'Transcript',
    
    // Timetable
    timetableLabel: 'Schedule',
    scheduleLabel: 'Course Schedule',
    periodLabel: 'Lecture',
    
    // Syllabus
    syllabusLabel: 'Course Outline',
    curriculumLabel: 'Curriculum',
    lessonPlan: 'Lecture Plan',
    
    // Homework & Assignments
    homeworkLabel: 'Tasks',
    assignmentLabel: 'Assignment',
    assignmentsLabel: 'Assignments',
    submissionLabel: 'Submission',
    submissionsLabel: 'Submissions',
    dueDateLabel: 'Due Date',
    lateSubmissionLabel: 'Late Submission',
    resubmissionLabel: 'Resubmission',
    assignmentDescription: 'Assignment Description',
    assignmentInstructions: 'Instructions',
    assignmentMaterials: 'Materials',
    assignmentAttachments: 'Attachments',
    assignmentGrading: 'Grading',
    assignmentSettings: 'Settings',
    assignmentDifficulty: 'Difficulty Level',
    assignmentEstimatedTime: 'Estimated Time',
    assignmentMaxFiles: 'Maximum Files',
    assignmentMaxFileSize: 'Maximum File Size',
    assignmentAllowLate: 'Allow Late Submissions',
    assignmentLatePenalty: 'Late Submission Penalty',
    assignmentPublishNow: 'Publish Immediately',
    assignmentSaveDraft: 'Save as Draft',
    assignmentGradeNow: 'Grade Now',
    assignmentFeedback: 'Feedback',
    assignmentRemarks: 'Remarks',
    assignmentPassingMarks: 'Passing Marks',
    assignmentTotalMarks: 'Total Marks',
    assignmentGradingType: 'Grading Type',
    assignmentMarksOnly: 'Marks Only',
    assignmentGrades: 'Grades (A-F)',
    assignmentPassFail: 'Pass/Fail',
    assignmentBeginner: 'Beginner',
    assignmentIntermediate: 'Intermediate',
    assignmentAdvanced: 'Advanced',
    assignmentExpert: 'Expert',
    assignmentSubmissionText: 'Submission Text',
    assignmentSubmissionFiles: 'Submission Files',
    assignmentSubmissionHistory: 'Submission History',
    assignmentAttemptNumber: 'Attempt',
    assignmentResubmissionCount: 'Resubmission Count',
    
    // Assignment Status
    assignmentStatusDraft: 'Draft',
    assignmentStatusPublished: 'Published',
    assignmentStatusPending: 'Pending',
    assignmentStatusSubmitted: 'Submitted',
    assignmentStatusGraded: 'Graded',
    assignmentStatusLate: 'Late',
    assignmentStatusOverdue: 'Overdue',
    assignmentStatusArchived: 'Archived',
    
    // Assignment-specific messages
    assignmentMessages: {
      createSuccess: 'Assignment created successfully!',
      updateSuccess: 'Assignment updated successfully!',
      deleteSuccess: 'Assignment deleted successfully!',
      submitSuccess: 'Assignment submitted successfully!',
      gradeSuccess: 'Submission graded successfully!',
      noFiles: 'No files attached',
      noSubmissions: 'No submissions yet',
      submissionDeadlinePassed: 'Submission deadline has passed',
      lateSubmissionAccepted: 'Late submissions are accepted with penalty',
      maxFilesExceeded: 'Maximum number of files exceeded',
      fileSizeExceeded: 'File size exceeds maximum limit',
      invalidFileType: 'Invalid file type',
      confirmDelete: 'Are you sure you want to delete this assignment?',
      confirmDeleteSubmission: 'Are you sure you want to delete this submission?',
      confirmGrade: 'Are you sure you want to grade this submission?',
      pendingGrading: 'Pending Grading',
      gradingInProgress: 'Grading in Progress',
      gradingCompleted: 'Grading Completed',
      resubmissionAllowed: 'Resubmission allowed',
      resubmissionDeadline: 'Resubmission Deadline',
    },
    
    // Study Material
    notesLabel: 'Lecture Notes',
    studyMaterial: 'Course Material',
    resourcesLabel: 'Resources',
    
    // Attendance
    attendanceLabel: 'Attendance',
    presentLabel: 'Present',
    absentLabel: 'Absent',
    lateLabel: 'Late',
    leaveLabel: 'Leave',
    
    // Fees & Finance
    feeLabel: 'Tuition Fee',
    feesLabel: 'Tuition Fees',
    feeStructure: 'Fee Structure',
    feeVoucher: 'Fee Voucher',
    feeReceipt: 'Fee Receipt',
    dueDate: 'Due Date',
    fineLabel: 'Late Fine',
    discountLabel: 'Scholarship',
    
    // Communication
    announcementLabel: 'Announcement',
    noticeLabel: 'Notice',
    circularLabel: 'Circular',
    messageLabel: 'Message',
    notificationLabel: 'Notification',
    
    // Library
    libraryLabel: 'Library',
    bookLabel: 'Book',
    issueLabel: 'Issue',
    returnLabel: 'Return',
    fineLabel_library: 'Fine',
    
    // Transport
    transportLabel: 'Transport',
    routeLabel: 'Route',
    vehicleLabel: 'Vehicle',
    stopLabel: 'Stop',
    
    // Hostel
    hostelLabel: 'Hostel',
    roomLabel: 'Room',
    messLabel: 'Mess',
    
    // Events
    eventLabel: 'Event',
    holidayLabel: 'Holiday',
    celebrationLabel: 'Celebration',
    
    // Reports
    reportLabel: 'Report',
    analyticsLabel: 'Analytics',
    progressReport: 'Progress Report',
    
    // Research
    researchLabel: 'Research',
    thesisLabel: 'Thesis',
    publicationLabel: 'Publication',
    
    // Navigation - Parent
    nav: {
      overview: 'Overview',
      myChildren: 'My Children',
      attendance: 'Attendance',
      results: 'Academic Results',
      fees: 'Tuition Fees',
      timetable: 'Schedule',
      homework: 'Tasks',
      assignments: 'Assignments',
      studyMaterial: 'Course Material',
      announcements: 'Announcements',
      communication: 'Communication',
      meetings: 'Faculty Meetings',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      feedback: 'Feedback',
    },
    
    // Navigation - Student
    nav: {
      overview: 'Dashboard',
      myAttendance: 'My Attendance',
      myResults: 'My Results',
      myFees: 'My Fees',
      myTimetable: 'My Schedule',
      myClasses: 'My Courses',
      homework: 'Tasks',
      assignments: 'Assignments',
      studyMaterial: 'Course Material',
      syllabus: 'Course Outline',
      exams: 'Exams',
      announcements: 'Announcements',
      library: 'Library',
      transport: 'Transport',
      hostel: 'Hostel',
      calendar: 'Calendar',
      profile: 'Profile',
      achievements: 'Achievements',
      clubs: 'Societies',
      sports: 'Sports',
      research: 'Research',
      thesis: 'Thesis',
    },
    
    // Navigation - Teacher
    nav: {
      overview: 'Dashboard',
      myClasses: 'My Courses',
      myStudents: 'My Students',
      myTimetable: 'My Schedule',
      attendance: 'Mark Attendance',
      selfAttendance: 'My Attendance',
      homework: 'Create Tasks',
      assignments: 'Create Assignments',
      studyMaterial: 'Upload Material',
      syllabus: 'Manage Course',
      exams: 'Manage Exams',
      examResults: 'Enter Results',
      announcements: 'Post Announcements',
      communication: 'Communicate',
      meetings: 'Schedule Meetings',
      reports: 'Reports',
      research: 'Research',
      publications: 'Publications',
      library: 'Library',
      transport: 'Transport Info',
      hostel: 'Hostel Info',
      calendar: 'Calendar',
      profile: 'Profile',
      leave: 'Leave Application',
      training: 'Training',
      achievements: 'Achievements',
      gradebook: 'Gradebook',
      lessonPlans: 'Lecture Plans',
    },
    
    // Common phrases (inherited after CONFIG initialization)
    common: {},
    status: {},
  },
};

// Default config fallback
CONFIG.default = CONFIG.school;

// Inherit shared common/status terms after CONFIG is fully initialized.
['coaching', 'academy', 'college', 'university'].forEach((type) => {
  CONFIG[type].common = { ...CONFIG.school.common, ...CONFIG[type].common };
  CONFIG[type].status = { ...CONFIG.school.status, ...CONFIG[type].status };
});

/**
 * Returns the terminology config for a given institute type and user type.
 * Falls back to 'school' if no match found.
 * 
 * @param {string} instituteType - 'school' | 'coaching' | 'academy' | 'college' | 'university'
 * @param {string} userType - 'STUDENT' | 'PARENT' | 'TEACHER' (optional, for role-specific terms)
 */
export function getPortalTerms(instituteType, userType = null) {
  const baseConfig = CONFIG[instituteType] || CONFIG.school;
  
  // If userType is provided, we could return role-specific overrides here
  // For now, return the base config
  
  return baseConfig;
}

/**
 * Get institute-specific label for a generic term
 * @param {string} instituteType 
 * @param {string} term - e.g., 'class', 'teacher', 'exam'
 */
export function getTerm(instituteType, term) {
  const config = CONFIG[instituteType] || CONFIG.school;
  return config[term] || config[`${term}Label`] || term;
}

/**
 * Get assignment-specific terminology
 */
export function getAssignmentTerms(instituteType) {
  const config = CONFIG[instituteType] || CONFIG.school;
  return {
    assignmentLabel: config.assignmentLabel || 'Assignment',
    assignmentsLabel: config.assignmentsLabel || 'Assignments',
    submissionLabel: config.submissionLabel || 'Submission',
    submissionsLabel: config.submissionsLabel || 'Submissions',
    dueDateLabel: config.dueDateLabel || 'Due Date',
    lateSubmissionLabel: config.lateSubmissionLabel || 'Late Submission',
    resubmissionLabel: config.resubmissionLabel || 'Resubmission',
    description: config.assignmentDescription || 'Assignment Description',
    instructions: config.assignmentInstructions || 'Instructions',
    materials: config.assignmentMaterials || 'Materials',
    attachments: config.assignmentAttachments || 'Attachments',
    grading: config.assignmentGrading || 'Grading',
    settings: config.assignmentSettings || 'Settings',
    difficulty: config.assignmentDifficulty || 'Difficulty Level',
    estimatedTime: config.assignmentEstimatedTime || 'Estimated Time',
    maxFiles: config.assignmentMaxFiles || 'Maximum Files',
    maxFileSize: config.assignmentMaxFileSize || 'Maximum File Size',
    allowLate: config.assignmentAllowLate || 'Allow Late Submissions',
    latePenalty: config.assignmentLatePenalty || 'Late Submission Penalty',
    publishNow: config.assignmentPublishNow || 'Publish Immediately',
    saveDraft: config.assignmentSaveDraft || 'Save as Draft',
    gradeNow: config.assignmentGradeNow || 'Grade Now',
    feedback: config.assignmentFeedback || 'Feedback',
    remarks: config.assignmentRemarks || 'Remarks',
    passingMarks: config.assignmentPassingMarks || 'Passing Marks',
    totalMarks: config.assignmentTotalMarks || 'Total Marks',
    gradingType: config.assignmentGradingType || 'Grading Type',
    marksOnly: config.assignmentMarksOnly || 'Marks Only',
    grades: config.assignmentGrades || 'Grades (A-F)',
    passFail: config.assignmentPassFail || 'Pass/Fail',
    beginner: config.assignmentBeginner || 'Beginner',
    intermediate: config.assignmentIntermediate || 'Intermediate',
    advanced: config.assignmentAdvanced || 'Advanced',
    expert: config.assignmentExpert || 'Expert',
    submissionText: config.assignmentSubmissionText || 'Submission Text',
    submissionFiles: config.assignmentSubmissionFiles || 'Submission Files',
    submissionHistory: config.assignmentSubmissionHistory || 'Submission History',
    attemptNumber: config.assignmentAttemptNumber || 'Attempt',
    resubmissionCount: config.assignmentResubmissionCount || 'Resubmission Count',
    statusDraft: config.assignmentStatusDraft || 'Draft',
    statusPublished: config.assignmentStatusPublished || 'Published',
    statusPending: config.assignmentStatusPending || 'Pending',
    statusSubmitted: config.assignmentStatusSubmitted || 'Submitted',
    statusGraded: config.assignmentStatusGraded || 'Graded',
    statusLate: config.assignmentStatusLate || 'Late',
    statusOverdue: config.assignmentStatusOverdue || 'Overdue',
    statusArchived: config.assignmentStatusArchived || 'Archived',
    messages: config.assignmentMessages || {},
  };
}

/**
 * Get navigation items for specific user type and institute
 */
export function getNavItems(instituteType, userType) {
  const config = CONFIG[instituteType] || CONFIG.school;
  const nav = config.nav || {};
  const role = String(userType || '').toUpperCase();

  if (role === 'PARENT') {
    return {
      overview: nav.overview || config.overviewLabel || 'Overview',
      myChildren: nav.myChildren || config.childrenLabel || 'My Children',
      attendance: nav.attendance || config.attendanceLabel || 'Attendance',
      results: nav.results || config.resultsLabel || 'Results',
      fees: nav.fees || config.feesLabel || 'Fees',
      assignments: nav.assignments || config.assignmentsLabel || 'Assignments',
      announcements: nav.announcements || config.announcementsLabel || 'Announcements'
    };
  }

  if (role === 'STUDENT') {
    return {
      overview: nav.overview || config.overviewLabel || 'Overview',
      myAttendance: nav.myAttendance || config.attendanceLabel || 'Attendance',
      exams: nav.exams || config.examsLabel || 'Exams',
      myTimetable: nav.myTimetable || config.timetableLabel || 'Timetable',
      syllabus: nav.syllabus || config.syllabusLabel || 'Syllabus',
      assignments: nav.assignments || config.assignmentsLabel || 'Assignments',
      homework: nav.homework || config.homeworkLabel || 'Homework',
      notes: nav.notes || nav.studyMaterial || config.notesLabel || 'Notes',
      myFees: nav.myFees || config.feesLabel || 'Fees',
      announcements: nav.announcements || config.announcementsLabel || 'Announcements'
    };
  }

  if (role === 'TEACHER') {
    return {
      overview: nav.overview || config.overviewLabel || 'Dashboard',
      myClasses: nav.myClasses || config.classesLabel || 'My Classes',
      myStudents: nav.myStudents || config.studentsLabel || 'My Students',
      myTimetable: nav.myTimetable || config.timetableLabel || 'My Timetable',
      attendance: nav.attendance || config.attendanceLabel || 'Attendance',
      homework: nav.homework || config.homeworkLabel || 'Homework',
      assignments: nav.assignments || config.assignmentsLabel || 'Assignments',
      notes: nav.notes || config.notesLabel || 'Notes',
      announcements: nav.announcements || config.announcementsLabel || 'Announcements'
    };
  }

  return nav;
}


export default CONFIG;

/**
 * Get institute type configuration with all settings
 */
export function getInstituteTypeConfig(instituteType) {
  const configs = {
    school: {
      name: 'School',
      classLabel: 'Class',
      classPlural: 'Classes',
      hasSections: true,
      hasSubjects: true,
      hasBatches: false,
      hasPrograms: false,
      structure: 'classes-sections',
      gradingSystem: 'percentage',
      assignmentLabel: 'Assignment',
      assignmentDescription: 'Create and manage homework, assignments, and projects for your classes.',
      defaultSubject: 'General'
    },
    college: {
      name: 'College',
      classLabel: 'Course',
      classPlural: 'Courses',
      hasSections: true,
      hasSubjects: true,
      hasBatches: false,
      hasPrograms: true,
      structure: 'programs',
      gradingSystem: 'letter',
      assignmentLabel: 'Assignment',
      assignmentDescription: 'Create and manage coursework, assignments, and projects for your courses.',
      defaultSubject: 'Core Subject'
    },
    coaching: {
      name: 'Coaching Center',
      classLabel: 'Batch',
      classPlural: 'Batches',
      hasSections: false,
      hasSubjects: true,
      hasBatches: true,
      hasPrograms: false,
      structure: 'batches',
      gradingSystem: 'marks',
      assignmentLabel: 'Test/Assignment',
      assignmentDescription: 'Create and manage practice tests, assignments, and homework for your batches.',
      defaultSubject: 'Subject'
    },
    tution_center: {
      name: 'Tuition Center',
      classLabel: 'Group',
      classPlural: 'Groups',
      hasSections: false,
      hasSubjects: true,
      hasBatches: true,
      hasPrograms: false,
      structure: 'batches',
      gradingSystem: 'marks',
      assignmentLabel: 'Homework',
      assignmentDescription: 'Create and manage homework and assignments for your student groups.',
      defaultSubject: 'Subject'
    },
    academy: {
      name: 'Academy',
      classLabel: 'Program',
      classPlural: 'Programs',
      hasSections: false,
      hasSubjects: true,
      hasBatches: false,
      hasPrograms: true,
      structure: 'programs',
      gradingSystem: 'percentage',
      assignmentLabel: 'Assignment',
      assignmentDescription: 'Create and manage assignments, projects, and assessments for your programs.',
      defaultSubject: 'Course'
    },
    university: {
      name: 'University',
      classLabel: 'Program',
      classPlural: 'Programs',
      hasSections: true,
      hasSubjects: true,
      hasBatches: false,
      hasPrograms: true,
      structure: 'programs',
      gradingSystem: 'letter',
      assignmentLabel: 'Assignment/Paper',
      assignmentDescription: 'Create and manage assignments, research papers, and coursework for university programs.',
      defaultSubject: 'Department'
    }
  };
  
  return configs[instituteType] || configs.school;
}
