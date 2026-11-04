const { test, expect } = require('../../fixtures');
const msg = require('../../test-data/messages');
const { seedTitles, seedActiveTitles, seedCompletedTitles } = require('../../test-data/tasks');

test.describe('Search and filter', () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('@p1 All is selected by default (FILT-03)', async ({ tasksPage }) => {
    await expect(tasksPage.filterAll).toHaveAttribute('aria-pressed', 'true');
    await expect(tasksPage.filterActive).toHaveAttribute('aria-pressed', 'false');
    await expect(tasksPage.filterCompleted).toHaveAttribute('aria-pressed', 'false');
  });

  test('@p1 search is a case-insensitive substring match (FILT-01)', async ({ tasksPage }) => {
    await tasksPage.search('REVIEW');
    await tasksPage.expectTitles(['Review pull request']);
    await tasksPage.search('e');
    await tasksPage.expectTitles(seedTitles);
  });

  test('search filters as you type, without submit (FILT-02)', async ({ page, tasksPage }) => {
    await tasksPage.searchInput.click();
    await page.keyboard.type('readme');
    await tasksPage.expectTitles(['Update README']);
  });

  test('@p1 Active shows unchecked tasks only (FILT-04)', async ({ tasksPage }) => {
    await tasksPage.filterActive.click();
    await tasksPage.expectTitles(seedActiveTitles);
    await expect(tasksPage.filterActive).toHaveAttribute('aria-pressed', 'true');
    await expect(tasksPage.filterAll).toHaveAttribute('aria-pressed', 'false');
  });

  test('@p1 Completed shows checked tasks only (FILT-04)', async ({ tasksPage }) => {
    await tasksPage.filterCompleted.click();
    await tasksPage.expectTitles(seedCompletedTitles);
  });

  test('@p1 search and filter combine (FILT-05)', async ({ tasksPage }) => {
    await tasksPage.filterActive.click();
    await tasksPage.search('t');
    await tasksPage.expectTitles(['Write test plan', 'Review pull request', 'Book team retro']);
    await tasksPage.search('readme');
    await expect(tasksPage.emptyState).toHaveText(msg.emptyState);
  });

  test('clearing search restores the current filter (FILT-06)', async ({ tasksPage }) => {
    await tasksPage.filterActive.click();
    await tasksPage.search('zzz');
    await expect(tasksPage.emptyState).toBeVisible();
    await tasksPage.search('');
    await tasksPage.expectTitles(seedActiveTitles);
  });

  test('@p1 no match shows the empty state (TASK-26)', async ({ tasksPage }) => {
    await tasksPage.search('does not exist');
    await expect(tasksPage.emptyState).toHaveText(msg.emptyState);
    await expect(tasksPage.rows).toHaveCount(0);
  });

  test('search and filter do not change items left (FILT-07)', async ({ tasksPage }) => {
    await tasksPage.filterCompleted.click();
    await tasksPage.search('readme');
    await tasksPage.expectItemsLeft(3);
  });

  test('checking a task under Active removes it from view (FILT-08)', async ({ tasksPage }) => {
    await tasksPage.filterActive.click();
    await tasksPage.toggle('Write test plan');
    await tasksPage.expectTitles(['Review pull request', 'Book team retro']);
  });

  test('Completed with nothing checked shows the empty state', async ({ tasksPage }) => {
    await tasksPage.toggle('Update README');
    await tasksPage.filterCompleted.click();
    await expect(tasksPage.emptyState).toHaveText(msg.emptyState);
  });
});
