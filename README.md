# The Clouds Academy — Frontend

Next.js 15 (App Router, JavaScript) frontend for the school management SaaS platform.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 15 + App Router | Framework (JS only, no TypeScript) |
| Tailwind CSS | Styling |
| Radix UI / ShadCN-style | Component primitives |
| TanStack Query v5 | Server state / caching |
| Zustand v5 | Client state (auth + UI) |
| React Hook Form + Zod | Forms + validation |
| Axios | HTTP client with auto token refresh |
| Socket.io-client | Real-time notifications |
| Recharts | Dashboard charts |
| next-themes | Dark mode |
| react-hot-toast | Toast notifications |

---

## Getting Started

```bash
cd Frontend
npm install
cp .env.example .env.local   # fill in your API URL
npm run dev
```

Open http://localhost:3001 (or whatever port Next.js assigns).

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/               # Login, forgot-password, reset-password
│   ├── (school)/             # School portal (dashboard, students, teachers…)
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── attendance/
│   │   ├── exams/
│   │   ├── fees/
│   │   ├── academic-years/
│   │   ├── roles/
│   │   ├── users/
│   │   └── settings/
│   └── (master-admin)/       # Master Admin portal
│       └── master-admin/
│           ├── page.js       → /master-admin
│           └── schools/
├── components/
│   ├── Providers.jsx          # QueryClient + ThemeProvider + Toaster
│   ├── layout/
│   │   ├── Sidebar.jsx        # Permission-aware school sidebar
│   │   └── Navbar.jsx         # Top bar with notifications + logout
│   └── shared/
│       ├── PermissionGuard.jsx
│       ├── LoadingSpinner.jsx
│       ├── EmptyState.jsx
│       ├── Pagination.jsx
│       └── StatusBadge.jsx
├── constants/
│   └── index.js               # PERMISSIONS, SCHOOL_NAV, enums
├── hooks/
│   ├── useAuth.js
│   ├── usePermission.js
│   ├── useSocket.js
│   ├── usePagination.js
│   └── useConfirm.js
├── lib/
│   ├── api.js                 # Axios instance (auto token refresh)
│   ├── auth.js                # Cookie/localStorage helpers
│   ├── queryClient.js
│   └── utils.js
├── services/                  # One file per backend resource
│   ├── index.js               # Central export
│   ├── authService.js
│   ├── studentService.js
│   ├── teacherService.js
│   ├── classService.js        # also exports sectionService
│   ├── attendanceService.js
│   ├── examService.js
│   ├── feeService.js
│   ├── roleService.js
│   ├── schoolService.js
│   ├── userService.js
│   ├── academicYearService.js
│   ├── dashboardService.js
│   └── notificationService.js
├── store/
│   ├── authStore.js           # Zustand persisted auth
│   └── uiStore.js             # Zustand persisted UI (sidebar, branch, year)
└── middleware.js              # Next.js route protection
```

---

## Auth Flow

1. User hits `/login` → submits school_code + email + password
2. Backend returns `{ user, access_token }` + sets httpOnly `refresh_token` cookie
3. `authService.login()` → `setUser(user, token)` in authStore
4. `authStore.setUser` writes access_token to a plain cookie + school_code to localStorage
5. `api.js` interceptor reads token from cookie and attaches `Authorization` header
6. On 401 → interceptor calls `/auth/refresh` → retries original requests

## Role System

| Role | Access |
|---|---|
| `MASTER_ADMIN` | Static, full access to `/master-admin/*` only |
| School Users | Dynamic roles, permissions checked via `canDo('perm.code')` |

`PermissionGuard` component hides UI elements based on permissions.
Sidebar items auto-filter per permission from `SCHOOL_NAV`.

## Branch Awareness

If `school.has_branches === true`:
- Branch selector should be shown in the navbar
- `uiStore.setActiveBranch(id, name)` updates localStorage
- `api.js` interceptor reads `X-Branch-ID` from localStorage and attaches it to every request

---

## What's Left (Future Work)

- [ ] All detail/edit pages (`/students/:id`, `/teachers/:id`, etc.)
- [ ] Form components (StudentForm, TeacherForm, FeeVoucherForm, ExamForm…)
- [ ] Branch selector UI in Navbar (when `has_branches` is true)
- [ ] Academic Year context banner (showing active year)
- [ ] Dashboard charts with Recharts (attendance %, fee collection)
- [ ] Role management UI (permission checkbox matrix)
- [ ] Bulk attendance marking page
- [ ] Fee voucher PDF download
- [ ] Exam result entry grid
- [ ] Dark mode toggle
- [ ] Mobile-responsive sidebar (drawer)
- [ ] Master Admin: school detail, subscription management pages
- [ ] Socket.io notification dropdown UI
