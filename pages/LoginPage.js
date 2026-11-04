const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.getByTestId('email-input');
    this.password = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('login-error');
    this.demoHint = page.getByTestId('demo-hint');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectError(message) {
    await expect(this.error).toHaveText(message);
  }
}

module.exports = { LoginPage };
