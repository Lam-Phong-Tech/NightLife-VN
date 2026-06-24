import { test, expect } from '@playwright/test';

test.describe('Smoke Test - User Journey', () => {
  test('home -> search -> detail -> booking', async ({ page }) => {
    // 1. Go to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/NightLife VN/);

    // 2. Click on "Tìm quán" (Search) in the header
    await page.locator('a.lk').filter({ hasText: 'Tìm quán' }).first().click();
    await expect(page.url()).toContain('/danh-sach-quan');

    // 3. Search for a venue
    const searchInput = page.locator('input[placeholder]:visible').first();
    await searchInput.fill('Club');
    
    // 4. Click on the first venue card
    const firstVenue = page.locator('.card:visible').first();
    await firstVenue.click();
    
    // 5. Verify we are on the details page
    await expect(page.url()).toContain('/stores/');

    // 6. Click on "Đặt chỗ ngay" or similar booking button
    const bookButton = page.locator('text=Đặt chỗ >> visible=true').first();
    await bookButton.click();
  });
});
