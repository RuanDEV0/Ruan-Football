import { expect, test } from '@playwright/test';
import { hotspots } from '@/data/hotspots';

test('scene can be mounted repeatedly and recovers from context loss', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Campo provisório carregado');
  await expect(page.locator('canvas')).toHaveCount(1);
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await page.getByRole('button', { name: 'Usar modo leve' }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.getByTestId('field-illustration')).toBeVisible();
    await page.getByRole('button', { name: 'Entrar no campo' }).click();
    await expect(page.getByRole('status')).toContainText('Campo provisório carregado');
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(page.locator('[data-screen]')).toHaveCount(4);
  }
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-mode', 'playing');
  // Quem pediu a entrada pelo teclado continua no fluxo: com movimento reduzido, no primeiro ponto.
  await expect(page.getByRole('button', { name: hotspots[0].label, exact: true })).toBeFocused();
  await page.setViewportSize({ width: 480, height: 800 });
  await expect
    .poll(() =>
      page
        .locator('canvas')
        .evaluate((canvas) => canvas.clientWidth === canvas.parentElement?.clientWidth),
    )
    .toBe(true);
  await page.locator('canvas').dispatchEvent('webglcontextlost');
  await expect(page.getByRole('status')).toContainText('interrompida');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('field-illustration')).toBeVisible();
  await expect(page.locator('[data-screen]')).toHaveCount(4);
});

test('field has enough screen space for inspection on desktop and narrow screens', async ({
  page,
}) => {
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const scene = page.getByRole('region', { name: 'Campo society provisório' });
    const box = await scene.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(480);
  }
});
