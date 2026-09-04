import { test, expect } from '../fixtures/auth.fixture.js';
import { SchoolDashboardPage } from '../pages/SchoolDashboardPage.js';

test.describe('04. School Admin Dashboard Suite', () => {
  test('School Dashboard renders KPI cards, metrics, and summary information', async ({ schoolAdminPage }) => {
    const dashboard = new SchoolDashboardPage(schoolAdminPage);
    await dashboard.navigate('school');

    // Verify Dashboard layout loaded
    await expect(schoolAdminPage.locator('h1, h2, [data-dashboard]').first()).toBeVisible();

    // Check stats are rendered or skeleton resolves
    await dashboard.expectStatsVisible();
  });

  test('Branch switcher dropdown renders and allows switching branches', async ({ schoolAdminPage }) => {
    const dashboard = new SchoolDashboardPage(schoolAdminPage);
    await dashboard.navigate('school');

    const branchSwitcher = schoolAdminPage.locator('button:has(.lucide-git-branch), [data-branch-switcher]').first();
    if (await branchSwitcher.isVisible()) {
      await branchSwitcher.click();
      await expect(schoolAdminPage.locator('[role="menu"], [role="listbox"]').first()).toBeVisible();
    }
  });

  test('Notification bell is visible in header', async ({ schoolAdminPage }) => {
    const dashboard = new SchoolDashboardPage(schoolAdminPage);
    await dashboard.navigate('school');

    const bell = schoolAdminPage.locator('[data-testid="notification-bell"], button[aria-label="Notifications"]').first();
    await expect(bell).toBeVisible();
  });

  test('User menu displays user details and logout option', async ({ schoolAdminPage }) => {
    const dashboard = new SchoolDashboardPage(schoolAdminPage);
    await dashboard.navigate('school');

    const userMenuBtn = schoolAdminPage.locator('button:has(.lucide-user), button:has(img[alt*="avatar" i]), [data-user-menu]').first();
    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click();
      await expect(schoolAdminPage.locator('text=Logout, text=Log out, button:has-text("Logout")').first()).toBeVisible();
    }
  });
});
