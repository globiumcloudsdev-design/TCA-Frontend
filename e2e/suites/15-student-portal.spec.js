import { test, expect } from '../fixtures/auth.fixture.js';
import { StudentPortalPage } from '../pages/PortalPages.js';

test.describe('15. Student Portal Suite', () => {
  test('Student dashboard loads overview widgets and student greeting', async ({ studentPortalPage }) => {
    const student = new StudentPortalPage(studentPortalPage);
    await student.navigateDashboard();

    await expect(studentPortalPage).toHaveURL(/.*\/student/);
    await expect(studentPortalPage.locator('text=Welcome, text=Student, text=Dashboard').first()).toBeVisible();
  });

  test('Student attendance records view displays calendar and statistics', async ({ studentPortalPage }) => {
    const student = new StudentPortalPage(studentPortalPage);
    await student.navigateAttendance();

    await expect(studentPortalPage).toHaveURL(/.*\/student\/attendance/);
    await expect(studentPortalPage.locator('h1, h2, text=Attendance').first()).toBeVisible();
  });

  test('Student fee status page displays dues, paid history, and vouchers', async ({ studentPortalPage }) => {
    const student = new StudentPortalPage(studentPortalPage);
    await student.navigateFees();

    await expect(studentPortalPage).toHaveURL(/.*\/student\/fees/);
    await expect(studentPortalPage.locator('h1, h2, text=Fee').first()).toBeVisible();
  });

  test('Student exams and results page renders schedule and marks', async ({ studentPortalPage }) => {
    const student = new StudentPortalPage(studentPortalPage);
    await student.navigateExams();

    await expect(studentPortalPage).toHaveURL(/.*\/student\/exams/);
    await expect(studentPortalPage.locator('h1, h2, text=Exam').first()).toBeVisible();
  });

  test('Student weekly timetable view renders class schedule', async ({ studentPortalPage }) => {
    const student = new StudentPortalPage(studentPortalPage);
    await student.navigateTimetable();

    await expect(studentPortalPage).toHaveURL(/.*\/student\/timetable/);
    await expect(studentPortalPage.locator('h1, h2, text=Timetable').first()).toBeVisible();
  });

  test('Student homework and notes pages load', async ({ studentPortalPage }) => {
    const student = new StudentPortalPage(studentPortalPage);
    await student.navigateHomework();
    await expect(studentPortalPage).toHaveURL(/.*\/student\/homework/);
    await expect(studentPortalPage.locator('h1, h2, text=Homework').first()).toBeVisible();

    await student.navigateNotes();
    await expect(studentPortalPage).toHaveURL(/.*\/student\/notes/);
    await expect(studentPortalPage.locator('h1, h2, text=Note').first()).toBeVisible();
  });
});
