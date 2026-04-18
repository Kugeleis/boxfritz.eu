import { test, expect } from '@playwright/test';

test('capture screenshots for inspection', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // Home page
  await page.goto('/');
  await page.waitForSelector('.card');
  await page.screenshot({ path: 'verification/home_page_v2.png' });

  // About page
  await page.goto('/about.html');
  await page.waitForSelector('.prose');
  await page.screenshot({ path: 'verification/about_page_v2.png' });
});
