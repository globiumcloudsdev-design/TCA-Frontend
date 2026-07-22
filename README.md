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
| Socket.io-client | Real-time notifications & Live System Health |
| Recharts | Dashboard charts |
| next-themes | Dark mode |
| react-hot-toast | Toast notifications |
| html2canvas & jspdf | ID Card & Fee Voucher PDF Generation |
| jsbarcode | Barcode Generation for ID Cards |

---

## Getting Started

```bash
cd Frontend
npm install
cp .env.example .env.local   # fill in your API URL
npm run dev
```

Open http://localhost:3000 (or whatever port Next.js assigns).

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/               # Login, forgot-password, reset-password
│   ├── (school)/             # School portal (dashboard, students, teachers…)
│   └── (master-admin)/       # Master Admin portal
├── components/
│   ├── Providers.jsx         # QueryClient + ThemeProvider + Toaster
│   ├── layout/               # Sidebar, Navbar, etc.
│   ├── shared/               # UI Primitives, DataTables
│   ├── modals/               # Reusable Form & Action Modals
│   └── pages/                # Complex Page Components
├── constants/
│   └── index.js              # PERMISSIONS, nav items, enums
├── hooks/                    # Custom React Hooks
├── lib/
│   ├── api.js                # Axios instance
│   ├── auth.js               # Cookie helpers
│   └── idCardGenerator.js    # PDF Generation Logic
├── services/                 # API Service Layer
├── store/                    # Zustand Stores
└── middleware.js             # Route protection
```

---

## Auth Flow

1. User hits `/login` → submits school_code + email + password.
2. Backend returns `{ user, access_token }` + sets httpOnly `refresh_token` cookie.
3. `authService.login()` → `setUser(user, token)` in authStore.
4. `authStore.setUser` writes access_token to a plain cookie + school_code to localStorage.
5. `api.js` interceptor reads token from cookie and attaches `Authorization` header.
6. On 401 → interceptor calls `/auth/refresh` → retries original requests.

## Role System

| Role | Access |
|---|---|
| `MASTER_ADMIN` | Static, full access to `/master-admin/*` only |
| `SYSTEM_ADMIN` / `SUPPORT_STAFF` | Specific platform-level management |
| School Users | Dynamic roles, permissions checked via `canDo('perm.code')` |

`PermissionGuard` component hides UI elements based on permissions.
Sidebar items auto-filter per permission from the internal catalogue.

## Branch Awareness

If `school.has_branches === true`:
- Branch selector is shown in the navbar.
- `uiStore.setActiveBranch(id, name)` updates localStorage.
- `api.js` interceptor reads `X-Branch-ID` from localStorage and attaches it to every request.

---

## Implemented Modules & Features

✅ **Master Admin Hub**
- Multi-tenant school & institute management
- Subscription plans, trial extensions, and invoicing
- Platform users (System Admin, Support Staff) management
- Live system health and database statistics (Socket.io)
- Global CMS & Settings management

✅ **Branch Admin Dashboard**
- Comprehensive analytics & charts
- Real-time student & staff statistics
- Attendance and revenue tracking

✅ **Academics & Operations**
- Student admissions, directory, and document handling
- Staff onboarding, roles, and payroll
- Class, Section, and Subject mapping
- Dynamic Timetable scheduling
- Attendance modules (Auto-absent, granular editing)
- Exam creation, marks entry, and Mark Sheet PDF generation
- Fee voucher generation, payment processing, and summaries

✅ **System Integrations**
- Dynamic Student/Staff ID Cards (QR Code & Barcode support via Settings)
- PDF Exports (Mark sheets, Vouchers, ID Cards)
- Granular permission-based route protection
