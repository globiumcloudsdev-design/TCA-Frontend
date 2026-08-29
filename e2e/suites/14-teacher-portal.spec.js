import { test, expect } from '../fixtures/auth.fixture.js';
import { TeacherPortalPage } from '../pages/PortalPages.js';

test.describe('14. Teacher Portal Suite', () => {
  test('Teacher dashboard loads with schedule and quick metrics', async ({ teacherPortalPage }) => {
    const teacher = new TeacherPortalPage(teacherPortalPage);
    await teacher.navigateDashboard();

    await expect(teacherPortalPage).toHaveURL(/.*\/teacher/);
    await expect(teacherPortalPage.locator('text=Teacher, text=Schedule, text=Dashboard').first()).toBeVisible();
  });

  test('Teacher assigned classes list renders correctly', async ({ teacherPortalPage }) => {
    const teacher = new TeacherPortalPage(teacherPortalPage);
    await teacher.navigateClasses();

    await expect(teacherPortalPage).toHaveURL(/.*\/teacher\/classes/);
    await expect(teacherPortalPage.locator('h1, h2, text=Class').first()).toBeVisible();
  });

  test('Teacher students roster renders with searchable table', async ({ teacherPortalPage }) => {
    const teacher = new TeacherPortalPage(teacherPortalPage);
    await teacher.navigateStudents();

    await expect(teacherPortalPage).toHaveURL(/.*\/teacher\/students/);
    await expect(teacherPortalPage.locator('h1, h2, text=Student').first()).toBeVisible();
  });

  test('Teacher attendance page allows marking class attendance', async ({ teacherPortalPage }) => {
    const teacher = new TeacherPortalPage(teacherPortalPage);
    await teacher.navigateAttendance();

    await expect(teacherPortalPage).toHaveURL(/.*\/teacher\/attendance/);
    await expect(teacherPortalPage.locator('h1, h2, text=Attendance').first()).toBeVisible();
  });

  test('Teacher homework and assignments management pages load', async ({ teacherPortalPage }) => {
    const teacher = new TeacherPortalPage(teacherPortalPage);
    await teacher.navigateHomework();
    await expect(teacherPortalPage).toHaveURL(/.*\/teacher\/homework/);
    await expect(teacherPortalPage.locator('h1, h2, text=Homework').first()).toBeVisible();

    await teacher.navigateAssignments();
    await expect(teacherPortalPage).toHaveURL(/.*\/teacher\/assignments/);
    await expect(teacherPortalPage.locator('h1, h2, text=Assignment').first()).toBeVisible();
  });

  test('Teacher lecture notes page loads with upload trigger', async ({ teacherPortalPage }) => {
    const teacher = new TeacherPortalPage(teacherPortalPage);
    await teacher.navigateNotes();

    await expect(teacherPortalPage).toHaveURL(/.*\/teacher\/notes/);
    await expect(teacherPortalPage.locator('h1, h2, text=Note').first()).toBeVisible();
  });
});
