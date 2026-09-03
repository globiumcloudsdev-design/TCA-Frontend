import { test, expect } from '../fixtures/auth.fixture.js';
import { SettingsPage } from '../pages/SettingsPage.js';

test.describe('12. Institute Settings, Roles & Branches Suite', () => {
  test('Institute Settings page renders configuration tabs', async ({ schoolAdminPage }) => {
    const settings = new SettingsPage(schoolAdminPage);
    await settings.navigate('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/settings/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Setting/i }).first()).toBeVisible();

    // Verify tabs
    await expect(schoolAdminPage.locator('[role="tab"], button:has-text("General"), button:has-text("Academic")').first()).toBeVisible();
  });

  test('Roles and Permissions page renders roles list and permissions', async ({ schoolAdminPage }) => {
    const settings = new SettingsPage(schoolAdminPage);
    await settings.navigateRoles('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/roles/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Role/i }).first()).toBeVisible();
  });

  test('Branches management page renders multi-branch list', async ({ schoolAdminPage }) => {
    const settings = new SettingsPage(schoolAdminPage);
    await settings.navigateBranches('school');

    await expect(schoolAdminPage).toHaveURL(/.*\/branches/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /Branch/i }).first()).toBeVisible();
  });

  test('User accounts page renders staff system users', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/users');
    await expect(schoolAdminPage).toHaveURL(/.*\/users/);
    await expect(schoolAdminPage.locator('h1, h2, h3').filter({ hasText: /User/i }).first()).toBeVisible();
  });
});
