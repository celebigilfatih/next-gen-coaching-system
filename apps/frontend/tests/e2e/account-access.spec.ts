import { expect, test } from '@playwright/test';

const password = process.env.E2E_COACH_PASSWORD;
const systemAdminEmail =
  process.env.E2E_SYSTEM_ADMIN_EMAIL ?? 'system.admin.e2e@example.test';

test('system admin can inspect the bounded account and permission workspace', async ({
  page,
}) => {
  test.skip(!password, 'Disposable account fixture required');

  await page.goto('/login');
  await page.getByLabel('E-posta').fill(systemAdminEmail);
  await page.getByLabel('Parola').fill(password!);
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);

  const accountResponse = page.waitForResponse(
    (value) => new URL(value.url()).pathname === '/accounts' && value.ok(),
  );
  await page
    .getByRole('link', { name: 'Kullanıcılar ve Yetkiler', exact: true })
    .click();
  await expect(page).toHaveURL(/\/app\/settings\/users/);
  await expect(
    page.getByRole('heading', {
      name: 'Kullanıcılar ve Yetkiler',
      level: 1,
    }),
  ).toBeVisible();
  await expect(page.getByText('E2E Koçu', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Teknik direktör', { exact: true }),
  ).toBeVisible();

  const payload = await (await accountResponse).json();
  expect(payload.items.length).toBeGreaterThan(0);
  expect(
    payload.items.every(
      (item: { passwordHash?: unknown; authVersion?: unknown }) =>
        item.passwordHash === undefined && item.authVersion === undefined,
    ),
  ).toBe(true);

  await page.getByRole('button', { name: 'Kullanıcı davet et' }).click();
  await expect(
    page.getByRole('heading', { name: 'Kullanıcı davet et' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'İptal' }).click();

  for (const viewport of [
    { width: 1440, height: 1024 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(
      page.getByRole('heading', { name: 'Kullanıcı hesapları' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`account-access-${viewport.width}.png`),
      fullPage: true,
    });
  }
});
