import { test, expect } from '@playwright/test';

test.describe('Darkfall Gear Optimizer', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Check that the title is correct
    await expect(page).toHaveTitle(/Darkfall Gear Optimizer/);

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Darkfall Gear Optimizer' })).toBeVisible();
  });

  test('should select a dataset and show results', async ({ page }) => {
    await page.goto('/');

    // Select a dataset
    await page.selectOption('select#dataset', { label: /50% Fire, 50% Slashing/ });

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Verify results are displayed
    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();
    await expect(page.getByText('Fixed Slots')).toBeVisible();
    await expect(page.getByText('Total Protection')).toBeVisible();
  });

  test('should update results when encumbrance changes', async ({ page }) => {
    await page.goto('/');

    // Select a dataset
    await page.selectOption('select#dataset', { label: /100% Slashing/ });
    await page.waitForTimeout(1000);

    // Get initial protection value
    const initialProtection = await page.locator('text=Total Protection').locator('..').locator('.text-lg').textContent();

    // Click the +0.1 button several times
    await page.getByRole('button', { name: '+0.1' }).click();
    await page.getByRole('button', { name: '+0.1' }).click();
    await page.waitForTimeout(500);

    // Get new protection value
    const newProtection = await page.locator('text=Total Protection').locator('..').locator('.text-lg').textContent();

    // Protection should have changed (likely increased)
    expect(initialProtection).not.toBe(newProtection);
  });

  test('should handle feather mode', async ({ page }) => {
    await page.goto('/');

    // Select a dataset
    await page.selectOption('select#dataset', { label: /50% Fire, 50% Slashing/ });
    await page.waitForTimeout(1000);

    // Enable feather mode
    await page.check('input#feather-enabled');

    // Feather inputs should be visible
    await expect(page.locator('input#feather-value')).toBeVisible();
    await expect(page.locator('select#head-armor-type')).toBeVisible();

    // Set feather value
    await page.fill('input#feather-value', '50');

    // Select head armor type
    await page.selectOption('select#head-armor-type', 'Bone');
    await page.waitForTimeout(500);

    // Results should still be displayed
    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();
  });

  test('should use preset encumbrance buttons', async ({ page }) => {
    await page.goto('/');

    // Select a dataset
    await page.selectOption('select#dataset', { label: /100% Slashing/ });
    await page.waitForTimeout(1000);

    // Click the "30" preset button
    await page.getByRole('button', { name: '30', exact: true }).click();
    await page.waitForTimeout(500);

    // Verify the input value changed to 30
    const inputValue = await page.locator('input#encumbrance').inputValue();
    expect(parseFloat(inputValue)).toBeCloseTo(30, 1);
  });

  test('should show placeholder when no dataset selected', async ({ page }) => {
    await page.goto('/');

    // Should show placeholder text
    await expect(page.getByText('Select options above to view optimal gear')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that the page is visible and usable
    await expect(page.getByRole('heading', { name: 'Darkfall Gear Optimizer' })).toBeVisible();
    await expect(page.locator('select#dataset')).toBeVisible();

    // Select a dataset
    await page.selectOption('select#dataset', { label: /50% Fire, 50% Slashing/ });
    await page.waitForTimeout(1000);

    // Results should be visible on mobile
    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();
  });
});
