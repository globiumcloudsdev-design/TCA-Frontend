/**
 * Playwright API Mock Fixture
 * Automatically intercepts backend API calls to provide robust, deterministic
 * responses for all portals, pages, modals, and CRUD operations.
 */
import {
  MOCK_USERS,
  MOCK_DASHBOARD_STATS,
  MOCK_STUDENTS,
  MOCK_TEACHERS,
  MOCK_CLASSES,
  MOCK_FEES,
  MOCK_EXAMS,
  MOCK_NOTICES,
} from './test-data.js';

export async function setupApiMocks(page) {
  // ── Auth Endpoints ────────────────────────────────────────────────
  await page.route('**/api/**/auth/login', async (route) => {
    const postData = route.request().postDataJSON() || {};
    const email = postData.email?.toLowerCase();

    let matchedUser = MOCK_USERS.schoolAdmin;
    if (email?.includes('admin@thecloudsacademy.com') || email?.includes('master')) {
      matchedUser = MOCK_USERS.masterAdmin;
    } else if (email?.includes('teacher')) {
      matchedUser = MOCK_USERS.teacher;
    } else if (email?.includes('student')) {
      matchedUser = MOCK_USERS.student;
    } else if (email?.includes('parent')) {
      matchedUser = MOCK_USERS.parent;
    } else if (email?.includes('shoaib') || email?.includes('accountant')) {
      matchedUser = MOCK_USERS.accountant;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        user: matchedUser,
        accessToken: 'mock-jwt-token-access-2026',
        refreshToken: 'mock-jwt-token-refresh-2026',
      }),
    });
  });

  await page.route('**/api/**/auth/portal-login', async (route) => {
    const postData = route.request().postDataJSON() || {};
    const type = postData.type || 'STUDENT';
    const user =
      type === 'STUDENT'
        ? MOCK_USERS.student
        : type === 'TEACHER'
        ? MOCK_USERS.teacher
        : MOCK_USERS.parent;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Portal login successful',
        user,
        accessToken: 'mock-portal-jwt-token-2026',
      }),
    });
  });

  await page.route('**/api/**/auth/forgot-password', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Password reset link sent to your email address.',
      }),
    });
  });

  await page.route('**/api/**/auth/reset-password/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Password has been reset successfully.',
      }),
    });
  });

  await page.route('**/api/**/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Logged out successfully' }),
    });
  });

  // ── Dashboard & Stats Endpoints ────────────────────────────────────
  await page.route('**/api/**/dashboard/institute**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: MOCK_DASHBOARD_STATS,
      }),
    });
  });

  await page.route('**/api/**/dashboard/master-admin**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          total_institutes: 18,
          active_subscriptions: 16,
          total_revenue: 12500000,
          pending_tickets: 4,
          institutes: [
            { id: '1', name: 'The Clouds Academy', type: 'school', plan: 'Enterprise', status: 'ACTIVE' },
            { id: '2', name: 'Horizon College', type: 'college', plan: 'Pro', status: 'ACTIVE' },
          ],
        },
      }),
    });
  });

  // ── Students Endpoints ─────────────────────────────────────────────
  await page.route('**/api/**/students**', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      const newStudent = {
        id: `std-${Date.now()}`,
        ...data,
        full_name: `${data.first_name || 'New'} ${data.last_name || 'Student'}`,
        status: 'ACTIVE',
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: newStudent, message: 'Student created successfully' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            rows: MOCK_STUDENTS,
            students: MOCK_STUDENTS,
            total: MOCK_STUDENTS.length,
            page: 1,
            limit: 10,
          },
        }),
      });
    }
  });

  // ── Teachers Endpoints ─────────────────────────────────────────────
  await page.route('**/api/**/teachers**', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const data = route.request().postDataJSON() || {};
      const newTeacher = {
        id: `teach-${Date.now()}`,
        ...data,
        full_name: `${data.first_name || 'New'} ${data.last_name || 'Teacher'}`,
        status: 'ACTIVE',
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: newTeacher, message: 'Teacher created successfully' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            rows: MOCK_TEACHERS,
            teachers: MOCK_TEACHERS,
            total: MOCK_TEACHERS.length,
          },
        }),
      });
    }
  });

  // ── Staff Endpoints ───────────────────────────────────────────────
  await page.route('**/api/**/staff**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          rows: [
            {
              id: 'staff-1',
              first_name: 'John',
              last_name: 'Staff',
              email: 'john.staff@school.com',
              phone: '1234567890',
              staff_type: 'ADMINISTRATIVE',
              is_active: true,
              role_name: 'Clerk',
            }
          ],
          total: 1,
          page: 1,
          totalPages: 1,
        },
      }),
    });
  });

  // ── Classes & Sections Endpoints ───────────────────────────────────
  await page.route('**/api/**/classes**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: MOCK_CLASSES,
      }),
    });
  });

  // ── Fees & Vouchers Endpoints ──────────────────────────────────────
  await page.route('**/api/**/fees**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          rows: MOCK_FEES,
          invoices: MOCK_FEES,
          total: MOCK_FEES.length,
        },
      }),
    });
  });

  // ── Exams Endpoints ────────────────────────────────────────────────
  await page.route('**/api/**/exams**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: MOCK_EXAMS,
      }),
    });
  });

  // ── Notices & Announcements Endpoints ──────────────────────────────
  await page.route('**/api/**/notices**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: MOCK_NOTICES,
      }),
    });
  });

  await page.route('**/api/**/notifications**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          { id: 'notif-1', title: 'New Announcement', message: 'School starts at 8 AM', read: false },
        ],
      }),
    });
  });

  // ── Generic Fallback for /api/* ───────────────────────────────────
  await page.route('**/api/v1/**', async (route) => {
    if (!route.isHandled?.()) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    }
  });
}
