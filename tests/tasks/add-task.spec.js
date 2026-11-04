const { test, expect } = require('../../fixtures');
const { daysFromToday } = require('../../utils/dates');
const msg = require('../../test-data/messages');
const { seedTitles, seedItemsLeft } = require('../../test-data/tasks');

test.describe('Add task', { tag: '@regression' }, () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('@smoke form shows fields, defaults and hints (TASK-01)', async ({ page, tasksPage }) => {
    await expect(tasksPage.titleInput).toHaveValue('');
    await expect(tasksPage.prioritySelect).toHaveValue('Medium');
    await expect(tasksPage.prioritySelect.getByRole('option')).toHaveText(['Low', 'Medium', 'High']);
    await expect(page.getByText('Required, max 50 characters')).toBeVisible();
    await expect(page.getByText('Must be today or later')).toBeVisible();
    await expect(tasksPage.addButton).toHaveText('Add task');
  });

  test('seed data is shown on first visit', async ({ tasksPage }) => {
    await tasksPage.expectTitles(seedTitles);
    await tasksPage.expectItemsLeft(seedItemsLeft);
  });

  test('@smoke adds a valid task at the bottom (TASK-02, TASK-03)', async ({ tasksPage }) => {
    const due = daysFromToday(3);
    await tasksPage.addTask({ title: 'Write release notes', priority: 'High', due });
    const row = tasksPage.row('Write release notes');
    await expect(row).toBeVisible();
    await expect(row.getByTestId('task-priority')).toHaveText('High');
    await expect(row.getByTestId('task-due')).toHaveText(due);
    await expect(row.getByTestId('task-checkbox')).not.toBeChecked();
    await expect(tasksPage.rows.last()).toContainText('Write release notes');
    await tasksPage.expectItemsLeft(seedItemsLeft + 1);
    // form resets
    await expect(tasksPage.titleInput).toHaveValue('');
    await expect(tasksPage.prioritySelect).toHaveValue('Medium');
    await expect(tasksPage.dueInput).toHaveValue('');
    await expect(tasksPage.addError).toBeEmpty();
  });

  test('@smoke @a11y empty title is rejected (TASK-04, TASK-09)', async ({ tasksPage }) => {
    await tasksPage.addTask({ title: '' });
    await expect(tasksPage.addError).toHaveText(msg.titleRequired);
    await expect(tasksPage.addError).toHaveAttribute('role', 'alert');
    await expect(tasksPage.titleInput).toHaveAttribute('aria-invalid', 'true');
    await expect(tasksPage.rows).toHaveCount(seedTitles.length);
  });

  test('@smoke whitespace-only title is rejected (TASK-04)', async ({ tasksPage }) => {
    await tasksPage.addTask({ title: '     ' });
    await expect(tasksPage.addError).toHaveText(msg.titleRequired);
    await expect(tasksPage.rows).toHaveCount(seedTitles.length);
  });

  test('@smoke title input limits entry to 50 characters (TASK-05)', async ({ tasksPage }) => {
    await expect(tasksPage.titleInput).toHaveAttribute('maxlength', '50');
    await tasksPage.titleInput.fill('x'.repeat(60));
    await expect(tasksPage.titleInput).toHaveValue('x'.repeat(50));
  });

  test('@smoke a 50-character title is accepted (TASK-05)', async ({ tasksPage }) => {
    const title = 'a'.repeat(50);
    await tasksPage.addTask({ title });
    await expect(tasksPage.row(title)).toBeVisible();
  });

  test('@smoke past due date is rejected (TASK-06)', async ({ tasksPage }) => {
    await tasksPage.addTask({ title: 'Late task', due: daysFromToday(-1) });
    await expect(tasksPage.addError).toHaveText(msg.dueInPast);
    await expect(tasksPage.rows).toHaveCount(seedTitles.length);
  });

  test('@smoke due date of today is accepted (TASK-07)', async ({ tasksPage }) => {
    await tasksPage.addTask({ title: 'Due today', due: daysFromToday(0) });
    await expect(tasksPage.row('Due today')).toBeVisible();
  });

  test('due date is optional (TASK-08)', async ({ tasksPage }) => {
    await tasksPage.addTask({ title: 'No date' });
    await expect(tasksPage.row('No date').getByTestId('task-due')).toHaveText('');
  });

  test('title is trimmed before saving (TASK-10)', async ({ tasksPage }) => {
    await tasksPage.addTask({ title: '   Padded title   ' });
    await expect(tasksPage.row('Padded title')).toBeVisible();
  });

  for (const priority of ['Low', 'Medium', 'High']) {
    test(`task is added with ${priority} priority badge (TASK-11)`, async ({ tasksPage }) => {
      await tasksPage.addTask({ title: `P ${priority}`, priority });
      await expect(tasksPage.row(`P ${priority}`).getByTestId('task-priority')).toHaveText(priority);
    });
  }

  test('error clears after a successful add (TASK-03)', async ({ tasksPage }) => {
    await tasksPage.addTask({ title: '' });
    await expect(tasksPage.addError).toHaveText(msg.titleRequired);
    await tasksPage.addTask({ title: 'Now valid' });
    await expect(tasksPage.addError).toBeEmpty();
  });

  test('added task persists after reload (TASK-15)', async ({ page, tasksPage }) => {
    await tasksPage.addTask({ title: 'Persistent' });
    await page.reload();
    await expect(tasksPage.row('Persistent')).toBeVisible();
  });
});
