import { defineConfig, devices } from '@playwright/test';

const shouldStartWebServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER !== '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  globalTimeout: 120_000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: shouldStartWebServer
    ? {
        command: 'node ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000',
        url: 'http://127.0.0.1:3000/robots.txt',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        gracefulShutdown: { signal: 'SIGTERM', timeout: 1_000 },
        env: {
          BACKEND_API_URL:
            process.env.BACKEND_API_URL || 'https://demonightlight.test9.io.vn/api/backend',
          NEXT_PUBLIC_API_URL:
            process.env.NEXT_PUBLIC_API_URL || 'https://demonightlight.test9.io.vn/api/backend',
        },
      }
    : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
