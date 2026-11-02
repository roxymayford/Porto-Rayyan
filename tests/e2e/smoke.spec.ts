import { test, expect } from '@playwright/test';

test.describe('Portofolio Rayan Smoke Tests', () => {
  test('1. Halaman termuat tanpa error di console', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow minor WebGL environment warnings if headless container lacks full 3D HW
    const fatalErrors = errors.filter(
      (e) => !e.includes('WebGL') && !e.includes('swiftshader') && !e.includes('ReadPixels')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('2. Tiga judul hero terlihat', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const b1 = page.locator('#cutout-block-1');
    const b2 = page.locator('#cutout-block-2');
    const b3 = page.locator('#cutout-block-3');

    await expect(b1).toBeVisible();
    await expect(b2).toBeVisible();
    await expect(b3).toBeVisible();
  });

  test('3. Filter pengalaman menampilkan jumlah kartu yang sesuai', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Initial: all 6 cards visible
    const allCards = page.locator('.exp-scrap-card');
    await expect(allCards).toHaveCount(6);

    // Click "Sekretariat (1)"
    const adminFilter = page.locator('button[data-action="filter-exp"][data-value="admin"]');
    await adminFilter.click();
    const visibleCardsAdmin = page.locator('.exp-scrap-card:not(.hidden)');
    await expect(visibleCardsAdmin).toHaveCount(1);

    // Click "Semua (6)"
    const allFilter = page.locator('button[data-action="filter-exp"][data-value="all"]');
    await allFilter.click();
    const visibleCardsAll = page.locator('.exp-scrap-card:not(.hidden)');
    await expect(visibleCardsAll).toHaveCount(6);
  });

  test('4. Modal watchlist dapat dibuka dan ditutup dengan tombol atau ESC', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const modal = page.locator('#watchlist-modal');
    await expect(modal).toBeHidden();

    // Open modal via button
    const openBtn = page.locator('button[data-action="open-modal"]').first();
    await openBtn.click();
    await expect(modal).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('5. Tombol salin menampilkan toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.waitForTimeout(500);

    const toast = page.locator('#tactile-toast');
    await expect(toast).toBeHidden();

    const copyBtn = page.locator('button[data-action="copy"]').first();
    await copyBtn.click();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Tersalin:');
  });

  test('6. Reduced motion tidak meninggalkan elemen opacity: 0', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(500);

    const prePasteCards = page.locator('.pre-paste');
    await expect(prePasteCards).toHaveCount(0);
  });
});
