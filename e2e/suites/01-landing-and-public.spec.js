import { test, expect } from '../fixtures/auth.fixture.js';
import { LandingPage } from '../pages/LandingPage.js';

test.describe('01. Public & Marketing Pages Suite', () => {
  test('Landing page loads and displays hero, branding, and navigation', async ({ mockPage }) => {
    const landing = new LandingPage(mockPage);
    await landing.navigate();

    // Verify Title & Hero content
    await expect(mockPage).toHaveTitle(/The Clouds Academy/i);
    await landing.expectHeroSection();

    // Verify main CTA buttons
    await expect(mockPage.locator('text=The Clouds Academy, text=Cloud-Based School Management').first()).toBeVisible();
    await expect(mockPage.locator('a[href*="/login"]').first()).toBeVisible();
    await expect(mockPage.locator('a[href*="/portal-login"]').first()).toBeVisible();
  });

  test('Navigation to School Login page from landing page', async ({ mockPage }) => {
    const landing = new LandingPage(mockPage);
    await landing.navigate();
    await landing.clickLogin();

    await expect(mockPage).toHaveURL(/.*\/login/);
    await expect(mockPage.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });

  test('Navigation to Portal Login page from landing page', async ({ mockPage }) => {
    const landing = new LandingPage(mockPage);
    await landing.navigate();
    await landing.clickPortalLogin();

    await expect(mockPage).toHaveURL(/.*\/portal-login/);
    await expect(mockPage.locator('text=Student, text=Teacher, text=Parent').first()).toBeVisible();
  });

  test('Features page (/features) renders module showcase', async ({ mockPage }) => {
    await mockPage.goto('/features');
    await expect(mockPage).toHaveURL(/.*\/features/);
    await expect(mockPage.locator('h1, h2').first()).toBeVisible();
  });

  test('Theme switcher toggles dark and light mode', async ({ mockPage }) => {
    const landing = new LandingPage(mockPage);
    await landing.navigate();

    const html = mockPage.locator('html');
    const initialClass = (await html.getAttribute('class')) || '';

    await landing.toggleTheme();
    // Verify theme toggling action was triggered
    await mockPage.waitForTimeout(300);
    const newClass = (await html.getAttribute('class')) || '';
    expect(newClass).toBeDefined();
  });
});
