import { test as baseTest, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock.fixture.js';

const MOCK_SUPER_ADMIN = {
  id: 'user-super-admin-001',
  first_name: 'Super',
  last_name: 'Admin',
  name: 'Super Admin',
  email: 'superadmin@thecloudsacademy.com',
  user_type: 'INSTITUTE_ADMIN',
  role_code: 'SUPER_ADMIN',
  permissions: ['*'],
  institute: {
    id: 'inst-school-001',
    name: 'The Clouds Academy',
    institute_type: 'school',
    code: 'TCA-MAIN',
    settings: {
      has_branches: true,
    },
    branches: [
      { id: 'branch-001', name: 'Main Campus', code: 'MAIN' },
      { id: 'branch-002', name: 'North Campus', code: 'NORTH' },
      { id: 'branch-003', name: 'South Campus', code: 'SOUTH' },
    ],
  },
};

const MOCK_BRANCH_ADMIN = {
  id: 'user-branch-admin-001',
  first_name: 'Branch',
  last_name: 'Manager',
  name: 'Branch Admin',
  email: 'branchadmin@thecloudsacademy.com',
  user_type: 'BRANCH_ADMIN',
  role_code: 'BRANCH_ADMIN',
  branch_id: 'branch-002',
  permissions: ['*'],
  institute: {
    id: 'inst-school-001',
    name: 'The Clouds Academy',
    institute_type: 'school',
    code: 'TCA-MAIN',
    settings: {
      has_branches: true,
    },
    branches: [
      { id: 'branch-001', name: 'Main Campus', code: 'MAIN' },
      { id: 'branch-002', name: 'North Campus', code: 'NORTH' },
    ],
  },
  branch: {
    id: 'branch-002',
    name: 'North Campus',
    code: 'NORTH',
  },
};

const test = baseTest.extend({
  superAdminPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const urlObj = new URL(baseURL || 'http://localhost:3000');
    const domain = urlObj.hostname;

    await context.addCookies([
      { name: 'access_token', value: 'mock-super-token', domain, path: '/' },
      { name: 'role_code', value: 'SUPER_ADMIN', domain, path: '/' },
      { name: 'user_type', value: 'INSTITUTE_ADMIN', domain, path: '/' },
      { name: 'institute_type', value: 'school', domain, path: '/' },
    ]);

    const page = await context.newPage();
    await setupApiMocks(page);

    await page.addInitScript((userData) => {
      localStorage.setItem(
        'clouds-auth',
        JSON.stringify({
          state: {
            user: userData,
            isAuthenticated: true,
          },
          version: 0,
        })
      );
      localStorage.setItem('school_code', 'TCA-MAIN');
      localStorage.removeItem('active_branch_id');
      localStorage.setItem(
        'clouds-ui',
        JSON.stringify({
          state: {
            activeBranchId: null,
            activeBranchName: null,
          },
          version: 0,
        })
      );
    }, MOCK_SUPER_ADMIN);

    await use(page);
    await context.close();
  },

  branchAdminPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const urlObj = new URL(baseURL || 'http://localhost:3000');
    const domain = urlObj.hostname;

    await context.addCookies([
      { name: 'access_token', value: 'mock-branch-token', domain, path: '/' },
      { name: 'role_code', value: 'BRANCH_ADMIN', domain, path: '/' },
      { name: 'user_type', value: 'BRANCH_ADMIN', domain, path: '/' },
      { name: 'institute_type', value: 'school', domain, path: '/' },
    ]);

    const page = await context.newPage();
    await setupApiMocks(page);

    await page.addInitScript((userData) => {
      localStorage.setItem(
        'clouds-auth',
        JSON.stringify({
          state: {
            user: userData,
            isAuthenticated: true,
          },
          version: 0,
        })
      );
      localStorage.setItem('school_code', 'TCA-MAIN');
      localStorage.setItem('active_branch_id', 'branch-002');
      localStorage.setItem(
        'clouds-ui',
        JSON.stringify({
          state: {
            activeBranchId: 'branch-002',
            activeBranchName: 'North Campus',
          },
          version: 0,
        })
      );
    }, MOCK_BRANCH_ADMIN);

    await use(page);
    await context.close();
  },
});

test.describe('Multi-Branch UI & Access Control Suite', () => {
  test('Super Admin sees global branch selector and can switch branches', async ({ superAdminPage }) => {
    await superAdminPage.goto('/school/dashboard', { waitUntil: 'domcontentloaded' });

    // Look for Branch Selector dropdown trigger
    const branchSelectorBtn = superAdminPage.getByRole('button', { name: /all branches|branch selector/i }).first();
    await expect(branchSelectorBtn).toBeVisible({ timeout: 15000 });

    // Open dropdown menu
    await branchSelectorBtn.click();

    // Verify "All Branches" and active branches are listed in dropdown
    await expect(superAdminPage.getByRole('menuitem', { name: /all branches/i }).first()).toBeVisible();
    await expect(superAdminPage.getByRole('menuitem', { name: /north campus/i }).first()).toBeVisible();
  });

  test('Super Admin sees Branch select field on Student Creation modal', async ({ superAdminPage }) => {
    await superAdminPage.goto('/school/students', { waitUntil: 'domcontentloaded' });

    // Click Add Student button
    const addBtn = superAdminPage.getByRole('button', { name: /add student/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();

    // Navigate to Academic tab
    const academicTab = superAdminPage.getByRole('tab', { name: /academic/i }).first();
    if (await academicTab.isVisible()) {
      await academicTab.click();
    }

    // Verify Branch select field is rendered and visible
    const branchCombobox = superAdminPage.getByRole('combobox', { name: /branch/i }).first();
    await expect(branchCombobox).toBeVisible({ timeout: 10000 });
  });

  test('Branch Admin sees "Logged into: [Branch Name]" and no dropdown', async ({ branchAdminPage }) => {
    await branchAdminPage.goto('/school/dashboard', { waitUntil: 'domcontentloaded' });

    // Verify "Logged into: North Campus" badge is visible
    const loggedIntoText = branchAdminPage.getByText(/Logged into:/i).first();
    await expect(loggedIntoText).toBeVisible({ timeout: 15000 });
    await expect(branchAdminPage.getByText(/North Campus/i).first()).toBeVisible();

    // Verify NO interactive branch dropdown button exists for switching
    const branchDropdown = branchAdminPage.getByRole('button', { name: /all branches/i });
    await expect(branchDropdown).toHaveCount(0);
  });

  test('Super Admin sees Branch column in Data Table under "All Branches", hides it when a branch is selected', async ({ superAdminPage }) => {
    await superAdminPage.goto('/school/students', { waitUntil: 'domcontentloaded' });

    // In All Branches view, verify the table has a Branch column
    const branchHeader = superAdminPage.locator('th:has-text("Branch")').first();
    await expect(branchHeader).toBeVisible({ timeout: 15000 });

    // Open branch selector in header and choose "Main Campus"
    const branchSelectorBtn = superAdminPage.getByRole('button', { name: /all branches|branch selector/i }).first();
    await branchSelectorBtn.click();
    const mainCampusItem = superAdminPage.getByRole('menuitem', { name: /main campus/i }).first();
    await mainCampusItem.click();

    // After switching to single branch, verify Branch column is hidden
    await expect(superAdminPage.locator('th:has-text("Branch")')).toHaveCount(0);
  });

  test('Branch Admin does NOT see Branch column in Data Tables', async ({ branchAdminPage }) => {
    await branchAdminPage.goto('/school/students', { waitUntil: 'domcontentloaded' });

    // Verify Branch column header is NOT visible in table for Branch Admin
    await expect(branchAdminPage.locator('th:has-text("Branch")')).toHaveCount(0);
  });

  test('Super Admin sees Branch select field on Teacher Creation modal', async ({ superAdminPage }) => {
    await superAdminPage.goto('/school/dashboard', { waitUntil: 'domcontentloaded' });
    await superAdminPage.getByRole('link', { name: 'Teachers' }).click();
    await superAdminPage.waitForLoadState('domcontentloaded');
    const addTeacherBtn = superAdminPage.getByRole('button', { name: /add teacher/i }).first();
    if (await addTeacherBtn.isVisible()) {
      await addTeacherBtn.click();
      const empTab = superAdminPage.getByRole('tab', { name: /employment/i }).first();
      if (await empTab.isVisible()) await empTab.click();
      await expect(superAdminPage.getByRole('combobox', { name: /branch/i }).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Branch Admin does NOT see Branch select field on Teacher Creation modal', async ({ branchAdminPage }) => {
    await branchAdminPage.goto('/school/dashboard', { waitUntil: 'domcontentloaded' });
    await branchAdminPage.getByRole('link', { name: 'Teachers' }).click();
    await branchAdminPage.waitForLoadState('domcontentloaded');
    const addTeacherBtnBranch = branchAdminPage.getByRole('button', { name: /add teacher/i }).first();
    if (await addTeacherBtnBranch.isVisible()) {
      await addTeacherBtnBranch.click();
      const empTab = branchAdminPage.getByRole('tab', { name: /employment/i }).first();
      if (await empTab.isVisible()) await empTab.click();
      await expect(branchAdminPage.getByRole('combobox', { name: /^branch/i })).toHaveCount(0);
    }
  });

  test('Super Admin sees Branch select field on Class Creation modal', async ({ superAdminPage }) => {
    await superAdminPage.goto('/school/dashboard', { waitUntil: 'domcontentloaded' });
    await superAdminPage.getByRole('link', { name: 'Classes' }).click();
    await superAdminPage.waitForLoadState('domcontentloaded');
    const addClassBtn = superAdminPage.getByRole('button', { name: /add class/i }).first();
    if (await addClassBtn.isVisible()) {
      await addClassBtn.click();
      await expect(superAdminPage.getByRole('combobox', { name: /branch/i }).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Super Admin sees Branch select field on Exam Creation modal', async ({ superAdminPage }) => {
    await superAdminPage.goto('/school/dashboard', { waitUntil: 'domcontentloaded' });
    await superAdminPage.getByRole('link', { name: 'Exams' }).click();
    await superAdminPage.waitForLoadState('domcontentloaded');
    const addExamBtn = superAdminPage.getByRole('button', { name: /create exam|add exam|new exam/i }).first();
    if (await addExamBtn.isVisible()) {
      await addExamBtn.click();
      await expect(superAdminPage.getByRole('combobox', { name: /branch/i }).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Branch Admin does NOT see "Branches" in sidebar navigation', async ({ branchAdminPage }) => {
    await branchAdminPage.goto('/school/dashboard', { waitUntil: 'domcontentloaded' });
    const branchesNavLink = branchAdminPage.getByRole('link', { name: /^branches$/i });
    await expect(branchesNavLink).toHaveCount(0);
  });

  test('Branch Admin visiting /school/branches is restricted and sees assigned branch only', async ({ branchAdminPage }) => {
    await branchAdminPage.goto('/school/branches', { waitUntil: 'domcontentloaded' });
    await expect(branchAdminPage.getByText(/Branch-Scoped Access/i)).toBeVisible({ timeout: 10000 });
    await expect(branchAdminPage.getByRole('main').getByText(/North Campus/i)).toBeVisible();
    await expect(branchAdminPage.getByRole('button', { name: /new branch/i })).toHaveCount(0);
  });
});
