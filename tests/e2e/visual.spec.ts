import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.describe('Visual Comparison', () => {
  const viewports = [
    { name: '1440', width: 1440, height: 900 },
    { name: '768', width: 768, height: 1024 },
    { name: '390', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    test(`Capture screenshot at ${vp.width}px (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      // Wait for GSAP intro timeline (0.15 delay + ~0.9s duration) and fonts
      await page.waitForTimeout(2500);

      const outDir = path.resolve('tests/e2e/__current__');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      await page.screenshot({
        path: path.join(outDir, `current-${vp.name}.png`),
        fullPage: false,
      });
    });
  }
});
