import { test, expect } from '../fixtures/auth.fixture.js';
import { NoticesPage, AdmissionsPage } from '../pages/AcademicPages.js';

test.describe('11. Communication, Notices & Admissions Suite', () => {
  test('Notices page renders notice board items', async ({ schoolAdminPage }) => {
    const notices = new NoticesPage(schoolAdminPage);
    await notices.navigate('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/notices/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Notice|Notification/i }).first()).toBeVisible();
  });

  test('Events calendar page renders upcoming school events', async ({ schoolAdminPage }) => {
    const notices = new NoticesPage(schoolAdminPage);
    await notices.navigateEvents('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/events/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Event/i }).first()).toBeVisible();
  });

  test('Admissions management page renders student applications', async ({ schoolAdminPage }) => {
    const admissions = new AdmissionsPage(schoolAdminPage);
    await admissions.navigate('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/admissions/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Admission/i }).first()).toBeVisible();
  });

  test('Parents directory page renders parent contact details', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/parents');
    await expect(schoolAdminPage).toHaveURL(/.*\/parents/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Parent/i }).first()).toBeVisible();
  });
});
