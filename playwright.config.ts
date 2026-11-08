import { defineConfig, devices } from '@playwright/test';

// Porta própria por execução: a 4321 pode estar com a prévia que aguarda a validação de Ruan.
const port = process.env.PREVIEW_PORT ?? '4321';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: [
    {
      command: `pnpm build && pnpm preview --ignore-lock --port ${port}`,
      url: baseURL,
      reuseExistingServer: false,
    },
    {
      command: 'pnpm exec astro dev --ignore-lock --host 127.0.0.1 --port 4323',
      url: 'http://127.0.0.1:4323',
      reuseExistingServer: false,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--enable-unsafe-swiftshader'] },
      },
    },
    {
      name: 'chromium-mobile',
      testMatch: '**/scene-*.spec.ts',
      use: {
        ...devices['Pixel 7'],
        launchOptions: { args: ['--enable-unsafe-swiftshader'] },
      },
    },
    {
      name: 'firefox',
      testIgnore: '**/scene-*.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: '**/scene-*.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      testIgnore: '**/scene-*.spec.ts',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit' },
    },
  ],
});
