class NavBar {
  constructor(page) {
    this.tasksLink = page.getByTestId('nav-tasks');
    this.profileLink = page.getByTestId('nav-profile');
    this.logoutButton = page.getByTestId('logout-button');
  }
}

module.exports = { NavBar };
