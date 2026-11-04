const { test, expect } = require('../../fixtures');
const { defaultProfile } = require('../../test-data/users');
const msg = require('../../test-data/messages');

test.describe('Profile', () => {
  test.beforeEach(async ({ loggedIn, tasksPage, profilePage }) => {
    await tasksPage.nav.profileLink.click();
    await expect(profilePage.fullName).toBeVisible();
  });

  test('@p1 shows prefilled values and phone hint (PROF-01, NAV-01)', async ({ page, profilePage }) => {
    await expect(page).toHaveURL(/\/profile$/);
    await expect(profilePage.nav.profileLink).toHaveAttribute('aria-current', 'page');
    await expect(profilePage.fullName).toHaveValue(defaultProfile.fullName);
    await expect(profilePage.email).toHaveValue(defaultProfile.email);
    await expect(profilePage.phone).toHaveValue(defaultProfile.phone);
    await expect(page.getByText('Digits only, at least 7')).toBeVisible();
    await expect(profilePage.success).toHaveCount(0);
  });

  test('@p1 valid save shows success and persists (PROF-02)', async ({ page, profilePage }) => {
    await profilePage.fillAndSave({ fullName: 'Jane QA', email: 'jane@test.com', phone: '0917123456' });
    await expect(profilePage.success).toHaveText(msg.profileSaved);
    await page.reload();
    await expect(profilePage.fullName).toHaveValue('Jane QA');
    await expect(profilePage.email).toHaveValue('jane@test.com');
    await expect(profilePage.phone).toHaveValue('0917123456');
  });

  test('@p1 empty full name is rejected (PROF-03, PROF-08, PROF-10)', async ({ page, profilePage }) => {
    await profilePage.fillAndSave({ fullName: '' });
    await expect(profilePage.nameError).toHaveText(msg.nameRequired);
    await expect(profilePage.nameError).toHaveAttribute('role', 'alert');
    await expect(profilePage.fullName).toHaveAttribute('aria-invalid', 'true');
    await expect(profilePage.success).toHaveCount(0);
    await page.reload();
    await expect(profilePage.fullName).toHaveValue(defaultProfile.fullName);
  });

  for (const bad of ['user@test', 'plainaddress', 'a b@test.com', '']) {
    test(`@p1 invalid email "${bad}" is rejected (PROF-04)`, async ({ profilePage }) => {
      await profilePage.fillAndSave({ email: bad });
      await expect(profilePage.emailError).toHaveText(msg.emailInvalid);
      await expect(profilePage.success).toHaveCount(0);
    });
  }

  for (const bad of ['12ab', '123456', '555-1234', '555 1234']) {
    test(`@p1 invalid phone "${bad}" is rejected (PROF-05)`, async ({ profilePage }) => {
      await profilePage.fillAndSave({ phone: bad });
      await expect(profilePage.phoneError).toHaveText(msg.phoneInvalid);
      await expect(profilePage.success).toHaveCount(0);
    });
  }

  test('@p1 phone of exactly 7 digits is accepted (PROF-06)', async ({ profilePage }) => {
    await profilePage.fillAndSave({ phone: '1234567' });
    await expect(profilePage.success).toBeVisible();
    await profilePage.expectNoErrors();
  });

  test('phone is optional (PROF-07)', async ({ profilePage }) => {
    await profilePage.fillAndSave({ phone: '' });
    await expect(profilePage.success).toBeVisible();
  });

  test('all three errors appear together (PROF-03/04/05)', async ({ profilePage }) => {
    await profilePage.fillAndSave({ fullName: '', email: 'user@test', phone: '12ab' });
    await expect(profilePage.nameError).toBeVisible();
    await expect(profilePage.emailError).toBeVisible();
    await expect(profilePage.phoneError).toBeVisible();
  });

  test('success banner disappears when a field is edited (PROF-09)', async ({ profilePage }) => {
    await profilePage.fillAndSave({ fullName: 'Someone Else' });
    await expect(profilePage.success).toBeVisible();
    await profilePage.fullName.fill('Someone Else 2');
    await expect(profilePage.success).toHaveCount(0);
  });

  test('errors clear after a valid save', async ({ profilePage }) => {
    await profilePage.fillAndSave({ fullName: '' });
    await expect(profilePage.nameError).toBeVisible();
    await profilePage.fillAndSave({ fullName: 'Fixed Name' });
    await profilePage.expectNoErrors();
    await expect(profilePage.success).toBeVisible();
  });

  test('@p1 navigation and logout work from Profile (NAV-01, NAV-02)', async ({ page, profilePage }) => {
    await profilePage.nav.tasksLink.click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(profilePage.nav.tasksLink).toHaveAttribute('aria-current', 'page');
    await profilePage.nav.profileLink.click();
    await profilePage.nav.logoutButton.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
