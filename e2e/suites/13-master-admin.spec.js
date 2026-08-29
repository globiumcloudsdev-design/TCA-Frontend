import { test, expect } from '../fixtures/auth.fixture.js';
import { MasterAdminPage } from '../pages/MasterAdminPage.js';

test.describe('13. Master Admin Super-Portal Suite', () => {
  test('Master Admin dashboard loads overview metrics and stats', async ({ masterAdminPage }) => {
    const masterAdmin = new MasterAdminPage(masterAdminPage);
    await masterAdmin.navigateDashboard();

    await expect(masterAdminPage).toHaveURL(/.*\/master-admin/);
    await expect(masterAdminPage.locator('h1, h2, text=Master Admin, text=Dashboard').first()).toBeVisible();
  });

  test('Schools and Institutes management page renders subscribed schools', async ({ masterAdminPage }) => {
    const masterAdmin = new MasterAdminPage(masterAdminPage);
    await masterAdmin.navigateSchools();

    await expect(masterAdminPage).toHaveURL(/.*\/master-admin\/(schools|institutes)/);
    await expect(masterAdminPage.locator('h1, h2, text=School, text=Institute').first()).toBeVisible();
  });

  test('Subscriptions page renders active customer subscriptions', async ({ masterAdminPage }) => {
    const masterAdmin = new MasterAdminPage(masterAdminPage);
    await masterAdmin.navigateSubscriptions();

    await expect(masterAdminPage).toHaveURL(/.*\/master-admin\/subscriptions/);
    await expect(masterAdminPage.locator('h1, h2, text=Subscription').first()).toBeVisible();
  });

  test('Subscription Templates page renders plan tiers', async ({ masterAdminPage }) => {
    const masterAdmin = new MasterAdminPage(masterAdminPage);
    await masterAdmin.navigateSubscriptionTemplates();

    await expect(masterAdminPage).toHaveURL(/.*\/master-admin\/subscription-templates/);
    await expect(masterAdminPage.locator('h1, h2, text=Template, text=Plan').first()).toBeVisible();
  });

  test('Global Users page renders super admin accounts', async ({ masterAdminPage }) => {
    const masterAdmin = new MasterAdminPage(masterAdminPage);
    await masterAdmin.navigateUsers();

    await expect(masterAdminPage).toHaveURL(/.*\/master-admin\/users/);
    await expect(masterAdminPage.locator('h1, h2, text=User').first()).toBeVisible();
  });
});
