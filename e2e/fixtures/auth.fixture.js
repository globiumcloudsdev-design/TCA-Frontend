/**
 * Playwright Custom Auth Fixtures
 * Sets up pre-authenticated cookies and Zustand localStorage hydration
 * for fast, reliable testing of role-protected pages and portals.
 */
import { test as baseTest, expect } from '@playwright/test';
import { setupApiMocks } from './api-mock.fixture.js';
import { MOCK_USERS } from './test-data.js';

export const test = baseTest.extend({
  // Base page with API mocks wired up
  mockPage: async ({ page }, use) => {
    await setupApiMocks(page);
    await use(page);
  },

  // Pre-authenticated School Admin Context
  schoolAdminPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const urlObj = new URL(baseURL || 'http://localhost:3000');
    const domain = urlObj.hostname;

    await context.addCookies([
      { name: 'access_token', value: 'mock-school-admin-token-2026', domain, path: '/' },
      { name: 'role_code', value: 'INSTITUTE_ADMIN', domain, path: '/' },
      { name: 'user_type', value: 'INSTITUTE_ADMIN', domain, path: '/' },
      { name: 'institute_type', value: 'school', domain, path: '/' },
    ]);

    const page = await context.newPage();
    await setupApiMocks(page);

    // Hydrate localStorage with Zustand state
    await page.addInitScript((userData) => {
      localStorage.setItem(
        'clouds-auth',
        JSON.stringify({
          state: {
            user: userData,
            isAuthenticated: true,
          },
          version: 0,
        })
      );
      localStorage.setItem('school_code', 'TCA-MAIN');
    }, MOCK_USERS.schoolAdmin);

    await use(page);
    await context.close();
  },

  // Pre-authenticated Master Admin Context
  masterAdminPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const urlObj = new URL(baseURL || 'http://localhost:3000');
    const domain = urlObj.hostname;

    await context.addCookies([
      { name: 'access_token', value: 'mock-master-admin-token-2026', domain, path: '/' },
      { name: 'role_code', value: 'MASTER_ADMIN', domain, path: '/' },
      { name: 'user_type', value: 'MASTER_ADMIN', domain, path: '/' },
    ]);

    const page = await context.newPage();
    await setupApiMocks(page);

    await page.addInitScript((userData) => {
      localStorage.setItem(
        'clouds-auth',
        JSON.stringify({
          state: {
            user: userData,
            isAuthenticated: true,
          },
          version: 0,
        })
      );
      localStorage.setItem('school_code', 'TCA-HQ');
    }, MOCK_USERS.masterAdmin);

    await use(page);
    await context.close();
  },

  // Pre-authenticated Teacher Portal Context
  teacherPortalPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const urlObj = new URL(baseURL || 'http://localhost:3000');
    const domain = urlObj.hostname;

    await context.addCookies([
      { name: 'portal_token', value: 'mock-teacher-portal-token', domain, path: '/' },
      { name: 'portal_type', value: 'TEACHER', domain, path: '/' },
      { name: 'user_type', value: 'TEACHER', domain, path: '/' },
    ]);

    const page = await context.newPage();
    await setupApiMocks(page);

    await page.addInitScript((userData) => {
      localStorage.setItem(
        'portal-session',
        JSON.stringify({
          state: {
            portalUser: userData,
            portalType: 'TEACHER',
            instituteType: 'school',
            permissions: ['*'],
          },
          version: 0,
        })
      );
    }, MOCK_USERS.teacher);

    await use(page);
    await context.close();
  },

  // Pre-authenticated Student Portal Context
  studentPortalPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const urlObj = new URL(baseURL || 'http://localhost:3000');
    const domain = urlObj.hostname;

    await context.addCookies([
      { name: 'portal_token', value: 'mock-student-portal-token', domain, path: '/' },
      { name: 'portal_type', value: 'STUDENT', domain, path: '/' },
      { name: 'user_type', value: 'STUDENT', domain, path: '/' },
    ]);

    const page = await context.newPage();
    await setupApiMocks(page);

    await page.addInitScript((userData) => {
      localStorage.setItem(
        'portal-session',
        JSON.stringify({
          state: {
            portalUser: userData,
            portalType: 'STUDENT',
            instituteType: 'school',
            permissions: ['*'],
          },
          version: 0,
        })
      );
    }, MOCK_USERS.student);

    await use(page);
    await context.close();
  },

  // Pre-authenticated Parent Portal Context
  parentPortalPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const urlObj = new URL(baseURL || 'http://localhost:3000');
    const domain = urlObj.hostname;

    await context.addCookies([
      { name: 'portal_token', value: 'mock-parent-portal-token', domain, path: '/' },
      { name: 'portal_type', value: 'PARENT', domain, path: '/' },
      { name: 'user_type', value: 'PARENT', domain, path: '/' },
    ]);

    const page = await context.newPage();
    await setupApiMocks(page);

    await page.addInitScript((userData) => {
      localStorage.setItem(
        'portal-session',
        JSON.stringify({
          state: {
            portalUser: userData,
            portalType: 'PARENT',
            instituteType: 'school',
            permissions: ['*'],
          },
          version: 0,
        })
      );
    }, MOCK_USERS.parent);

    await use(page);
    await context.close();
  },
});

export { expect };
