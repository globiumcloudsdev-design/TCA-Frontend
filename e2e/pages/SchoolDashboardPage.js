import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class SchoolDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.statCards = page.locator('.grid > div:has(.text-2xl)');
    this.branchSwitcher = page.locator('button:has(.lucide-git-branch), [data-branch-switcher]');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/dashboard`);
  }

  async expectStatsVisible() {
    await expect(this.page.getByText(/Total Students|Students/i).first()).toBeVisible();
    await expect(this.page.getByText(/Total Teachers|Teachers/i).first()).toBeVisible();
  }

  async expectChartsVisible() {
    await expect(this.page.locator('.recharts-responsive-container, [data-chart]').first()).toBeVisible();
  }
}
