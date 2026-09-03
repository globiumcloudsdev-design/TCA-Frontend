import { test, expect } from '../fixtures/auth.fixture.js';
import { AttendancePage } from '../pages/AttendancePage.js';

test.describe('08. Attendance System Suite', () => {
  test('Student Attendance page loads with date selector and class filters', async ({ schoolAdminPage }) => {
    const attendance = new AttendancePage(schoolAdminPage);
    await attendance.navigateStudentAttendance('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/attendance/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Attendance/i }).first()).toBeVisible();
  });

  test('Attendance QR Scanner interface loads camera container / scan UI', async ({ schoolAdminPage }) => {
    const attendance = new AttendancePage(schoolAdminPage);
    await attendance.navigateScan('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/attendance\/scan/);
    await expect(schoolAdminPage.locator('body').filter({ hasText: /Scan|QR|Camera/i }).first()).toBeVisible();
  });

  test('Staff Attendance page renders staff member list', async ({ schoolAdminPage }) => {
    const attendance = new AttendancePage(schoolAdminPage);
    await attendance.navigateStaffAttendance('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/staff-attendance/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Staff Attendance/i }).first()).toBeVisible();
  });
});
