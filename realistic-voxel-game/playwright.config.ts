import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5199',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    channel: 'chrome'
  },
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://127.0.0.1:5199',
    reuseExistingServer: false,
    timeout: 30000
  },
  projects: [
    {
      name: 'Google Chrome',
      use: {
        channel: 'chrome',
        launchOptions: {
          args: ['--enable-webgl', '--ignore-gpu-blocklist']
        }
      }
    }
  ]
});
