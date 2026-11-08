import { expect, type Page } from '@playwright/test';

const STEP_MS = 100;
const CLOCK_START_MS = 1_000_000;
const MAX_LOADING_MS = 30_000;

/** Abre a página com o relógio parado desde o primeiro script; o tempo só anda com `runFor`. */
export async function openWithPausedClock(page: Page, url = '/'): Promise<void> {
  await page.clock.install({ time: CLOCK_START_MS });
  await page.clock.pauseAt(CLOCK_START_MS + 1);
  await page.goto(url);
}

/**
 * Abre a home com o relógio da página parado e o avança em passos até a cena entrar em campo. O
 * Chromium sem GPU leva centenas de ms por quadro: com o tempo real, quique, chegada e testes
 * disputariam o relógio. Devolve o tempo simulado gasto; o relógio continua parado.
 */
export async function stepIntoField(page: Page, url = '/'): Promise<number> {
  await openWithPausedClock(page, url);
  const stage = page.locator('[data-stage]');
  let elapsedMs = 0;
  while ((await stage.getAttribute('data-mode')) !== 'playing') {
    expect(elapsedMs, 'a cena não entrou em campo').toBeLessThan(MAX_LOADING_MS);
    await page.clock.runFor(STEP_MS);
    elapsedMs += STEP_MS;
  }
  return elapsedMs;
}
