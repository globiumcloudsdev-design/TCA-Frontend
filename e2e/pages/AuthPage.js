import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class AuthPage extends BasePage {
  constructor(page) {
    super(page);
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.passwordToggle = page.locator('button:has(.lucide-eye), button:has(.lucide-eye-off)');
    this.forgotPasswordLink = page.locator('a[href*="forgot-password"]');
    this.portalLoginLink = page.locator('a[href*="portal-login"], button:has-text("Portal")');
  }

  async navigateLogin() {
    await this.goto('/login');
  }

  async navigateForgotPassword() {
    await this.goto('/forgot-password');
  }

  async navigateResetPassword(token = 'valid-test-token-123') {
    await this.goto(`/reset-password/${token}`);
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    if (password) {
      await this.passwordInput.fill(password);
    }
    await this.submitButton.click();
  }

  async clickQuickLogin(label) {
    const quickBtn = this.page.locator(`button:has-text("${label}")`);
    await quickBtn.click();
  }

  async togglePasswordVisibility() {
    if (await this.passwordToggle.first().isVisible()) {
      await this.passwordToggle.first().click();
    }
  }
}
