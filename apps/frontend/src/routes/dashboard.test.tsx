import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardRoute, {
  dashboardDayBounds,
  greeting,
  meta,
} from './dashboard';

const mocks = vi.hoisted(() => ({
  overview: vi.fn(),
  day: vi.fn(),
  role: 'COACH',
  drillOverview: vi.fn(),
  matchOverview: vi.fn(),
  playerOverview: vi.fn(),
  reload: vi.fn(),
  workspace: {
    group: { id: 'g', name: 'U17' } as { id: string; name: string } | null,
    season: { id: 's', name: 'Season' } as
      | { id: string; name: string }
      | undefined,
    scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({
  getTrainingOverview: mocks.overview,
  getTrainingDayPage: mocks.day,
  getDrillOverview: mocks.drillOverview,
  getMatchOverview: mocks.matchOverview,
  getPlayerMemberPage: mocks.playerOverview,
}));
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { role: mocks.role } }),
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    reload: mocks.reload,
    get members() {
      throw new Error('Dashboard must not consume shared members');
    },
    get drills() {
      throw new Error('Dashboard must not consume shared drills');
    },
    get matches() {
      throw new Error('Dashboard must not consume shared matches');
    },
    get plans() {
      throw new Error('Dashboard must not consume shared plans');
    },
  }),
}));
const result = (title = 'Recent') => ({
  items: [{ id: title, title, date: null, totalDuration: 60, phaseCount: 4 }],
  summary: {
    total: 31,
    presentAttendance: 240,
    scheduled: 30,
    undated: 1,
    totalDuration: 1860,
  },
  limit: 3,
  nextCursor: 'unused',
});
function Harness() {
  return (
    <MemoryRouter>
      <DashboardRoute />
    </MemoryRouter>
  );
}
describe('independent dashboard training overview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.role = 'COACH';
    mocks.day.mockResolvedValue({ items: [], nextCursor: null, total: 0 });
    mocks.workspace = {
      group: { id: 'g', name: 'U17' },
      season: { id: 's', name: 'Season' },
      scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
      loading: false,
      error: '',
    };
    mocks.overview.mockResolvedValue(result());
    mocks.drillOverview.mockResolvedValue({ items: [], total: 0, limit: 1 });
    mocks.matchOverview.mockResolvedValue({ items: [], total: 0, limit: 3 });
    mocks.playerOverview.mockResolvedValue({ items: [], total: 0, limit: 1 });
  });
  it('uses a bounded player page only for its full count and retries independently', async () => {
    mocks.playerOverview.mockRejectedValueOnce(
      new Error('Player count unavailable'),
    );
    render(<Harness />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Player count unavailable',
    );
    expect(screen.getByLabelText('Oyuncu özeti')).toHaveTextContent('—');
    mocks.playerOverview.mockResolvedValueOnce({
      items: [{}],
      total: 130,
      limit: 1,
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Oyuncu sayısını tekrar yükle' }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Oyuncu özeti')).toHaveTextContent('130'),
    );
    expect(mocks.playerOverview).toHaveBeenLastCalledWith('g', undefined, 1);
    expect(mocks.overview).toHaveBeenCalledTimes(1);
  });
  it('shows six real counters and uses dated/undated totals instead of page lengths', async () => {
    render(<Harness />);
    await screen.findByRole('heading', { name: 'Recent' });
    expect(document.querySelectorAll('.metric-card')).toHaveLength(6);
    expect(screen.getByLabelText('Antrenman süresi özeti')).toHaveTextContent(
      '1860',
    );
    expect(
      screen.getByRole('progressbar', { name: 'Tarihli plan' }),
    ).toHaveAttribute('value', '30');
    expect(
      screen.getByRole('progressbar', { name: 'Tarihsiz plan' }),
    ).toHaveAttribute('value', '1');
    expect(screen.queryByText('Yaklaşan maçlar')).not.toBeInTheDocument();
    expect(meta()).toEqual([{ title: 'Ana Sayfa | NGCS' }]);
  });
  it('does not request player counts for PLAYER and retains working quick links', async () => {
    mocks.role = 'PLAYER';
    render(<Harness />);
    await screen.findByRole('heading', { name: 'Recent' });
    expect(mocks.playerOverview).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Oyuncu özeti')).toHaveTextContent('—');
    expect(screen.getByText(/Bu rol için üye listesi/)).toBeInTheDocument();
    for (const [name, route] of [
      ['Antrenmanları planla', 'trainings'],
      ['Yoklamayı takip et', 'attendance'],
      ['Egzersiz kütüphanesini aç', 'library'],
      ['Taktik tahtasına geç', 'tactics'],
    ]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'href',
        '/app/' + route,
      );
    }
  });
  it('reads the local day with cursor pagination and independently retries failed daily reads', async () => {
    const today = {
      id: 'today',
      title: 'Daily practice',
      date: new Date().toISOString(),
      totalDuration: 45,
      phaseCount: 2,
    };
    mocks.day.mockResolvedValueOnce({ items: [today], nextCursor: 'day-2' });
    render(<Harness />);
    await screen.findByRole('link', { name: /Daily practice/ });
    const bounds = dashboardDayBounds(new Date());
    expect(mocks.day).toHaveBeenLastCalledWith(
      'g',
      's',
      bounds.from,
      bounds.until,
      undefined,
    );
    const pager = screen.getByRole('navigation', {
      name: 'Günlük program sayfaları',
    });
    expect(
      within(pager).getByRole('button', { name: 'Önceki sayfa' }),
    ).toBeDisabled();
    mocks.day.mockRejectedValueOnce(new Error('Daily failed'));
    fireEvent.click(
      within(pager).getByRole('button', { name: 'Sonraki sayfa' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Daily failed');
    mocks.day.mockResolvedValueOnce({
      items: [{ ...today, id: 'second', title: 'Second practice' }],
      nextCursor: null,
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Günlük programı tekrar dene' }),
    );
    expect(
      await screen.findByRole('link', { name: /Second practice/ }),
    ).toHaveAttribute('href', '/app/trainings/second');
    expect(mocks.day).toHaveBeenLastCalledWith(
      'g',
      's',
      bounds.from,
      bounds.until,
      'day-2',
    );
    expect(screen.queryByText('Daily practice')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sonraki sayfa' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await waitFor(() =>
      expect(mocks.day).toHaveBeenLastCalledWith(
        'g',
        's',
        bounds.from,
        bounds.until,
        undefined,
      ),
    );
    expect(mocks.overview).toHaveBeenCalledTimes(1);
  });
  it('ignores old daily responses after a scope change', async () => {
    let resolve!: (value: unknown) => void;
    mocks.day.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.day).toHaveBeenCalledTimes(1));
    mocks.workspace.scope.teamId = 'other';
    mocks.workspace.group = { id: 'other', name: 'Other' };
    view.rerender(<Harness />);
    await screen.findByText('Bugün için planlanmış antrenman yok.');
    await act(async () =>
      resolve({
        items: [
          { id: 'old', title: 'Stale daily', date: new Date().toISOString() },
        ],
      }),
    );
    expect(screen.queryByText('Stale daily')).not.toBeInTheDocument();
  });
  it('constructs local midnight boundaries across month/year rollover and varies the greeting by hour', () => {
    for (const day of [
      new Date(2026, 8, 30, 23, 59),
      new Date(2026, 11, 31, 23, 59),
      new Date(2026, 2, 29, 12),
    ]) {
      const { from, until } = dashboardDayBounds(day);
      expect(new Date(from).getHours()).toBe(0);
      expect(new Date(from).getDate()).toBe(day.getDate());
      const next = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate() + 1,
      );
      expect(until).toBe(next.toISOString());
    }
    expect(greeting(new Date(2026, 8, 8, 8))).toBe('Günaydın');
    expect(greeting(new Date(2026, 8, 8, 12))).toBe('İyi günler');
    expect(greeting(new Date(2026, 8, 8, 18))).toBe('İyi akşamlar');
  });
  it('uses full counters and scalar phases, never shared plan arrays or page length', async () => {
    render(<Harness />);
    expect(
      await screen.findByRole('heading', { name: 'Recent' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Antrenman özeti')).toBeInTheDocument();
    expect(screen.getByText('240')).toBeInTheDocument();
    expect(screen.getByText('4 faz')).toBeInTheDocument();
    expect(screen.getAllByText(/Tarih TBD/)[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Recent/ })).toHaveAttribute(
      'href',
      '/app/trainings/Recent',
    );
    expect(mocks.overview).toHaveBeenCalledWith('g', 's');
  });
  it('distinguishes loading and failure from zero/empty data and retries independently', async () => {
    let reject!: (reason: Error) => void;
    mocks.overview.mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    render(<Harness />);
    expect(
      screen.getByRole('status', { name: 'Antrenman özeti yükleniyor' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText('Egzersiz özeti')).toHaveTextContent('0'),
    );
    expect(screen.getAllByText('—')).toHaveLength(3);
    await waitFor(() => expect(mocks.overview).toHaveBeenCalledTimes(1));
    await act(async () => reject(new Error('Geçici hata')));
    expect(screen.getByRole('alert')).toHaveTextContent('Geçici hata');
    expect(
      screen.queryByText('Henüz antrenman planı yok.'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByRole('heading', { name: 'Recent' });
    expect(mocks.reload).not.toHaveBeenCalled();
  });
  it('resets scope immediately and ignores late responses from the old scope', async () => {
    let resolve!: (value: ReturnType<typeof result>) => void;
    mocks.overview.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.overview).toHaveBeenCalledTimes(1));
    mocks.workspace.scope.teamId = 'new-team';
    mocks.workspace.group = { id: 'new-group', name: 'U19' };
    view.rerender(<Harness />);
    await screen.findByRole('heading', { name: 'Recent' });
    expect(mocks.overview).toHaveBeenLastCalledWith('new-group', 's');
    await act(async () => resolve(result('Stale')));
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    mocks.workspace.season = undefined;
    mocks.workspace.scope.clubSeasonId = '*';
    view.rerender(<Harness />);
    expect(
      screen.queryByRole('heading', { name: 'Recent' }),
    ).not.toBeInTheDocument();
    await screen.findByRole('heading', { name: 'Recent' });
    expect(mocks.overview).toHaveBeenLastCalledWith('new-group', undefined);
  });
  it('does not request when workspace is loading, failed or lacks a legacy group', async () => {
    mocks.workspace.loading = true;
    const view = render(<Harness />);
    expect(screen.getByRole('status')).toHaveAccessibleName(
      'Genel bakış yükleniyor',
    );
    mocks.workspace.loading = false;
    mocks.workspace.error = 'Workspace failed';
    view.rerender(<Harness />);
    expect(screen.getByRole('alert')).toHaveTextContent('Workspace failed');
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    expect(mocks.reload).toHaveBeenCalledTimes(1);
    mocks.workspace.error = '';
    mocks.workspace.group = null;
    view.rerender(<Harness />);
    expect(
      screen.getByText(/legacy antrenman bağlamı bulunmuyor/),
    ).toBeInTheDocument();
    expect(mocks.overview).not.toHaveBeenCalled();
    expect(mocks.drillOverview).not.toHaveBeenCalled();
    expect(mocks.matchOverview).not.toHaveBeenCalled();
  });
  it('shows a genuine empty response with zero totals', async () => {
    mocks.overview.mockResolvedValue({
      ...result(),
      items: [],
      summary: {
        total: 0,
        presentAttendance: 0,
        scheduled: 0,
        undated: 0,
        totalDuration: 0,
      },
    });
    render(<Harness />);
    await screen.findByText('Henüz antrenman planı yok.');
    expect(screen.queryByText('—')).not.toBeInTheDocument();
    for (const label of [
      'Oyuncu özeti',
      'Antrenman özeti',
      'Antrenman süresi özeti',
      'Egzersiz özeti',
      'Katılım özeti',
      'Kapsamdaki maç özeti',
    ])
      expect(screen.getByLabelText(label)).toHaveTextContent('0');
    expect(screen.getByLabelText('Maç özeti toplamı')).toHaveTextContent(
      '0 / 0 maç',
    );
  });

  it('preserves server match order, scalar board badges, full total and detail links', async () => {
    mocks.matchOverview.mockResolvedValue({
      items: ['Earlier', 'Equal date A', 'Equal date B'].map((opponent, i) => ({
        id: String(i),
        opponent,
        date: '2026-01-01T12:00:00Z',
        location: 'Home',
        hasBoard: i === 1,
      })),
      total: 31,
      limit: 3,
      nextCursor: 'unused',
    });
    render(<Harness />);
    await screen.findByText('Earlier');
    expect(mocks.matchOverview).toHaveBeenCalledExactlyOnceWith('g', 's');
    expect(screen.getByLabelText('Maç özeti toplamı')).toHaveTextContent(
      '3 / 31 maç',
    );
    expect(screen.getByRole('link', { name: /Equal date A/ })).toHaveAttribute(
      'href',
      '/app/matches/1',
    );
    expect(
      screen.getByRole('link', { name: /Equal date A/ }),
    ).toHaveTextContent('Hazır');
    expect(screen.getByRole('link', { name: /Earlier/ })).toHaveTextContent(
      'Tahta bekliyor',
    );
    expect(
      screen
        .getAllByRole('link')
        .filter((link) =>
          link.getAttribute('href')?.startsWith('/app/matches/'),
        )
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/app/matches/0', '/app/matches/1', '/app/matches/2']);
  });

  it('keeps match loading/error distinct from empty and retries only match reads', async () => {
    let reject!: (error: Error) => void;
    mocks.matchOverview.mockImplementationOnce(
      () =>
        new Promise((_done, fail) => {
          reject = fail;
        }),
    );
    render(<Harness />);
    await screen.findByRole('heading', { name: 'Recent' });
    expect(screen.getByLabelText('Maç özeti yükleniyor')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Maç özeti toplamı'),
    ).not.toBeInTheDocument();
    await act(async () => reject(new Error('Match failed')));
    expect(
      screen.getByRole('alert', { name: 'Maç özeti hatası' }),
    ).toHaveTextContent('Match failed');
    expect(
      screen.queryByText('Planlanmış maç bulunmuyor.'),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Maçları tekrar dene' }),
    );
    await screen.findByText('Planlanmış maç bulunmuyor.');
    expect(mocks.overview).toHaveBeenCalledTimes(1);
    expect(mocks.drillOverview).toHaveBeenCalledTimes(1);
    expect(mocks.reload).not.toHaveBeenCalled();
  });

  it('discards old match responses and re-reads selected/all-season context', async () => {
    let resolve!: (value: unknown) => void;
    mocks.matchOverview.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.matchOverview).toHaveBeenCalledTimes(1));
    mocks.workspace.group = { id: 'g2', name: 'U19' };
    mocks.workspace.scope.teamId = 't2';
    view.rerender(<Harness />);
    await screen.findByText('Planlanmış maç bulunmuyor.');
    await act(async () =>
      resolve({ items: [{ id: 'old', opponent: 'Stale match' }], total: 999 }),
    );
    expect(screen.queryByText('Stale match')).not.toBeInTheDocument();
    expect(mocks.matchOverview).toHaveBeenLastCalledWith('g2', 's');
    mocks.workspace.season = undefined;
    mocks.workspace.scope.clubSeasonId = '*';
    view.rerender(<Harness />);
    expect(
      screen.queryByLabelText('Maç özeti toplamı'),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.matchOverview).toHaveBeenLastCalledWith('g2', undefined),
    );
  });

  it('does not widen missing selected-season matches or hide unrelated summaries', async () => {
    mocks.workspace.season = undefined;
    render(<Harness />);
    await screen.findByRole('heading', { name: 'Recent' });
    expect(screen.getByText(/maç bağlamı bulunmuyor/)).toBeInTheDocument();
    expect(mocks.matchOverview).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Antrenman özeti')).toHaveTextContent('31');
  });

  it('uses the full drill total, not the one-item projection or shared array', async () => {
    mocks.drillOverview.mockResolvedValue({
      items: [{ id: 'only-card' }],
      total: 35,
      limit: 1,
      nextCursor: 'unused',
    });
    render(<Harness />);
    await waitFor(() =>
      expect(screen.getByLabelText('Egzersiz özeti')).toHaveTextContent('35'),
    );
    expect(mocks.drillOverview).toHaveBeenCalledExactlyOnceWith('g');
    expect(screen.queryByText('only-card')).not.toBeInTheDocument();
  });

  it('keeps drill loading/failure distinct from zero and retries without refreshing other resources', async () => {
    let reject!: (error: Error) => void;
    mocks.drillOverview.mockImplementationOnce(
      () =>
        new Promise((_done, fail) => {
          reject = fail;
        }),
    );
    render(<Harness />);
    await screen.findByRole('heading', { name: 'Recent' });
    expect(
      screen.getByRole('status', { name: 'Egzersiz özeti yükleniyor' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Egzersiz özeti')).toHaveTextContent('—');
    await act(async () => reject(new Error('Egzersiz alınamadı')));
    expect(
      screen.getByRole('alert', { name: 'Egzersiz özeti hatası' }),
    ).toHaveTextContent('Egzersiz alınamadı');
    expect(screen.getByLabelText('Egzersiz özeti')).toHaveTextContent('—');
    expect(screen.getByRole('heading', { name: 'Recent' })).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Egzersizleri tekrar dene' }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Egzersiz özeti')).toHaveTextContent('0'),
    );
    expect(mocks.overview).toHaveBeenCalledTimes(1);
    expect(mocks.reload).not.toHaveBeenCalled();
  });

  it('discards drill totals from an old team and refreshes on season scope changes', async () => {
    let resolve!: (value: { total: number }) => void;
    mocks.drillOverview.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.drillOverview).toHaveBeenCalledTimes(1));
    mocks.workspace.group = { id: 'other', name: 'U19' };
    mocks.workspace.scope.teamId = 'other-team';
    view.rerender(<Harness />);
    expect(screen.getByLabelText('Egzersiz özeti')).toHaveTextContent('—');
    await waitFor(() =>
      expect(screen.getByLabelText('Egzersiz özeti')).toHaveTextContent('0'),
    );
    await act(async () => resolve({ total: 999 }));
    expect(screen.queryByText('999')).not.toBeInTheDocument();
    expect(mocks.drillOverview).toHaveBeenLastCalledWith('other');
    mocks.workspace.season = undefined;
    mocks.workspace.scope.clubSeasonId = '*';
    view.rerender(<Harness />);
    expect(screen.getByLabelText('Egzersiz özeti')).toHaveTextContent('—');
    await waitFor(() => expect(mocks.drillOverview).toHaveBeenCalledTimes(3));
    expect(mocks.drillOverview).toHaveBeenLastCalledWith('other');
  });
});
