// Capturas do ciclo visual (docs/ai/procedures/implement-change.md, seção 4.1). Não comparam pixels:
// geram imagens para inspeção em .captures/ (ou CAPTURE_DIR), fora do Git.
import { defineConfig, devices } from '@playwright/test';

// Porta própria por execução: a 4321 pode estar com a prévia que aguarda a validação de Ruan.
const port = process.env.PREVIEW_PORT ?? '4321';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/visual',
  outputDir: '.captures/results',
  workers: 1,
  reporter: 'list',
  use: { baseURL },
  webServer: {
    command: `pnpm build && pnpm preview --ignore-lock --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'capture',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--enable-unsafe-swiftshader'] },
      },
    },
  ],
});
