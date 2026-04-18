import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport size for desktop
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('Taking screenshot of Home Page...');
  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshot-home.png', fullPage: true });

  console.log('Taking screenshot of About Page...');
  await page.goto('http://localhost:5174/about.html');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshot-about.png', fullPage: true });

  await browser.close();
  console.log('Screenshots taken successfully.');
})();
