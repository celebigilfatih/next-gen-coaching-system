import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TrainingsRoute, { trainingDayBounds } from './trainings';
import { toLocalDateKey } from '../lib/week';
import { setSession } from '../lib/session';

const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  day: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  reload: vi.fn(),
  workspace: {
    group: { id: 'g', name: 'U17' } as { id: string; name: string } | null,
    season: { id: 's' } as { id: string } | undefined,
    scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({
  getTrainingPlanPage: mocks.page,
  getTrainingDayPage: mocks.day,
  createTrainingPlan: mocks.create,
  updateTrainingPlan: mocks.update,
  deleteTrainingPlan: mocks.remove,
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    reload: mocks.reload,
    get plans() {
      throw new Error('Catalog must not consume the shared full array');
    },
  }),
}));
const page = (id: string, nextCursor: string | null = null) => ({
  items: [
    {
      id,
      title: id,
      groupId: 'g',
      date: null,
      notes: null,
      totalDuration: 60,
      phaseCount: 4,
    },
  ],
  nextCursor,
  limit: 25,
  summary: {
    total: 31,
    scheduled: 30,
    undated: 1,
    totalDuration: 1800,
    presentAttendance: 7,
  },
});
function Harness() {
  return (
    <MemoryRouter initialEntries={['/app/trainings']}>
      <Routes>
        <Route path="/app/trainings" element={<TrainingsRoute />} />
        <Route path="/app/trainings/:id" element={<p>Created detail</p>} />
      </Routes>
    </MemoryRouter>
  );
}
describe('independent training catalog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.workspace = {
      group: { id: 'g', name: 'U17' },
      season: { id: 's' },
      scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
      loading: false,
      error: '',
    };
    mocks.page.mockImplementation(async (_group, _season, after) =>
      page(after ? 'Second' : 'First', after ? null : 'cursor'),
    );
    mocks.day.mockImplementation(
      async (_group, _season, _from, _until, after) =>
        page(after ? 'Day second' : 'Day first', after ? null : 'day-cursor'),
    );
    mocks.reload.mockResolvedValue(undefined);
    mocks.update.mockResolvedValue({
      id: 'First',
      title: 'Güncel plan',
      groupId: 'g',
      date: new Date('2026-09-08T12:00').toISOString(),
      notes: 'Yeni amaç',
      totalDuration: 60,
    });
    mocks.remove.mockResolvedValue({ id: 'First' });
    setSession({
      token: 'unit-only',
      user: {
        id: 'coach',
        role: 'COACH',
        clubId: 'c',
        name: 'Coach',
        email: 'coach@example.test',
      },
    });
  });
  it('renders the approved training visual hierarchy from verified catalog totals', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(
      screen.getByRole('heading', { name: 'Antrenman Planları' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Antrenman planları' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Tarih ve saat' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Süre ve faz' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Antrenman Akışları' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Toplam plan')).toBeInTheDocument();
    expect(screen.getByText('Toplam süre')).toBeInTheDocument();
    expect(
      screen.queryByText(/sakat|sağlık|scouting/i),
    ).not.toBeInTheDocument();
  });
  it('replaces pages, displays full totals and scalar phase counts without reading shared plans', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(screen.getByLabelText('Antrenman kapsamı özeti')).toHaveTextContent(
      '31 plan · 30 tarihli · 1 tarihsiz · 1800 dakika · 7 işaretlenmiş katılım',
    );
    expect(screen.getByText('4 faz')).toBeInTheDocument();
    expect(
      screen.getByRole('rowheader', { name: /First/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(
      screen.getByRole('navigation', {
        name: 'Antrenman sayfaları',
      }),
    ).toHaveTextContent('Sayfa 2 · 1 / 31 plan');
    expect(mocks.page).toHaveBeenLastCalledWith('g', 's', 'cursor');
    expect(mocks.reload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('First');
  });
  it('shows failure instead of empty data, permits previous-page recovery and retry', async () => {
    mocks.page
      .mockResolvedValueOnce(page('First', 'cursor'))
      .mockRejectedValueOnce(new Error('Geçici hata'))
      .mockResolvedValue(page('Recovered'));
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Geçici hata');
    expect(
      screen.queryByText('Henüz antrenman planı yok'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Recovered');
    expect(mocks.page).toHaveBeenLastCalledWith('g', 's', 'cursor');
  });
  it('resets after a scope change and discards late continuation results', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    mocks.page
      .mockResolvedValueOnce(page('First', 'cursor'))
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      )
      .mockResolvedValue(page('New scope'));
    const view = render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(2));
    mocks.workspace = {
      ...mocks.workspace,
      season: { id: 'other-season' },
      scope: { ...mocks.workspace.scope, clubSeasonId: 'other' },
    };
    view.rerender(<Harness />);
    await screen.findByText('New scope');
    expect(mocks.page).toHaveBeenLastCalledWith('g', 'other-season', undefined);
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
    await act(async () => resolve(page('Stale')));
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
  });
  it('omits legacy season for all-seasons and distinguishes an empty continuation', async () => {
    mocks.workspace.season = undefined;
    mocks.workspace.scope.clubSeasonId = '*';
    mocks.page
      .mockResolvedValueOnce(page('First', 'cursor'))
      .mockResolvedValue({ ...page('unused'), items: [] });
    render(<Harness />);
    await screen.findByText('First');
    expect(mocks.page).toHaveBeenCalledWith('g', undefined, undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Bu sayfada plan yok');
    expect(
      screen.getByRole('navigation', {
        name: 'Antrenman sayfaları',
      }),
    ).toHaveTextContent('0 / 31 plan');
  });
  it('does not fetch for a native team without legacy group or a loading workspace', async () => {
    mocks.workspace.group = null;
    const view = render(<Harness />);
    expect(screen.getByRole('button', { name: 'Yeni plan' })).toBeDisabled();
    expect(mocks.page).not.toHaveBeenCalled();
    mocks.workspace.group = { id: 'g', name: 'U17' };
    mocks.workspace.loading = true;
    view.rerender(<Harness />);
    expect(mocks.page).not.toHaveBeenCalled();
  });
  it('handles create errors and refreshes shared summaries before navigating after success', async () => {
    mocks.create
      .mockRejectedValueOnce(new Error('Kaydedilemedi'))
      .mockResolvedValue({ id: 'created' });
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Yeni plan' }));
    fireEvent.change(screen.getByLabelText('Tarih ve saat'), {
      target: { value: '2026-09-06T12:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Planı oluştur' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kaydedilemedi');
    expect(mocks.reload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Planı oluştur' }));
    await screen.findByText('Created detail');
    expect(mocks.reload).toHaveBeenCalledTimes(1);
    expect(mocks.create).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupId: 'g', title: 'Yeni antrenman' }),
    );
  });

  it('edits only title, date and purpose, then refreshes the current catalog cursor', async () => {
    render(<Harness />);
    await screen.findByText('First');
    await userEvent.click(screen.getByRole('button', { name: 'Düzenle' }));
    expect(screen.getByLabelText('Başlık')).toHaveValue('First');
    await userEvent.clear(screen.getByLabelText('Başlık'));
    await userEvent.type(screen.getByLabelText('Başlık'), 'Güncel plan');
    fireEvent.change(screen.getByLabelText('Tarih ve saat'), {
      target: { value: '2026-09-08T15:00' },
    });
    fireEvent.change(screen.getByLabelText('Amaç'), {
      target: { value: 'Yeni amaç' },
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Değişiklikleri kaydet' }),
    );
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(2));
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith('First', {
      title: 'Güncel plan',
      date: new Date('2026-09-08T15:00').toISOString(),
      notes: 'Yeni amaç',
    });
    expect(mocks.page).toHaveBeenLastCalledWith('g', 's', undefined);
    expect(mocks.reload).not.toHaveBeenCalled();
  });

  it('requires explicit delete confirmation and keeps the plan after a failed response', async () => {
    mocks.remove
      .mockRejectedValueOnce(new Error('Silme tamamlanamadı'))
      .mockResolvedValueOnce({ id: 'First' });
    render(<Harness />);
    await screen.findByText('First');
    await userEvent.click(
      screen.getByRole('button', { name: 'First işlemleri' }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sil' }));
    expect(screen.getByRole('button', { name: 'Vazgeç' })).toHaveFocus();
    await userEvent.click(
      screen.getByRole('button', { name: 'Antrenmanı kalıcı sil' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Silme tamamlanamadı',
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Antrenmanı kalıcı sil' }),
    );
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(2));
    expect(mocks.remove).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides create, edit and delete mutations from players', async () => {
    setSession({
      token: 'player-only',
      user: {
        id: 'player',
        role: 'PLAYER',
        clubId: 'c',
        name: 'Player',
        email: 'player@example.test',
      },
    });
    render(<Harness />);
    await screen.findByText('First');
    expect(
      screen.queryByRole('button', { name: 'Yeni plan' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Düzenle' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'First işlemleri' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /First.*Detay/ }),
    ).toBeInTheDocument();
  });

  it('reads a complete selected day, resets cursors and keeps the date input mounted', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    const input = screen.getByLabelText('Antrenman tarihi');
    fireEvent.change(input, { target: { value: '2026-10-20' } });
    await screen.findByText('Day first');
    expect(screen.getByLabelText('Antrenman tarihi')).toBe(input);
    expect(mocks.day).toHaveBeenLastCalledWith(
      'g',
      's',
      new Date(2026, 9, 20).toISOString(),
      new Date(2026, 9, 21).toISOString(),
      undefined,
    );
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Sonraki plan sayfası' }),
    );
    await screen.findByText('Day second');
    expect(mocks.day).toHaveBeenLastCalledWith(
      'g',
      's',
      expect.any(String),
      expect.any(String),
      'day-cursor',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tüm planlar' }));
    await screen.findByText('First');
    expect(input).toHaveValue('');
    expect(mocks.page).toHaveBeenLastCalledWith('g', 's', undefined);
    expect(
      screen.getByRole('button', { name: 'Önceki plan sayfası' }),
    ).toBeDisabled();
  });
  it('ignores a late day response and keeps the selected-day empty state distinct', async () => {
    let complete!: (value: ReturnType<typeof page>) => void;
    mocks.day
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            complete = resolve;
          }),
      )
      .mockResolvedValue({
        ...page('unused'),
        items: [],
        summary: {
          total: 0,
          scheduled: 0,
          undated: 0,
          totalDuration: 0,
          presentAttendance: 0,
        },
      });
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.change(screen.getByLabelText('Antrenman tarihi'), {
      target: { value: '2026-10-20' },
    });
    await waitFor(() => expect(mocks.day).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText('Antrenman tarihi'), {
      target: { value: '2026-10-21' },
    });
    await screen.findByText('Bu tarihte antrenman planı yok');
    await act(async () => complete(page('Stale day')));
    expect(screen.queryByText('Stale day')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Henüz antrenman planı yok'),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Antrenman kapsamı özeti')).toHaveTextContent(
      '0 plan',
    );
  });
  it('uses the existing day endpoint with no season in all-seasons and today uses the local date', async () => {
    mocks.workspace.season = undefined;
    mocks.workspace.scope.clubSeasonId = '*';
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Bugün' }));
    await screen.findByText('Day first');
    expect(screen.getByLabelText('Antrenman tarihi')).toHaveValue(
      toLocalDateKey(new Date()),
    );
    expect(mocks.day).toHaveBeenLastCalledWith(
      'g',
      undefined,
      expect.any(String),
      expect.any(String),
      undefined,
    );
  });
  it('keeps the complete purpose and an explicit, named detail link separate from mutations', async () => {
    const purpose =
      'İlk kontrol ve destek açıları.\nİkinci bölümde alanı daraltın; tüm oyuncularla uygulayın.';
    mocks.page.mockResolvedValue({
      ...page('Plan with notes'),
      items: [
        {
          ...page('Plan with notes').items[0],
          date: new Date(2026, 9, 20, 15, 30).toISOString(),
          notes: purpose,
        },
      ],
    });
    render(<Harness />);
    const title = await screen.findByText('Plan with notes');
    const row = within(title.closest('tr') as HTMLElement);
    const details = row.getByText('Planın amacı').closest('details');
    expect(details).not.toHaveAttribute('open');
    await userEvent.click(row.getByText('Planın amacı'));
    expect(details).toHaveAttribute('open');
    expect(row.getByText(/İkinci bölümde/)).toBeVisible();
    const link = row.getByRole('link', { name: /Plan with notes.*Detay/ });
    expect(link).toHaveAttribute('href', '/app/trainings/Plan with notes');
    expect(link.querySelector('button')).toBeNull();
    await userEvent.click(link);
    expect(await screen.findByText('Created detail')).toBeInTheDocument();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });
  it('does not fall back to an unfiltered read for an unsupported date input', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.change(screen.getByLabelText('Antrenman tarihi'), {
      target: { value: '10000-10-19' },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Geçerli bir antrenman tarihi seçin.',
    );
    expect(mocks.page).toHaveBeenCalledTimes(1);
    expect(mocks.day).not.toHaveBeenCalled();
  });
  it.each(['', 'not-a-date', '2026-02-30', '2026-13-01'])(
    'rejects invalid date bounds: %s',
    (value) => {
      expect(trainingDayBounds(value)).toBeNull();
    },
  );
  it.each(['2026-03-29', '2026-10-25', '2026-12-31'])(
    'uses local midnight through the next exclusive midnight: %s',
    (value) => {
      const bounds = trainingDayBounds(value)!;
      expect(new Date(bounds.from).getHours()).toBe(0);
      expect(new Date(bounds.until).getHours()).toBe(0);
      expect(toLocalDateKey(new Date(bounds.from))).toBe(value);
      const next = new Date(bounds.from);
      next.setDate(next.getDate() + 1);
      expect(bounds.until).toBe(next.toISOString());
    },
  );

  async function openCreate() {
    render(<Harness />);
    await screen.findByText('First');
    await userEvent.click(screen.getByRole('button', { name: 'Yeni plan' }));
    return screen.getByRole('dialog', { name: 'Yeni antrenman planı' });
  }

  it('preserves defaults and the existing title/date gate without inventing native constraints', async () => {
    await openCreate();
    expect(screen.getByLabelText('Başlık')).toHaveValue('Yeni antrenman');
    const date = screen.getByLabelText('Tarih ve saat');
    expect(date).toHaveAttribute('type', 'datetime-local');
    expect(date).not.toHaveAttribute('required');
    expect(date).not.toHaveAttribute('min');
    expect(date).not.toHaveAttribute('max');
    expect(
      screen.getByRole('button', { name: 'Planı oluştur' }),
    ).toBeDisabled();
    fireEvent.change(date, { target: { value: '2026-09-07T18:30' } });
    expect(screen.getByRole('button', { name: 'Planı oluştur' })).toBeEnabled();
    await userEvent.clear(screen.getByLabelText('Başlık'));
    await userEvent.type(screen.getByLabelText('Başlık'), '   ');
    expect(
      screen.getByRole('button', { name: 'Planı oluştur' }),
    ).toBeDisabled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('preserves local-date ISO conversion, raw title/notes and waits for reload before navigation', async () => {
    let created!: (value: { id: string }) => void;
    let refreshed!: () => void;
    mocks.create.mockImplementation(
      () =>
        new Promise((resolve) => {
          created = resolve;
        }),
    );
    mocks.reload.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          refreshed = resolve;
        }),
    );
    await openCreate();
    fireEvent.change(screen.getByLabelText('Başlık'), {
      target: { value: '  Geçiş oyunu  ' },
    });
    fireEvent.change(screen.getByLabelText('Amaç'), {
      target: { value: 'İlk hat\nİkinci hat' },
    });
    fireEvent.change(screen.getByLabelText('Tarih ve saat'), {
      target: { value: '2026-12-31T23:30' },
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Planı oluştur' }),
    );
    expect(mocks.create).toHaveBeenCalledExactlyOnceWith({
      groupId: 'g',
      title: '  Geçiş oyunu  ',
      notes: 'İlk hat\nİkinci hat',
      date: new Date('2026-12-31T23:30').toISOString(),
    });
    expect(
      screen.getByRole('button', { name: 'Oluşturuluyor…' }),
    ).toBeDisabled();
    expect(
      screen.getByLabelText('Başlık').closest('[aria-busy]'),
    ).toHaveAttribute('aria-busy', 'true');
    await act(async () => created({ id: 'created' }));
    expect(mocks.reload).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('Created detail')).not.toBeInTheDocument();
    await act(async () => refreshed());
    expect(await screen.findByText('Created detail')).toBeInTheDocument();
  });

  it.each(['escape', 'cancel', 'close'] as const)(
    'preserves %s dismissal, focus return and draft on reopen',
    async (method) => {
      await openCreate();
      expect(screen.getByLabelText('Başlık')).toHaveFocus();
      await userEvent.clear(screen.getByLabelText('Başlık'));
      await userEvent.type(screen.getByLabelText('Başlık'), 'Taslak');
      if (method === 'escape') await userEvent.keyboard('{Escape}');
      else
        await userEvent.click(
          screen.getByRole('button', {
            name: method === 'cancel' ? 'Vazgeç' : 'Kapat',
          }),
        );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yeni plan' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(screen.getByLabelText('Başlık')).toHaveValue('Taslak');
      expect(mocks.create).not.toHaveBeenCalled();
    },
  );

  it('keeps focus trapped and does not turn Enter in title into a submission', async () => {
    await openCreate();
    fireEvent.change(screen.getByLabelText('Tarih ve saat'), {
      target: { value: '2026-09-07T18:30' },
    });
    await userEvent.keyboard('{Enter}');
    expect(mocks.create).not.toHaveBeenCalled();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Kapat' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByLabelText('Başlık')).toHaveFocus();
  });

  it.each([new Error('<b>Plan hatası</b>'), 'unknown'])(
    'renders failure as plain text and retains draft for retry: %s',
    async (cause) => {
      mocks.create.mockRejectedValue(cause);
      await openCreate();
      fireEvent.change(screen.getByLabelText('Amaç'), {
        target: { value: 'Taslak notu' },
      });
      fireEvent.change(screen.getByLabelText('Tarih ve saat'), {
        target: { value: '2026-09-07T18:30' },
      });
      await userEvent.click(
        screen.getByRole('button', { name: 'Planı oluştur' }),
      );
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(
        cause instanceof Error ? cause.message : 'Plan oluşturulamadı.',
      );
      expect(alert.querySelector('b')).toBeNull();
      expect(screen.getByLabelText('Amaç')).toHaveValue('Taslak notu');
      expect(
        screen.getByRole('button', { name: 'Planı oluştur' }),
      ).toBeEnabled();
      expect(mocks.reload).not.toHaveBeenCalled();
    },
  );

  it('keeps creation unavailable on workspace errors', () => {
    mocks.workspace.error = 'Kapsam okunamadı';
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Yeni plan' })).toBeDisabled();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.page).not.toHaveBeenCalled();
  });
});
