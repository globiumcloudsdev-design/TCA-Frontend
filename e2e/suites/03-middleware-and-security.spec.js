import { test, expect } from '../fixtures/auth.fixture.js';

test.describe('03. Middleware & Security Route Protection Suite', () => {
  test('Unauthenticated user attempting to access /school/dashboard is redirected to /login', async ({ mockPage }) => {
    await mockPage.goto('/school/dashboard');
    await mockPage.waitForURL(/.*\/login/, { timeout: 10000 });
    expect(mockPage.url()).toContain('/login');
  });

  test('Unauthenticated user attempting to access /student is redirected to /portal-login', async ({ mockPage }) => {
    await mockPage.goto('/student');
    await mockPage.waitForURL(/.*\/portal-login/, { timeout: 10000 });
    expect(mockPage.url()).toContain('/portal-login');
  });

  test('Unauthenticated user attempting to access /teacher is redirected to /portal-login', async ({ mockPage }) => {
    await mockPage.goto('/teacher');
    await mockPage.waitForURL(/.*\/portal-login/, { timeout: 10000 });
    expect(mockPage.url()).toContain('/portal-login');
  });

  test('Unauthenticated user attempting to access /parent is redirected to /portal-login', async ({ mockPage }) => {
    await mockPage.goto('/parent');
    await mockPage.waitForURL(/.*\/portal-login/, { timeout: 10000 });
    expect(mockPage.url()).toContain('/portal-login');
  });

  test('Authenticated School Admin is redirected away from /login to dashboard', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/login');
    await schoolAdminPage.waitForURL(/.*\/(school\/dashboard|dashboard)/, { timeout: 10000 });
    expect(schoolAdminPage.url()).toContain('dashboard');
  });

  test('Authenticated Master Admin can access /master-admin routes directly', async ({ masterAdminPage }) => {
    await masterAdminPage.goto('/master-admin');
    await expect(masterAdminPage).toHaveURL(/.*\/master-admin/);
    await expect(masterAdminPage.locator('h1, h2, h3').first()).toBeVisible();
  });
});
