import { test, expect } from '@playwright/test';

test('Service worker: visited pages reload offline, new pages get the offline screen', async ({ page, context }) => {
  await page.goto('/about');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 20000 });
  await page.goto('/about');
  await page.waitForFunction(async () => (await caches.match('/about')) !== undefined, undefined, { timeout: 20000 });

  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle(/How it works/);

  await page.goto('/sync');
  await expect(page.getByTestId('offline-page')).toBeVisible();

  await context.setOffline(false);
});
