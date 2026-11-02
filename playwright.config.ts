import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function findBrowserExecutable(): string | undefined {
  const linuxChrome = '/usr/local/bin/google-chrome';
  if (fs.existsSync(linuxChrome)) return linuxChrome;

  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const msPlaywright = path.join(localAppData, 'ms-playwright');
    if (fs.existsSync(msPlaywright)) {
      const dirs = fs
        .readdirSync(msPlaywright)
        .filter((d) => d.startsWith('chromium-'))
        .sort()
        .reverse();
      for (const dir of dirs) {
        const candidate = path.join(msPlaywright, dir, 'chrome-win64', 'chrome.exe');
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }
  return undefined;
}

const executablePath = findBrowserExecutable();

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          ...(executablePath ? { executablePath } : {}),
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        },
      },
    },
  ],
});
