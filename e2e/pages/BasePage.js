/**
 * Base Page Object Model (POM)
 * Provides foundational helpers for all application pages.
 */
import { expect } from '@playwright/test';

export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.sidebar = page.locator('aside, nav, [data-sidebar]');
    this.themeToggle = page.locator('button[aria-label*="theme" i], button:has(.lucide-sun), button:has(.lucide-moon)');
    this.notificationBell = page.locator('button:has(.lucide-bell)');
    this.userMenu = page.locator('button:has(.lucide-user), [data-user-menu]');
  }

  async goto(path) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectHeading(text) {
    await expect(this.page.locator('h1, h2, h3').filter({ hasText: text }).first()).toBeVisible();
  }

  async expectText(text) {
    await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible();
  }

  async toggleTheme() {
    if (await this.themeToggle.first().isVisible()) {
      await this.themeToggle.first().click();
    }
  }

  async openModal(triggerLocator) {
    await triggerLocator.click();
    await expect(this.page.locator('[role="dialog"]').first()).toBeVisible();
  }

  async closeModal() {
    const closeBtn = this.page.locator('[role="dialog"] button:has-text("Cancel"), [role="dialog"] button:has-text("Close"), [role="dialog"] [aria-label="Close"]');
    if (await closeBtn.first().isVisible()) {
      await closeBtn.first().click();
    }
  }

  async getTableRows() {
    return this.page.locator('table tbody tr');
  }
}
