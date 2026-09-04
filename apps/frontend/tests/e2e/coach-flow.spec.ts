import { expect, test, type Page } from '@playwright/test';

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach.e2e@example.test';
const coachPassword = process.env.E2E_COACH_PASSWORD;

async function loginAsCoach(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-posta').fill(coachEmail);
  await page.getByLabel('Parola').fill(coachPassword!);
  await page.getByRole('button', { name: 'Giriş yap' }).click();

  await expect(page).toHaveURL(/\/app\/week$/);
  await expect(
    page.getByRole('heading', { name: 'E2E U17 Takımı' }).first(),
  ).toBeVisible();
  await expect(page.getByText('2026–27 Test Sezonu').first()).toBeVisible();
}

test('coach logs in, creates a plan and persists attendance', async ({
  page,
}) => {
  test.skip(!coachPassword, 'E2E_COACH_PASSWORD is required');

  await loginAsCoach(page);

  await page.getByRole('button', { name: 'Antrenmanlar' }).click();
  await page
    .getByLabel('Antrenman amacı')
    .fill('E2E pas kalitesi ve geçiş oyunu çalışması.');

  const planCreated = page.waitForResponse(
    (response) =>
      response.url().endsWith('/training-plans') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Planı kaydet' }).click();
  await expect((await planCreated).status()).toBe(201);
  await expect(page.getByRole('status')).toContainText(
    'Antrenman planı kaydedildi',
  );

  await page.getByRole('button', { name: 'Katılımı aç' }).click();
  await expect(page.getByText(/2\/2 oyuncu mevcut/)).toBeVisible();
  await page.getByRole('button', { name: /Bora E2E/ }).click();
  await expect(page.getByText(/1\/2 oyuncu mevcut/)).toBeVisible();

  const attendanceReloaded = page.waitForResponse(
    (response) =>
      response.url().includes('/attendance?planId=') &&
      response.request().method() === 'GET',
  );
  await page.getByRole('button', { name: 'Katılımı kaydet' }).click();

  const persistedAttendance = (await attendanceReloaded).json() as Promise<
    Array<{
      playerId: string;
      status: 'PRESENT' | 'ABSENT';
      player: { name: string };
    }>
  >;
  await expect(persistedAttendance).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: 'ABSENT',
        player: expect.objectContaining({ name: 'Bora E2E' }),
      }),
    ]),
  );
  await expect(page.getByRole('status')).toContainText(
    'Katılım listesi kaydedildi',
  );
});

test('coach updates and persists match tactical analysis', async ({ page }) => {
  test.skip(!coachPassword, 'E2E_COACH_PASSWORD is required');

  await loginAsCoach(page);
  await page.getByRole('button', { name: 'Maçlar' }).click();
  await expect(
    page.getByRole('heading', { name: 'E2E Rakibi U17' }),
  ).toBeVisible();

  const analysis =
    'E2E rakip analizi: merkezde daralıyor, ters kanat geçişi öncelikli.';
  const coachNote =
    'E2E koç notu: top kaybı sonrası beş saniye baskı uygulanacak.';
  await page.getByLabel('Rakip ve taktik analizi').fill(analysis);
  await page.getByLabel('Koç notu').fill(coachNote);

  const matchUpdated = page.waitForResponse(
    (response) =>
      response.url().includes('/seasons/matches/') &&
      response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Analizi kaydet' }).click();

  const response = await matchUpdated;
  expect(response.status()).toBe(200);
  const persistedMatch = (await response.json()) as {
    opponent: string;
    ourFormation: string;
    notes: string;
    opponentAnalysis: {
      summary: string;
      opponentFormation: string;
      focus: string;
    };
  };
  expect(persistedMatch).toEqual(
    expect.objectContaining({
      opponent: 'E2E Rakibi U17',
      ourFormation: '4-3-3',
      notes: coachNote,
      opponentAnalysis: {
        summary: analysis,
        opponentFormation: '4-4-2',
        focus: 'İlk bölge baskısı',
      },
    }),
  );
  await expect(page.getByRole('status')).toContainText(
    'Maç analizi kaydedildi',
  );
});

test('coach selects phased drills and persists plan drill notes', async ({
  page,
}) => {
  test.skip(!coachPassword, 'E2E_COACH_PASSWORD is required');

  await loginAsCoach(page);
  await page.getByRole('button', { name: 'Antrenmanlar' }).click();

  await page
    .getByLabel('Isınma egzersizi')
    .selectOption({ label: 'E2E Dinamik Isınma' });
  await page
    .getByLabel('Teknik egzersizi')
    .selectOption({ label: 'E2E Yön Değiştirme' });
  await page
    .getByLabel('Taktik egzersizi')
    .selectOption({ label: 'E2E Ön Alan Baskısı' });
  await page
    .getByLabel('Soğuma egzersizi')
    .selectOption({ label: 'E2E Aktif Soğuma' });
  const technicalNote = 'E2E teknik notu: iki temas ve açık vücut açısı.';
  await page.getByLabel('Teknik notu').fill(technicalNote);

  const drillsReplaced = page.waitForResponse(
    (response) =>
      /\/training-plans\/[^/]+\/drills$/.test(response.url()) &&
      response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Planı kaydet' }).click();

  const response = await drillsReplaced;
  expect(response.status()).toBe(200);
  const persistedPlan = (await response.json()) as {
    totalDuration: number;
    drills: Array<{
      phase: string;
      notes: string | null;
      drill: { title: string; durationMin: number };
    }>;
  };
  expect(persistedPlan.totalDuration).toBe(75);
  expect(persistedPlan.drills).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        phase: 'TECHNICAL',
        notes: technicalNote,
        drill: expect.objectContaining({
          title: 'E2E Yön Değiştirme',
          durationMin: 24,
        }),
      }),
    ]),
  );
  await expect(page.getByRole('status')).toContainText(
    'Antrenman planı kaydedildi',
  );
});
