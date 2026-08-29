import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class AttendancePage extends BasePage {
  constructor(page) {
    super(page);
    this.saveAttendanceBtn = page.locator('button:has-text("Save Attendance"), button:has-text("Submit")');
    this.scanQrBtn = page.locator('a[href*="scan"], button:has-text("Scan")');
  }

  async navigateStudentAttendance(type = 'school') {
    await this.goto(`/${type}/attendance`);
  }

  async navigateStaffAttendance(type = 'school') {
    await this.goto(`/${type}/staff-attendance`);
  }

  async navigateScan(type = 'school') {
    await this.goto(`/${type}/attendance/scan`);
  }
}
