import { test, expect } from '@playwright/test';

test.describe('Main Branch vs Branch Admin Role Recognition', () => {
  test.describe.configure({ mode: 'serial' });

  test('Super Admin (Main Branch: neeliansari@gmail.com) has global access, sees branch dropdown, and sees Branches sidebar', async ({ page }) => {
    // 1. Login
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'neeliansari@gmail.com');
    await page.fill('input[type="password"], input[name="password"]', 'Admin@Zehra123');
    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]').click();

    // 2. Redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
    await page.waitForLoadState('domcontentloaded');

    // 3. Verify Branch Switcher is visible and interactive
    const branchSwitcherBtn = page.getByRole('button', { name: /all branches|selected branch|branch selector/i }).first();
    await expect(branchSwitcherBtn).toBeVisible({ timeout: 20000 });

    // 4. Click branch switcher and verify options appear
    await page.waitForTimeout(1000);
    await branchSwitcherBtn.click();
    await expect(page.getByRole('menuitem', { name: /all branches/i })).toBeVisible({ timeout: 15000 });
    await page.keyboard.press('Escape');

    // 5. Verify "Branches" link is VISIBLE in the sidebar navigation
    const branchesNavLink = page.getByRole('link', { name: /^branches$/i }).first();
    await expect(branchesNavLink).toBeVisible({ timeout: 10000 });

    // 6. Navigate to /school/branches and verify full management view
    await page.goto('/school/branches', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /branches/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Branch-Scoped Access/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /new branch/i })).toBeVisible();
  });

  test('Branch Admin (Non-Main Branch: khalidshah387@gmail.com) is restricted, sees no dropdown, and does NOT see Branches sidebar', async ({ page }) => {
    // 1. Login
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'khalidshah387@gmail.com');
    await page.fill('input[type="password"], input[name="password"]', 'Admin@Warsi123');
    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]').click();

    // 2. Redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
    await page.waitForLoadState('domcontentloaded');

    // 3. Verify read-only badge is visible with assigned branch
    const loggedIntoBadge = page.getByText(/Logged into:/i).first();
    await expect(loggedIntoBadge).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Assigned Branch|Kaneez Fatima/i).first()).toBeVisible();

    // 4. Verify NO branch dropdown button exists
    const branchSwitcherBtn = page.getByRole('button', { name: /all branches|selected branch|branch selector/i });
    await expect(branchSwitcherBtn).toHaveCount(0);

    // 5. Verify "Branches" link is NOT visible in the sidebar navigation
    const branchesNavLink = page.getByRole('link', { name: /^branches$/i });
    await expect(branchesNavLink).toHaveCount(0);

    // 6. Navigate directly to /school/branches and verify access restriction
    await page.goto('/school/branches', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Branch-Scoped Access/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /new branch/i })).toHaveCount(0);
  });

  test('Super Admin can open New Branch modal, head user is optional by default, and branch creation succeeds', async ({ page }) => {
    // 1. Login as Super Admin
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'neeliansari@gmail.com');
    await page.fill('input[type="password"], input[name="password"]', 'Admin@Zehra123');
    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });

    // 2. Navigate to /school/branches
    await page.goto('/school/branches', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /new branch/i })).toBeVisible({ timeout: 15000 });

    // 3. Open New Branch modal
    await page.getByRole('button', { name: /new branch/i }).click();
    await expect(page.getByRole('heading', { name: /add new branch|create branch|new branch/i })).toBeVisible();

    // 4. Check Head tab - verify head user is optional / toggled off by default
    await page.getByRole('tab', { name: /head/i }).click();
    await expect(page.getByRole('heading', { name: /No Dedicated Branch Head User/i })).toBeVisible();

    // 5. Fill Basic tab and submit
    await page.getByRole('tab', { name: /basic/i }).click();
    const branchName = 'E2E Branch ' + Date.now().toString().slice(-4);
    await page.fill('input[name="name"]', branchName);
    await page.fill('input[name="city"]', 'Karachi');

    // Click submit in modal
    await page.getByRole('button', { name: /^create branch$|^save$|^submit$/i }).click();

    // 6. Verify success toast or modal closes
    await expect(page.getByText(/created successfully/i)).toBeVisible({ timeout: 15000 });
  });
});
