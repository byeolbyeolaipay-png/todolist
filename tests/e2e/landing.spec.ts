import { test, expect } from '@playwright/test';

test('landing renders greeting', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('안녕하세요')).toBeVisible();
});
