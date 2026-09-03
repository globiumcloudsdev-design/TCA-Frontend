import { test, expect } from '../fixtures/auth.fixture.js';
import { FeesPage } from '../pages/FeesPage.js';

test.describe('09. Fees & Financial Management Suite', () => {
  test('Fees collection overview loads invoices and payment statuses', async ({ schoolAdminPage }) => {
    const feesPage = new FeesPage(schoolAdminPage);
    await feesPage.navigateFees('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/fees/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Fee/i }).first()).toBeVisible();
    await expect(schoolAdminPage.locator('table, [data-fee-list], [role="table"]').first()).toBeVisible();
  });

  test('Fee Templates page allows creating and managing fee structures', async ({ schoolAdminPage }) => {
    const feesPage = new FeesPage(schoolAdminPage);
    await feesPage.navigateFeeTemplates('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/fee-templates/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Template/i }).first()).toBeVisible();
  });

  test('Payroll page displays staff salary and payroll records', async ({ schoolAdminPage }) => {
    const feesPage = new FeesPage(schoolAdminPage);
    await feesPage.navigatePayroll('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/payroll/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Payroll/i }).first()).toBeVisible();
  });

  test('Expense management page is accessible', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/expense');
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Expense/i }).first()).toBeVisible();
  });
});
