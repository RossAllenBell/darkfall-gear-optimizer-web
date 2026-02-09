import { test, expect } from '@playwright/test';

test.describe('Darkfall Gear Optimizer', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Check that the title is correct
    await expect(page).toHaveTitle(/Darkfall Gear Optimizer/);

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Darkfall Gear Optimizer' })).toBeVisible();
  });

  test('should show both selectors', async ({ page }) => {
    await page.goto('/');

    // Both selectors should be present
    await expect(page.locator('select#dataset')).toBeVisible();
    await expect(page.locator('select#armor-tier')).toBeVisible();
  });

  test('should select protection type and armor tier then show results', async ({ page }) => {
    await page.goto('/');

    // Select protection type
    await page.selectOption('select#dataset', { label: 'Physical' });

    // Select armor access tier
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Verify results are displayed
    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();
    await expect(page.getByText('Fixed Slots')).toBeVisible();
    await expect(page.getByText('Armor Stats')).toBeVisible();
  });

  test('should display armor stats table with damage type columns', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    // Verify stats table headers
    await expect(page.getByText('Enc')).toBeVisible();
    await expect(page.getByText('Bludg')).toBeVisible();
    await expect(page.getByText('Slash')).toBeVisible();

    // Verify totals row
    await expect(page.getByText('Total')).toBeVisible();
  });

  test('should update results when encumbrance changes', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    // Click the +0.1 button several times
    await page.getByRole('button', { name: '+0.1' }).click();
    await page.getByRole('button', { name: '+0.1' }).click();
    await page.waitForTimeout(500);

    // Results should still be displayed
    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();
  });

  test('should handle feather mode', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
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

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    // Click the "30" preset button
    await page.getByRole('button', { name: '30', exact: true }).click();
    await page.waitForTimeout(500);

    // Verify the input value changed to 30
    const inputValue = await page.locator('input#encumbrance').inputValue();
    expect(parseFloat(inputValue)).toBeCloseTo(30, 1);
  });

  test('should show placeholder when no selections made', async ({ page }) => {
    await page.goto('/');

    // Should not show results initially
    await expect(page.getByText('Optimal Gear Configuration')).not.toBeVisible();
  });

  test('should not show results with only protection type chosen', async ({ page }) => {
    await page.goto('/');

    // Select only protection type
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.waitForTimeout(500);

    // Should not show results
    await expect(page.getByText('Optimal Gear Configuration')).not.toBeVisible();
  });

  test('should not show results with only armor tier chosen', async ({ page }) => {
    await page.goto('/');

    // Select only armor tier
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(500);

    // Should not show results
    await expect(page.getByText('Optimal Gear Configuration')).not.toBeVisible();

    // Feather and encumbrance controls should remain disabled
    await expect(page.locator('input#feather-enabled')).toBeDisabled();
  });

  test('should reload data when armor tier changes', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();

    // Change armor tier
    await page.selectOption('select#armor-tier', { label: 'Dragon' });
    await page.waitForTimeout(1000);

    // Results should still be visible (different data may load)
    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();
  });

  test('should show no results message for unavailable feather head armor', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Pierce (Arrow)' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    // Enable feather mode
    await page.check('input#feather-enabled');

    // Select a head armor type that doesn't have results for this encumbrance/tier combo
    await page.selectOption('select#head-armor-type', 'Dragon');
    await page.waitForTimeout(500);

    // Should show the no results message (Dragon not in common tier)
    await expect(page.getByText('No gear sets available with Dragon head armor')).toBeVisible();
  });

  test('should show real stat values in the armor stats table', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    // Set encumbrance to 20 to get non-zero armor
    await page.getByRole('button', { name: '20', exact: true }).click();
    await page.waitForTimeout(500);

    // The stats table should contain actual numeric values (not all dashes)
    const table = page.locator('[data-testid="armor-stats-table"]');
    await expect(table).toBeVisible();

    // The Total row should have numeric values
    const totalRow = table.locator('tr').last();
    const totalText = await totalRow.textContent();
    // Total row should contain decimal numbers (e.g. 19.90, 4.35)
    expect(totalText).toMatch(/\d+\.\d+/);
  });

  test('should preserve armor tier when switching protection type', async ({ page }) => {
    await page.goto('/');

    // Select both
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();

    // Switch protection type
    await page.selectOption('select#dataset', { label: 'Magic' });
    await page.waitForTimeout(1000);

    // Armor tier should still be "Common" and results should load
    await expect(page.locator('select#armor-tier')).toHaveValue('common');
    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();
  });

  test('should clear results when protection type is deselected', async ({ page }) => {
    await page.goto('/');

    // Select both
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();

    // Deselect protection type
    await page.selectOption('select#dataset', '');
    await page.waitForTimeout(500);

    // Results should disappear
    await expect(page.getByText('Optimal Gear Configuration')).not.toBeVisible();
  });

  test('should display armor stats table in Dragon tier', async ({ page }) => {
    await page.goto('/');

    // Select Dragon tier to get Dragon armor
    await page.selectOption('select#dataset', { label: 'Magic' });
    await page.selectOption('select#armor-tier', { label: 'Dragon' });
    await page.waitForTimeout(1000);

    // Set high encumbrance to get Dragon armor
    await page.getByRole('button', { name: '30', exact: true }).click();
    await page.waitForTimeout(500);

    // The stats table should be visible with data
    const table = page.locator('[data-testid="armor-stats-table"]');
    await expect(table).toBeVisible();

    // Check that the combined elemental column is present
    await expect(page.getByText('Fire/Acid/Cold')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that the page is visible and usable
    await expect(page.getByRole('heading', { name: 'Darkfall Gear Optimizer' })).toBeVisible();
    await expect(page.locator('select#dataset')).toBeVisible();
    await expect(page.locator('select#armor-tier')).toBeVisible();

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    // Results should be visible on mobile
    await expect(page.getByText('Optimal Gear Configuration')).toBeVisible();
  });
});
