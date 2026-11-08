import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { profile } from '@/data/profile';
import { navigation } from '@/data/navigation';
import { hotspots } from '@/data/hotspots';

test('static pages remain accessible without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  for (const { route } of navigation) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
  }
  await page.goto('/projetos/exemplo');
  await expect(page.locator('h1')).toHaveText('Página não encontrada');
  await context.close();
});

test('routes have no serious accessibility violations or overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of ['/', ...navigation.map((item) => item.route), '/404']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact ?? ''),
      ),
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('keyboard reaches the skip link and permanent menu', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const menu = page.getByText('Menu', { exact: true });
  await menu.focus();
  await page.keyboard.press('Enter');
  const projects = page
    .getByRole('navigation', { name: 'Principal' })
    .getByRole('link', { name: 'Projetos', exact: true });
  await projects.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/projetos');
});

test('WebGL failure preserves navigation and announces the alternative', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.name);
  await page.getByRole('button', { name: 'Entrar no campo' }).click();
  await expect(page.getByRole('status')).toContainText('apresentação leve');
  await expect(page.getByRole('link', { name: 'Ver projetos' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('field-illustration')).toBeVisible();
});

test('the illustrated field offers the same points as links without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.name);
  await expect(page.getByRole('button', { name: 'Entrar no campo' })).toBeHidden();
  await page.getByText('Menu', { exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
  const illustration = page.getByTestId('field-illustration');
  await expect(illustration).toBeVisible();
  for (const { label, route } of hotspots)
    await expect(illustration.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      route,
    );
  await context.close();
});

test('light mode persists and reduced motion is honored', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Usar modo leve' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Usar modo leve' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('field-illustration')).toBeVisible();
});

test('confirmed contacts and introduction are available without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/contato');
  for (const [label, href] of [
    ['E-mail', `mailto:${profile.email}`],
    ['LinkedIn', profile.linkedin],
    ['GitHub', profile.github],
  ] as const) {
    await expect(page.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      href,
    );
  }
  await page.goto('/sobre');
  await expect(page.getByText(profile.fullName, { exact: true })).toBeVisible();
  await expect(page.getByText(profile.bio, { exact: true })).toBeVisible();
  await context.close();
});
