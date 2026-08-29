import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class StudentsPage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');
    this.addStudentBtn = page.locator('button:has-text("Add Student"), a:has-text("Add Student"), button:has-text("New Student")').first();
    this.filterBtn = page.locator('button:has-text("Filter"), button:has(.lucide-filter)');
    this.dataTable = page.locator('table');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/students`);
  }

  async navigateAdd(type = 'school') {
    await this.goto(`/${type}/students/add`);
  }

  async searchStudent(query) {
    if (await this.searchInput.first().isVisible()) {
      await this.searchInput.first().fill(query);
      await this.page.waitForTimeout(300);
    }
  }

  async openAddStudentModal() {
    if (await this.addStudentBtn.isVisible()) {
      await this.addStudentBtn.click();
    }
  }

  async expectStudentsTable() {
    await expect(this.dataTable).toBeVisible();
  }
}
