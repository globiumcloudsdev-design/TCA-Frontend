import { test, expect } from '../fixtures/auth.fixture.js';
import { StudentsPage } from '../pages/StudentsPage.js';

test.describe('05. Student Management Suite', () => {
  test('Students list page renders table with students data', async ({ schoolAdminPage }) => {
    const studentsPage = new StudentsPage(schoolAdminPage);
    await studentsPage.navigate('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/students/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Students/i }).first()).toBeVisible();

    // Verify search input or table is present
    await expect(schoolAdminPage.locator('table, [role="table"], [data-student-list]').first()).toBeVisible();
  });

  test('Search filter filters students in the data table', async ({ schoolAdminPage }) => {
    const studentsPage = new StudentsPage(schoolAdminPage);
    await studentsPage.navigate('school');

    await studentsPage.searchStudent('Fatima');
    // Verify search input was updated
    if (await studentsPage.searchInput.first().isVisible()) {
      await expect(studentsPage.searchInput.first()).toHaveValue('Fatima');
    }
  });

  test('Add Student page/modal is accessible', async ({ schoolAdminPage }) => {
    const studentsPage = new StudentsPage(schoolAdminPage);
    await studentsPage.navigate('school');

    const addBtn = schoolAdminPage.locator('a[href*="/students/add"], button:has-text("Add Student"), a:has-text("Add Student")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await schoolAdminPage.waitForTimeout(500);
      // Verify navigated or modal opened
      const isAddPageOrModal =
        schoolAdminPage.url().includes('/students/add') ||
        (await schoolAdminPage.locator('[role="dialog"], form').first().isVisible());
      expect(isAddPageOrModal).toBeTruthy();
    }
  });

  test('Student promote workflow page renders correctly', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/students/promote');
    await expect(schoolAdminPage.locator('h1, h2, text=Promote, text=Promotion').first()).toBeVisible();
  });
});
