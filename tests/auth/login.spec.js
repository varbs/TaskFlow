const { test, expect } = require('../../fixtures');
const { validUser } = require('../../test-data/users');
const msg = require('../../test-data/messages');

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('@p1 shows email, password, button and demo hint (AUTH-01)', async ({ loginPage }) => {
    await expect(loginPage.email).toBeVisible();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.loginButton).toHaveText('Log in');
    await expect(loginPage.demoHint).toHaveText('Demo account: user@test.com / Password123');
    await expect(loginPage.error).toHaveCount(0);
  });

  test('password field masks input (AUTH-02)', async ({ loginPage }) => {
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('@p1 valid credentials open the Tasks page (AUTH-03)', async ({ page, loginPage }) => {
    await loginPage.login(validUser.email, validUser.password);
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByTestId('add-task-button')).toBeVisible();
  });

  test('@p1 empty form shows required error (AUTH-04, AUTH-07)', async ({ page, loginPage }) => {
    await loginPage.loginButton.click();
    await loginPage.expectError(msg.loginRequired);
    await expect(loginPage.error).toHaveAttribute('role', 'alert');
    await expect(loginPage.email).toHaveAttribute('aria-invalid', 'true');
    await expect(loginPage.password).toHaveAttribute('aria-invalid', 'true');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('@p1 email only shows required error (AUTH-04)', async ({ loginPage }) => {
    await loginPage.login(validUser.email, '');
    await loginPage.expectError(msg.loginRequired);
  });

  test('@p1 password only shows required error (AUTH-04)', async ({ loginPage }) => {
    await loginPage.login('', validUser.password);
    await loginPage.expectError(msg.loginRequired);
  });

  test('@p1 wrong password shows invalid error (AUTH-05)', async ({ page, loginPage }) => {
    await loginPage.login(validUser.email, 'WrongPass1');
    await loginPage.expectError(msg.loginInvalid);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('wrong email shows the same invalid error (AUTH-06)', async ({ loginPage }) => {
    await loginPage.login('nobody@test.com', validUser.password);
    await loginPage.expectError(msg.loginInvalid);
  });

  test('email is case-insensitive and trimmed (AUTH-11)', async ({ page, loginPage }) => {
    await loginPage.login('  USER@Test.com ', validUser.password);
    await expect(page).toHaveURL(/\/tasks$/);
  });

  test('password is case-sensitive (AUTH-05)', async ({ loginPage }) => {
    await loginPage.login(validUser.email, 'password123');
    await loginPage.expectError(msg.loginInvalid);
  });

  test('@p1 log out returns to Login (AUTH-08)', async ({ page, loginPage, tasksPage }) => {
    await loginPage.login(validUser.email, validUser.password);
    await tasksPage.nav.logoutButton.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('@p1 protected pages redirect to Login when logged out (AUTH-09)', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('protected pages stay closed after logout (AUTH-09)', async ({ page, loginPage, tasksPage }) => {
    await loginPage.login(validUser.email, validUser.password);
    await tasksPage.nav.logoutButton.click();
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logged-in user opening Login lands on Tasks (AUTH-10)', async ({ page, loginPage }) => {
    await loginPage.login(validUser.email, validUser.password);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/tasks$/);
  });
});
