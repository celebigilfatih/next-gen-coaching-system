import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach.e2e@example.test';
const coachPassword = process.env.E2E_COACH_PASSWORD;
const captureQa = process.env.E2E_CAPTURE_QA === 'true';
const apiBaseUrl = `http://localhost:${process.env.E2E_BACKEND_PORT ?? '4000'}`;

test('squad pages player memberships and dashboard keeps the full count', async ({
  page,
}) => {
  test.skip(
    !coachPassword || process.env.E2E_MEMBER_PAGE_FIXTURE !== 'true',
    'Disposable member fixture required',
  );
  await page.setViewportSize({ width: 1440, height: 1024 });
  const fullMemberReads: string[] = [];
  page.on('request', (r) => {
    if (
      r.method() === 'GET' &&
      /^\/groups\/[^/]+\/members$/.test(new URL(r.url()).pathname)
    )
      fullMemberReads.push(r.url());
  });
  await loginAsCoach(page);
  const team = page.getByLabel('Aktif takım');
  const original = await team.inputValue();
  await page.getByRole('button', { name: 'Sonraki takım seçenekleri' }).click();
  await team.selectOption('z-catalog-browser-team-029');
  const response = page.waitForResponse((r) => {
    const url = new URL(r.url());
    return (
      url.pathname.endsWith('/members/players/page') &&
      url.searchParams.get('limit') === '25' &&
      r.ok()
    );
  });
  await page.getByRole('link', { name: 'Kadro', exact: true }).click();
  const body = await (await response).json();
  expect(body.total).toBe(30);
  expect(body.items).toHaveLength(25);
  expect(
    body.items.every(
      (m: { user: { role: string; passwordHash?: unknown } }) =>
        m.user.role === 'PLAYER' && m.user.passwordHash === undefined,
    ),
  ).toBe(true);
  const pages = page.getByRole('navigation', { name: 'Kadro sayfaları' });
  await expect(page.locator('.squad-grid > div')).toHaveCount(25);
  await pages.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await expect(pages).toContainText('Sayfa 2 · 5 / 30 oyuncu');
  await expect(page.locator('.squad-grid > div')).toHaveCount(5);
  await expect(page.locator('.squad-number').first()).toHaveText('26');
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(pages).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`squad-members-${width}.png`),
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1024 });
  const editorResponse = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname ===
        '/training-plans/member-browser-attendance-plan/editor-metadata' &&
      r.ok(),
  );
  await page.goto(
    '/app/trainings/member-browser-attendance-plan?tab=attendance',
  );
  const editor = await (await editorResponse).json();
  expect(editor.attendance).toBeUndefined();
  expect(editor.group).toBeUndefined();
  await expect(page.getByText('Katılım · 2/30', { exact: true })).toBeVisible();
  const attendancePages = page.getByRole('navigation', {
    name: 'Katılım sayfaları',
  });
  await attendancePages.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await expect(attendancePages).toContainText('Sayfa 2 · 5 / 30 oyuncu');
  const lastPlayer = page.getByRole('button', {
    name: 'Member Player 029',
    exact: true,
  });
  await expect(lastPlayer).toHaveAttribute('aria-pressed', 'true');
  await lastPlayer.click();
  await expect(page.getByText('Katılım · 1/30', { exact: true })).toBeVisible();
  await expect(lastPlayer).toHaveAttribute('aria-pressed', 'false');
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(attendancePages).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`attendance-members-${width}.png`),
      fullPage: true,
    });
  }
  await page.reload();
  await expect(page.getByText('Katılım · 1/30', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Member Player 000', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(fullMemberReads).toEqual([]);
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.getByRole('link', { name: 'Ana Sayfa', exact: true }).click();
  await expect(page.getByLabel('Oyuncu özeti', { exact: true })).toContainText(
    '30',
  );
  await team.selectOption(original);
  await expect(page.getByLabel('Oyuncu özeti', { exact: true })).toContainText(
    '2',
  );
});

test('training pages and bounded dashboard retain full season summaries and attendance stays complete', async ({
  page,
}) => {
  test.skip(
    !coachPassword || process.env.E2E_TRAINING_PAGE_FIXTURE !== 'true',
    'Disposable training fixture required',
  );
  await page.setViewportSize({ width: 1440, height: 1024 });
  const fullPlanReads: string[] = [];
  page.on('request', (r) => {
    if (
      r.method() === 'GET' &&
      ([
        '/training-plans',
        '/drills',
        '/sporting/workspace/legacy-context',
      ].includes(new URL(r.url()).pathname) ||
        /^\/seasons\/[^/]+\/matches$/.test(new URL(r.url()).pathname))
    )
      fullPlanReads.push(r.url());
  });
  await loginAsCoach(page);
  if (process.env.E2E_MATCH_PAGE_FIXTURE === 'true') {
    await expect(
      page.getByRole('button', { name: 'Bildirimler', exact: true }),
    ).toHaveText(/31/);
    const matchRead = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === '/matches/catalog/page' &&
        url.searchParams.get('limit') === '25' &&
        !url.searchParams.has('from') &&
        !url.searchParams.has('after') &&
        response.ok()
      );
    });
    await page.getByRole('link', { name: 'Maçlar', exact: true }).click();
    const body = await (await matchRead).json();
    expect(body.total).toBe(31);
    expect(body.items).toHaveLength(25);
    expect(
      body.items.every(
        (item: {
          hasBoard: boolean;
          tacticalBoard?: unknown;
          opponentAnalysis?: unknown;
          videoLinks?: unknown;
        }) =>
          typeof item.hasBoard === 'boolean' &&
          item.tacticalBoard === undefined &&
          item.opponentAnalysis === undefined &&
          item.videoLinks === undefined,
      ),
    ).toBe(true);
    const pages = page.getByRole('navigation', { name: 'Maç sayfaları' });
    await expect(pages).toContainText('25 / 31 maç');
    await expect(page.locator('.match-card')).toHaveCount(25);
    await pages.getByRole('button', { name: 'Sonraki sayfa' }).click();
    await expect(pages).toContainText('Sayfa 2 · 6 / 31');
    await expect(page.locator('.match-card')).toHaveCount(6);
    const last = page.getByRole('link', { name: /Match Catalog 029/ });
    await expect(last).toContainText('Tahta hazır');
    await expect(
      page.getByRole('link', { name: /Match Catalog 028/ }),
    ).toContainText('Tahta bekliyor');
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(pages).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: test.info().outputPath(`matches-${width}.png`),
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: 1440, height: 1024 });
    const detailRead = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname.startsWith(
          '/matches/catalog/detail/',
        ) && response.ok(),
    );
    await last.click();
    const detailBody = await (await detailRead).json();
    expect(detailBody.opponent).toBe('Match Catalog 029');
    expect(detailBody).toHaveProperty('tacticalBoard');
    expect(detailBody).not.toHaveProperty('videoLinks');
    await expect(
      page.getByRole('heading', {
        name: 'Match Catalog 029',
        level: 1,
        exact: true,
      }),
    ).toBeVisible();
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(
        page.getByLabel('Rakip analizi', { exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: test.info().outputPath(`match-detail-${width}.png`),
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page
      .getByRole('link', { name: 'Maçlar', exact: true })
      .last()
      .click();
    await expect(pages).toContainText('Sayfa 1 · 25 / 31');
    await pages.getByRole('button', { name: 'Sonraki sayfa' }).click();
    const seasonSelect = page.getByLabel('Aktif sezon', { exact: true });
    const selectedSeason = await seasonSelect.inputValue();
    await seasonSelect.selectOption('*');
    await expect(pages).toContainText('Sayfa 1 · 25 / 31');
    await seasonSelect.selectOption(selectedSeason);
    await expect(pages).toContainText('Sayfa 1 · 25 / 31');
    await page.getByRole('link', { name: 'Hafta', exact: true }).click();
    const dayBounds = await page.evaluate(() => ({
      from: new Date(2026, 9, 1).toISOString(),
      until: new Date(2026, 9, 2).toISOString(),
    }));
    const matchDayRead = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === '/matches/catalog/page' &&
        url.searchParams.get('from') === dayBounds.from &&
        url.searchParams.get('until') === dayBounds.until &&
        url.searchParams.get('limit') === '25' &&
        response.ok()
      );
    });
    await page.getByLabel('Hafta seç').fill('2026-10-01');
    const dayBody = await (await matchDayRead).json();
    expect(dayBody.total).toBe(30);
    expect(dayBody.items).toHaveLength(25);
    expect(
      dayBody.items.every(
        (item: { tacticalBoard?: unknown; opponentAnalysis?: unknown }) =>
          item.tacticalBoard === undefined &&
          item.opponentAnalysis === undefined,
      ),
    ).toBe(true);
    const matchDay = page.getByRole('region', {
      name: '2026-10-01 maçları',
      exact: true,
    });
    const matchPages = page.getByRole('navigation', {
      name: '2026-10-01 maç sayfaları',
      exact: true,
    });
    await expect(matchDay.locator('a')).toHaveCount(25);
    await expect(matchPages).toContainText('25 / 30 maç');
    await expect(
      page.getByRole('region', {
        name: '2026-10-01 antrenmanları',
        exact: true,
      }),
    ).not.toContainText('Planlanmış etkinlik yok');
    await matchPages.getByRole('button', { name: 'Sonraki maçlar' }).click();
    await expect(matchDay.locator('a')).toHaveCount(5);
    await expect(matchPages).toContainText('Sayfa 2 · 5 / 30 maç');
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await matchPages.scrollIntoViewIfNeeded();
      await expect(matchPages).toBeVisible();
      await expect(matchPages).toBeInViewport();
      expect(
        await matchPages.evaluate((nav) => {
          const card = nav.closest('.week-day')!.getBoundingClientRect();
          return [...nav.querySelectorAll('button')].every((button) => {
            const bounds = button.getBoundingClientRect();
            return bounds.left >= card.left && bounds.right <= card.right;
          });
        }),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: test.info().outputPath(`week-matches-${width}.png`),
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page
      .getByRole('button', { name: 'Sonraki hafta', exact: true })
      .click();
    await expect(page.locator('.week-event.match')).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Önceki hafta', exact: true })
      .click();
    await expect(matchPages).toContainText('Sayfa 1 · 25 / 30 maç');
    await matchPages.getByRole('button', { name: 'Sonraki maçlar' }).click();
    await matchDay.getByRole('link', { name: /Match Catalog 029/ }).click();
    await expect(
      page.getByRole('heading', {
        name: 'Match Catalog 029',
        level: 1,
        exact: true,
      }),
    ).toBeVisible();
  }
  if (process.env.E2E_TACTIC_PAGE_FIXTURE === 'true') {
    const boardRead = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === '/drills/catalog/page' &&
        url.searchParams.get('kind') === 'tactical-board' &&
        response.ok()
      );
    });
    await page
      .getByRole('link', { name: 'Taktik Tahtası', exact: true })
      .click();
    const body = await (await boardRead).json();
    expect(body.total).toBe(30);
    expect(body.items).toHaveLength(25);
    expect(
      body.items.every(
        (item: { isBoard: boolean; jsonData?: unknown }) =>
          item.isBoard && item.jsonData === undefined,
      ),
    ).toBe(true);
    const pages = page.getByRole('navigation', { name: 'Taktik sayfaları' });
    await expect(pages).toContainText('25 / 30 taktik egzersizi');
    await expect(page.locator('.tactic-card')).toHaveCount(25);
    await pages.getByRole('button', { name: 'Sonraki sayfa' }).click();
    await expect(pages).toContainText('Sayfa 2 · 5 / 30');
    await expect(page.locator('.tactic-card')).toHaveCount(5);
    await expect(
      page.getByRole('link', { name: /Library Catalog 000/ }),
    ).toBeVisible();
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(pages).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.getByRole('link', { name: /Library Catalog 000/ }).click();
    await expect(page.getByLabel('Başlık', { exact: true })).toHaveValue(
      'Library Catalog 000',
    );
  }
  if (process.env.E2E_DRILL_PAGE_FIXTURE === 'true') {
    await page
      .getByRole('link', { name: 'Egzersiz Kütüphanesi', exact: true })
      .click();
    const libraryPages = page.getByRole('navigation', {
      name: 'Egzersiz sayfaları',
    });
    await expect(libraryPages).toContainText('25 / 35 egzersiz');
    await expect(page.locator('.library-card')).toHaveCount(25);
    await libraryPages.getByRole('button', { name: 'Sonraki sayfa' }).click();
    await expect(libraryPages).toContainText('10 / 35 egzersiz');
    await page.getByRole('tab', { name: 'Taktik', exact: true }).click();
    await expect(libraryPages).toContainText('Sayfa 1 · 25 / 31 egzersiz');
    await page.getByRole('tab', { name: 'Teknik', exact: true }).click();
    await expect(libraryPages).toContainText('2 / 2 egzersiz');
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(libraryPages).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.getByRole('tab', { name: 'Tümü', exact: true }).click();
    await expect(libraryPages).toContainText('Sayfa 1 · 25 / 35 egzersiz');
    await page.getByRole('link', { name: /Library Catalog 029/ }).click();
    await expect(page).toHaveURL(/\/app\/tactics\/drill-catalog-browser-029$/);
    await expect(page.getByLabel('Başlık', { exact: true })).toHaveValue(
      'Library Catalog 029',
    );
  }
  await page.getByRole('link', { name: 'Antrenmanlar', exact: true }).click();
  const pages = page.getByRole('navigation', { name: 'Antrenman sayfaları' });
  const summary = page.getByLabel('Antrenman kapsamı özeti');
  await expect(pages).toContainText('25 / 31 plan');
  await expect(page.locator('.catalog-grid > .list-link')).toHaveCount(25);
  await expect(summary).toContainText(
    '31 plan · 30 tarihli · 1 tarihsiz · 1810 dakika',
  );
  await pages.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await expect(pages).toContainText('6 / 31 plan');
  await expect(page.locator('.catalog-grid > .list-link')).toHaveCount(6);
  await expect(summary).toContainText('1810 dakika');
  await expect(
    page.getByRole('link', { name: /Training Catalog 030/ }),
  ).toContainText('Tarih TBD');
  for (const viewport of [
    { width: 1440, height: 1024 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(pages).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1024 });
  const season = page.getByLabel('Aktif sezon');
  const selected = await season.inputValue();
  await season.selectOption('*');
  await expect(pages).toContainText('Sayfa 1 · 25 / 32 plan');
  await expect(summary).toContainText('1820 dakika');
  await season.selectOption(selected);
  await expect(pages).toContainText('Sayfa 1 · 25 / 31 plan');
  const overviewRead = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === '/training-plans/catalog/page' &&
      url.searchParams.get('limit') === '3' &&
      response.ok()
    );
  });
  const matchOverviewRead = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === '/matches/catalog/page' &&
      url.searchParams.get('limit') === '3' &&
      !url.searchParams.has('after') &&
      response.ok()
    );
  });
  const drillOverviewRead = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === '/drills/catalog/page' &&
      url.searchParams.get('limit') === '1' &&
      response.ok()
    );
  });
  await page.getByRole('link', { name: 'Ana Sayfa', exact: true }).click();
  const matchPayload = await (await matchOverviewRead).json();
  const expectedMatches =
    process.env.E2E_MATCH_PAGE_FIXTURE === 'true' ? 31 : 1;
  expect(matchPayload.total).toBe(expectedMatches);
  expect(matchPayload.items).toHaveLength(Math.min(3, expectedMatches));
  expect(
    matchPayload.items.every(
      (item: {
        tacticalBoard?: unknown;
        opponentAnalysis?: unknown;
        videoLinks?: unknown;
      }) =>
        item.tacticalBoard === undefined &&
        item.opponentAnalysis === undefined &&
        item.videoLinks === undefined,
    ),
  ).toBe(true);
  const matchLinks = page.locator(
    '.dashboard-match-card a[href^="/app/matches/"]',
  );
  await expect(matchLinks).toHaveCount(Math.min(3, expectedMatches));
  await expect(matchLinks.first()).toContainText('E2E Rakibi U17');
  if (expectedMatches > 3) {
    await expect(matchLinks.nth(1)).toContainText('Match Catalog 000');
    await expect(matchLinks.nth(1)).toContainText('Tahta bekliyor');
    await expect(matchLinks.nth(2)).toContainText('Match Catalog 001');
    await expect(matchLinks.nth(2)).toContainText('Hazır');
  }
  await expect(page.getByLabel('Maç özeti toplamı')).toContainText(
    `${Math.min(3, expectedMatches)} / ${expectedMatches} maç`,
  );
  const drillOverviewPayload = await (await drillOverviewRead).json();
  const expectedDrills = process.env.E2E_DRILL_PAGE_FIXTURE === 'true' ? 35 : 5;
  expect(drillOverviewPayload.items).toHaveLength(1);
  expect(drillOverviewPayload.items[0]).not.toHaveProperty('jsonData');
  expect(drillOverviewPayload.total).toBe(expectedDrills);
  await expect(
    page.getByLabel('Egzersiz özeti', { exact: true }),
  ).toContainText(String(expectedDrills));
  const overviewPayload = await (await overviewRead).json();
  expect(overviewPayload.items).toHaveLength(3);
  expect(overviewPayload.summary.total).toBe(31);
  const recentPlans = page.locator(
    '.dashboard-list a[href^="/app/trainings/"]',
  );
  await expect(recentPlans).toHaveCount(3);
  await expect(recentPlans.first()).toContainText('Training Catalog 029');
  await expect(
    page.locator('.dashboard-stat').filter({ hasText: 'Aktif takım planı' }),
  ).toContainText('31');
  await season.selectOption('*');
  await expect(page.getByLabel('Maç özeti toplamı')).toContainText(
    `${Math.min(3, expectedMatches)} / ${expectedMatches} maç`,
  );
  await expect(
    page.getByLabel('Egzersiz özeti', { exact: true }),
  ).toContainText(String(expectedDrills));
  await expect(
    page.locator('.dashboard-stat').filter({ hasText: 'Aktif takım planı' }),
  ).toContainText('32');
  await season.selectOption(selected);
  await expect(
    page.locator('.dashboard-stat').filter({ hasText: 'Aktif takım planı' }),
  ).toContainText('31');
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByLabel('Egzersiz özeti', { exact: true }),
    ).toContainText(String(expectedDrills));
    await expect(recentPlans).toHaveCount(3);
    await expect(matchLinks).toHaveCount(Math.min(3, expectedMatches));
    await page.screenshot({
      path: test.info().outputPath(`dashboard-matches-${width}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1024 });
  await matchLinks.first().click();
  await expect(
    page.getByRole('heading', { name: 'E2E Rakibi U17', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Yoklama', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: /Training Catalog/ }),
  ).toHaveCount(25);
  const attendancePages = page.getByRole('navigation', {
    name: 'Yoklama sayfaları',
  });
  await expect(page.getByLabel('Yoklama kapsamı özeti')).toContainText(
    '31 plan · 2 güncel oyuncu',
  );
  await attendancePages.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await expect(
    page.getByRole('heading', { name: /Training Catalog/ }),
  ).toHaveCount(6);
  await expect(attendancePages).toContainText('Sayfa 2 · 6 / 31 plan');
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(attendancePages).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1024 });
  await attendancePages.getByRole('button', { name: 'Önceki sayfa' }).click();
  await expect(attendancePages).toContainText('Sayfa 1 · 25 / 31 plan');
  await page
    .getByRole('link', { name: 'Yoklamayı aç', exact: true })
    .first()
    .click();
  await page.getByRole('button', { name: 'Arda E2E', exact: true }).click();
  await expect(page.getByText('Katılım · 1/2')).toBeVisible();
  await page.getByRole('link', { name: 'Yoklama', exact: true }).click();
  await expect(page.getByLabel('Yoklama kapsamı özeti')).toContainText(
    '1 işaretlenmiş katılım',
  );
  await expect(page.locator('.attendance-list > div').first()).toContainText(
    '1 katılım kaydı · 2 güncel oyuncu',
  );
  await page.getByRole('link', { name: 'Ana Sayfa', exact: true }).click();
  await expect(
    page.locator('.dashboard-stat').filter({ hasText: 'İşaretlenmiş katılım' }),
  ).toContainText('1');
  await page.getByRole('link', { name: 'Hafta', exact: true }).first().click();
  await page.getByLabel('Hafta seç').fill('2026-09-04');
  const friday = page.getByRole('region', { name: '2026-09-04 antrenmanları' });
  await expect(friday.locator('a.week-event')).toHaveCount(25);
  await expect(friday).toContainText('30 plan · 1800 dk');
  await expect(friday).not.toContainText('Training Catalog 030');
  await friday.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await expect(friday.locator('a.week-event')).toHaveCount(5);
  await expect(friday).toContainText('Sayfa 2 · 5 / 30 plan');
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      friday.getByRole('button', { name: 'Önceki sayfa' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.getByRole('button', { name: 'Sonraki hafta' }).click();
  await expect(friday).toHaveCount(0);
  await page.getByRole('button', { name: 'Önceki hafta' }).click();
  await expect(friday).toContainText('Sayfa 1 · 25 / 30 plan');
  await page.getByRole('link', { name: 'Antrenmanlar', exact: true }).click();
  await expect(pages).toContainText('Sayfa 1 · 25 / 31 plan');
  await pages.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await page.getByRole('link', { name: /Training Catalog 030/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Training Catalog 030', exact: true }),
  ).toBeVisible();
  expect(fullPlanReads).toHaveLength(0);
});

test('assignment dialog pages team and role options, retains off-page choices and saves explicit selections', async ({
  page,
}) => {
  test.skip(
    !coachPassword || process.env.E2E_CATALOG_FIXTURE !== 'true',
    'Disposable catalog fixture required',
  );
  await page.setViewportSize({ width: 1440, height: 1024 });
  const metadataReads: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.origin === apiBaseUrl) metadataReads.push(url.pathname);
  });
  await loginAsCoach(page);
  await page.getByRole('link', { name: 'Oyuncular', exact: true }).click();
  await page.getByRole('link', { name: /Arda E2E/ }).click();
  await expect(page.getByRole('button', { name: 'Atama ekle' })).toBeVisible();
  expect(metadataReads).not.toContain('/sporting/roles/page');
  expect(metadataReads).not.toContain('/sporting/roles');
  expect(metadataReads).not.toContain('/sporting/teams');
  expect(metadataReads).not.toContain('/groups');
  expect(metadataReads).not.toContain('/seasons');
  expect(metadataReads).toContain('/sporting/workspace/legacy-metadata');
  await page.getByRole('button', { name: 'Atama ekle' }).click();
  const dialog = page.getByRole('dialog', { name: 'Sportif atama' });
  const team = dialog.getByLabel('Atama takımı', { exact: true });
  const role = dialog.getByLabel('Atama rolü', { exact: true });
  await expect(team).toBeEnabled();
  await expect(role).toBeEnabled();
  await expect(
    dialog.getByRole('button', { name: 'Kaydet', exact: true }),
  ).toBeDisabled();
  await expect(team.locator('option')).toHaveCount(26);
  await expect(role.locator('option')).toHaveCount(26);
  await dialog
    .getByRole('button', { name: 'Sonraki Atama takımı seçenekleri' })
    .click();
  await expect(
    team.locator('option', { hasText: 'Catalog Team 029' }),
  ).toHaveCount(1);
  await team.selectOption('z-catalog-browser-team-029');
  await dialog
    .getByRole('button', { name: 'Sonraki Atama rolü seçenekleri' })
    .click();
  await expect(
    role.locator('option', { hasText: 'Catalog Role 029' }),
  ).toHaveCount(1);
  await role.selectOption('z-catalog-browser-role-029');
  await dialog
    .getByRole('button', { name: 'Önceki Atama takımı seçenekleri' })
    .click();
  await dialog
    .getByRole('button', { name: 'Önceki Atama rolü seçenekleri' })
    .click();
  await expect(team).toBeEnabled();
  await expect(role).toBeEnabled();
  await expect(team).toHaveValue('z-catalog-browser-team-029');
  await expect(role).toHaveValue('z-catalog-browser-role-029');
  await expect(team.locator('option')).toHaveCount(27);
  await expect(role.locator('option')).toHaveCount(27);
  for (const viewport of [
    { width: 1440, height: 1024 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(
      dialog.getByRole('button', { name: 'Kaydet', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const box = await dialog.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
  }
  // Future assignment leaves the independent dated-roster fixture totals intact.
  await dialog.getByLabel('Başlangıç', { exact: true }).fill('2030-01-01');
  await dialog
    .getByLabel('Gerekçe', { exact: true })
    .fill('Catalog paging synthetic verification');
  const saved = page.waitForResponse(
    (r) =>
      r.url().endsWith('/sporting/assignments') &&
      r.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Kaydet', exact: true }).click();
  const response = await saved;
  expect(response.status()).toBe(201);
  expect(response.request().postDataJSON()).toMatchObject({
    teamId: 'z-catalog-browser-team-029',
    roleDefinitionId: 'z-catalog-browser-role-029',
  });
  await expect(page.getByText('Sportif atama kaydedildi')).toBeVisible();
  await page.getByRole('button', { name: 'Atama ekle' }).click();
  await expect(team).toBeEnabled();
  await expect(role).toBeEnabled();
  await expect(team).toHaveValue('');
  await expect(role).toHaveValue('');
  await expect(
    dialog.getByRole('button', { name: 'Kaydet', exact: true }),
  ).toBeDisabled();
  await dialog.getByRole('button', { name: 'Vazgeç' }).click();
});

async function loginAsCoach(page: Page) {
  test.setTimeout(100_000);
  // Visit the lazy editor before login. Wait for the usable form rather than
  // global network silence: development HMR can keep requests open indefinitely.
  await page.goto('/app/tactics/new');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Giriş yap' })).toBeEnabled();
  await page.getByLabel('E-posta').fill(coachEmail);
  await page.getByLabel('Parola').fill(coachPassword!);
  const attempt = page.waitForResponse(
    (r) => r.url().endsWith('/auth/login') && r.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  const response = await attempt;
  if (response.status() === 429) {
    const retryAfter = Number(response.headers()['retry-after']);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
    // Honour the real server rate limit across this suite's independent logins.
    await page.waitForTimeout(retryAfter * 1000 + 250);
    await page.getByRole('button', { name: 'Giriş yap' }).click();
  }
  await expect(page).toHaveURL(/\/app\/week$/);
  await expect(
    page.locator('.page-header').getByText(/E2E U17 Takımı/),
  ).toBeVisible();
  await expect(
    page.locator('.page-header').getByText(/2026–27 Test Sezonu/),
  ).toBeVisible();
}

test('dated roster and Player 360 paginate assignments while retaining full totals', async ({
  page,
}) => {
  test.skip(
    !coachPassword ||
      process.env.E2E_HISTORY_FIXTURE !== 'true' ||
      process.env.E2E_PLAYER_PAGE_FIXTURE !== 'true',
    'Disposable history and player fixtures required',
  );
  await page.setViewportSize({ width: 1440, height: 1024 });
  await loginAsCoach(page);
  await page.getByRole('link', { name: 'Takımlar', exact: true }).click();
  await page.getByRole('link', { name: /E2E U17 Takımı/ }).click();
  const rosterPages = page.getByRole('navigation', { name: 'Kadro sayfaları' });
  await expect(rosterPages).toContainText('25 / 33 atama');
  await expect(
    page.getByText(/32 oyuncu ataması · 1 teknik ekip ataması/),
  ).toBeVisible();
  await rosterPages.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await expect(rosterPages).toContainText('8 / 33 atama');
  await expect(
    page.getByText(/32 oyuncu ataması · 1 teknik ekip ataması/),
  ).toBeVisible();
  await page.getByLabel('Kadro tarihi').fill('2025-01-01');
  await expect(page.getByText('Bu sayfada atama yok')).toBeVisible();
  await expect(rosterPages).toContainText('0 / 0 atama');
  await expect(
    rosterPages.getByRole('button', { name: 'Önceki sayfa' }),
  ).toBeDisabled();
  await page.getByLabel('Kadro tarihi').fill('2026-09-06');
  await page.getByRole('link', { name: /Arda E2E/ }).click();
  const historyPages = page.getByRole('navigation', {
    name: 'Atama geçmişi sayfaları',
  });
  await expect(historyPages).toContainText('25 / 31 atama');
  await expect(page.locator('.pathway-timeline > li')).toHaveCount(25);
  const active = page
    .locator('.player-facts')
    .getByText('Aktif atama')
    .locator('..');
  await expect(active).toContainText('1');
  await historyPages.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await expect(historyPages).toContainText('6 / 31 atama');
  await expect(page.locator('.pathway-timeline > li')).toHaveCount(6);
  await expect(active).toContainText('1');
  await historyPages.getByRole('button', { name: 'Önceki sayfa' }).click();
  await expect(historyPages).toContainText('25 / 31 atama');
  await page.getByLabel('Görünüm tarihi').fill('2026-07-01');
  await expect(
    historyPages.getByRole('button', { name: 'Önceki sayfa' }),
  ).toBeDisabled();
  for (const viewport of [
    { width: 1440, height: 1024 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(historyPages).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test('bounded team and season catalogs retain off-page selections with responsive controls', async ({
  page,
}) => {
  test.skip(
    !coachPassword || process.env.E2E_CATALOG_FIXTURE !== 'true',
    'Disposable catalog fixture required',
  );
  await page.setViewportSize({ width: 1440, height: 1024 });
  await loginAsCoach(page);
  const team = page.getByLabel('Aktif takım');
  const season = page.getByLabel('Aktif sezon');
  const originalTeam = await team.inputValue();
  const originalSeason = await season.inputValue();
  await page.getByRole('button', { name: 'Sonraki takım seçenekleri' }).click();
  await expect(
    team.locator('option', { hasText: 'Catalog Team 029' }),
  ).toHaveCount(1);
  await expect(team).toHaveValue(originalTeam);
  await team.selectOption('z-catalog-browser-team-029');
  await expect(team).toHaveValue('z-catalog-browser-team-029');
  await expect(team).toBeEnabled();
  await expect(team.locator('option')).toHaveCount(26);
  await page.getByRole('link', { name: 'Takımlar', exact: true }).click();
  await expect(page.locator('.sporting-team-card')).toHaveCount(25);
  await page
    .getByRole('button', { name: 'Sonraki sayfa', exact: true })
    .click();
  await expect(page.locator('.sporting-team-card')).toHaveCount(6);
  await expect(team).toHaveValue('z-catalog-browser-team-029');
  await page
    .getByRole('button', { name: 'Catalog Team 028 takımını seç' })
    .click();
  await expect(team).toHaveValue('z-catalog-browser-team-028');
  await expect(team).toBeEnabled();
  await page.getByLabel('Takım ara').fill('Catalog Team 029');
  await expect(page.locator('.sporting-team-card')).toHaveCount(1);
  await expect(page.locator('.sporting-team-card')).toContainText(
    'Catalog Team 029',
  );
  await team.selectOption(originalTeam);
  await expect(team).toHaveValue(originalTeam);
  await expect(season).toBeEnabled();
  await page.getByRole('button', { name: 'Sonraki sezon seçenekleri' }).click();
  await expect(
    season.locator('option', { hasText: 'Catalog Season 029' }),
  ).toHaveCount(1);
  await expect(season).toHaveValue(originalSeason);
  await season.selectOption('z-catalog-browser-season-029');
  await expect(season).toHaveValue('z-catalog-browser-season-029');
  await expect(season).toBeEnabled();
  // 25 page records + separately retained selected season + all-seasons option.
  await expect(season.locator('option')).toHaveCount(27);
  await season.selectOption(originalSeason);
  await expect(season).toHaveValue(originalSeason);
  await expect(team).toBeEnabled();
  for (const viewport of [
    { width: 1440, height: 1024 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(
      page.getByRole('button', { name: 'Sonraki takım seçenekleri' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test('player directory pages and searches server results with responsive controls', async ({
  page,
}) => {
  test.skip(
    !coachPassword || process.env.E2E_PLAYER_PAGE_FIXTURE !== 'true',
    'Disposable paging fixture required',
  );
  await page.setViewportSize({ width: 1440, height: 1024 });
  await loginAsCoach(page);
  await page.getByRole('link', { name: 'Oyuncular', exact: true }).click();
  await expect(page.locator('.player-360-card')).toHaveCount(25);
  await page.getByRole('button', { name: 'Sonraki sayfa' }).click();
  await expect(page.locator('.player-360-card')).toHaveCount(7);
  await expect(
    page.getByText('Paging Player 029', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Sonraki sayfa' }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Önceki sayfa' }).click();
  await expect(page.locator('.player-360-card')).toHaveCount(25);
  await page
    .getByLabel('Oyuncu ara', { exact: true })
    .fill('Paging Player 029');
  await expect(page.locator('.player-360-card')).toHaveCount(1);
  await expect(
    page.getByText('Paging Player 029', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Önceki sayfa' }),
  ).toBeDisabled();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole('navigation', { name: 'Oyuncu sayfaları' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test('workspace selection survives navigation and protects unsaved boards', async ({
  page,
  request,
}) => {
  test.skip(!coachPassword, 'E2E_COACH_PASSWORD is required');
  await page.setViewportSize({ width: 1440, height: 1024 });
  const loginResponse = page.waitForResponse(
    // The helper can retry a real 429. Only a successful response carries
    // access_token/user; the first response is not necessarily the login.
    (r) =>
      r.url().endsWith('/auth/login') &&
      r.request().method() === 'POST' &&
      r.ok(),
    { timeout: 100_000 },
  );
  await loginAsCoach(page);
  const login = (await (await loginResponse).json()) as {
    access_token: string;
    user: { clubId: string };
  };
  const headers = { Authorization: `Bearer ${login.access_token}` };
  const groupResponse = await request.get(`${apiBaseUrl}/groups`, { headers });
  const groups = (await groupResponse.json()) as { id: string }[];
  const currentSeason = await page
    .getByLabel('Aktif sezon', { exact: true })
    .inputValue();
  const archived = await request.post(`${apiBaseUrl}/seasons`, {
    headers,
    data: {
      clubId: login.user.clubId,
      groupId: groups[0].id,
      name: '2025–26 Archived E2E',
      startDate: '2025-07-01',
      endDate: '2026-06-30',
    },
  });
  expect(archived.status()).toBe(201);
  await page.getByLabel('Aktif sezon', { exact: true }).selectOption('*');
  await expect(page.getByLabel('Aktif sezon', { exact: true })).toBeEnabled();
  await page
    .getByLabel('Aktif sezon', { exact: true })
    .selectOption({ label: '2025–26 Archived E2E' });
  await expect(
    page.locator('.page-header').getByText(/2025–26 Archived E2E/),
  ).toBeVisible();
  const selected = await page
    .getByLabel('Aktif sezon', { exact: true })
    .inputValue();
  if (process.env.E2E_PERSISTENT_SESSIONS === 'true') {
    await page.reload();
    await expect(page.getByLabel('Aktif sezon', { exact: true })).toHaveValue(
      selected,
    );
  }
  await page.getByRole('link', { name: 'Taktik Tahtası', exact: true }).click();
  await page.getByRole('link', { name: 'Yeni egzersiz' }).click();
  await page.getByRole('button', { name: 'Oyuncu', exact: true }).click();
  await page
    .getByLabel('Aktif sezon', { exact: true })
    .selectOption(currentSeason);
  await expect(
    page.getByRole('dialog', { name: 'Kaydedilmemiş değişiklikler var' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'İptal', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/tactics\/new$/);
  await expect(page.getByLabel('Aktif sezon', { exact: true })).toHaveValue(
    selected,
  );
  await page
    .getByLabel('Aktif sezon', { exact: true })
    .selectOption(currentSeason);
  await page.getByRole('button', { name: 'Değişiklikleri at' }).click();
  await expect(page.getByLabel('Aktif sezon', { exact: true })).toHaveValue(
    currentSeason,
  );
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByLabel('Aktif takım', { exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

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

  await page.getByRole('link', { name: 'Ana Sayfa', exact: true }).click();
  await expect(
    page.getByLabel('Egzersiz özeti', { exact: true }),
  ).toContainText(process.env.E2E_DRILL_PAGE_FIXTURE === 'true' ? '36' : '6');
  await page.getByRole('link', { name: 'Antrenmanlar' }).click();
  await page.getByRole('button', { name: 'Yeni plan' }).click();
  await page.getByLabel('Başlık').fill('E2E Cuma Antrenmanı');
  await page.getByLabel('Tarih ve saat').fill('2026-09-04T18:00');
  await page.getByLabel('Amaç').fill('Ön alan baskısı ve geçiş savunması.');
  await page.getByRole('button', { name: 'Planı oluştur' }).click();
  await expect(page).toHaveURL(/\/app\/trainings\/.+$/);

  const trainingUrl = page.url();
  const optionsPages = page.getByRole('navigation', {
    name: 'Egzersiz seçenek sayfaları',
  });
  if (process.env.E2E_DRILL_PAGE_FIXTURE === 'true') {
    await expect(optionsPages).toContainText('25 / 36 katalog kaydı');
    await page.getByRole('button', { name: 'Sonraki egzersizler' }).click();
    await expect(optionsPages).toContainText('Sayfa 2 · 11 / 36');
  }
  await page.getByLabel('Egzersiz ekle').selectOption(drill.id);
  if (process.env.E2E_DRILL_PAGE_FIXTURE === 'true') {
    await page.getByRole('button', { name: 'Önceki egzersizler' }).click();
    await expect(optionsPages).toContainText('Sayfa 1 · 25 / 36');
    await expect(page.getByLabel('Egzersiz ekle')).toHaveValue(drill.id);
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(optionsPages).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 1024 });
  }
  await page.getByRole('button', { name: 'Plana ekle' }).click();
  await expect(page.getByText('Egzersiz plana eklendi')).toBeVisible();
  await page.getByRole('tab', { name: 'Taktik snapshot' }).click();
  await page.getByRole('button', { name: 'Tahtayı aç', exact: true }).click();
  await page.getByRole('button', { name: 'Top', exact: true }).click();
  await page.getByRole('tab', { name: 'Akış', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'İptal', exact: true })
    .click();
  await expect(
    page.getByRole('tab', { name: 'Taktik snapshot' }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByRole('button', { name: 'Geri al', exact: true }),
  ).toBeEnabled();
  const snapshotSaved = page.waitForResponse(
    (response) =>
      /\/training-plans\/[^/]+\/drills\/[^/]+\/board$/.test(response.url()) &&
      response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Kaydet' }).click();
  const savedSnapshotResponse = await snapshotSaved;
  expect(savedSnapshotResponse.status()).toBe(200);
  const savedSnapshot = await savedSnapshotResponse.json();
  expect(savedSnapshot.boardSnapshot).toMatchObject({ kind: 'tactical-board' });
  await expect(
    page.getByRole('status').filter({ hasText: /^Kaydedildi$/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Geri al', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Kaydedilmemiş değişiklik' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Yinele', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: /^Kaydedildi$/ }),
  ).toBeVisible();
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByLabel('Snapshot kaynağı')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `../../output/playwright/bl046c-board-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1024 });
  if (process.env.E2E_DRILL_PAGE_FIXTURE === 'true') {
    await page.getByRole('tab', { name: 'Akış', exact: true }).click();
    await page
      .getByLabel('Egzersiz ekle')
      .selectOption('drill-catalog-browser-029');
    const refreshedPlan = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response
          .url()
          .endsWith(
            `/training-plans/${new URL(trainingUrl).pathname.split('/').pop()}/editor-metadata`,
          ) &&
        response.ok(),
    );
    await page.getByRole('button', { name: 'Plana ekle' }).click();
    const afterAdd = await (await refreshedPlan).json();
    expect(afterAdd.drills).toHaveLength(2);
    expect(
      afterAdd.drills.some(
        (entry: { id: string }) => entry.id === savedSnapshot.id,
      ),
    ).toBe(true);
    expect(
      afterAdd.drills.every(
        (entry: Record<string, unknown>) => !('boardSnapshot' in entry),
      ),
    ).toBe(true);
    await page.getByRole('tab', { name: 'Taktik snapshot' }).click();
    await page.getByLabel('Snapshot kaynağı').selectOption(savedSnapshot.id);
    const reopened = page.waitForResponse(
      (r) =>
        r.request().method() === 'GET' &&
        r.url().endsWith(`/drills/${savedSnapshot.id}/board`) &&
        r.ok(),
    );
    await page.getByRole('button', { name: 'Tahtayı aç', exact: true }).click();
    expect((await (await reopened).json()).document).toEqual(
      savedSnapshot.boardSnapshot,
    );
  }

  // Changing the source after snapshot persistence must not rewrite the plan.
  await page.goto(`/app/tactics/${drill.id}`);
  await page.getByRole('button', { name: 'Koni', exact: true }).click();
  const sourceUpdated = page.waitForResponse(
    (r) =>
      r.url().endsWith(`/drills/${drill.id}`) && r.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  expect((await sourceUpdated).status()).toBe(200);
  await expect(
    page.getByRole('status').filter({ hasText: /^Kaydedildi$/ }),
  ).toBeVisible();
  await page.goto(trainingUrl);
  await page.getByRole('tab', { name: 'Taktik snapshot' }).click();
  await page.getByLabel('Snapshot kaynağı').selectOption(savedSnapshot.id);
  const isolatedSnapshot = page.waitForResponse(
    (r) =>
      r.request().method() === 'GET' &&
      r.url().endsWith(`/drills/${savedSnapshot.id}/board`),
  );
  await page.getByRole('button', { name: 'Tahtayı aç', exact: true }).click();
  expect((await (await isolatedSnapshot).json()).document).toEqual(
    savedSnapshot.boardSnapshot,
  );

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

  const loginSecondCoach = () =>
    request.post(`${apiBaseUrl}/auth/login`, {
      headers: {
        Origin: `http://localhost:${process.env.E2E_FRONTEND_PORT ?? '3001'}`,
        'X-NGCS-CSRF': '1',
      },
      data: { email: 'coach.second.e2e@example.test', password: coachPassword },
    });
  let secondLogin = await loginSecondCoach();
  if (secondLogin.status() === 429) {
    const retryAfter = Number(secondLogin.headers()['retry-after']);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
    await page.waitForTimeout(retryAfter * 1000 + 250);
    secondLogin = await loginSecondCoach();
  }
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
  expect(
    Object.keys(stored.local).every((key) =>
      key.startsWith('ngcs.workspace.v1.'),
    ),
  ).toBe(true);
  for (const value of Object.values(stored.local)) {
    const scope = JSON.parse(value) as Record<string, unknown>;
    expect(Object.keys(scope).sort()).toEqual([
      'clubId',
      'clubSeasonId',
      'teamId',
    ]);
    expect(
      Object.values(scope).every(
        (id) => typeof id === 'string' && id.length <= 160,
      ),
    ).toBe(true);
  }
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

test('team workspace and Player 360 remain readable on desktop, tablet, and mobile', async ({
  page,
}) => {
  test.skip(!coachPassword, 'E2E_COACH_PASSWORD is required');
  await page.setViewportSize({ width: 1440, height: 1024 });
  await loginAsCoach(page);

  await page.getByRole('link', { name: 'Takımlar' }).click();
  await expect(page).toHaveURL(/\/app\/teams$/);
  await page.getByRole('link', { name: /E2E U17 Takımı/ }).click();
  await expect(page).toHaveURL(/\/app\/teams\/.+$/);
  await expect(page.getByText('Arda E2E')).toBeVisible();

  await page.getByRole('link', { name: 'Oyuncular' }).click();
  await page.getByRole('link', { name: /Arda E2E/ }).click();
  await expect(page).toHaveURL(/\/app\/players\/.+$/);
  await expect(
    page.getByRole('heading', { name: 'Arda E2E', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Hazırlık skoru')).toBeVisible();
  await expect(page.getByText('N/A', { exact: true })).toBeVisible();

  for (const viewport of [
    { width: 1440, height: 1024 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(
      page.getByRole('heading', { name: 'Arda E2E', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
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
