const { test, expect } = require('../../fixtures');
const { daysFromToday } = require('../../utils/dates');
const msg = require('../../test-data/messages');

test.describe('Complete and edit task', () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('@p1 checking a task completes it and updates the counter (TASK-12, TASK-13)', async ({ tasksPage }) => {
    await tasksPage.toggle('Write test plan');
    await expect(tasksPage.row('Write test plan').getByTestId('task-checkbox')).toBeChecked();
    await expect(tasksPage.row('Write test plan').getByTestId('task-title')).toHaveCSS('text-decoration-line', 'line-through');
    await tasksPage.expectItemsLeft(2);
  });

  test('@p1 unchecking reverses completion (TASK-12)', async ({ tasksPage }) => {
    await tasksPage.toggle('Update README');
    await expect(tasksPage.row('Update README').getByTestId('task-checkbox')).not.toBeChecked();
    await tasksPage.expectItemsLeft(4);
  });

  test('counter uses singular for one item (TASK-14)', async ({ tasksPage }) => {
    await tasksPage.toggle('Write test plan');
    await tasksPage.toggle('Review pull request');
    await tasksPage.expectItemsLeft(1);
    await expect(tasksPage.itemsLeft).toHaveText('1 item left');
  });

  test('completed state survives reload (TASK-15)', async ({ page, tasksPage }) => {
    await tasksPage.toggle('Book team retro');
    await page.reload();
    await expect(tasksPage.row('Book team retro').getByTestId('task-checkbox')).toBeChecked();
  });

  test('@p1 Edit shows prefilled inputs with Save and Cancel (TASK-16)', async ({ tasksPage }) => {
    await tasksPage.startEdit('Review pull request');
    const r = tasksPage.editRow;
    await expect(r.getByTestId('edit-title-input')).toHaveValue('Review pull request');
    await expect(r.getByTestId('edit-priority-select')).toHaveValue('High');
    await expect(r.getByTestId('edit-due-input')).toHaveValue('2026-11-05');
    await expect(r.getByTestId('save-button')).toBeVisible();
    await expect(r.getByTestId('cancel-button')).toBeVisible();
  });

  test('@p1 Save applies title, priority and due date (TASK-17, TASK-20)', async ({ tasksPage }) => {
    const due = daysFromToday(7);
    await tasksPage.startEdit('Write test plan');
    await tasksPage.fillEdit({ title: 'Write test strategy', priority: 'High', due });
    await tasksPage.saveEdit();
    const row = tasksPage.row('Write test strategy');
    await expect(row.getByTestId('task-priority')).toHaveText('High');
    await expect(row.getByTestId('task-due')).toHaveText(due);
    await expect(tasksPage.row('Write test plan')).toHaveCount(0);
    await expect(tasksPage.editRow).toHaveCount(0);
  });

  test('@p1 Cancel discards changes (TASK-18)', async ({ tasksPage }) => {
    await tasksPage.startEdit('Write test plan');
    await tasksPage.fillEdit({ title: 'Changed', priority: 'Low' });
    await tasksPage.cancelEdit();
    const row = tasksPage.row('Write test plan');
    await expect(row.getByTestId('task-priority')).toHaveText('Medium');
    await expect(tasksPage.row('Changed')).toHaveCount(0);
  });

  test('@p1 Save with empty title is rejected (TASK-19)', async ({ tasksPage }) => {
    await tasksPage.startEdit('Write test plan');
    await tasksPage.fillEdit({ title: '' });
    await tasksPage.saveEdit();
    await expect(tasksPage.editRow.getByTestId('edit-error')).toHaveText(msg.titleRequired);
    await expect(tasksPage.editRow).toHaveCount(1);
  });

  test('Save with past due date is rejected (TASK-19)', async ({ tasksPage }) => {
    await tasksPage.startEdit('Write test plan');
    await tasksPage.fillEdit({ due: daysFromToday(-1) });
    await tasksPage.saveEdit();
    await expect(tasksPage.editRow.getByTestId('edit-error')).toHaveText(msg.dueInPast);
  });

  test('only one row is in edit mode at a time (TASK-21)', async ({ tasksPage }) => {
    await tasksPage.startEdit('Write test plan');
    await tasksPage.startEdit('Book team retro');
    await expect(tasksPage.editRow).toHaveCount(1);
    await expect(tasksPage.editRow.getByTestId('edit-title-input')).toHaveValue('Book team retro');
  });

  test('edited task persists after reload', async ({ page, tasksPage }) => {
    await tasksPage.startEdit('Write test plan');
    await tasksPage.fillEdit({ title: 'Renamed' });
    await tasksPage.saveEdit();
    await page.reload();
    await expect(tasksPage.row('Renamed')).toBeVisible();
  });
});
