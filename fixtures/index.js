const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { TasksPage } = require('../pages/TasksPage');
const { ProfilePage } = require('../pages/ProfilePage');
const { validUser } = require('../test-data/users');

/**
 * Fixtures:
 *  - loginPage / tasksPage / profilePage: page objects on a fresh browser context
 *    (each Playwright test gets clean localStorage, so seed data is always reset).
 *  - loggedIn: logs in through the UI, then returns the TasksPage.
 */
const test = base.test.extend({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  tasksPage: async ({ page }, use) => use(new TasksPage(page)),
  profilePage: async ({ page }, use) => use(new ProfilePage(page)),
  loggedIn: async ({ page, loginPage, tasksPage }, use) => {
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
    await base.expect(page).toHaveURL(/\/tasks$/);
    await use(tasksPage);
  },
});

module.exports = { test, expect: base.expect };
