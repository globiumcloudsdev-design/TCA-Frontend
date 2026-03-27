# Full Frontend Feature Analysis

Generated on: 2026-03-26
Scope: `Frontend/src/app`, `Frontend/src/components/pages`, portal shell/navigation and route groups.

## 1. High-Level Architecture

- Framework: Next.js App Router (`src/app` route groups + role portals).
- UI pattern:
  - Institute and school admin areas mostly use reusable page components from `src/components/pages/*`.
  - Teacher/Student/Parent use dedicated portal pages under `src/app/teacher`, `src/app/student`, `src/app/parent`.
- Access pattern:
  - Institute route-group guard in `(institute)/layout.js` handles token/user type redirects.
  - Portal layout wrappers use `PortalShell` with role-based nav/permissions.
  - Master-admin has separate layout + permission-filtered menu.

## 2. Route Inventory (What Exists)

### 2.1 Auth + Public

Available:
- `/` landing/home
- `/login`
- `/forgot-password`
- `/reset-password/[token]`
- `/portal-login`
- Global not-found page

### 2.2 Institute Admin (Dynamic by Type)

Base route group: `/(institute)/[type]/...`
Supported types in routes: `school`, `coaching`, `academy`, `college`, `university`, `tuition_center`

Available pages:
- `dashboard`
- `academic-years`
- `admissions`
- `attendance`
- `batches`
- `branches`
- `classes`
- `courses`
- `departments`
- `exams`
- `faculties`
- `fee-templates`
- `fees`
- `notices`
- `parents`
- `payroll`
- `programs`
- `reports`
- `research`
- `roles`
- `sections`
- `semesters`
- `settings`
- `staff`
- `staff-attendance`
- `students`
- `students/add`
- `students/[id]`
- `students/[id]/edit`
- `subjects`
- `teachers`
- `timetable`
- `users`

### 2.3 School Legacy/Parallel Group

Also present under `/(school)/...`:
- academic-years, admissions, attendance, branches, classes, dashboard, exams, fee-templates, fees, notices, parents, payroll, reports, roles, sections, settings, staff-attendance, students, subjects, teachers, timetable, users

Note:
- This appears to be a parallel/legacy route set in addition to `/(institute)/[type]` dynamic routes.

### 2.4 Master Admin

Available:
- `/master-admin`
- `/master-admin/roles`
- `/master-admin/subscription-templates`
- `/master-admin/schools`
- `/master-admin/institutes`
- `/master-admin/institutes/[id]`
- `/master-admin/subscriptions`
- `/master-admin/emails`
- `/master-admin/reports`
- `/master-admin/notifications`
- `/master-admin/users`

### 2.5 Teacher Portal

Available:
- `/teacher` (overview/dashboard)
- `/teacher/classes`
- `/teacher/students`
- `/teacher/timetable`
- `/teacher/notes`
- `/teacher/assignments`
- `/teacher/homework`
- `/teacher/attendance`
- `/teacher/announcements`

### 2.6 Student Portal

Available:
- `/student` (overview)
- `/student/attendance`
- `/student/timetable`
- `/student/syllabus`
- `/student/assignments`
- `/student/homework`
- `/student/notes`
- `/student/exams`
- `/student/fees`
- `/student/announcements`

### 2.7 Parent Portal

Available:
- `/parent` (overview)
- `/parent/attendance`
- `/parent/results`
- `/parent/fees`
- `/parent/announcements`

## 3. Core Feature Surface by Role

## 3.1 Institute Admin / Staff (via `components/pages`)

Primary reusable page components found:
- `DashboardPage`
- `StudentsPage`, `StudentAddEditPage`, `StudentDetailPage`
- `TeachersPage`, `StaffPage`, `ParentsPage`, `UsersPage`
- `ClassesPage`, `SectionsPage`, `SubjectsPage`, `TimetablePage`
- `AdmissionsPage`, `AttendancePage`, `StaffAttendancePage`, `ExamsPage`
- `FeesPage`, `FeeTemplatesPage`, `PayrollPage`
- `AcademicYearsPage`, `SemestersPage`, `ProgramsPage`, `FacultiesPage`, `DepartmentsPage`, `ResearchPage`, `Courses` route support
- `BranchesPage`
- `RolesPage`, `SettingsPage`, `NoticesPage`, `ReportsPage`

What this indicates:
- Full ERP-style modules are scaffolded and connected at route level.
- Multi-institute-type adaptability exists via institute config and dynamic `[type]` route.

Potentially partial/inconsistent:
- Duplicate route systems `/(school)` and `/(institute)/[type]` may create maintenance drift.
- Recent user edits on key pages (`FeeTemplatesPage`, `StaffPage`, `ClassesPage`, `AcademicYearsPage`) suggest active changes and possible instability/ongoing refactors.

## 3.2 Master Admin

Visible menu-driven capabilities:
- Platform dashboard
- Role management
- Subscription templates
- Institute/school management
- Subscription/invoice monitoring
- Bulk email history/sending area
- Platform reports
- Broadcast notifications

Strengths:
- Permission-filtered navigation in layout.
- Dedicated module routes for institute details and subscription templates.

Potential gaps:
- Users menu item in layout is commented in one place while route exists (`/master-admin/users`), signaling possible UX mismatch.

## 3.3 Teacher Portal

Feature set currently implemented (route + page level):
- Overview/dashboard
- My classes and students
- Timetable
- Notes / study material management
- Assignment management
- Homework management
- Attendance marking
- Announcements

Recent strong implementations (based on current portal pages):
- Attachment viewing workflows for notes/assignments/homework.
- Edit/create modal flows with class/section/subject selection.

Current risk area:
- Section resolution and persistence had multiple iterative fixes recently; should be considered sensitive and regression-prone.

## 3.4 Student Portal

Implemented modules:
- Overview
- Attendance
- Timetable
- Syllabus
- Assignments
- Homework
- Notes
- Exams
- Fees
- Announcements

Indicates good learner-facing coverage for academics + finance visibility.

## 3.5 Parent Portal

Implemented modules:
- Overview
- Child attendance
- Results
- Fees
- Announcements

Compared to student portal, parent portal is intentionally smaller and monitoring-oriented.

## 4. Navigation & Permission Model

Observed:
- `PortalShell` builds role-specific nav menus.
- Permission constants are used to filter/enable entries.
- `(institute)/layout.js` performs role redirection:
  - `STUDENT` -> `/student`
  - `PARENT` -> `/parent`
  - `TEACHER` -> `/teacher`
  - `STAFF` stays in institute area

Risk notes:
- There is commented legacy code and evolved current code inside `PortalShell.jsx`; cleanup would improve maintainability.
- Inconsistent naming in some areas (`schools` vs `institutes`) can confuse operational flows.

## 5. Feature Presence Matrix (Quick View)

Legend:
- `Yes`: route + page present
- `Partial`: present but likely evolving/inconsistent
- `No`: not found in current route/page scan

| Feature Area | Institute Admin | Master Admin | Teacher | Student | Parent |
|---|---|---|---|---|---|
| Dashboard | Yes | Yes | Yes | Yes | Yes |
| User/Role Management | Yes | Yes | No | No | No |
| Student Management | Yes | No | Partial (view-focused) | Self only | Child monitoring |
| Teacher/Staff Management | Yes | No | No | No | No |
| Classes/Sections/Subjects | Yes | No | Partial (classes view) | No | No |
| Attendance | Yes | No | Yes | Yes | Yes |
| Assignments | Partial (academic ops) | No | Yes | Yes | No |
| Homework | Partial | No | Yes | Yes | No |
| Notes/Study Material | Partial | No | Yes | Yes | No |
| Timetable | Yes | No | Yes | Yes | No |
| Exams/Results | Yes | Platform reports | No direct module | Yes | Yes |
| Fees | Yes | Subscription/billing platform level | No | Yes | Yes |
| Payroll | Yes | No | No | No | No |
| Admissions | Yes | No | No | No | No |
| Notifications/Notices | Yes | Yes | Yes | Yes | Yes |
| Reports | Yes | Yes | No dedicated route | No dedicated route | No dedicated route |
| Branches/Multi-campus | Yes | Institute-level | No | No | No |

## 6. What Exists vs Missing (By Domain)

### 6.1 Clearly Available (Strong Coverage)

- Institute ERP core modules (students, teachers, classes, fees, attendance, exams, timetable, notices, reports).
- Full role-based portals for teacher/student/parent.
- Master-admin governance modules with subscriptions, roles, reports, and notifications.

### 6.2 Likely Missing or Not Clearly Implemented End-to-End

- Unified route strategy (duplicate `/(school)` + `/(institute)/[type]` can cause duplicate code paths).
- Teacher analytics/reporting pages (no dedicated teacher report route found).
- Parent-side timetable/assignment deep tracking (not found as explicit routes).
- Explicit audit/health dashboards for portal data consistency (not found as dedicated module).

### 6.3 Areas that appear Partially Implemented / Volatile

- Section linkage in teacher create/update flows (recently fixed repeatedly).
- Some master-admin nav-route parity (users menu comment vs route exists).
- Mixed old/new code blocks in portal shell component (commented blocks + active implementation).

## 7. Technical Quality Observations

Strengths:
- Good modularization through `components/pages` for institute admin.
- Clean role split in app routing.
- Use of React Query and centralized services in key areas.
- Permission-aware nav patterns are in place.

Risks:
- Inconsistent or duplicate routing layers increase regression risk.
- Heavy ongoing edits in operational pages suggest need for stronger integration tests.
- Some pages likely rely on data shape variants (`id` vs `section_id`, etc.), requiring robust normalization.

## 8. Recommended Next Improvements (Priority)

1. Route consolidation:
- Decide single source between `/(school)` and `/(institute)/[type]` and deprecate one.

2. PortalShell cleanup:
- Remove dead commented blocks and keep one authoritative nav/permission implementation.

3. Section consistency hardening:
- Standardize section shape across UI and APIs (`id`, `name`) with strict schema checks.

4. Feature parity matrix as CI artifact:
- Auto-generate route-to-component audit on build to catch missing modules early.

5. End-to-end tests for high-risk workflows:
- Teacher create/update note/assignment/homework with class+section switching.

## 9. Conclusion

Frontend is feature-rich and close to a full education ERP + role portals stack.

- Institute admin: very broad module coverage.
- Master admin: solid platform governance coverage.
- Teacher/student/parent portals: practical and meaningful coverage.

Main current challenge is not missing breadth; it is consistency and stabilization across overlapping routes and evolving workflows (especially class-section data flows).
