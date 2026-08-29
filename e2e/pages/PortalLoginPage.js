import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class PortalLoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"], input[id="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async navigate(portalType) {
    const url = portalType ? `/portal-login?type=${portalType}` : '/portal-login';
    await this.goto(url);
  }

  async selectPortalType(type) {
    // Type can be 'STUDENT', 'TEACHER', 'PARENT'
    const typeBtn = this.page.locator(`button:has-text("${type}"), [data-portal="${type}"]`).first();
    if (await typeBtn.isVisible()) {
      await typeBtn.click();
    }
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
