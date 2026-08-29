import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class LandingPage extends BasePage {
  constructor(page) {
    super(page);
    this.heroHeading = page.locator('h1');
    this.loginNavLink = page.locator('header a[href*="/login"], nav a[href*="/login"]').first();
    this.portalLoginNavLink = page.locator('header a[href*="/portal-login"], nav a[href*="/portal-login"]').first();
    this.featuresNavLink = page.locator('header a[href*="/features"], nav a[href*="/features"]').first();
    this.getStartedButton = page.locator('a:has-text("Get Started"), button:has-text("Get Started"), a:has-text("Start Free Trial")').first();
    this.bookDemoButton = page.locator('button:has-text("Book Demo"), a:has-text("Book Demo"), button:has-text("Request Demo")').first();
  }

  async navigate() {
    await this.goto('/');
  }

  async expectHeroSection() {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.page.getByText('Cloud', { exact: false }).first()).toBeVisible();
  }

  async clickLogin() {
    await this.loginNavLink.click();
    await this.page.waitForURL('**/login');
  }

  async clickPortalLogin() {
    await this.portalLoginNavLink.click();
    await this.page.waitForURL('**/portal-login');
  }
}
