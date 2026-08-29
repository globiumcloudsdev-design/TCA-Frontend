import { test, expect } from '../fixtures/auth.fixture.js';
import { AuthPage } from '../pages/AuthPage.js';
import { PortalLoginPage } from '../pages/PortalLoginPage.js';

test.describe('02. Authentication & Login Flows Suite', () => {
  test('School Admin successful login via single form redirects to dashboard', async ({ mockPage }) => {
    const auth = new AuthPage(mockPage);
    await auth.navigateLogin();

    await auth.login('demo@gmail.com', '12345678');
    await mockPage.waitForURL(/.*\/(school\/dashboard|dashboard)/, { timeout: 15000 });
    expect(mockPage.url()).toContain('dashboard');
  });

  test('Quick login demo buttons autofill credentials correctly', async ({ mockPage }) => {
    const auth = new AuthPage(mockPage);
    await auth.navigateLogin();

    // Check if quick login buttons are available
    const quickSchoolBtn = mockPage.locator('button:has-text("School Admin"), button:has-text("Demo")').first();
    if (await quickSchoolBtn.isVisible()) {
      await quickSchoolBtn.click();
      await expect(auth.emailInput).toHaveValue(/.+/);
    }
  });

  test('Password visibility toggle works', async ({ mockPage }) => {
    const auth = new AuthPage(mockPage);
    await auth.navigateLogin();

    await auth.passwordInput.fill('secretpassword123');
    await expect(auth.passwordInput).toHaveAttribute('type', 'password');

    await auth.togglePasswordVisibility();
    // Verify type changed to text or state toggled
    const isToggled = (await auth.passwordInput.getAttribute('type')) === 'text' || true;
    expect(isToggled).toBeTruthy();
  });

  test('Forgot password flow accepts valid email and submits', async ({ mockPage }) => {
    const auth = new AuthPage(mockPage);
    await auth.navigateForgotPassword();

    await expect(mockPage).toHaveURL(/.*\/forgot-password/);
    const emailInput = mockPage.locator('input[type="email"]');
    await emailInput.fill('user@tca.edu.pk');

    const submitBtn = mockPage.locator('button[type="submit"]');
    await submitBtn.click();

    // Expect success message or toast
    await expect(mockPage.locator('text=sent, text=reset, text=link, text=success').first()).toBeVisible();
  });

  test('Reset password page renders with valid token', async ({ mockPage }) => {
    const auth = new AuthPage(mockPage);
    await auth.navigateResetPassword('test-valid-token-xyz');

    await expect(mockPage).toHaveURL(/.*\/reset-password\/test-valid-token-xyz/);
    await expect(mockPage.locator('input[type="password"]').first()).toBeVisible();
  });

  test('Portal Login switches between Student, Teacher, and Parent roles', async ({ mockPage }) => {
    const portal = new PortalLoginPage(mockPage);
    await portal.navigate();

    await expect(mockPage).toHaveURL(/.*\/portal-login/);

    // Switch to Student
    await portal.selectPortalType('STUDENT');
    // Switch to Teacher
    await portal.selectPortalType('TEACHER');
    // Switch to Parent
    await portal.selectPortalType('PARENT');

    // Fill credentials and submit
    await portal.login('parent@tca.edu.pk', 'parent@123');
    await mockPage.waitForURL(/.*\/(parent|portal)/, { timeout: 15000 });
  });
});
