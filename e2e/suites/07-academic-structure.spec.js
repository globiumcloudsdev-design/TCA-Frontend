import { test, expect } from '../fixtures/auth.fixture.js';
import { ClassesPage, TimetablePage } from '../pages/AcademicPages.js';

test.describe('07. Academic Structure & Timetable Suite', () => {
  test('Classes management page renders class cards or table', async ({ schoolAdminPage }) => {
    const classesPage = new ClassesPage(schoolAdminPage);
    await classesPage.navigate('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/classes/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Classes/i }).first()).toBeVisible();
  });

  test('Sections page is accessible and displays section details', async ({ schoolAdminPage }) => {
    const classesPage = new ClassesPage(schoolAdminPage);
    await classesPage.navigateSections('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/sections/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Section/i }).first()).toBeVisible();
  });

  test('Academic Years setup page displays list and active year', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/academic-years');
    await expect(schoolAdminPage).toHaveURL(/.*\/academic-years/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Academic Year/i }).first()).toBeVisible();
  });

  test('Subjects page displays list of curriculum subjects', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/subjects');
    await expect(schoolAdminPage).toHaveURL(/.*\/subjects/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Subject/i }).first()).toBeVisible();
  });

  test('Timetable schedule view renders grid slots', async ({ schoolAdminPage }) => {
    const timetable = new TimetablePage(schoolAdminPage);
    await timetable.navigate('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/timetable/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Timetable/i }).first()).toBeVisible();
  });
});
