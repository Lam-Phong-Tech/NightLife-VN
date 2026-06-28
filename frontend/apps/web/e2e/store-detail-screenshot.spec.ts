import { expect, test } from '@playwright/test';

const storePath = '/stores/neon-club';

test.describe('store detail screenshots', () => {
  test('desktop store detail renders without visual breakage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    const response = await page.goto(storePath, { waitUntil: 'networkidle' });

    test.skip(
      !response || response.status() >= 500,
      'Store detail SSR needs the local backend API to be running.',
    );

    await expect(page.getByTestId('store-detail-page')).toBeVisible();
    await expect(page).toHaveScreenshot('store-detail-desktop.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('mobile store detail keeps CTA and content usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(storePath, { waitUntil: 'networkidle' });

    test.skip(
      !response || response.status() >= 500,
      'Store detail SSR needs the local backend API to be running.',
    );

    await expect(page.getByTestId('store-detail-page')).toBeVisible();
    await expect(page.getByTestId('store-booking-cta')).toBeVisible();
    await expect(page).toHaveScreenshot('store-detail-mobile.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
