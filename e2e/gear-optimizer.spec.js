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
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
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
    await expect(page.getByRole('columnheader', { name: 'Enc' })).toBeVisible();
    await expect(page.getByText('Bludg')).toBeVisible();
    await expect(page.getByText('Slash')).toBeVisible();

    // Verify totals row
    await expect(page.getByRole('cell', { name: 'Total' })).toBeVisible();
  });

  test('should update results when encumbrance changes', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    // Click the +0.1 button several times
    await page.getByRole('button', { name: 'Increase by 0.1' }).click();
    await page.getByRole('button', { name: 'Increase by 0.1' }).click();
    await page.waitForTimeout(500);

    // Results should still be displayed
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
  });

  test('should use preset encumbrance buttons', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    // Click the "30" preset button
    await page.getByRole('button', { name: '30 (Archery)' }).click();
    await page.waitForTimeout(500);

    // Verify the input value changed to 30
    const inputValue = await page.locator('input#encumbrance').inputValue();
    expect(parseFloat(inputValue)).toBeCloseTo(30, 1);
  });

  test('should show placeholder when no selections made', async ({ page }) => {
    await page.goto('/');

    // Should not show results initially
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).not.toBeVisible();
  });

  test('should not show results with only protection type chosen', async ({ page }) => {
    await page.goto('/');

    // Select only protection type
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.waitForTimeout(500);

    // Should not show results
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).not.toBeVisible();
  });

  test('should not show results with only armor tier chosen', async ({ page }) => {
    await page.goto('/');

    // Armor tier should be disabled without a protection type selected
    await expect(page.locator('select#armor-tier')).toBeDisabled();

    // Should not show results
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).not.toBeVisible();

    // Feather and encumbrance controls should remain disabled
    await expect(page.locator('input#feather-enabled')).toBeDisabled();
  });

  test('should reload data when armor tier changes', async ({ page }) => {
    await page.goto('/');

    // Select protection type and armor tier
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();

    // Change armor tier
    await page.selectOption('select#armor-tier', { label: 'Dragon' });
    await page.waitForTimeout(1000);

    // Results should still be visible (different data may load)
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
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
    await page.getByRole('button', { name: '20 (Magic)' }).click();
    await page.waitForTimeout(500);

    // The stats table should contain actual numeric values (not all dashes)
    const table = page.locator('[data-testid="armor-stats-table"]');
    await expect(table).toBeVisible();

    // The Total row should have numeric values
    const totalRow = table.locator('tr', { has: page.getByRole('cell', { name: 'Total', exact: true }) });
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

    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();

    // Switch protection type
    await page.selectOption('select#dataset', { label: 'Magic' });
    await page.waitForTimeout(1000);

    // Armor tier should still be "Common" and results should load
    await expect(page.locator('select#armor-tier')).toHaveValue('common');
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
  });

  test('should clear results when protection type is deselected', async ({ page }) => {
    await page.goto('/');

    // Select both
    await page.selectOption('select#dataset', { label: 'Physical' });
    await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();

    // Deselect protection type
    await page.selectOption('select#dataset', '');
    await page.waitForTimeout(500);

    // Results should disappear
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).not.toBeVisible();
  });

  test('should display armor stats table in Dragon tier', async ({ page }) => {
    await page.goto('/');

    // Select Dragon tier to get Dragon armor
    await page.selectOption('select#dataset', { label: 'Magic' });
    await page.selectOption('select#armor-tier', { label: 'Dragon' });
    await page.waitForTimeout(1000);

    // Set high encumbrance to get Dragon armor
    await page.getByRole('button', { name: '30 (Archery)' }).click();
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
    await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
  });

  test.describe('URL deeplinks', () => {
    test('should restore full state from URL params', async ({ page }) => {
      await page.goto('/?protection=physical&tier=common&enc=25');
      await page.waitForTimeout(1000);

      // Protection type and armor tier should be selected
      await expect(page.locator('select#dataset')).toHaveValue('physical');
      await expect(page.locator('select#armor-tier')).toHaveValue('common');

      // Encumbrance should be set
      const encValue = await page.locator('input#encumbrance').inputValue();
      expect(parseFloat(encValue)).toBeCloseTo(25, 1);

      // Results should be displayed
      await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
    });

    test('should restore feather state from URL params', async ({ page }) => {
      await page.goto('/?protection=physical&tier=common&enc=20&feather=true&featherValue=5&headArmor=Bone');
      await page.waitForTimeout(1000);

      // Feather should be enabled
      await expect(page.locator('input#feather-enabled')).toBeChecked();

      // Feather value should be set
      const featherVal = await page.locator('input#feather-value').inputValue();
      expect(parseFloat(featherVal)).toBe(5);

      // Head armor type should be selected
      await expect(page.locator('select#head-armor-type')).toHaveValue('Bone');

      // Results should be displayed
      await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
    });

    test('should update URL when user changes inputs', async ({ page }) => {
      await page.goto('/');

      // Select protection type and armor tier
      await page.selectOption('select#dataset', { label: 'Physical' });
      await page.selectOption('select#armor-tier', { label: 'Bone and Plate' });
      await page.waitForTimeout(1000);

      // URL should contain the selection params
      const url = page.url();
      expect(url).toContain('protection=physical');
      expect(url).toContain('tier=common');
    });

    test('should have clean URL with no params when all values are defaults', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      // URL should not have any query params
      const url = page.url();
      expect(url).not.toContain('?');
    });

    test('should load normally with invalid URL params', async ({ page }) => {
      await page.goto('/?protection=invalid&tier=bogus&enc=abc');
      await page.waitForTimeout(1000);

      // App should load without errors
      await expect(page.getByRole('heading', { name: 'Darkfall Gear Optimizer' })).toBeVisible();

      // No dataset should be selected (invalid IDs ignored)
      await expect(page.locator('select#dataset')).toHaveValue('');

      // Results should not be displayed
      await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).not.toBeVisible();
    });

    test('should show confirmation when Share button is clicked', async ({ page }) => {
      await page.goto('/?protection=physical&tier=common&enc=25');
      await page.waitForTimeout(1000);

      // Share button should be visible
      const shareButton = page.getByRole('button', { name: 'Share' });
      await expect(shareButton).toBeVisible();

      // Click Share button
      await shareButton.click();

      // Confirmation message should appear
      await expect(page.getByText('Link copied to clipboard')).toBeVisible();

      // Confirmation should disappear after ~2 seconds
      await expect(page.getByText('Link copied to clipboard')).not.toBeVisible({ timeout: 3000 });
    });

    test('should restore state when navigating back to a captured URL', async ({ page }) => {
      // Set up state via URL
      await page.goto('/?protection=physical&tier=common&enc=25');
      await page.waitForTimeout(1000);

      // Capture the URL
      const capturedUrl = page.url();

      // Navigate away
      await page.goto('/');
      await page.waitForTimeout(500);

      // Navigate back to captured URL
      await page.goto(capturedUrl);
      await page.waitForTimeout(1000);

      // State should be fully restored
      await expect(page.locator('select#dataset')).toHaveValue('physical');
      await expect(page.locator('select#armor-tier')).toHaveValue('common');
      const encValue = await page.locator('input#encumbrance').inputValue();
      expect(parseFloat(encValue)).toBeCloseTo(25, 1);
      await expect(page.getByRole('heading', { name: 'Optimal Gear Configuration' })).toBeVisible();
    });
  });
});
