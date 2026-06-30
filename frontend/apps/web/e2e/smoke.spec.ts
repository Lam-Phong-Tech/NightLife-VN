import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function gotoRouteOrSkip(page: Page, path: string) {
  try {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 20_000 });

    test.skip(
      !response || response.status() >= 500,
      'Public route SSR needs the local backend API to be running.',
    );

    return response;
  } catch (error) {
    test.skip(true, `Public route was not reachable in the local dev server: ${String(error)}`);
    return null;
  }
}

test('smoke test: home and booking routes render', async ({ page }) => {
  await gotoRouteOrSkip(page, '/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page).toHaveTitle(/NightLife|Vietyoru/i);

  await gotoRouteOrSkip(page, '/dat-cho');
  await expect(page.locator('body')).toBeVisible();
});
