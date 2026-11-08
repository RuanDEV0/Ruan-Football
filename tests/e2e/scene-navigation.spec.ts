import { expect, test, type Locator, type Page } from '@playwright/test';
import { hotspots } from '@/data/hotspots';
import { openWithPausedClock, stepIntoField } from './field-clock';

const region = (page: Page): Locator =>
  page.getByRole('region', { name: 'Campo society provisório' });
const hotspotButton = (page: Page, label: string): Locator =>
  region(page).getByRole('button', { name: label, exact: true });
const backToField = (page: Page): Locator =>
  region(page).getByRole('button', { name: 'Voltar ao campo' });

// A home entra em campo sozinha ao terminar o carregamento (ADR 0007), depois do quique mínimo (ADR
// 0008). O relógio é adiantado até a entrada e volta a correr normalmente na chegada.
async function enter(page: Page, url = '/'): Promise<void> {
  await stepIntoField(page, url);
  await page.clock.resume();
}

const BOUNCE_MS = 5000;

test('the ball bounces for five seconds of real loading, then is kicked into the field', async ({
  page,
}) => {
  await openWithPausedClock(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const progress = page.getByRole('progressbar', { name: 'Carregamento do campo' });
  const loader = page.locator('[data-loader]');
  const step = page.locator('[data-loader-step]');
  let elapsedMs = 0;
  const advance = async (ms: number): Promise<void> => {
    await page.clock.runFor(ms);
    elapsedMs += ms;
  };
  while ((await progress.getAttribute('aria-valuenow')) !== '100') {
    expect(elapsedMs, 'o carregamento não terminou').toBeLessThan(BOUNCE_MS - 1000);
    await advance(100);
  }
  await advance(BOUNCE_MS - 500 - elapsedMs);
  await expect(step).toHaveText('Aquecendo a bola…');
  await expect(loader).not.toHaveAttribute('data-complete', '');
  await expect(page.getByRole('status')).not.toContainText('Campo provisório carregado');
  await advance(700);
  await expect(loader).toHaveAttribute('data-complete', '');
  await expect(step).toHaveText('Bola em jogo!');
  await expect(page.getByRole('status')).toContainText('Campo provisório carregado');
  await advance(1000);
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-mode', 'playing');
  await expect(progress).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Pular chegada' })).not.toBeFocused();
});

// Relógio parado durante a chegada: a chegada não termina sozinha antes de o teste acionar “Pular”.
test('arrival is short, offers Skip and reveals the hotspot buttons', async ({ page }) => {
  await stepIntoField(page);
  const skip = page.getByRole('button', { name: 'Pular chegada' });
  await expect(skip).toBeVisible();
  await expect(hotspotButton(page, hotspots[0].label)).toBeHidden();
  await skip.press('Enter');
  await expect(skip).toBeHidden();
  for (const { label } of hotspots) await expect(hotspotButton(page, label)).toBeVisible();
  await expect(hotspotButton(page, hotspots[0].label)).toBeFocused();
});

test('arrival finishes by itself within a few seconds', async ({ page }) => {
  await enter(page);
  await expect(page.getByRole('button', { name: 'Pular chegada' })).toBeHidden({ timeout: 6000 });
  await expect(hotspotButton(page, hotspots[0].label)).toBeVisible();
});

test('reduced motion cuts the arrival and the idle scene stops requesting frames', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = window.requestAnimationFrame.bind(window);
    // Contador acrescentado ao window apenas neste teste; o tipo global não o conhece.
    const counter = window as unknown as { frameRequests: number };
    counter.frameRequests = 0;
    window.requestAnimationFrame = (callback) => {
      counter.frameRequests += 1;
      return original(callback);
    };
  });
  await enter(page);
  await expect(page.getByRole('button', { name: 'Pular chegada' })).toBeHidden();
  await expect(hotspotButton(page, hotspots[0].label)).toBeVisible();
  const requests = (): Promise<number> =>
    // Mesmo contador registrado no addInitScript acima.
    page.evaluate(() => (window as unknown as { frameRequests: number }).frameRequests);
  await page.waitForTimeout(300);
  const settled = await requests();
  await page.waitForTimeout(1000);
  expect(await requests()).toBe(settled);
});

test('after the full arrival the idle scene stops requesting frames', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.requestAnimationFrame.bind(window);
    // Contador acrescentado ao window apenas neste teste; o tipo global não o conhece.
    const counter = window as unknown as { frameRequests: number };
    counter.frameRequests = 0;
    window.requestAnimationFrame = (callback) => {
      counter.frameRequests += 1;
      return original(callback);
    };
  });
  await enter(page);
  await expect(page.getByRole('button', { name: 'Pular chegada' })).toBeHidden({ timeout: 8000 });
  const requests = (): Promise<number> =>
    // Mesmo contador registrado no addInitScript acima.
    page.evaluate(() => (window as unknown as { frameRequests: number }).frameRequests);
  await page.waitForTimeout(500);
  const settled = await requests();
  await page.waitForTimeout(1000);
  expect(await requests()).toBe(settled);
});

test('hotspot buttons stay inside the scene without overlapping', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await enter(page);
    const sceneBox = await region(page).boundingBox();
    const boxes = [];
    for (const { label } of hotspots) {
      const button = hotspotButton(page, label);
      await expect(button).toBeVisible();
      const box = await button.boundingBox();
      expect(box, label).not.toBeNull();
      if (!box || !sceneBox) continue;
      expect(box.height, label).toBeGreaterThanOrEqual(44);
      expect(box.x, label).toBeGreaterThanOrEqual(sceneBox.x - 1);
      expect(box.x + box.width, label).toBeLessThanOrEqual(sceneBox.x + sceneBox.width + 1);
      expect(box.y, label).toBeGreaterThanOrEqual(sceneBox.y - 1);
      boxes.push({ label, ...box });
    }
    for (const a of boxes)
      for (const b of boxes) {
        if (a.label >= b.label) continue;
        const overlaps =
          a.x < b.x + b.width &&
          b.x < a.x + a.width &&
          a.y < b.y + b.height &&
          b.y < a.y + a.height;
        expect(overlaps, `${a.label} × ${b.label} em ${String(width)}px`).toBe(false);
      }
  }
});

test('a hotspot shows its content on a screen in the field and returns to the overview', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enter(page);
  const sceneBox = await region(page).boundingBox();
  for (const { label, route } of hotspots) {
    await hotspotButton(page, label).click();
    await expect(page.getByRole('status')).toContainText(label);
    const heading = region(page).getByRole('heading', { name: label, exact: true });
    await expect(heading).toBeFocused();
    const link = region(page).getByRole('link', { name: `Ir para ${label}` });
    await expect(link).toHaveAttribute('href', route);
    await expect(link).toBeVisible();
    const screen = page.locator('[data-screen]:not([hidden])');
    await expect(screen).toHaveCount(1);
    const box = await screen.boundingBox();
    if (box && sceneBox) {
      expect(box.x, label).toBeGreaterThanOrEqual(sceneBox.x - 1);
      expect(box.x + box.width, label).toBeLessThanOrEqual(sceneBox.x + sceneBox.width + 1);
      expect(box.width, `${label} legível`).toBeGreaterThanOrEqual(300);
    }
    const linkBox = await link.boundingBox();
    expect(linkBox?.height, `${label} área de toque`).toBeGreaterThanOrEqual(43);
    // Confere que o link recebe o clique de verdade, não só que aparece sobre o canvas.
    await link.click({ trial: true });
    await backToField(page).click();
    await expect(backToField(page)).toBeHidden();
    await expect(screen).toHaveCount(0);
    await expect(hotspotButton(page, label)).toBeFocused();
  }
  await hotspotButton(page, hotspots[1].label).focus();
  await page.keyboard.press('Enter');
  await expect(region(page).getByRole('heading', { name: hotspots[1].label })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(backToField(page)).toBeHidden();
  await expect(page.getByRole('status')).toContainText('Visão geral');
  await expect(hotspotButton(page, hotspots[1].label)).toBeFocused();
});

test('clicking the object in the canvas selects the same hotspot', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enter(page);
  const scoreboard = hotspots.find(({ id }) => id === 'scoreboard');
  if (!scoreboard) throw new Error('hotspot do placar ausente');
  const button = hotspotButton(page, scoreboard.label);
  const box = await button.boundingBox();
  if (!box) throw new Error('botão do placar sem posição');
  const anchor = await button.evaluate((element) => {
    const read = (name: string): number => parseFloat(element.style.getPropertyValue(name)) || 0;
    const angle = (read('--leader-angle') * Math.PI) / 180;
    return {
      x: read('--leader-x') - Math.sin(angle) * read('--leader'),
      y: read('--leader-y') + Math.cos(angle) * read('--leader'),
    };
  });
  await page.mouse.click(box.x + anchor.x, box.y + anchor.y + 16);
  await expect(
    region(page).getByRole('heading', { name: scoreboard.label, exact: true }),
  ).toBeFocused();
});

test('dragging the canvas adjusts the view without selecting a hotspot', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enter(page);
  const button = hotspotButton(page, hotspots[0].label);
  const before = await button.boundingBox();
  const canvas = await page.locator('canvas').boundingBox();
  if (!before || !canvas) throw new Error('cena sem posição');
  const y = canvas.y + canvas.height - 40;
  await page.mouse.move(canvas.x + canvas.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width / 2 + 120, y, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => (await button.boundingBox())?.x).not.toBe(before.x);
  await expect(backToField(page)).toBeHidden();
});

test('debug mode measures sustained fps on the device and stays out of normal visits', async ({
  page,
}) => {
  await page.goto('/?debug');
  const panel = page.getByTestId('scene-debug');
  // Sem GPU, os quadros rentes ao gramado na perseguição da bola (ADR 0008) passam do limite de
  // 250 ms e zeram a janela de FPS; a primeira média pode sair só depois da chegada.
  await expect(panel).toContainText(/FPS médio \d/, { timeout: 20_000 });
  await expect(panel).toContainText('chamadas');
  await page.goto('/');
  // Inclui os 5 s de quique antes do chute (ADR 0008).
  await expect(page.getByRole('status')).toContainText('Campo provisório carregado', {
    timeout: 15_000,
  });
  await expect(page.getByTestId('scene-debug')).toHaveCount(0);
});

test('every screen in the field fits its content without cutting it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [
    { width: 1280, height: 900 },
    { width: 360, height: 800 },
  ]) {
    await page.setViewportSize(size);
    await enter(page);
    for (const { id, label } of hotspots) {
      await hotspotButton(page, label).click();
      await expect(region(page).getByRole('heading', { name: label, exact: true })).toBeFocused();
      const overflow = await page
        .locator(`[data-screen="${id}"] .scene-screen__inner`)
        .evaluate((inner) => inner.scrollHeight - inner.clientHeight);
      expect(overflow, `${label} em ${String(size.width)}px`).toBeLessThanOrEqual(1);
      await backToField(page).click();
    }
  }
});

test('finishing the scene load never steals the first Tab stop from the skip link', async ({
  page,
}) => {
  await enter(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
});

test('in the field the header stays out of view until the keyboard reaches it', async ({
  page,
}) => {
  await enter(page);
  const header = page.getByRole('banner');
  const opacity = (): Promise<string> =>
    header.evaluate((element) => getComputedStyle(element).opacity);
  await expect.poll(opacity).toBe('0');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(header.getByRole('link').first()).toBeFocused();
  await expect.poll(opacity).toBe('1');
});
