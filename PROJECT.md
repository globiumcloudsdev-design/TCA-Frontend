# The Clouds Academy (TCA) — Full Project Documentation

> **Version:** Phase 1–14 Complete (Frontend)  
> **Framework:** Next.js 15 (App Router)  
> **GitHub:** https://github.com/globiumcloudsdev-design/The-Clouds-Academy  
> **Deployment:** Vercel (`npm install --legacy-peer-deps` via `vercel.json`)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Route Map — All Pages](#4-route-map--all-pages)
5. [Role-Based Access Control](#5-role-based-access-control)
6. [Portal System](#6-portal-system)
7. [Component Library](#7-component-library)
8. [State Management & Stores](#8-state-management--stores)
9. [Middleware & Route Protection](#9-middleware--route-protection)
10. [Data Layer (Dummy Data)](#10-data-layer-dummy-data)
11. [Demo Credentials](#11-demo-credentials)
12. [Deployment Configuration](#12-deployment-configuration)
13. [What's Done vs Pending](#13-whats-done-vs-pending)
14. [Phase-by-Phase Summary](#14-phase-by-phase-summary)

---

## 1. Project Overview

**The Clouds Academy (TCA)** is a multi-tenant School Management SaaS built with Next.js 15. It supports:

- **Multiple Schools** managed under a single Master Admin
- **Branch-level administration** (one school can have multiple branches)
- **Role-scoped dashboards** for school staff (Branch Admin, Teachers, Accountant, Receptionist)
- **Three separate portals** for Parents, Students, and Teachers with their own login and protected routes
- **Fully responsive landing page** for marketing

The frontend is 100% complete as a static/mock-data application ready for real API integration.

---

## 2. Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v3 |
| UI Components | shadcn/ui |
| State Management | Zustand (with persist) |
| Tables | TanStack Table v8 (via DataTable) |
| Forms | react-hook-form + zod |
| Date Handling | date-fns |
| Charts | Recharts |
| Notifications | Sonner (toast) |
| Auth Cookies | js-cookie |
| Data Fetching | @tanstack/react-query (wired up, API pending) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 3. Folder Structure

```
Frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/                          # Auth route group
│   │   │   ├── layout.js
│   │   │   ├── login/page.js
│   │   │   ├── forgot-password/page.js
│   │   │   └── reset-password/page.js
│   │   │
│   │   ├── (school)/                        # School Admin route group
│   │   │   ├── layout.js
│   │   │   ├── dashboard/page.js
│   │   │   ├── students/page.js
│   │   │   ├── teachers/page.js
│   │   │   ├── attendance/page.js
│   │   │   ├── fees/page.js
│   │   │   ├── exams/page.js
│   │   │   ├── classes/page.js
│   │   │   ├── branches/page.js
│   │   │   ├── users/page.js
│   │   │   ├── roles/page.js
│   │   │   ├── settings/page.js
│   │   │   └── academic-years/page.js
│   │   │
│   │   ├── (master-admin)/                  # Master Admin route group
│   │   │   ├── layout.js
│   │   │   └── master-admin/
│   │   │       ├── page.js
│   │   │       ├── schools/
│   │   │       ├── subscriptions/
│   │   │       ├── subscription-templates/
│   │   │       └── users/
│   │   │
│   │   ├── parent/                          # Parent Portal
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   ├── attendance/page.jsx
│   │   │   ├── fees/page.jsx
│   │   │   ├── results/page.jsx
│   │   │   └── announcements/page.jsx
│   │   │
│   │   ├── student/                         # Student Portal
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   ├── attendance/page.jsx
│   │   │   ├── fees/page.jsx
│   │   │   ├── exams/page.jsx
│   │   │   ├── timetable/page.jsx
│   │   │   └── announcements/page.jsx
│   │   │
│   │   ├── teacher/                         # Teacher Portal
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   ├── classes/page.jsx
│   │   │   ├── students/page.jsx
│   │   │   ├── notes/page.jsx
│   │   │   ├── assignments/page.jsx
│   │   │   ├── homework/page.jsx
│   │   │   ├── attendance/page.jsx
│   │   │   └── announcements/page.jsx
│   │   │
│   │   ├── portal-login/page.jsx            # Unified portal login
│   │   ├── page.js                          # Landing page
│   │   ├── layout.js                        # Root layout
│   │   └── not-found.js                     # 404 page
│   │
│   ├── components/
│   │   ├── common/                          # Reusable app-wide components (29 files)
│   │   ├── charts/                          # Recharts wrappers (4 charts)
│   │   ├── forms/                           # Form section components
│   │   ├── landing/                         # Landing page sections (11 components)
│   │   ├── layout/                          # Navbar + Sidebar
│   │   ├── portal/                          # PortalShell (shared portal layout)
│   │   ├── shared/                          # Cross-portal shared components
│   │   └── ui/                              # shadcn/ui primitives
│   │
│   ├── data/
│   │   ├── dummyData.js                     # School admin dummy data
│   │   └── portalDummyData.js               # Portal dummy data (parent/student/teacher)
│   │
│   ├── store/
│   │   ├── authStore.js                     # Auth state (token, user, role)
│   │   ├── portalStore.js                   # Portal auth state (persisted)
│   │   └── uiStore.js                       # UI state (sidebar open/close, theme)
│   │
│   └── middleware.js                        # Edge middleware — route protection
│
├── .gitignore
├── vercel.json
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## 4. Route Map — All Pages

### 4.1 Public / Static Pages

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `app/page.js` | Static | Landing page — marketing site |
| `/login` | `(auth)/login/page.js` | Static | School staff login |
| `/forgot-password` | `(auth)/forgot-password/page.js` | Static | Password reset request |
| `/reset-password` | `(auth)/reset-password/page.js` | Static | New password entry |
| `/portal-login` | `portal-login/page.jsx` | Static | Unified portal login (Parent / Student / Teacher) |

### 4.2 School Admin Pages — Dynamic (Role-Protected)

All routes under `(school)/` are protected by `access_token` cookie + `role_code` check.

| Route | Type | Description | Access |
|-------|------|-------------|--------|
| `/dashboard` | Dynamic | KPI cards, charts, recent activity | All roles |
| `/students` | Dynamic | Student list, CRUD, class filter, DataTable | Branch Admin, Receptionist |
| `/teachers` | Dynamic | Teacher list, CRUD, DataTable | Branch Admin |
| `/attendance` | Dynamic | Daily attendance tracking, reports | Branch Admin, Teacher |
| `/fees` | Dynamic | Fee collection, invoices, status tracking | Branch Admin, Accountant |
| `/exams` | Dynamic | Exam scheduling, result entry | Branch Admin, Teacher |
| `/classes` | Dynamic | Class sections, assign teachers | Branch Admin |
| `/branches` | Dynamic | Branch management (multi-campus) | Branch Admin |
| `/users` | Dynamic | Staff user accounts | Branch Admin |
| `/roles` | Dynamic | Role definitions and permissions | Branch Admin |
| `/settings` | Dynamic | School profile, branding, config | Branch Admin |
| `/academic-years` | Dynamic | Academic year management | Branch Admin |

### 4.3 Master Admin Pages — Dynamic (MASTER_ADMIN only)

| Route | Description |
|-------|-------------|
| `/master-admin` | Overview dashboard |
| `/master-admin/schools` | Manage all schools |
| `/master-admin/subscriptions` | Active subscriptions |
| `/master-admin/subscription-templates` | Plan templates |
| `/master-admin/users` | Global user management |

### 4.4 Parent Portal — Dynamic (portal_type: PARENT)

| Route | Description |
|-------|-------------|
| `/parent` | Dashboard — child overview, announcements summary |
| `/parent/attendance` | Child attendance records |
| `/parent/fees` | Fee status, history, dues |
| `/parent/results` | Exam results and report card |
| `/parent/announcements` | School announcements |

### 4.5 Student Portal — Dynamic (portal_type: STUDENT)

| Route | Description |
|-------|-------------|
| `/student` | Dashboard — quick stats, upcoming exams |
| `/student/attendance` | Personal attendance record |
| `/student/fees` | Fee dues and payment history |
| `/student/exams` | Exam schedule and results |
| `/student/timetable` | Weekly class timetable |
| `/student/announcements` | School announcements |

### 4.6 Teacher Portal — Dynamic (portal_type: TEACHER)

| Route | Description |
|-------|-------------|

| `/teacher` | Dashboard — classes summary, today's schedule |
| `/teacher/classes` | Assigned classes list |
| `/teacher/students` | Students in assigned classes (DataTable, searchable) |
| `/teacher/notes` | Lecture notes — create, list (AppModal form) |
| `/teacher/assignments` | Assignment management (AppModal form with shadcn components) |
| `/teacher/homework` | Homework management (AppModal form with dual date pickers) |
| `/teacher/attendance` | Take/view attendance per class |
| `/teacher/announcements` | Class announcements |

---

## 5. Role-Based Access Control

### School Staff Roles

| Role Code | Display Name | Access |
|-----------|-------------|--------|
| `MASTER_ADMIN` | Master Administrator | Everything + `/master-admin/*` |
| `BRANCH_ADMIN` | Branch Admin / Principal | All school admin pages |
| `TEACHER` | Teacher | Dashboard, Attendance, Exams |
| `ACCOUNTANT` | Accountant | Dashboard, Fees |
| `RECEPTIONIST` | Receptionist | Dashboard, Students |

### How it Works

1. On login → server returns `access_token` + user object with `role_code`
2. Cookie `access_token` is set via js-cookie
3. `middleware.js` checks `access_token` for all `(school)/*` and `(master-admin)/*` routes
4. `role_code === 'MASTER_ADMIN'` is required for `/master-admin` routes
5. Sidebar navigation items are filtered by role on the client

### Portal Auth (Separate System)

Portals use a separate cookie pair:

| Cookie | Value |
|--------|-------|
| `portal_token` | JWT from portal login |
| `portal_type` | `PARENT` \| `STUDENT` \| `TEACHER` |

Middleware enforces that:
- `/parent/*` → only `portal_type === 'PARENT'`
- `/student/*` → only `portal_type === 'STUDENT'`
- `/teacher/*` → only `portal_type === 'TEACHER'`
- Any mismatch → redirect to `/portal-login`

---

## 6. Portal System

### Shared Architecture

All three portals share a single `PortalShell.jsx` component that provides:
- Top navigation bar with portal branding (color-coded)
- Mobile hamburger menu
- User info from `portalStore`
- Logout button (clears cookies + store)

### Portal Color Themes

| Portal | Accent Color | Tailwind Class |
|--------|-------------|----------------|
| Parent | Indigo | `indigo-600` |
| Student | Emerald | `emerald-600` |
| Teacher | Sky/Blue | `sky-600` / `blue-600` |

### Portal Login Flow

1. User visits `/portal-login`
2. Selects portal type (Parent / Student / Teacher)
3. Enters email + password
4. On success: sets `portal_token` + `portal_type` cookies → redirect to portal home
5. Zustand `portalStore` persists user data across refreshes

---

## 7. Component Library

### 7.1 Common Components (`src/components/common/`)

29 reusable components used throughout the school admin and portals:

| Component | Purpose |
|-----------|---------|
| `DataTable.jsx` | Full-featured table with TanStack Table v8 — sorting, filtering, pagination |
| `DataTableToolbar.jsx` | Search bar + filter dropdowns for DataTable |
| `AppModal.jsx` | Dialog/modal wrapper (shadcn Dialog + custom header/footer) |
| `AppPagination.jsx` | Pagination controls |
| `AppBreadcrumb.jsx` | Breadcrumb navigation |
| `DatePickerField.jsx` | Calendar + Popover date picker (shadcn Calendar) |
| `ExportModal.jsx` | Export data to CSV/Excel modal |
| `ConfirmDialog.jsx` | Delete/action confirmation dialog |
| `EmptyState.jsx` | Empty list state with illustration |
| `ErrorAlert.jsx` | Error display component |
| `PageHeader.jsx` | Page title + action buttons row |
| `PageLoader.jsx` | Full-page loading spinner |
| `SectionHeader.jsx` | Section title + subtitle |
| `StatsCard.jsx` | KPI card with trend indicator |
| `StatusBadge.jsx` | Colored badge (active/inactive/pending etc.) |
| `SearchInput.jsx` | Debounced search input |
| `TableRowActions.jsx` | Edit/Delete action menu for table rows |
| `BranchSwitcher.jsx` | Branch selector in sidebar |
| `BranchInitializer.jsx` | Initializes branch context on load |
| `NotificationBell.jsx` | Notification icon with count badge |
| `UserMenu.jsx` | User avatar dropdown (profile/logout) |
| `ThemeToggle.jsx` | Dark/light mode toggle |
| `AvatarWithInitials.jsx` | Avatar fallback with name initials |
| `FormSubmitButton.jsx` | Submit button with loading state |
| `InputField.jsx` | react-hook-form wired Input |
| `SelectField.jsx` | react-hook-form wired Select |
| `TextareaField.jsx` | react-hook-form wired Textarea |
| `CheckboxField.jsx` | react-hook-form wired Checkbox |
| `SwitchField.jsx` | react-hook-form wired Switch |

### 7.2 Charts (`src/components/charts/`)

| Component | Chart Type | Used In |
|-----------|-----------|---------|
| `AttendanceChart.jsx` | Bar chart | Dashboard |
| `DonutChart.jsx` | Donut/Pie | Dashboard |
| `EnrollmentChart.jsx` | Line/Area | Dashboard |
| `FeesChart.jsx` | Bar chart | Dashboard |

### 7.3 Landing Page Components (`src/components/landing/`)

11 sections building the complete marketing landing page:

| Component | Section |
|-----------|---------|
| `Navbar.jsx` | Top navigation with mobile menu |
| `HeroSection.jsx` | Hero with headline, CTA, mockup image |
| `StatsSection.jsx` | Key numbers (schools, students, etc.) |
| `FeaturesSection.jsx` | Feature grid cards |
| `ModulesSection.jsx` | Module tabs with horizontal scroll on mobile |
| `PricingSection.jsx` | 3-tier pricing cards |
| `TestimonialsSection.jsx` | User testimonial carousel |
| `FAQSection.jsx` | Accordion FAQ |
| `CTASection.jsx` | Bottom CTA with contact info |
| `Footer.jsx` | Links, social, copyright |
| `LandingPage.jsx` | Assembles all sections |

### 7.4 Layout (`src/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `Navbar.jsx` | Top bar for school admin — notifications, user menu, branch switcher |
| `Sidebar.jsx` | Collapsible sidebar — role-filtered nav items |

### 7.5 Portal (`src/components/portal/`)

| Component | Purpose |
|-----------|---------|
| `PortalShell.jsx` | Shared shell layout for all 3 portals |

### 7.6 UI (shadcn/ui primitives)

Full shadcn component set installed including:
`Button`, `Input`, `Label`, `Select`, `Textarea`, `Calendar`, `Popover`, `Dialog`, `Badge`, `Accordion`, `Checkbox`, `Switch`, `Card`, `Table`, `DropdownMenu`, `Separator`, `Skeleton`, `Tooltip`, `Avatar`, `Sheet`, `Tabs`, `ScrollArea`, and more.

---

## 8. State Management & Stores

### `authStore.js` — School Staff Auth

```js
// State
{
  user: null,           // logged-in user object
  token: null,          // access_token string
  roleCode: null,       // 'BRANCH_ADMIN' | 'TEACHER' | etc.
  isAuthenticated: false
}
// Actions: login(), logout(), setUser()
```

### `portalStore.js` — Portal Auth (Persisted)

```js
// State (persisted to localStorage)
{
  portalUser: null,     // parent / student / teacher object
  portalType: null,     // 'PARENT' | 'STUDENT' | 'TEACHER'
  isAuthenticated: false
}
// Actions: loginPortal(), logoutPortal()
```

### `uiStore.js` — UI State

```js
// State
{
  sidebarOpen: true,    // sidebar collapsed/expanded
  theme: 'light'        // 'light' | 'dark'
}
// Actions: toggleSidebar(), setTheme()
```

---

## 9. Middleware & Route Protection

**File:** `src/middleware.js` (Next.js Edge Middleware)

### Protection Rules

| Route Pattern | Condition | Action |
|---------------|-----------|--------|
| `/_next/*`, `/api/*`, `*.ext` | Always | Pass through |
| `/parent/*` | No `portal_token` OR `portal_type !== 'PARENT'` | Redirect → `/portal-login` |
| `/student/*` | No `portal_token` OR `portal_type !== 'STUDENT'` | Redirect → `/portal-login` |
| `/teacher/*` | No `portal_token` OR `portal_type !== 'TEACHER'` | Redirect → `/portal-login` |
| `/(school)/*` | No `access_token` | Redirect → `/login` |
| `/(master-admin)/*` | `role_code !== 'MASTER_ADMIN'` | Redirect → `/dashboard` |
| `/login` | Has `access_token` | Redirect → `/dashboard` |
| `/portal-login` | Has valid `portal_token` | Redirect to correct portal home |

---

## 10. Data Layer (Dummy Data)

### `dummyData.js` — School Admin

Contains mock data for all school admin pages:
- Students list (20+ records with name, class, roll, fees status, attendance %)
- Teachers list (with subjects, classes, joining date)
- Fees records (invoices, dues, paid amounts)
- Attendance records (class-wise, date-wise)
- Exam schedules and results
- Classes and sections
- Branches (3 demo branches)
- Dashboard KPI numbers

### `portalDummyData.js` — Portals

Contains portal-specific mock data:
- Parent: child info, attendance summaries, fee status, exam results, announcements
- Student: personal info, attendance, exam schedule, timetable, fee dues
- Teacher: assigned classes, student lists, notes, assignments, homework entries

All dummy data is imported directly into page components. When API is ready, just replace the dummy imports with real API calls via react-query hooks.

---

## 11. Demo Credentials

### School Staff (Admin Panel)

| Email | Password | Role |
|-------|----------|------|
| `principal@tca.edu.pk` | `admin@123` | Branch Admin |
| `admin@tca.edu.pk` | `admin@123` | Branch Admin |
| `accountant@tca.edu.pk` | `admin@123` | Accountant |
| `receptionist@tca.edu.pk` | `admin@123` | Receptionist |

### Master Admin

| Email | Password | Role |
|-------|----------|------|
| `master@tca.edu.pk` | `master@123` | Master Admin |

### Parent Portal

| Email | Password |
|-------|----------|
| `parent@tca.edu.pk` | `parent@123` |
| `parent2@tca.edu.pk` | `parent@123` |

### Student Portal

| Email | Password |
|-------|----------|
| `ali@student.tca` | `student@123` |
| `fatima@student.tca` | `student@123` |

### Teacher Portal

| Email | Password |
|-------|----------|
| `hassan@teacher.tca` | `teacher@123` |
| `sana@teacher.tca` | `teacher@123` |

---

## 12. Deployment Configuration

### `vercel.json`

```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

**Why:** `vaul@0.9.9` (used by shadcn Drawer) has a peer dependency conflict with React 19. `--legacy-peer-deps` bypasses this during Vercel build.

### `.gitignore`

Standard Next.js `.gitignore` plus:
- `node_modules/`
- `.next/`
- `.env*.local`
- `*.log`

### Environment Variables (Required for Production)

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_NAME=The Clouds Academy
```

---

## 13. What's Done vs Pending

### ✅ Completed (Frontend — All 14 Phases)

#### Landing Page
- [x] Full responsive landing page (11 sections)
- [x] Mobile-first responsive design (all breakpoints)
- [x] Navbar with mobile hamburger menu

#### Auth Pages
- [x] Login page with form validation
- [x] Forgot password page
- [x] Reset password page

#### School Admin Panel
- [x] Role-scoped sidebar navigation
- [x] Dashboard with 4 charts + KPI cards
- [x] Students page — DataTable with search, filter, CRUD modals
- [x] Teachers page — DataTable with CRUD modals
- [x] Attendance page — daily attendance tracker
- [x] Fees page — invoice + fee tracking
- [x] Exams page — schedule + result management
- [x] Classes page — class/section management
- [x] Branches page — multi-branch management
- [x] Users page — staff user accounts
- [x] Roles page — role definitions
- [x] Settings page — school profile
- [x] Academic Years page

#### Master Admin Panel
- [x] Master admin dashboard
- [x] Schools management
- [x] Subscriptions management
- [x] Subscription templates
- [x] Global users

#### Parent Portal
- [x] Portal login (shared with Student + Teacher)
- [x] Parent dashboard
- [x] Attendance view
- [x] Fees view
- [x] Results view
- [x] Announcements view

#### Student Portal
- [x] Student dashboard
- [x] Attendance view
- [x] Fees view
- [x] Exams view
- [x] Timetable view
- [x] Announcements view

#### Teacher Portal
- [x] Teacher dashboard
- [x] Classes view
- [x] Students page with DataTable (searchable, class filter)
- [x] Notes page with AppModal form (shadcn Select + Textarea + file picker)
- [x] Assignments page with AppModal form (shadcn Select + Textarea + Calendar)
- [x] Homework page with AppModal form (dual date pickers)
- [x] Attendance page
- [x] Announcements page

#### Infrastructure
- [x] Zustand stores (auth, portal, ui)
- [x] Edge middleware (route protection for all portals + admin)
- [x] DataTable component (TanStack Table v8)
- [x] AppModal reusable wrapper
- [x] 29 common reusable components
- [x] shadcn/ui full component set
- [x] `.gitignore`
- [x] `vercel.json` (Vercel deployment fix)
- [x] Responsive landing page

---

### ⏳ Pending (API Integration — Backend Required)

#### Authentication
- [ ] Real JWT login API (`POST /auth/login`)
- [ ] Real portal login API (`POST /portal/login`)
- [ ] Token refresh logic
- [ ] Logout API call

#### School Admin CRUD APIs
- [ ] Students — GET list, POST create, PUT update, DELETE
- [ ] Teachers — GET list, POST create, PUT update, DELETE
- [ ] Attendance — GET records, POST mark attendance
- [ ] Fees — GET invoices, POST payment, GET dues
- [ ] Exams — GET schedule, POST results
- [ ] Classes — GET list, POST create
- [ ] Branches — GET list, POST create
- [ ] Users — GET list, POST invite, DELETE
- [ ] Roles — GET list, POST create
- [ ] Settings — GET config, PUT update
- [ ] Academic Years — GET list, POST create

#### Portal APIs
- [ ] Parent: child info, attendance, fees, results
- [ ] Student: personal data, timetable, exams
- [ ] Teacher: classes, student list, notes, assignments, homework

#### File Uploads
- [ ] Notes file attachment upload (`POST /notes/upload`)
- [ ] Teacher avatar upload
- [ ] School logo upload (Settings page)

#### Notifications
- [ ] Real notification bell with API
- [ ] Push notification setup (optional)

---

## 14. Phase-by-Phase Summary

| Phase | What Was Built |
|-------|---------------|
| 1–3 | Project setup, Next.js 15 config, Tailwind, shadcn install |
| 4–5 | Auth layout, Login/Forgot/Reset pages |
| 6–7 | School admin layout (Navbar + Sidebar), Dashboard page |
| 8–9 | Students, Teachers, Attendance, Fees pages |
| 10 | Exams, Classes, Branches, Settings, Academic Years |
| 11 | Users, Roles, Master Admin panel (5 pages) |
| 12 | Landing page — all 11 sections |
| 13 | Parent Portal + Student Portal (full flows) |
| 14 | Teacher Portal — 8 pages with DataTable + AppModal + shadcn forms |
| 14+ | Bug fixes (Calendar clash, Input import), responsive fixes, Vercel deployment fix, .gitignore |

---

## Notes for Backend Integration

When integrating the real API:

1. **Replace dummy data imports** in each page with `useQuery` / `useMutation` hooks
2. **Auth flow** — store the JWT from login response in `authStore` and set `access_token` cookie
3. **Portal flow** — set `portal_token` + `portal_type` cookies on portal login
4. **All forms** already use react-hook-form + zod — just wire `onSubmit` to `useMutation`
5. **DataTable** accepts any array via `data` prop — just pass API response data
6. **Error handling** — `ErrorAlert` component ready for API error display
7. **Loading states** — `PageLoader` + `FormSubmitButton` loading prop already built

---

*Documentation generated after Phase 14 completion.*  
*Project: The Clouds Academy SaaS — Frontend by Globium Clouds*
