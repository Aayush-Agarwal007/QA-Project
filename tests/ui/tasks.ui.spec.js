/**
 * UI test suite for TaskFlow Mini.
 *
 * Run with:  npm run test:ui  (after npm run test:ui:install, once)
 *
 * Playwright auto-starts the app via webServer in playwright.config.js,
 * so you don't need to start it manually first.
 *
 * Note: BUG-001 (empty title accepted) is also visible from the UI layer
 * here — it's a good example of the same defect being catchable at both
 * the API and UI level, which is worth pointing out in the interview.
 */
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page, request }) => {
  await request.post('/api/reset');
  await page.goto('/');
});

test('page loads with the seeded task list', async ({ page }) => {
  await expect(page.locator('.task')).toHaveCount(3);
  await expect(page.locator('h1')).toHaveText('TaskFlow Mini');
});

test('user can add a new task', async ({ page }) => {
  await page.fill('#title-input', 'Write Playwright suite');
  await page.selectOption('#priority-input', 'high');
  await page.click('button[type="submit"]');

  await expect(page.locator('.task')).toHaveCount(4);
  await expect(page.locator('.task-title', { hasText: 'Write Playwright suite' })).toBeVisible();
});

test('user can mark a task complete and it shows strikethrough styling', async ({ page }) => {
  const firstTask = page.locator('.task').first();
  const taskId = await firstTask.getAttribute('data-testid'); // e.g. "task-1"
  const id = taskId.split('-')[1];

  await page.click(`[data-testid="complete-${id}"]`);
  await expect(page.locator(`[data-testid="task-${id}"]`)).toHaveClass(/completed/);
});

test('user can delete a task', async ({ page }) => {
  const firstTask = page.locator('.task').first();
  const taskId = await firstTask.getAttribute('data-testid');
  const id = taskId.split('-')[1];

  await page.click(`[data-testid="delete-${id}"]`);
  await expect(page.locator('.task')).toHaveCount(2);
});

// --- Documents BUG-001 from the UI layer ---
// Expected: submitting the form with an empty title should NOT add a task
// (or should show a validation message).
// Actual: a blank task is silently added to the list.
test('BUG-001 (UI): submitting an empty title should not add a blank task', async ({ page }) => {
  await page.fill('#title-input', '');
  await page.click('button[type="submit"]');

  await expect(page.locator('.task')).toHaveCount(3); // still 3 — no blank task added
});
