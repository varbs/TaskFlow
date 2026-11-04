const { test, expect } = require('../../fixtures');
const msg = require('../../test-data/messages');
const { seedTitles } = require('../../test-data/tasks');

test.describe('Delete and clear completed', { tag: '@regression' }, () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('@smoke Delete removes the task immediately, no dialog (TASK-22)', async ({ page, tasksPage }) => {
    let dialogSeen = false;
    page.on('dialog', async (d) => { dialogSeen = true; await d.dismiss(); });
    await tasksPage.remove('Review pull request');
    await expect(tasksPage.row('Review pull request')).toHaveCount(0);
    await expect(tasksPage.rows).toHaveCount(seedTitles.length - 1);
    expect(dialogSeen).toBe(false);
  });

  test('@smoke deleting an unchecked task decreases items left (TASK-23)', async ({ tasksPage }) => {
    await tasksPage.remove('Write test plan');
    await tasksPage.expectItemsLeft(2);
  });

  test('@smoke deleting a checked task keeps items left (TASK-23)', async ({ tasksPage }) => {
    await tasksPage.remove('Update README');
    await tasksPage.expectItemsLeft(3);
  });

  test('@smoke Clear completed removes only checked tasks (TASK-24)', async ({ tasksPage }) => {
    await tasksPage.toggle('Write test plan');
    await tasksPage.clearCompleted.click();
    await tasksPage.expectTitles(['Review pull request', 'Book team retro']);
    await tasksPage.expectItemsLeft(2);
  });

  test('Clear completed is enabled only when something is checked (TASK-25)', async ({ tasksPage }) => {
    await expect(tasksPage.clearCompleted).toBeEnabled(); // seed has a completed task
    await tasksPage.clearCompleted.click();
    await expect(tasksPage.clearCompleted).toBeDisabled();
  });

  test('@smoke deleting every task shows the empty state (TASK-26, TASK-27)', async ({ tasksPage }) => {
    for (const title of ['Write test plan', 'Review pull request', 'Update README', 'Book team retro']) {
      await tasksPage.remove(title);
    }
    await expect(tasksPage.emptyState).toHaveText(msg.emptyState);
    await expect(tasksPage.itemsLeft).toHaveText('0 items left');
    await expect(tasksPage.clearCompleted).toBeDisabled();
  });

  test('deletion persists after reload', async ({ page, tasksPage }) => {
    await tasksPage.remove('Book team retro');
    await page.reload();
    await expect(tasksPage.row('Book team retro')).toHaveCount(0);
  });
});
