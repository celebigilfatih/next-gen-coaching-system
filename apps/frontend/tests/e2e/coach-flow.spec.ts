import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach.e2e@example.test';
const coachPassword = process.env.E2E_COACH_PASSWORD;
const captureQa = process.env.E2E_CAPTURE_QA === 'true';
const apiBaseUrl = `http://localhost:${process.env.E2E_BACKEND_PORT ?? '4000'}`;

async function loginAsCoach(page: Page) {
  // Prime all lazy editor dependencies before relying on the intentionally
  // memory-only prototype session; Vite may reload once while optimizing them.
  await page.goto('/app/tactics/new');
  await expect(page).toHaveURL(/\/login$/);
  await page.waitForLoadState('networkidle');
  await page.getByLabel('E-posta').fill(coachEmail);
  await page.getByLabel('Parola').fill(coachPassword!);
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page).toHaveURL(/\/app\/week$/);
  await expect(
    page.locator('.page-header').getByText(/E2E U17 Takımı/),
  ).toBeVisible();
  await expect(
    page.locator('.page-header').getByText(/2026–27 Test Sezonu/),
  ).toBeVisible();
}

test('coach creates a club board, snapshots it into training, saves a match board, and cross-tenant access is denied', async ({
  page,
  request,
}) => {
  test.skip(!coachPassword, 'E2E_COACH_PASSWORD is required');
  await page.setViewportSize({ width: 1440, height: 1024 });
  await loginAsCoach(page);

  await page.getByRole('link', { name: 'Taktik Tahtası' }).click();
  await page.getByRole('link', { name: 'Yeni egzersiz' }).click();
  await page.getByLabel('Başlık').fill('E2E Ön Alan Pres Tahtası');
  await page.getByRole('button', { name: 'Oyuncu' }).click();
  const drillCreated = page.waitForResponse(
    (response) =>
      response.url().endsWith('/drills') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Kaydet' }).click();
  const drillResponse = await drillCreated;
  expect(drillResponse.status()).toBe(201);
  const drill = (await drillResponse.json()) as {
    id: string;
    scope: string;
    groupId: string;
    jsonData: { kind: string; elements: unknown[] };
  };
  expect(drill).toMatchObject({
    scope: 'CLUB',
    jsonData: { kind: 'tactical-board' },
  });
  expect(drill.jsonData.elements).toHaveLength(1);
  await expect(page).toHaveURL(new RegExp(`/app/tactics/${drill.id}$`));
  if (captureQa) {
    await page.screenshot({
      path: fileURLToPath(
        new URL(
          '../../qa/implementation-tactics-1440x1024.png',
          import.meta.url,
        ),
      ),
      fullPage: true,
    });
  }

  await page.getByRole('link', { name: 'Antrenmanlar' }).click();
  await page.getByRole('button', { name: 'Yeni plan' }).click();
  await page.getByLabel('Başlık').fill('E2E Cuma Antrenmanı');
  await page.getByLabel('Tarih ve saat').fill('2026-09-04T18:00');
  await page.getByLabel('Amaç').fill('Ön alan baskısı ve geçiş savunması.');
  await page.getByRole('button', { name: 'Planı oluştur' }).click();
  await expect(page).toHaveURL(/\/app\/trainings\/.+$/);

  await page.getByLabel('Egzersiz ekle').selectOption(drill.id);
  await page.getByRole('button', { name: 'Plana ekle' }).click();
  await expect(page.getByText('Egzersiz plana eklendi')).toBeVisible();
  await page.getByRole('tab', { name: 'Taktik snapshot' }).click();
  const snapshotSaved = page.waitForResponse(
    (response) =>
      /\/training-plans\/[^/]+\/drills\/[^/]+\/board$/.test(response.url()) &&
      response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Kaydet' }).click();
  expect((await snapshotSaved).status()).toBe(200);

  await page.getByRole('link', { name: 'Maçlar' }).click();
  await page.getByRole('link', { name: /E2E Rakibi U17/ }).click();
  await page.getByRole('tab', { name: 'Taktik tahtası' }).click();
  await page.getByRole('button', { name: 'Top' }).click();
  const matchBoardSaved = page.waitForResponse(
    (response) =>
      /\/seasons\/matches\/[^/]+\/tactical-board$/.test(response.url()) &&
      response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Kaydet' }).click();
  const matchBoardResponse = await matchBoardSaved;
  expect(matchBoardResponse.status()).toBe(200);
  await expect(matchBoardResponse.json()).resolves.toMatchObject({
    tacticalBoard: {
      kind: 'tactical-board',
      elements: [expect.objectContaining({ type: 'ball' })],
    },
  });

  const secondLogin = await request.post(`${apiBaseUrl}/auth/login`, {
    headers: {
      Origin: `http://localhost:${process.env.E2E_FRONTEND_PORT ?? '3001'}`,
      'X-NGCS-CSRF': '1',
    },
    data: { email: 'coach.second.e2e@example.test', password: coachPassword },
  });
  expect(secondLogin.status()).toBe(201);
  const { access_token: secondToken } = (await secondLogin.json()) as {
    access_token: string;
  };
  const crossTenantRead = await request.get(
    `${apiBaseUrl}/drills/${drill.id}`,
    { headers: { Authorization: `Bearer ${secondToken}` } },
  );
  expect(crossTenantRead.status()).toBe(403);
});

test('persistent session survives reload and new tab, then server logout denies the old access token', async ({
  page,
  context,
}) => {
  test.skip(
    process.env.E2E_PERSISTENT_SESSIONS !== 'true' || !coachPassword,
    'Persistent sessions opt-in suite',
  );
  await loginAsCoach(page);
  const refreshResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/auth/refresh') && response.status() === 200,
  );
  await page.reload();
  const token = (
    (await (await refreshResponse).json()) as { access_token: string }
  ).access_token;
  await expect(page).toHaveURL(/\/app\/week$/);
  await expect(
    page.getByRole('heading', { name: 'Hafta', exact: true }),
  ).toBeVisible();
  const cookies = await context.cookies();
  expect(
    cookies.find((cookie) => cookie.name === 'ngcs_refresh'),
  ).toMatchObject({ httpOnly: true, sameSite: 'Lax', path: '/' });
  expect(await page.evaluate(() => document.cookie)).not.toContain(
    'ngcs_refresh',
  );
  const stored = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
  expect(stored.local).toEqual({});
  // React Router stores scroll positions, which are not authentication data.
  expect(
    Object.keys(stored.session).every(
      (key) => key === 'react-router-scroll-positions',
    ),
  ).toBe(true);
  expect(JSON.stringify(stored)).not.toContain(token);
  const second = await context.newPage();
  await second.goto('/app/week');
  await expect(
    second.getByRole('heading', { name: 'Hafta', exact: true }),
  ).toBeVisible();
  await second.getByRole('link', { name: 'Ayarlar' }).click();
  await second.getByRole('button', { name: 'Çıkış yap' }).click();
  await expect(second).toHaveURL(/\/login$/);
  const denied = await context.request.get(`${apiBaseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(denied.status()).toBe(401);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await second.close();
});

test('all five task routes stay addressable on desktop, tablet, and mobile', async ({
  page,
}) => {
  test.skip(!coachPassword, 'E2E_COACH_PASSWORD is required');
  await loginAsCoach(page);
  for (const viewport of [
    { width: 1440, height: 1024 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [path, heading] of [
      ['week', 'Hafta'],
      ['trainings', 'Antrenmanlar'],
      ['tactics', 'Taktik Tahtası'],
      ['squad', 'Kadro'],
      ['matches', 'Maçlar'],
    ] as const) {
      await page.getByRole('link', { name: heading }).click();
      await expect(page).toHaveURL(new RegExp(`/app/${path}$`));
      await expect(
        page.getByRole('heading', { name: heading, exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: heading })).toHaveClass(
        /active/,
      );
      if (captureQa && path === 'week') {
        await page.screenshot({
          path: fileURLToPath(
            new URL(
              `../../qa/implementation-week-${viewport.width}x${viewport.height}.png`,
              import.meta.url,
            ),
          ),
          fullPage: true,
        });
      }
    }
  }
});

test('dirty tactical work blocks sidebar, browser-back, and mobile navigation until confirmed', async ({
  page,
}) => {
  test.skip(!coachPassword, 'E2E_COACH_PASSWORD is required');
  await page.setViewportSize({ width: 1440, height: 1024 });
  await loginAsCoach(page);

  await page.getByRole('link', { name: 'Taktik Tahtası' }).click();
  await page.getByRole('link', { name: 'Yeni egzersiz' }).click();
  await page.getByLabel('Başlık').fill('Kaydedilmemiş E2E Tahtası');

  await page.getByRole('link', { name: 'Kütüphane', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Kaydedilmemiş değişiklikler var' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'İptal' }).click();
  await expect(page).toHaveURL(/\/app\/tactics\/new$/);

  await page.evaluate(() => window.history.back());
  await expect(
    page.getByRole('heading', { name: 'Kaydedilmemiş değişiklikler var' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'İptal' }).click();
  await expect(page).toHaveURL(/\/app\/tactics\/new$/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator('.ngcs-mobile-nav')
    .getByRole('link', { name: 'Antrenmanlar' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Kaydedilmemiş değişiklikler var' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Değişiklikleri at' }).click();
  await expect(page).toHaveURL(/\/app\/trainings$/);
});
