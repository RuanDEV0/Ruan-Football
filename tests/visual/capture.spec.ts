import { expect, test, type Page } from '@playwright/test';
import { hotspots } from '@/data/hotspots';
import { loadingStep } from '@/ui/loading';
import { stepIntoField } from '../e2e/field-clock';

// Fora de test-results/: o Playwright limpa essa pasta a cada execução dos testes.
const OUTPUT_DIR = process.env.CAPTURE_DIR ?? '.captures';
const viewports = [
  { name: 'wide', width: 1280, height: 900 },
  { name: 'narrow', width: 360, height: 800 },
] as const;

async function shoot(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUTPUT_DIR}/${name}.png`, animations: 'disabled' });
}

for (const viewport of viewports) {
  test(`home, arrival and screens — ${viewport.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await stepIntoField(page);
    await page.clock.resume();
    await page.waitForTimeout(500);
    await shoot(page, `${viewport.name}-arrival-early`);
    await page.waitForTimeout(1200);
    await shoot(page, `${viewport.name}-arrival-late`);
    await expect(page.getByRole('button', { name: 'Pular chegada' })).toBeHidden({ timeout: 6000 });
    await expect(page.getByRole('button', { name: hotspots[0].label, exact: true })).toBeVisible();
    await shoot(page, `${viewport.name}-overview`);
    await page.getByRole('button', { name: hotspots[0].label, exact: true }).hover();
    await shoot(page, `${viewport.name}-hover`);
    for (const { id, label } of hotspots) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByRole('heading', { name: label, exact: true })).toBeFocused({
        timeout: 4000,
      });
      await shoot(page, `${viewport.name}-${id}`);
      await page
        .locator(`[data-screen="${id}"]`)
        .getByRole('button', { name: 'Voltar ao campo' })
        .click();
      await page.waitForTimeout(1400);
    }
    await page.getByRole('button', { name: 'Usar modo leve' }).click();
    await shoot(page, `${viewport.name}-illustration`);
    await page.getByRole('button', { name: 'Usar modo leve' }).click();
  });

  // Relógio controlado: no Chromium sem GPU cada quadro leva centenas de ms e a chegada pularia etapas.
  test(`arrival kick frames — ${viewport.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await stepIntoField(page);
    let elapsedMs = 0;
    for (const atMs of [200, 700, 1300, 1800, 2300, 3000]) {
      await page.clock.runFor(atMs - elapsedMs);
      elapsedMs = atMs;
      await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.name}-kick-${String(atMs)}.png` });
    }
  });

  test(`loading screen — ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    // Segura o código da cena para fotografar cada etapa; só as capturas atrasam o carregamento.
    await page.route(/three.*\.js$/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 60_000));
      await route.continue();
    });
    await page.goto('/');
    for (const done of [1, 2, 4]) {
      const step = loadingStep({
        isCodeLoaded: true,
        sceneRatio: (done - 1) / 3,
        hasWarmedUp: true,
      });
      await page.evaluate((value) => {
        const loader = document.querySelector<HTMLElement>('[data-loader]');
        if (!loader) return;
        loader.style.setProperty('--progress', String(value.percent / 100));
        loader.toggleAttribute('data-complete', value.isComplete);
        const label = loader.querySelector('[data-loader-step]');
        const percent = loader.querySelector('[data-loader-percent]');
        if (label) label.textContent = value.label;
        if (percent) percent.textContent = `${String(value.percent)}%`;
      }, step);
      await page.waitForTimeout(450);
      await shoot(page, `${viewport.name}-loader-${String(step.percent)}`);
    }
  });
}

for (const viewport of viewports) {
  test(`debug measurement panel — ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/?debug');
    await expect(page.getByTestId('scene-debug')).toContainText(/FPS médio \d/, { timeout: 10000 });
    await shoot(page, `${viewport.name}-debug`);
  });
}
