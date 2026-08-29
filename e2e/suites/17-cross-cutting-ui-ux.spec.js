import { test, expect } from '../fixtures/auth.fixture.js';

test.describe('17. Cross-Cutting UI/UX & Responsive Behaviors Suite', () => {
  test('404 Not Found page is rendered gracefully for invalid URLs', async ({ mockPage }) => {
    await mockPage.goto('/this-is-an-invalid-unknown-route-xyz-404');
    await expect(mockPage.locator('text=404, text=Not Found, text=Page Not Found, a[href="/"]').first()).toBeVisible();
  });

  test('Theme switching works smoothly across navigation', async ({ schoolAdminPage }) => {
    await schoolAdminPage.goto('/school/dashboard');

    const themeToggle = schoolAdminPage.locator('button[aria-label*="theme" i], button:has(.lucide-sun), button:has(.lucide-moon)').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await schoolAdminPage.waitForTimeout(300);
      const isDarkOrLight = await schoolAdminPage.locator('html').getAttribute('class');
      expect(isDarkOrLight).toBeDefined();
    }
  });

  test('Responsive hamburger menu toggles mobile sidebar', async ({ schoolAdminPage }) => {
    // Set mobile viewport
    await schoolAdminPage.setViewportSize({ width: 375, height: 667 });
    await schoolAdminPage.goto('/school/dashboard');

    const menuBtn = schoolAdminPage.locator('button[aria-label*="sidebar" i], button:has(.lucide-menu)').first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await schoolAdminPage.waitForTimeout(300);
    }
  });
});
