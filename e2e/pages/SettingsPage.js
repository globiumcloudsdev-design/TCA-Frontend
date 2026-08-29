import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class SettingsPage extends BasePage {
  constructor(page) {
    super(page);
    this.generalTab = page.locator('button[role="tab"]:has-text("General"), [data-tab="general"]');
    this.academicTab = page.locator('button[role="tab"]:has-text("Academic"), [data-tab="academic"]');
    this.timingsTab = page.locator('button[role="tab"]:has-text("Timings"), [data-tab="timings"]');
    this.financeTab = page.locator('button[role="tab"]:has-text("Finance"), [data-tab="finance"]');
    this.modulesTab = page.locator('button[role="tab"]:has-text("Modules"), [data-tab="modules"]');
    this.saveSettingsBtn = page.locator('button:has-text("Save Settings"), button:has-text("Save Changes")');
  }

  async navigate(type = 'school') {
    await this.goto(`/${type}/settings`);
  }

  async navigateRoles(type = 'school') {
    await this.goto(`/${type}/roles`);
  }

  async navigateBranches(type = 'school') {
    await this.goto(`/${type}/branches`);
  }
}
