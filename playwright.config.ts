import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm build && pnpm preview --ignore-lock',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--enable-unsafe-swiftshader'] },
      },
    },
    {
      name: 'firefox',
      testIgnore: '**/scene-lifecycle.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: '**/scene-lifecycle.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      testIgnore: '**/scene-lifecycle.spec.ts',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit' },
    },
  ],
});
