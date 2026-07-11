import { test, expect } from '@playwright/test';

test('homepage has title and hero section', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Ovelia/);

  // Expect the hero section to be visible
  const heroHeading = page.locator('h1').first();
  await expect(heroHeading).toBeVisible();
});
