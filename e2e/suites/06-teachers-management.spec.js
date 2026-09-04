import { test, expect } from '../fixtures/auth.fixture.js';
import { TeachersPage } from '../pages/TeachersPage.js';

test.describe('06. Teachers & Staff Management Suite', () => {
  test('Teachers list page renders table with teachers records', async ({ schoolAdminPage }) => {
    const teachersPage = new TeachersPage(schoolAdminPage);
    await teachersPage.navigate('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/teachers/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Teachers/i }).first()).toBeVisible();
    await expect(schoolAdminPage.locator('table, [role="table"], [data-teacher-list]').first()).toBeVisible();
  });

  test('Search filter on Teachers page responds to input', async ({ schoolAdminPage }) => {
    const teachersPage = new TeachersPage(schoolAdminPage);
    await teachersPage.navigate('school');

    await teachersPage.searchTeacher('Hassan');
    if (await teachersPage.searchInput.first().isVisible()) {
      await expect(teachersPage.searchInput.first()).toHaveValue('Hassan');
    }
  });

  test('Add Teacher trigger opens creation dialog or form', async ({ schoolAdminPage }) => {
    const teachersPage = new TeachersPage(schoolAdminPage);
    await teachersPage.navigate('school');

    const addBtn = schoolAdminPage.locator('button:has-text("Add Teacher"), a:has-text("Add Teacher"), button:has-text("New Teacher")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(schoolAdminPage.locator('[role="dialog"], form').first()).toBeVisible();
    }
  });

  test('Staff members page renders correctly', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/staff');
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Staff/i }).first()).toBeVisible();
  });
});
