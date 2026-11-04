const { expect } = require('@playwright/test');
const { NavBar } = require('./NavBar');

class ProfilePage {
  constructor(page) {
    this.page = page;
    this.nav = new NavBar(page);
    this.fullName = page.getByTestId('full-name-input');
    this.email = page.getByTestId('email-input');
    this.phone = page.getByTestId('phone-input');
    this.saveButton = page.getByTestId('save-profile-button');
    this.success = page.getByTestId('profile-success');
    this.nameError = page.getByTestId('full-name-error');
    this.emailError = page.getByTestId('email-error');
    this.phoneError = page.getByTestId('phone-error');
  }

  async goto() {
    await this.page.goto('/profile');
  }

  async fillAndSave({ fullName, email, phone }) {
    if (fullName !== undefined) await this.fullName.fill(fullName);
    if (email !== undefined) await this.email.fill(email);
    if (phone !== undefined) await this.phone.fill(phone);
    await this.saveButton.click();
  }

  async expectNoErrors() {
    await expect(this.nameError).toHaveCount(0);
    await expect(this.emailError).toHaveCount(0);
    await expect(this.phoneError).toHaveCount(0);
  }
}

module.exports = { ProfilePage };
