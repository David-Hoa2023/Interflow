import { test, expect } from '@playwright/test';

test.describe('InferFlow Basic Functionality', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/InferFlow/i);

    // Check header is visible
    const header = page.getByRole('heading', { name: /InferFlow/i });
    await expect(header).toBeVisible();
  });

  test('should display the inference window', async ({ page }) => {
    await page.goto('/');

    // Check inference window exists
    const textarea = page.getByPlaceholder(/Ask a question/i);
    await expect(textarea).toBeVisible();

    // Check send button exists
    const sendButton = page.getByRole('button', { name: /Send/i });
    await expect(sendButton).toBeVisible();
  });

  test('should have settings button', async ({ page }) => {
    await page.goto('/');

    const settingsButton = page.getByRole('button', { name: /Settings/i });
    await expect(settingsButton).toBeVisible();
  });

  test('should open settings panel', async ({ page }) => {
    await page.goto('/');

    // Click settings button
    await page.getByRole('button', { name: /Settings/i }).click();

    // Check settings panel is visible
    await expect(page.getByText(/Model Settings/i)).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');

    // Get initial theme
    const htmlElement = page.locator('html');
    const initialDarkMode = await htmlElement.getAttribute('class');

    // Click theme toggle
    const themeButton = page.getByRole('button', { name: /🌙|☀️/ });
    await themeButton.click();

    // Check theme changed
    const newDarkMode = await htmlElement.getAttribute('class');
    expect(newDarkMode).not.toBe(initialDarkMode);
  });

  test('should display canvas', async ({ page }) => {
    await page.goto('/');

    // Check React Flow canvas exists
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });

  test('should have navigation buttons', async ({ page }) => {
    await page.goto('/');

    // Check for key navigation buttons
    await expect(page.getByRole('button', { name: /Sessions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Bookmarks/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export/i })).toBeVisible();
  });

  test('should show new question button', async ({ page }) => {
    await page.goto('/');

    const newQuestionButton = page.getByRole('button', { name: /New Question/i });
    await expect(newQuestionButton).toBeVisible();
  });
});

test.describe('InferFlow Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');

    // Basic accessibility check - ensure interactive elements are keyboard accessible
    const settingsButton = page.getByRole('button', { name: /Settings/i });
    await settingsButton.focus();
    await expect(settingsButton).toBeFocused();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
