import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { profile } from '@/data/profile';

test('local review exposes the current presentation and editorial questions accessibly', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('http://127.0.0.1:4323/');
  await page.getByRole('link', { name: 'Revisar conteúdo da Etapa 1' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Revisão da Etapa 1');
  await expect(page.getByText(profile.bio, { exact: true })).toBeVisible();
  await expect(page.getByText('Base inicial aprovada por Ruan', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Padrão para completar cada projeto' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inspect Gov RR', exact: true })).toBeVisible();
  await expect(
    page.getByText('A confirmar: período e status atual', { exact: true }).first(),
  ).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical'),
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('editorial drafts and the review link are excluded from the static site', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Revisar conteúdo da Etapa 1' })).toHaveCount(0);
  const response = await page.goto('/revisao');
  expect(response?.status()).toBe(404);
  await expect(page.getByText('Revisão da Etapa 1', { exact: true })).toHaveCount(0);
});
