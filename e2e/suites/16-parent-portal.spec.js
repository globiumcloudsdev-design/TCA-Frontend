import { test, expect } from '../fixtures/auth.fixture.js';
import { ParentPortalPage } from '../pages/PortalPages.js';

test.describe('16. Parent Portal Suite', () => {
  test('Parent dashboard renders child overview cards and notifications', async ({ parentPortalPage }) => {
    const parent = new ParentPortalPage(parentPortalPage);
    await parent.navigateDashboard();

    await expect(parentPortalPage).toHaveURL(/.*\/parent/);
    await expect(parentPortalPage.locator('text=Parent, text=Child, text=Dashboard, text=Welcome').first()).toBeVisible();
  });

  test('Parent child attendance page renders attendance records', async ({ parentPortalPage }) => {
    const parent = new ParentPortalPage(parentPortalPage);
    await parent.navigateAttendance();

    await expect(parentPortalPage).toHaveURL(/.*\/parent\/attendance/);
    await expect(parentPortalPage.locator('h1, h2, text=Attendance').first()).toBeVisible();
  });

  test('Parent child fees status page renders invoices and vouchers', async ({ parentPortalPage }) => {
    const parent = new ParentPortalPage(parentPortalPage);
    await parent.navigateFees();

    await expect(parentPortalPage).toHaveURL(/.*\/parent\/fees/);
    await expect(parentPortalPage.locator('h1, h2, text=Fee').first()).toBeVisible();
  });

  test('Parent child exam results and report card page loads', async ({ parentPortalPage }) => {
    const parent = new ParentPortalPage(parentPortalPage);
    await parent.navigateResults();

    await expect(parentPortalPage).toHaveURL(/.*\/parent\/results/);
    await expect(parentPortalPage.locator('h1, h2, text=Result, text=Report').first()).toBeVisible();
  });

  test('Parent announcements feed renders school notices', async ({ parentPortalPage }) => {
    const parent = new ParentPortalPage(parentPortalPage);
    await parent.navigateAnnouncements();

    await expect(parentPortalPage).toHaveURL(/.*\/parent\/announcements/);
    await expect(parentPortalPage.locator('h1, h2, text=Announcement, text=Notice').first()).toBeVisible();
  });
});
