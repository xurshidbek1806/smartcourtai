import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('smartcourt-tour-done', '1');
    window.localStorage.removeItem('smartcourt-locale');
  });
});

test('landing and core dashboards render', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Insonparvar adolat, soniyalar ichida.' })
  ).toBeVisible();

  await page.goto('/portal/claims/new');
  await expect(page.getByRole('heading', { name: 'Arizani sudga yuborish' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumbs' })).toHaveCount(0);

  await page.goto('/oversight/corruption/graph');
  await expect(
    page.getByRole('img', { name: 'Korrupsiya monitoring aloqalar grafi' })
  ).toBeVisible();
});

test('generic pages save forms and open card details', async ({ page }) => {
  await page.goto('/portal/profile/edit');

  const phone = page.getByLabel('Telefon');
  await phone.fill('+998 90 123 45 67');
  await page.locator('.form-actions').getByRole('button', { name: 'Saqlash' }).click();
  await expect(page.getByText('Ma’lumot saqlandi')).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Telefon')).toHaveValue('+998 90 123 45 67');

  await page.goto('/portal/mediation');
  await page.getByText('Mehnat nizosi').click();
  await expect(page.getByRole('dialog', { name: 'Mehnat nizosi' })).toBeVisible();
});

test('language selector translates generic page content', async ({ page }) => {
  await page.goto('/portal/mediation');
  await page.getByRole('button', { name: 'Profil' }).click();
  await page.getByRole('button', { name: 'EN' }).click();

  await expect(page.getByRole('heading', { name: 'Mediation center' })).toBeVisible();
  await expect(
    page.getByText('Pre-court settlement proposals, sessions, and success probability.')
  ).toBeVisible();
  await expect(page.getByText('Labor dispute')).toBeVisible();
});

test('problems page presents the project statistics', async ({ page }) => {
  await page.goto('/problems');

  await expect(
    page.getByRole('heading', { name: 'Muammo aniq: adolatga vaqt yetmayapti.' })
  ).toBeVisible();
  await expect(page.getByText('4M+', { exact: true })).toBeVisible();
  await expect(page.getByText('556', { exact: true })).toBeVisible();
  await expect(page.getByText('85%+', { exact: true })).toBeVisible();
});

test('ClaimValidator feeds the claim wizard', async ({ page }) => {
  await page.goto('/portal/claim-validator');
  await page.getByRole('button', { name: 'Arizani tahlil qilish' }).click();

  await expect(page.getByText('Ariza tayyorlik darajasi')).toBeVisible();
  await expect(page.locator('.result-row.danger').getByText('Javobgar INN raqami')).toBeVisible();
  await page.getByRole('button', { name: 'Ariza wizardiga o‘tish' }).click();

  await expect(page.getByText('ClaimValidator natijasi')).toBeVisible();
  await expect(page.getByText('82% tayyor', { exact: false })).toBeVisible();
});

test('AutoExec completes the enforcement flow', async ({ page }) => {
  await page.goto('/oversight/auto-exec');
  await page.getByRole('button', { name: 'AutoExec ishga tushirish' }).click();

  await expect(page.getByText('AutoExec yakunlandi')).toBeVisible();
  await expect(page.getByText('4 / 4')).toBeVisible();
});
