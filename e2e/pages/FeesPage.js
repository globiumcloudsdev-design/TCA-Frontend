import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class FeesPage extends BasePage {
  constructor(page) {
    super(page);
    this.createInvoiceBtn = page.locator('button:has-text("Create Invoice"), button:has-text("Generate Voucher"), a:has-text("Generate")');
    this.feeTemplatesBtn = page.locator('a[href*="fee-templates"], button:has-text("Templates")');
  }

  async navigateFees(type = 'school') {
    await this.goto(`/${type}/fees`);
  }

  async navigateFeeTemplates(type = 'school') {
    await this.goto(`/${type}/fee-templates`);
  }

  async navigatePayroll(type = 'school') {
    await this.goto(`/${type}/payroll`);
  }
}
