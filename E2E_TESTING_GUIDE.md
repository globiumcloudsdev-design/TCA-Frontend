# The Clouds Academy (TCA) — End-to-End (E2E) Testing Guide

Comprehensive End-to-End (E2E) testing framework built with [Playwright](https://playwright.dev/) for Next.js 15 App Router architecture.

---

## 1. Quick Start

### Run all E2E tests (Headless)
```bash
npm run test:e2e
```

### Run tests on Chromium only
```bash
npm run test:e2e:chromium
```

### Run tests in Interactive UI Mode (Time Travel & Locator Picker)
```bash
npm run test:e2e:ui
```

### Run tests in Headed Mode (Watch browsers open)
```bash
npm run test:e2e:headed
```

### View HTML Test Report
```bash
npm run test:e2e:report
```

---

## 2. Directory Structure

```
TCA-Frontend/
├── playwright.config.js               # Global Playwright configuration
├── .github/workflows/e2e.yml          # GitHub Actions CI/CD pipeline
│
└── e2e/
    ├── fixtures/
    │   ├── auth.fixture.js            # Role-based auth contexts & state hydration
    │   ├── api-mock.fixture.js        # API mock interceptors for deterministic runs
    │   └── test-data.js               # Canonical mock entities (Users, Classes, Fees, etc.)
    │
    ├── pages/                         # Page Object Model (POM) layer
    │   ├── BasePage.js                # Common helpers & assertions
    │   ├── LandingPage.js             # Marketing & public site POM
    │   ├── AuthPage.js                # Login, Forgot, Reset Password POM
    │   ├── PortalLoginPage.js         # Unified portal login POM
    │   ├── SchoolDashboardPage.js     # School Admin dashboard POM
    │   ├── StudentsPage.js            # Student management & DataTable POM
    │   ├── TeachersPage.js            # Teacher management POM
    │   ├── AcademicPages.js           # Classes, Sections, Exams, Timetable, Notices POMs
    │   ├── AttendancePage.js          # Student & Staff Attendance POM
    │   ├── FeesPage.js                # Fees, Invoices, Templates & Payroll POM
    │   ├── SettingsPage.js            # Institute settings & roles POM
    │   ├── MasterAdminPage.js         # Master Admin portal POM
    │   └── PortalPages.js             # Teacher, Student & Parent portal POMs
    │
    └── suites/                        # 17 Comprehensive Test Suites
        ├── 01-landing-and-public.spec.js
        ├── 02-auth-and-login.spec.js
        ├── 03-middleware-and-security.spec.js
        ├── 04-school-dashboard.spec.js
        ├── 05-students-management.spec.js
        ├── 06-teachers-management.spec.js
        ├── 07-academic-structure.spec.js
        ├── 08-attendance-system.spec.js
        ├── 09-fees-and-finance.spec.js
        ├── 10-exams-and-grading.spec.js
        ├── 11-communication-and-notices.spec.js
        ├── 12-settings-and-roles.spec.js
        ├── 13-master-admin.spec.js
        ├── 14-teacher-portal.spec.js
        ├── 15-student-portal.spec.js
        ├── 16-parent-portal.spec.js
        └── 17-cross-cutting-ui-ux.spec.js
```

---

## 3. Test Suites Overview

| # | Suite | Description |
|---|-------|-------------|
| 01 | `01-landing-and-public` | Marketing site, hero section, CTA buttons, feature tabs, pricing, FAQs, responsive navbar |
| 02 | `02-auth-and-login` | School admin login, quick credentials autofill, password toggle, forgot/reset password, portal login |
| 03 | `03-middleware-and-security` | Next.js Edge Middleware route guards, unauthorized redirects, role boundaries, login bypass |
| 04 | `04-school-dashboard` | KPI stat cards, charts (Attendance, Fees, Enrollment), branch switcher, notification bell, user menu |
| 05 | `05-students-management` | Students DataTable, search filter, add student page/modal, student profile, promotion workflow |
| 06 | `06-teachers-management` | Teachers table, search filter, add teacher dialog, staff members view |
| 07 | `07-academic-structure` | Classes, sections, academic years, curriculum subjects, weekly timetable grid |
| 08 | `08-attendance-system` | Student daily attendance, QR scanner camera interface, staff attendance |
| 09 | `09-fees-and-finance` | Fee collections, invoice records, fee templates, payroll generator, expense log |
| 10 | `10-exams-and-grading` | Exam schedule list, create exam dialog, marks entry sheet, reports view |
| 11 | `11-communication-and-notices` | Notice board broadcast, event calendar, admission applications, parents directory |
| 12 | `12-settings-and-roles` | School profile, academic timings, modules toggles, roles matrix, branches, system users |
| 13 | `13-master-admin` | Master Admin overview, subscribed institutes, subscription tiers, global users, CMS branding |
| 14 | `14-teacher-portal` | Teacher dashboard, assigned classes, students roster, take attendance, homework, notes |
| 15 | `15-student-portal` | Student dashboard, attendance breakdown, fee vouchers, exam results, timetable |
| 16 | `16-parent-portal` | Parent overview, child attendance tracking, fee receipts, report cards, announcements |
| 17 | `17-cross-cutting-ui-ux` | 404 page recovery, theme persistence (Dark/Light), mobile hamburger drawer |

---

## 4. Auth Fixtures & Role Testing

Use the pre-configured role fixtures in tests to automatically inject authentication cookies and Zustand state:

```javascript
import { test, expect } from '../fixtures/auth.fixture.js';

// Test as School Admin
test('Admin flow', async ({ schoolAdminPage }) => {
  await schoolAdminPage.goto('/school/dashboard');
});

// Test as Master Admin
test('Master flow', async ({ masterAdminPage }) => {
  await masterAdminPage.goto('/master-admin');
});

// Test as Teacher
test('Teacher flow', async ({ teacherPortalPage }) => {
  await teacherPortalPage.goto('/teacher');
});

// Test as Student
test('Student flow', async ({ studentPortalPage }) => {
  await studentPortalPage.goto('/student');
});

// Test as Parent
test('Parent flow', async ({ parentPortalPage }) => {
  await parentPortalPage.goto('/parent');
});
```

---

## 5. Continuous Integration (CI/CD)

The project includes `.github/workflows/e2e.yml` which automatically:
1. Installs Node.js & dependencies
2. Downloads Playwright browsers with system dependencies
3. Executes test suites against the Next.js production build / dev server
4. Saves and uploads the HTML test reports as artifacts
