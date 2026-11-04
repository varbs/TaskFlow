const { expect } = require('@playwright/test');
const { NavBar } = require('./NavBar');

class TasksPage {
  constructor(page) {
    this.page = page;
    this.nav = new NavBar(page);
    // add form
    this.titleInput = page.getByTestId('task-title-input');
    this.prioritySelect = page.getByTestId('task-priority-select');
    this.dueInput = page.getByTestId('task-due-input');
    this.addButton = page.getByTestId('add-task-button');
    this.addError = page.getByTestId('add-task-error');
    // search + filters
    this.searchInput = page.getByTestId('search-input');
    this.filterAll = page.getByTestId('filter-all');
    this.filterActive = page.getByTestId('filter-active');
    this.filterCompleted = page.getByTestId('filter-completed');
    // list + footer
    this.rows = page.getByTestId('task-item');
    this.emptyState = page.getByTestId('empty-state');
    this.itemsLeft = page.getByTestId('items-left');
    this.clearCompleted = page.getByTestId('clear-completed');
  }

  async goto() {
    await this.page.goto('/tasks');
  }

  /** Row locator by exact title (read-only rows only). */
  row(title) {
    return this.rows.filter({ has: this.page.getByTestId('task-title').getByText(title, { exact: true }) });
  }

  async addTask({ title = '', priority, due } = {}) {
    await this.titleInput.fill(title);
    if (priority) await this.prioritySelect.selectOption(priority);
    if (due) await this.dueInput.fill(due);
    await this.addButton.click();
  }

  async toggle(title) {
    await this.row(title).getByTestId('task-checkbox').click();
  }

  async startEdit(title) {
    await this.row(title).getByTestId('edit-button').click();
  }

  /** The single row currently in edit mode. */
  get editRow() {
    return this.rows.filter({ has: this.page.getByTestId('edit-title-input') });
  }

  async fillEdit({ title, priority, due }) {
    const r = this.editRow;
    if (title !== undefined) await r.getByTestId('edit-title-input').fill(title);
    if (priority) await r.getByTestId('edit-priority-select').selectOption(priority);
    if (due !== undefined) await r.getByTestId('edit-due-input').fill(due);
  }

  async saveEdit() {
    await this.editRow.getByTestId('save-button').click();
  }

  async cancelEdit() {
    await this.editRow.getByTestId('cancel-button').click();
  }

  async remove(title) {
    await this.row(title).getByTestId('delete-button').click();
  }

  async search(text) {
    await this.searchInput.fill(text);
  }

  async titles() {
    return this.page.getByTestId('task-title').allTextContents();
  }

  async expectTitles(titles) {
    await expect(this.page.getByTestId('task-title')).toHaveText(titles);
  }

  async expectItemsLeft(n) {
    await expect(this.itemsLeft).toHaveText(`${n} ${n === 1 ? 'item' : 'items'} left`);
  }
}

module.exports = { TasksPage };
