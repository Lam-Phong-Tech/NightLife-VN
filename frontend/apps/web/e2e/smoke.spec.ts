import { test, expect } from '@playwright/test';

test('smoke test: home → search → detail → booking', async ({ page }) => {
  // Go to Home
  await page.goto('/');
  await expect(page).toHaveTitle(/NightLife VN/);

  // Search (simulate clicking search bar or link)
  await page.click('text=Tìm kiếm'); // Assuming a search button or link
  await expect(page).toHaveURL(/.*danh-sach-quan|.*search/);

  // Click on a detail item
  await page.click('text=Club Lumière');
  await expect(page).toHaveURL(/.*stores\/club-lumiere/);

  // Click on booking
  await page.click('text=Đặt chỗ');
  await expect(page).toHaveURL(/.*dat-cho/);
});
