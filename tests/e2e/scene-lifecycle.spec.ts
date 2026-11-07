import { expect, test } from '@playwright/test';

test('scene can be mounted repeatedly and recovers from context loss', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    window.requestAnimationFrame = () => {
      throw new Error('Movimento reduzido não deve iniciar um loop.');
    };
  });
  await page.goto('/');
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await page.getByRole('button', { name: 'Entrar no campo' }).click();
    await expect(page.getByRole('status')).toContainText('Cena de teste carregada');
    await expect(page.locator('canvas')).toHaveCount(1);
    await page.getByRole('button', { name: 'Usar modo leve' }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Entrar no campo' }).click();
  await expect(page.locator('canvas')).toHaveCount(1);
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
});
