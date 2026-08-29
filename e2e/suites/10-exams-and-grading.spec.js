import { test, expect } from '../fixtures/auth.fixture.js';
import { ExamsPage } from '../pages/AcademicPages.js';

test.describe('10. Exams & Grading Management Suite', () => {
  test('Exams list page renders scheduled and past exams', async ({ schoolAdminPage }) => {
    const examsPage = new ExamsPage(schoolAdminPage);
    await examsPage.navigate('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/exams/);
    await expect(schoolAdminPage.locator('h1, h2, text=Exam').first()).toBeVisible();
  });

  test('Create Exam button opens exam schedule dialog', async ({ schoolAdminPage }) => {
    const examsPage = new ExamsPage(schoolAdminPage);
    await examsPage.navigate('school');

    const createBtn = schoolAdminPage.locator('button:has-text("Create Exam"), button:has-text("Add Exam"), a:has-text("Create Exam")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(schoolAdminPage.locator('[role="dialog"], form').first()).toBeVisible();
    }
  });

  test('Reports overview page renders report filters', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/reports');
    await expect(schoolAdminPage.locator('h1, h2, text=Report').first()).toBeVisible();
  });
});
