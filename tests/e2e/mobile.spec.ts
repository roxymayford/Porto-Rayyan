import { test, expect } from '@playwright/test';

const mobileViewports = [
  { name: 'iPhone SE (320px)', width: 320, height: 568 },
  { name: 'Galaxy S (360px)', width: 360, height: 800 },
  { name: 'iPhone 14 (390px)', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max (430px)', width: 430, height: 932 },
  { name: 'iPad Mini (768px)', width: 768, height: 1024 },
];

test.describe('Mobile Responsive & Web Design Preservation Suite', () => {
  for (const vp of mobileViewports) {
    test(`1. Tidak ada overflow horizontal di ${vp.name} pada ketiga mode headline`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      for (let mode = 0; mode < 3; mode++) {
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

        await page.locator('button[data-action="cycle-headline"]').click();
      }
    });
  }

  test('2. Semua 6 keycap keyboard dock dan 4 tombol filter terlihat utuh tanpa terpotong di mobile (360px)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const keys = page.locator('.mech-frame .mech-key');
    await expect(keys).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const box = await keys.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(360);
    }

    const filters = page.locator('.scrap-filter-btn');
    await expect(filters).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const box = await filters.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(360);
    }
  });

  test('3. Saat masuk halaman (termasuk dengan hash lama), otomatis fokus ke #collage-hero dan ruler/keyboard tidak bertabrakan (320px)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/#profil-karir');
    await page.waitForLoadState('networkidle');

    const entryState = await page.evaluate(() => {
      const heroBox = document.querySelector('#collage-hero .crop-mark-box')!.getBoundingClientRect();
      return {
        hash: window.location.hash,
        heroTop: Math.round(heroBox.top),
      };
    });

    expect(entryState.hash).toBe('');
    expect(entryState.heroTop).toBeGreaterThanOrEqual(28);
    expect(entryState.heroTop).toBeLessThanOrEqual(48);

    await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));

    const boxes = await page.evaluate(() => {
      const ruler = document.querySelector('.ruler-top')!.getBoundingClientRect();
      const backBtn = document.getElementById('floating-back-btn')!.getBoundingClientRect();
      const kbd = document.querySelector('.mech-frame')!.getBoundingClientRect();
      return {
        rulerHeight: ruler.height,
        backBottom: backBtn.bottom,
        kbdTop: kbd.top,
      };
    });

    expect(boxes.rulerHeight).toBeLessThanOrEqual(26);
    expect(boxes.kbdTop).toBeGreaterThanOrEqual(boxes.backBottom);
  });

  test('4. Modal studi kasus dan quick menu berfungsi penuh di layar kecil (320x568)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const backBtn = page.locator('#floating-back-btn');
    const quickMenu = page.locator('#quick-jump-menu');
    await backBtn.click();
    await expect(quickMenu).toBeVisible();

    const menuBox = await quickMenu.boundingBox();
    expect(menuBox).not.toBeNull();
    expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(320);

    await page.locator('#cutout-block-1').click();
    await expect(quickMenu).toBeHidden();

    const openBtn = page.locator('button[data-action="open-modal"][data-value="olaf"]').first();
    await openBtn.click();

    const modal = page.locator('#watchlist-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#studio-canvas')).toHaveAttribute('inert', '');

    const modalCardBox = await modal.locator('.polaroid-yt-card').boundingBox();
    expect(modalCardBox).not.toBeNull();
    expect(modalCardBox!.height).toBeLessThanOrEqual(568);

    await modal.locator('button[data-action="close-modal"]').first().click();
    await expect(modal).toBeHidden();
    await expect(page.locator('#studio-canvas')).not.toHaveAttribute('inert');
  });
});
