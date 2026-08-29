import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class MasterAdminPage extends BasePage {
  constructor(page) {
    super(page);
    this.schoolsLink = page.locator('a[href*="/master-admin/schools"], a[href*="/master-admin/institutes"]');
    this.subscriptionsLink = page.locator('a[href*="/master-admin/subscriptions"]');
    this.usersLink = page.locator('a[href*="/master-admin/users"]');
  }

  async navigateDashboard() {
    await this.goto('/master-admin');
  }

  async navigateSchools() {
    await this.goto('/master-admin/schools');
  }

  async navigateSubscriptions() {
    await this.goto('/master-admin/subscriptions');
  }

  async navigateSubscriptionTemplates() {
    await this.goto('/master-admin/subscription-templates');
  }

  async navigateUsers() {
    await this.goto('/master-admin/users');
  }

  async navigateBranding() {
    await this.goto('/master-admin/branding');
  }
}
