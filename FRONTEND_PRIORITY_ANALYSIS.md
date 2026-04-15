# Frontend Priority Analysis & Strategic Tasks
**Date:** April 12, 2026  
**Framework:** Next.js 15 (App Router)  
**Current Status:** Phase 14 Complete (All pages built + partial API integration)

---

## 🎯 Executive Summary

**Total Work:** 100% Pages Built | 70% API Integrated | 30% Pending Features  
**Completion Status:** UI/UX ✅ | Core Features ✅ | Advanced Features ⏳ | Testing ⏳

---

# 📊 PRIORITY BREAKDOWN

---

## 🔴 FIRST PRIORITY (CRITICAL) — Must Complete Now
**Timeline:** Week 1-2  
**Impact:** 100% product functionality  
**Status:** 60% Complete → 100% Complete

### 1.1 Backend API Integration for Core Features
**Status:** ⏳ In Progress | **Completion:** 40%

#### 1.1.1 Authentication System
- **Current State:** Login pages built, dummy auth flow working
- **What's Done:**
  - ✅ Login page UI with form validation (react-hook-form + zod)
  - ✅ Forgot password page UI
  - ✅ Reset password page UI
  - ✅ Auth middleware protecting routes
  - ✅ `authStore` (Zustand) for token storage
  - ✅ `authService.js` with API endpoints defined

- **What's Pending:**
  - [ ] Backend `POST /auth/login` integration (currently using dummy)
  - [ ] Backend `POST /auth/forgot-password` integration
  - [ ] Backend `POST /auth/reset-password` integration
  - [ ] Token refresh logic for expired JWTs
  - [ ] Auto-logout on token expiry
  - [ ] Logout API call to blacklist token

- **Strategic Task 1.1.1: Implement Real Auth Flow**
  - **Objective:** Replace dummy auth with real JWT backend flow
  - **Components Affected:** `(auth)/login/page.js`, `(auth)/forgot-password/page.js`, `(auth)/reset-password/page.js`, `authService.js`
  - **Steps:**
    1. Connect login form to `POST /auth/login` backend endpoint (instead of dummy)
    2. Store JWT token in `authStore` and set `access_token` cookie
    3. Add token refresh interceptor in axios (`lib/api.js`)
    4. Implement logout flow calling `POST /auth/logout` backend
    5. Test: Login → API call → Token stored → Can access school routes
  - **Success Criteria:**
    - Real login works with backend credentials
    - Token persists across page refresh
    - Expired token triggers automatic refresh or logout
    - Logout clears token and redirects to `/login`
  - **Estimated Hours:** 4-6 hours

#### 1.1.2 School Admin Core CRUD Operations
- **Current State:** All pages built with dummy data
- **What's Done:**
  - ✅ Students page — DataTable UI, search, filter, modal forms
  - ✅ Teachers page — DataTable UI, CRUD modals
  - ✅ Classes page — DataTable UI for class/section management
  - ✅ Dashboard — with 4 mock charts
  - ✅ Forms with validation (react-hook-form + zod)
  - ✅ Services defined: `studentService.js`, `teacherService.js`, `classService.js`

- **What's Pending:**
  - [ ] `studentService.js` — Wire `GET /students`, `POST /students`, `PUT /students/:id`, `DELETE /students/:id`
  - [ ] `teacherService.js` — Wire CRUD endpoints
  - [ ] `classService.js` — Wire class/section CRUD
  - [ ] Dashboard — Replace dummy charts with real data from `GET /dashboard`
  - [ ] List pages — Replace `dummyData` imports with `useQuery` hooks
  - [ ] Create/Update modals — Wire `useMutation` for forms

- **Strategic Task 1.1.2: Implement Students CRUD Flow**
  - **Objective:** Connect Students page to real backend endpoints
  - **Components Affected:** `StudentsPage.jsx`, `studentService.js`, `useStudentPortal.js` hook
  - **Steps:**
    1. Replace dummy data import with `useQuery` hook:
       ```jsx
       const { data: students, isLoading } = useQuery({ 
         queryKey: ['students'], 
         queryFn: () => studentService.getStudents() 
       });
       ```
    2. Add/Update student modal — wire to `useMutation`:
       ```jsx
       const addMutation = useMutation({
         mutationFn: (data) => studentService.createStudent(data),
         onSuccess: () => queryClient.invalidateQueries(['students'])
       });
       ```
    3. Update DataTable `data` prop to use real API response
    4. Implement search/filter by wiring query parameters to backend
    5. Add error handling with `ErrorAlert` component
    6. Test: List students → Add student → See it in list → Update → Delete
  - **Success Criteria:**
    - Students list loads from backend
    - Can add new student and see in list immediately
    - Can update and delete students
    - Filters and search work with real data
  - **Estimated Hours:** 5-8 hours

- **Strategic Task 1.1.3: Implement Teachers & Classes CRUD**
  - **Objective:** Wire Teachers and Classes pages to backend
  - **Similar Flow to 1.1.2** — Replace dummy with `useQuery` + `useMutation`
  - **Estimated Hours:** 4-6 hours per page (2 pages = 8-12 hours)

#### 1.1.3 Portal System Real Data
- **Current State:** Parent/Student/Teacher portals have partial API integration
- **What's Done (via hooks `useParentPortal`, `useStudentPortal`, `useTeacherPortal`):**
  - ✅ Teacher Portal mostly integrated (dashboard, classes, students, assignments, homework, attendance)
  - ✅ Parent Portal pages built (dashboard, fees, attendance, results)
  - ✅ Student Portal pages built (dashboard, exams, timetable)

- **What's Pending:**
  - [ ] Parent Portal `GET /portal/parent/dashboard` integration
  - [ ] Parent Portal `GET /portal/parent/fees` integration
  - [ ] Student Portal `GET /portal/student/dashboard` integration
  - [ ] Student Portal `GET /portal/student/timetable` integration
  - [ ] Teacher Portal Notes API integration (`PUT /portal/teacher/notes`)
  - [ ] **Critical:** Teacher Notes page not using realtime hooks (Uses dummy store)

- **Strategic Task 1.1.4: Complete Teacher Portal Notes Integration**
  - **Objective:** Wire Teacher Notes to backend (currently dummy-data based)
  - **Components Affected:** `app/(portal)/teacher/notes/page.jsx`, `teacherPortalService.js`
  - **Steps:**
    1. Ensure backend has these endpoints:
       - `GET /portal/teacher/notes` — list all notes
       - `POST /portal/teacher/notes` — create new note
       - `DELETE /portal/teacher/notes/:id` — delete note
       - `GET /portal/teacher/notes/:id/download` — download note file (optional)
    2. Update `teacherPortalService.js` with actual endpoint calls
    3. Replace dummy store reads with `useQuery` hooks
    4. Wire upload/create button to `useMutation`
    5. Test: Create note → See in list → Delete note
  - **Success Criteria:**
    - Notes list loads from backend
    - Can create and delete notes
    - File upload works (if applicable)
  - **Estimated Hours:** 3-4 hours

---

### 1.2 Attendance & Fee Tracking System
**Status:** ⏳ Ready for API | **Completion:** 50%

#### 1.2.1 Daily Attendance Tracking
- **Current State:** UI built with dummy data
- **What's Done:**
  - ✅ Attendance page UI (class selector, date picker, mark attendance grid)
  - ✅ `attendanceService.js` API endpoints defined
  - ✅ Services for mark attendance

- **What's Pending:**
  - [ ] Real `GET /attendance/:date` to fetch current attendance
  - [ ] Real `POST /attendance/mark` to save attendance
  - [ ] Real `GET /attendance/stats` for dashboard charts
  - [ ] Validation: Don't allow marking attendance for future dates
  - [ ] Bulk attendance operations (mark all/mark section)

- **Strategic Task 1.2.1: Implement Attendance Marking**
  - **Objective:** Wire Attendance page to real backend endpoints
  - **Components Affected:** `AttendancePage.jsx`, `attendanceService.js`
  - **Steps:**
    1. Fetch attendance for class + date: `GET /attendance?classId=X&date=Y`
    2. For each student, track: present/absent/leave
    3. Save attendance: `POST /attendance/mark` with array of records
    4. Add confirmation dialog before saving
    5. Implement bulk actions (mark all present, mark section)
  - **Success Criteria:**
    - Can select class and date
    - Can mark attendance and save
    - Data persists and loads correctly
  - **Estimated Hours:** 4-5 hours

#### 1.2.2 Fee Management System
- **Current State:** UI built, partial backend integration
- **What's Done:**
  - ✅ Fees page UI (invoice list, payment tracking)
  - ✅ Fee payment modal form
  - ✅ `feeService.js` with endpoints

- **What's Pending:**
  - [ ] Real `GET /fees/invoices` paginated list
  - [ ] Real `GET /fees/:id` single invoice details
  - [ ] Real `POST /fees/:id/payment` to record payment
  - [ ] Fee template management integration
  - [ ] Parent Portal fee viewing not fully integrated

- **Strategic Task 1.2.2: Implement Fee Payment Flow**
  - **Objective:** Wire fee pages to backend
  - **Components Affected:** `FeesPage.jsx`, `feeService.js`, Parent Portal
  - **Steps:**
    1. Load fee invoices: `GET /fees/invoices?studentId=X`
    2. Show invoice details with due date, amount, status
    3. Record payment: `POST /fees/:invoiceId/payment` with amount + date
    4. Update invoice status after payment
    5. Generate receipt (optional: PDF)
  - **Success Criteria:**
    - Can view invoices with status
    - Can record payments
    - Dashboard shows fee stats
  - **Estimated Hours:** 4-5 hours

---

### 1.3 Error Handling & Validation
**Status:** ⏳ Partially Done | **Completion:** 40%

- **What's Done:**
  - ✅ Forms use zod validation (client-side)
  - ✅ `ErrorAlert` component exists
  - ✅ HTTP error interceptor in axios

- **What's Pending:**
  - [ ] Consistent error message display on API failures
  - [ ] Retry logic for failed API calls
  - [ ] User-friendly error messages (not raw API errors)
  - [ ] Offline detection and messaging
  - [ ] Timeout handling for slow connections

- **Strategic Task 1.3: Implement Robust Error Handling**
  - **Objective:** Add comprehensive error handling across all pages
  - **Steps:**
    1. Wrap all API calls in try-catch with `ErrorAlert`
    2. Add retry button to error states
    3. Implement exponential backoff for retries
    4. Add timeout detection (e.g., >10s = timeout)
    5. Show specific error messages based on error type (400, 401, 404, 500, timeout, etc.)
  - **Files to Update:** All page components using `useQuery`/`useMutation`
  - **Estimated Hours:** 3-4 hours

---

## Summary: First Priority Remaining
| Task | Hours | Impact |
|------|-------|--------|
| Auth System Real Integration | 4-6 | Login works with backend |
| Students CRUD | 5-8 | Core admin functionality |
| Teachers & Classes CRUD | 8-12 | Full school panel |
| Portal Data Integration | 6-8 | Parent/Student/Teacher real data |
| Attendance System | 4-5 | Daily operations |
| Fees System | 4-5 | Financial tracking |
| Error Handling | 3-4 | Stability |
| **Total First Priority** | **34-48 hours** | **70% functionality** |

---

---

## 🟡 SECOND PRIORITY (HIGH) — Complete in Week 2-3
**Timeline:** Week 2-3  
**Impact:** Advanced features + polish  
**Status:** 20% Complete → 80% Complete

### 2.1 Exams & Results Management
**Status:** ⏳ UI Built | **Completion:** 5%

- **What's Done:**
  - ✅ Exams page UI (exam schedule table, results browser)
  - ✅ ExamService defined
  - ✅ Student Portal exam view

- **What's Pending:**
  - [ ] Real `GET /exams/schedule` integration
  - [ ] Real `POST /exams` to create exam
  - [ ] Real `POST /exams/:id/results` to record results
  - [ ] Result publish workflow (draft → published)
  - [ ] Result download as PDF
  - [ ] Parent Portal result viewing

- **Strategic Task 2.1: Complete Exams & Results Flow**
  - **Objective:** Wire exam pages to backend for full lifecycle
  - **Components Affected:** `ExamsPage.jsx`, `examService.js`, Student/Parent Portals
  - **Workflow:**
    1. Create Exam: `POST /exams` with subject, date, time, total marks
    2. List Exams: `GET /exams` with filters (subject, class, date)
    3. Enter Results: `POST /exams/:id/results` with student marks
    4. Publish Results: `PUT /exams/:id/publish` (state change)
    5. View Results: `GET /exams/:id/results` for students/parents
  - **Success Criteria:**
    - Can create and schedule exams
    - Can enter and publish results
    - Students can view their results
    - Parents can see child results
  - **Estimated Hours:** 8-10 hours

### 2.2 Timetable & Schedule Management
**Status:** ⏳ UI Built | **Completion:** 5%

- **What's Done:**
  - ✅ Timetable page UI (weekly grid, color-coded classes)
  - ✅ Student Portal timetable view
  - ✅ Teacher Portal today's schedule in dashboard
  - ✅ `timetableService.js` defined

- **What's Pending:**
  - [ ] Real `GET /timetable/class/:id` integration
  - [ ] Real `POST /timetable/create` to create schedule entries
  - [ ] Conflict detection (teacher + room double-booked)
  - [ ] Mobile-responsive timetable
  - [ ] Export timetable as PDF
  - [ ] Student personal timetable (filtered by class)

- **Strategic Task 2.2: Implement Timetable Management**
  - **Objective:** Build complete timetable creation and viewing
  - **Steps:**
    1. Load timetable: `GET /timetable?classId=X&week=Y`
    2. Add schedule entry: `POST /timetable` with subject, teacher, room, day, time
    3. Validate: no conflicts (same teacher/room same time)
    4. Display: Color-coded by subject
    5. For students: Filter to only their class timetable
  - **Success Criteria:**
    - Can create and view timetables
    - Conflicts prevented
    - Students see their timetable correctly
  - **Estimated Hours:** 6-8 hours

### 2.3 Payroll & Staff Attendance
**Status:** ⏳ UI Built | **Completion:** 30%

- **What's Done:**
  - ✅ Staff Attendance page built
  - ✅ Payroll page UI with payslip template
  - ✅ PayslipTemplate component cleaned up
  - ✅ `staffAttendanceService.js`, `payrollService.js` defined

- **What's Pending:**
  - [ ] Real staff attendance marking integration
  - [ ] Real payslip generation from backend: `GET /payroll/:id/payslip`
  - [ ] Salary calculation logic
  - [ ] Deductions + allowances management
  - [ ] Bulk payslip generation: `POST /payroll/generate`
  - [ ] Payslip download as PDF
  - [ ] Export payroll reports

- **Strategic Task 2.3: Complete Payroll System**
  - **Objective:** Wire payroll pages to generate and manage payslips
  - **Steps:**
    1. Mark staff attendance: Same as student attendance flow
    2. Generate payslips: `POST /payroll/generate?month=X&year=Y`
    3. Calculate: Basic + Allowances - Deductions = Net
    4. Save to database
    5. Provide download: `GET /payroll/:id/payslip` as PDF
  - **Files to Update:** `PayslipTemplate.jsx`, Payroll pages
  - **Success Criteria:**
    - Can mark staff attendance
    - Can generate payslips automatically
    - Payslips show correct calculations
    - Can download as PDF
  - **Estimated Hours:** 6-8 hours

### 2.4 Master Admin Portal Completion
**Status:** ⏳ UI Built | **Completion:** 20%

- **What's Done:**
  - ✅ All Master Admin pages UI built
  - ✅ Schools management page
  - ✅ Subscriptions management
  - ✅ `masterAdminService.js` defined

- **What's Pending:**
  - [ ] Real `GET /master-admin/schools` listingwith filters
  - [ ] School activation/deactivation
  - [ ] Subscription assignment: `POST /subscriptions/assign`
  - [ ] Subscription upgrade/downgrade
  - [ ] User role management at global level
  - [ ] Dashboard with statistics
  - [ ] Bulk school operations

- **Strategic Task 2.4: Wire Master Admin Operations**
  - **Objective:** Make Master Admin fully functional for school management
  - **Steps:**
    1. List schools: `GET /master-admin/schools` with pagination + filters
    2. Create school: `POST /master-admin/schools` with name, address, etc.
    3. Manage subscriptions: Assign plans to schools
    4. Dashboard: Stats on total schools, subscriptions, revenue
  - **Success Criteria:**
    - Can manage all schools
    - Can assign and upgrade subscriptions
    - Dashboard shows key metrics
  - **Estimated Hours:** 6-8 hours

### 2.5 Leave Management System
**Status:** ⏳ UI Built | **Completion:** 30%

- **What's Done:**
  - ✅ Leave Request page built with full UI
  - ✅ Leave types management UI
  - ✅ Approve/Reject workflows
  - ✅ `leaveRequestService.js` defined

- **What's Pending:**
  - [ ] Real `GET /leave-requests` integration
  - [ ] Real `POST /leave-requests` to create request
  - [ ] Real `PUT /leave-requests/:id/approve` and `/reject`
  - [ ] Leave balance calculations
  - [ ] Email notifications on approval/rejection
  - [ ] HR approval workflow

- **Strategic Task 2.5: Complete Leave Management**
  - **Objective:** Full leave request lifecycle
  - **Steps:**
    1. Staff submit request: `POST /leave-requests` with dates + reason
    2. Check balance: Ensure not exceeding allowed days
    3. HR review: `GET /leave-requests?status=pending`
    4. Approve: `PUT /leave-requests/:id/approve`
    5. Reject: `PUT /leave-requests/:id/reject` with reason
    6. Notify staff and HR
  - **Success Criteria:**
    - Can submit leave requests
    - HR can approve/reject
    - Balance is tracked
    - Notifications sent
  - **Estimated Hours:** 5-6 hours

### 2.6 Notifications & Messaging System
**Status:** ⏳ Backend Ready | **Completion:** 10%

- **What's Done:**
  - ✅ Notification bell UI in navbar
  - ✅ `notificationService.js` defined
  - ✅ `useSocket.js` hook for real-time

- **What's Pending:**
  - [ ] Socket.io connection setup (if not done)
  - [ ] Real `GET /notifications` API
  - [ ] Real notification bell with unread count
  - [ ] Mark as read: `PUT /notifications/:id/read`
  - [ ] Real-time notification push via WebSocket
  - [ ] Notification types: announcement, deadline, approval, system
  - [ ] Notification preferences/settings

- **Strategic Task 2.6: Implement Notification System**
  - **Objective:** Real-time notifications for all users
  - **Steps:**
    1. Fetch notifications: `GET /notifications`
    2. Show unread count in bell
    3. WebSocket listener for new notifications
    4. Click notification → Mark read + navigate to relevant page
    5. Settings: Choose which notifications to receive
  - **Success Criteria:**
    - Notifications load correctly
    - Unread count updates
    - Real-time updates via WebSocket
    - Can manage notification preferences
  - **Estimated Hours:** 4-6 hours

### 2.7 Reports & Analytics
**Status:** ⏳ Partially Built | **Completion:** 10%

- **What's Done:**
  - ✅ Dashboard charts UI
  - ✅ Charts components (Recharts integration)
  - ✅ `reportService.js` defined

- **What's Pending:**
  - [ ] Real `GET /reports/attendance` for attendance analytics
  - [ ] Real `GET /reports/fees` for fee collection analytics
  - [ ] Real `GET /reports/performance` for student performance
  - [ ] Export reports as PDF/Excel
  - [ ] Custom date range filters
  - [ ] Role-specific reports

- **Strategic Task 2.7: Build Reports Module**
  - **Objective:** Provide analytics for decision-making
  - **Key Reports:**
    1. Attendance: Trends, defaulters, class-wise
    2. Fees: Collection rate, pending amount, student-wise
    3. Performance: Class average, top/bottom students
    4. Staff: Joining date, experience, qualification
  - **Success Criteria:**
    - All reports load with real data
    - Can filter by date range
    - Can download reports
  - **Estimated Hours:** 6-8 hours

---

## Summary: Second Priority Remaining
| Task | Hours | Impact |
|------|-------|--------|
| Exams & Results | 8-10 | Academic management |
| Timetable System | 6-8 | Schedule management |
| Payroll & Staff Attendance | 6-8 | HR operations |
| Master Admin | 6-8 | Multi-school management |
| Leave Management | 5-6 | HR workflows |
| Notifications | 4-6 | Real-time communication |
| Reports & Analytics | 6-8 | Data insights |
| **Total Second Priority** | **41-48 hours** | **Advanced features** |

---

---

## 🟢 THIRD PRIORITY (MEDIUM) — Polish & Optimization
**Timeline:** Week 3-4  
**Impact:** Performance + UX refinement  
**Status:** 10% Complete → 70% Complete

### 3.1 File Upload & Storage
**Status:** ⏳ Structure Ready | **Completion:** 10%

- **What's Pending:**
  - [ ] Profile image uploads for students/teachers/staff
  - [ ] Document uploads (certificates, documents)
  - [ ] Assignment submission file uploads
  - [ ] Note/resource file uploads for teacher portal
  - [ ] School/institute logo upload
  - [ ] Bulk CSV import for students/teachers
  - [ ] Progress indicators for file uploads
  - [ ] Virus scanning for uploaded files

- **Strategic Task 3.1: Implement File Management System**
  - **Objective:** Complete file upload workflow
  - **Architecture:**
    1. Frontend: Upload to backend with progress bar
    2. Backend: Save to cloud storage (AWS S3, Cloudinary, etc.)
    3. Database: Store file metadata (name, size, url, uploader)
    4. Delete: Remove from storage when record deleted
  - **File Types to Support:**
    - Profiles: JPG, PNG (max 5MB)
    - Documents: PDF, DOC, DOCX (max 20MB)
    - Bulk Import: CSV, XLSX (max 10MB)
  - **Success Criteria:**
    - Can upload files
    - Progress bar shows upload status
    - Files accessible via URLs
    - Can delete files
  - **Estimated Hours:** 8-10 hours

### 3.2 Performance Optimization
**Status:** ⏳ Basic Setup | **Completion:** 15%

- **What's Done:**
  - ✅ Next.js configured
  - ✅ Tailwind CSS compiled
  - ✅ TanStack Query for data caching

- **What's Pending:**
  - [ ] Image optimization (next/image)
  - [ ] Code splitting for large pages
  - [ ] Lazy loading for modals + lists
  - [ ] Debounce search/filter inputs
  - [ ] Pagination for large datasets (avoid loading all at once)
  - [ ] Caching strategy for frequently accessed data
  - [ ] Lighthouse score improvement (target: 90+)

- **Strategic Task 3.2: Performance Audit & Optimization**
  - **Objective:** Improve Core Web Vitals
  - **Checklist:**
    1. Run Lighthouse → identify issues
    2. Optimize images with `next/image`
    3. Enable code splitting
    4. Implement pagination (max 20-50 items per request)
    5. Cache static resources
    6. Minify JavaScript/CSS
    7. Aim for: LCP <2.5s, FID <100ms, CLS <0.1
  - **Success Criteria:**
    - Lighthouse score ≥85 (all pages)
    - Page load time <3s on 4G
    - No layout shifts during loading
  - **Estimated Hours:** 6-8 hours

### 3.3 Real-time Features
**Status:** ⏳ Socket Setup | **Completion:** 20%

- **What's Pending:**
  - [ ] Real-time attendance updates (auto-refresh when marked)
  - [ ] Real-time notification push
  - [ ] Live student list updates (when new student added by HR)
  - [ ] Collaborative features (multiple admins managing same data)
  - [ ] Real-time assignment/homework update for students
  - [ ] Live fee payment notifications for parents

- **Strategic Task 3.3: Enhance Real-time Capabilities**
  - **Objective:** Minimize manual page refreshes
  - **Implementation:**
    1. Use Socket.io for bi-directional communication
    2. Listen for events: `user:created`, `attendance:marked`, `fee:paid`, etc.
    3. Update UI in real-time via query invalidation
    4. Prevent showing stale data
  - **Success Criteria:**
    - Data updates automatically without refresh
    - No conflicts when multiple users work simultaneously
  - **Estimated Hours:** 5-6 hours

### 3.4 Mobile App Responsiveness
**Status:** ⏳ Tailwind Mobile | **Completion:** 40%

- **What's Done:**
  - ✅ Tailwind CSS mobile-first approach
  - ✅ Mobile hamburger menu
  - ✅ Responsive forms

- **What's Pending:**
  - [ ] Test all pages on mobile (iOS + Android)
  - [ ] Touch-friendly buttons (min 48x48px)
  - [ ] Mobile-optimized modals (full screen on small screens)
  - [ ] Optimize DataTable for small screens
  - [ ] Mobile-specific UI for complex features (timetable, reports)
  - [ ] iOS safe area compliance
  - [ ] PWA setup (offline access)

- **Strategic Task 3.4: Mobile-First Optimization**
  - **Objective:** 100% mobile usability
  - **Checklist:**
    1. Test each page on iPhone + Android
    2. Adjust padding/font sizes for mobile
    3. Make modals full-screen on mobile
    4. Optimize DataTable: horizontal scroll for small screens
    5. Test touch interactions (no hover-only actions)
    6. Implement PWA manifest for offline mode
  - **Success Criteria:**
    - All pages work on 320px-430px screens
    - Touch targets properly sized
    - Form input accessible (no keyboard cover)
    - Can use app offline
  - **Estimated Hours:** 8-10 hours

### 3.5 Dark Mode Enhancement
**Status:** ⏳ Theme Toggle Ready | **Completion:** 30%

- **What's Done:**
  - ✅ Dark mode toggle in settings
  - ✅ Tailwind CSS dark: utilities
  - ✅ `next-themes` integration

- **What's Pending:**
  - [ ] Consistent dark mode colors across all components
  - [ ] Dark mode for charts
  - [ ] Dark mode for portal pages
  - [ ] Dark mode for landing page
  - [ ] Auto dark mode based on system preference
  - [ ] Persist dark mode preference

- **Strategic Task 3.5: Complete Dark Mode**
  - **Objective:** Polished dark mode throughout app
  - **Steps:**
    1. Audit all pages for dark mode compatibility
    2. Ensure sufficient contrast (WCAG AA standard)
    3. Update chart colors for dark mode
    4. Test dark mode across all pages
    5. Default to system preference if available
  - **Success Criteria:**
    - All pages look good in both light and dark mode
    - Colors meet accessibility standards
    - Toggle works across all browsers
  - **Estimated Hours:** 4-5 hours

### 3.6 Accessibility (A11y) Improvements
**Status:** ⏳ Basic HTML | **Completion:** 20%

- **What's Pending:**
  - [ ] Keyboard navigation for all interactive elements
  - [ ] ARIA labels for screen readers
  - [ ] Color contrast ratios (target: WCAG AA+)
  - [ ] Focus indicators visible
  - [ ] Form error messages linked to inputs
  - [ ] Skip links
  - [ ] Alt text for images

- **Strategic Task 3.6: A11y Audit & Fixes**
  - **Objective:** WCAG AA compliance
  - **Tools:** axe DevTools, Lighthouse
  - **Key Areas:**
    1. Keyboard: Tab through all interactive elements
    2. Screen Reader: Test with NVDA/JAWS
    3. Contrast: Check text vs background (ratio ≥4.5:1)
    4. Forms: Labels properly associated
    5. Images: Descriptive alt text
  - **Success Criteria:**
    - 0 accessibility errors in axe report
    - Keyboard navigation works
    - Screen reader friendly
  - **Estimated Hours:** 5-6 hours

### 3.7 Testing & QA
**Status:** ⏳ Not Started | **Completion:** 0%

- **What's Pending:**
  - [ ] Unit tests for utilities + hooks (Jest)
  - [ ] Component tests (React Testing Library)
  - [ ] Integration tests (API + UI flows)
  - [ ] E2E tests (Playwright/Cypress)
  - [ ] Cross-browser testing
  - [ ] Load testing

- **Strategic Task 3.7: Implement Testing Strategy**
  - **Objective:** Catch bugs early + confidence in deployments
  - **Approach:**
    1. Unit tests: `lib/utils.js`, `hooks/*.js` (~40% coverage)
    2. Component tests: Critical components like DataTable, Modal, Forms (~30% coverage)
    3. E2E tests: Full user flows like login → add student → view list
    4. Cross-browser: Chrome, Firefox, Safari, Edge
  - **Success Criteria:**
    - Test coverage ≥50%
    - All critical flows covered
    - Cross-browser passing
  - **Estimated Hours:** 12-16 hours

### 3.8 Documentation & Developer Experience
**Status:** ⏳ Partial Docs | **Completion:** 30%

- **What's Done:**
  - ✅ PROJECT.md with high-level overview
  - ✅ README.md with setup instructions
  - ✅ Code comments in some files

- **What's Pending:**
  - [ ] Component API documentation
  - [ ] Service function documentation
  - [ ] Deployment guide
  - [ ] Architecture diagrams
  - [ ] Troubleshooting guide
  - [ ] Contribution guidelines

- **Strategic Task 3.8: Complete Developer Documentation**
  - **Objective:** Easy onboarding + maintainability
  - **Docs to Create:**
    1. Component Library: Each component with props, examples
    2. Services: How to call APIs, error handling examples
    3. State Management: Store usage examples
    4. Deployment: Step-by-step for Vercel + custom server
    5. Troubleshooting: Common issues + solutions
  - **Success Criteria:**
    - New dev can be productive in <2 hours
    - All components documented
    - Deployment runbook available
  - **Estimated Hours:** 6-8 hours

---

## Summary: Third Priority Remaining
| Task | Hours | Impact |
|------|-------|--------|
| File Upload System | 8-10 | Content management |
| Performance Optimization | 6-8 | User experience |
| Real-time Features | 5-6 | Competitive feature |
| Mobile Optimization | 8-10 | Multi-device support |
| Dark Mode | 4-5 | UX polish |
| Accessibility (A11y) | 5-6 | Inclusive design |
| Testing & QA | 12-16 | Quality assurance |
| Documentation | 6-8 | Developer experience |
| **Total Third Priority** | **54-63 hours** | **Polish & optimization** |

---

---

# 📋 STRATEGIC IMPLEMENTATION ROADMAP

## Week 1: Critical Auth & Core CRUD
```
Mon-Tue    → Auth integration (Login/Logout/Token Refresh)
Wed-Thu    → Students CRUD fully wired
Fri        → Teachers & Classes CRUD partially done
```

## Week 2: Portal Data & Core Operations
```
Mon-Tue    → Complete Teachers/Classes CRUD, Teacher Portal Notes
Wed-Thu    → Attendance & Fee system integration
Fri        → Error handling + validation across pages
```

## Week 3: Advanced Features
```
Mon-Tue    → Exams & Results system
Wed-Thu    → Timetable management
Fri        → Payroll & Leave management
```

## Week 4: Polish & Optimization
```
Mon-Tue    → File uploads + Performance optimization
Wed-Thu    → Real-time features + Mobile optimization
Fri        → Accessibility + Dark mode enhancements
```

---

# 🚀 QUICK ACTION CHECKLIST

### Before Starting Week 1
- [ ] Backend API endpoints finalized and documented
- [ ] API base URL configured in `.env.local`
- [ ] Backend running and accessible from frontend
- [ ] CORS configured correctly

### Daily Standup Checklist
- [ ] Which tasks completed today?
- [ ] Blockers encountered?
- [ ] Tasks for tomorrow?
- [ ] Any API contract changes?

### Before Deployment
- [ ] All First Priority tasks complete ✅
- [ ] Second Priority 80% complete ⚠️
- [ ] No console errors/warnings
- [ ] Lighthouse score ≥80
- [ ] Browser testing complete (Chrome, Firefox, Safari)
- [ ] Mobile testing on 2+ actual devices
- [ ] API error scenarios tested
- [ ] Performance acceptable (<3s load time)

---

# 📊 METRICS & SUCCESS CRITERIA

## By End of Week 1 (First Priority)
| Metric | Target | Current |
|--------|--------|---------|
| Pages with real API data | 100% | 20% |
| CRUD operations wired | 100% | 10% |
| Authentication working | ✅ | ❌ |
| Errors properly handled | 90% | 20% |
| **Overall Completion** | **70%** | **40%** |

## By End of Week 2
| Metric | Target | Current |
|--------|--------|---------|
| Portal data realtime | 100% | 50% |
| Attendance system live | ✅ | ❌ |
| Fee tracking working | ✅ | ❌ |
| Leave management | ✅ | Partial |
| **Overall Completion** | **85%** | **55%** |

## By End of Week 4 (All Priorities)
| Metric | Target | Current |
|--------|--------|---------|
| Feature Completeness | 95% | 40% |
| Code Coverage | 50%+ | 0% |
| Lighthouse Score | 85+ | - |
| Mobile Usability | 100% | 60% |
| Accessibility (WCAG AA) | 100% | 50% |
| **Overall Completion** | **100%** | **40%** |

---

# 🎓 DEVELOPMENT TIPS

### 1. Service Pattern (Reusable across pages)
```javascript
// src/services/studentService.js
export const studentService = {
  getStudents: (params) => api.get('/students', { params }),
  getStudent: (id) => api.get(`/students/${id}`),
  createStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/students/${id}`),
};
```

### 2. Hook Pattern (Use in any component)
```javascript
// src/hooks/useStudents.js
export function useStudents() {
  const queryClient = useQueryClient();
  
  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getStudents(),
  });
  
  const addMutation = useMutation({
    mutationFn: (data) => studentService.createStudent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });
  
  return { students, isLoading, addMutation };
}
```

### 3. Component Pattern (Use hook in page)
```javascript
// src/app/(school)/students/page.js
export default function StudentsPage() {
  const { students, isLoading, addMutation } = useStudents();
  
  if (isLoading) return <PageLoader />;
  
  return (
    <DataTable
      columns={columns}
      data={students}
      onAdd={(data) => addMutation.mutate(data)}
    />
  );
}
```

---

# ⚠️ COMMON PITFALLS TO AVOID

1. **Forgetting to invalidate queries after mutations**
   - ❌ Bad: Create student but list doesn't update
   - ✅ Good: Invalidate ['students'] query on success

2. **Hardcoding API URLs**
   - ❌ Bad: `http://localhost:5000` in component
   - ✅ Good: Use `NEXT_PUBLIC_API_URL` from env

3. **Not handling loading/error states**
   - ❌ Bad: List appears empty while loading
   - ✅ Good: Show loading spinner, error message

4. **Timetable selector values leaking into payloads**
   - ❌ Bad: Sending 'all' or 'any' to API
   - ✅ Good: Normalize filter values before API call

5. **Enum mismatches between frontend and backend**
   - ❌ Bad: Frontend sends `published: true`, backend expects `is_published`
   - ✅ Good: Map enum values correctly

---

# 📞 DEPENDENCIES

- Backend APIs must be available and documented
- Database migrations applied
- Email service configured (for password reset, notifications)
- Cloud storage (AWS S3, Cloudinary, etc.) for file uploads
- Socket.io server running for real-time features

---

*Document Version: 1.0*  
*Last Updated: April 12, 2026*  
*Created by: Globium Clouds Dev Team*
