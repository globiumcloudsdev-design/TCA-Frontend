import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class TeachersPage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = page.locator('input[placeholder*="search" i]');
    this.addTeacherBtn = page.locator('button:has-text("Add Teacher"), a:has-text("Add Teacher")').first();
    this.dataTable = page.locator('table');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/teachers`);
  }

  async searchTeacher(query) {
    if (await this.searchInput.first().isVisible()) {
      await this.searchInput.first().fill(query);
      await this.page.waitForTimeout(300);
    }
  }

  async expectTeachersTable() {
    await expect(this.dataTable).toBeVisible();
  }
}
