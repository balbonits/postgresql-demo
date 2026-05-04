import { chromium } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Public page
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join('public', 'screenshot-home.png'), fullPage: false });
  console.log('✓ Home screenshot saved');

  // Admin page — handle password prompt
  page.once('dialog', async (dialog) => {
    await dialog.accept('demo123');
  });
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join('public', 'screenshot-admin.png'), fullPage: false });
  console.log('✓ Admin screenshot saved');

  await browser.close();
})();
