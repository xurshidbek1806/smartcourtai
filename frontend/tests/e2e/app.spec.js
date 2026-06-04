import { expect, test } from '@playwright/test';

test('landing and core dashboards render', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Adolat. Tezroq. Aniqroq.' })).toBeVisible();

  await page.goto('/portal/claims/new');
  await expect(page.getByRole('heading', { name: 'Arizani sudga yuborish' })).toBeVisible();

  await page.goto('/oversight/corruption/graph');
  await expect(page.getByRole('img', { name: 'Korrupsiya monitoring aloqalar grafi' })).toBeVisible();
});
