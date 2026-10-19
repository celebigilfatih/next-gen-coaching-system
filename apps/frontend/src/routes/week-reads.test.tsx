import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WeekRoute from './week';
import { addDays, toLocalDateKey } from '../lib/week';

const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  matches: vi.fn(),
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
  getTrainingDayPage: mocks.page,
  getMatchDayPage: mocks.matches,
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    get matches() {
      throw new Error('Week must not read shared matches');
    },
    get plans() {
      throw new Error('Week must not read shared plans');
    },
  }),
}));
const page = (title: string, after?: string) => ({
  items: [
    {
      id: title,
      title,
      date: new Date(2026, 8, 1, 12).toISOString(),
      totalDuration: 60,
    },
  ],
  nextCursor: after ?? null,
  summary: { total: 30, totalDuration: 1800 },
});
const empty = {
  items: [],
  nextCursor: null,
  summary: { total: 0, totalDuration: 0 },
};
function Location() {
  return <output aria-label="URL">{useLocation().search}</output>;
}
function Harness() {
  return (
    <MemoryRouter initialEntries={['/app/week?start=2026-08-31&ngcsTeam=t']}>
      <WeekRoute />
      <Location />
    </MemoryRouter>
  );
}
describe('bounded daily training reads', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.workspace = {
      group: { id: 'g', name: 'U17' },
      season: { id: 's', name: 'Season' },
      scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
      loading: false,
      error: '',
    };
    mocks.page.mockImplementation(async (_g, _s, from, _until, after) =>
      toLocalDateKey(new Date(from)) === '2026-09-01'
        ? page(after ? 'Second' : 'First', after ? undefined : 'cursor')
        : empty,
    );
    mocks.matches.mockImplementation(async (_g, _s, from) =>
      toLocalDateKey(new Date(from)) === '2026-09-01'
        ? {
            items: [
              {
                id: 'm',
                opponent: 'Match',
                date: new Date(2026, 8, 1, 12).toISOString(),
                location: 'Home',
              },
            ],
            total: 1,
            nextCursor: null,
          }
        : { items: [], total: 0, nextCursor: null },
    );
  });
  it('renders the approved weekly planning surface without fabricated aggregates', async () => {
    const { container } = render(<Harness />);
    expect(
      screen.getByRole('heading', { name: 'Haftalık Plan', level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Hafta görünümü kontrolleri' }),
    ).toHaveTextContent('Pazartesi – Pazar');
    expect(container.querySelector('.week-reference__hero img')).not.toBeNull();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(7);
    expect(
      screen.queryByText(/sakat|performans yüzdesi/i),
    ).not.toBeInTheDocument();
  });
  it('requests seven local half-open days and pages only the selected day without changing its full totals or matches', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(mocks.page).toHaveBeenCalledTimes(7);
    const start = new Date(2026, 7, 31);
    for (let i = 0; i < 7; i++)
      expect(mocks.page).toHaveBeenCalledWith(
        'g',
        's',
        addDays(start, i).toISOString(),
        addDays(start, i + 1).toISOString(),
        undefined,
      );
    const day = within(
      screen.getByRole('region', { name: '2026-09-01 antrenmanları' }),
    );
    expect(day.getByText('30 plan · 1800 dk')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Match/ })).toBeInTheDocument();
    fireEvent.click(day.getByRole('button', { name: 'Sonraki sayfa' }));
    await day.findByText('Second');
    expect(day.queryByText('First')).not.toBeInTheDocument();
    expect(mocks.page).toHaveBeenCalledTimes(8);
    expect(day.getByText('30 plan · 1800 dk')).toBeInTheDocument();
    fireEvent.click(day.getByRole('button', { name: 'Önceki sayfa' }));
    await day.findByText('First');
  });
  it('keeps a failed continuation distinct from an empty day and retries the same cursor', async () => {
    render(<Harness />);
    await screen.findByText('First');
    mocks.page.mockRejectedValueOnce(new Error('Day failed'));
    const day = within(
      screen.getByRole('region', { name: '2026-09-01 antrenmanları' }),
    );
    fireEvent.click(day.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(await day.findByRole('alert')).toHaveTextContent('Day failed');
    expect(day.queryByText('Planlanmış etkinlik yok')).not.toBeInTheDocument();
    expect(day.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    fireEvent.click(day.getByRole('button', { name: 'Tekrar dene' }));
    await day.findByText('Second');
    expect(mocks.page.mock.lastCall?.[4]).toBe('cursor');
  });
  it('resets on week/scope changes, preserves URL context and ignores late old-day responses', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    mocks.page.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(7));
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki hafta' }));
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(14));
    expect(screen.getByLabelText('URL')).toHaveTextContent(
      'start=2026-09-07&ngcsTeam=t',
    );
    await act(async () => resolve(page('Stale')));
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    mocks.workspace.season = undefined;
    mocks.workspace.scope.clubSeasonId = '*';
    view.rerender(<Harness />);
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(21));
    expect(mocks.page.mock.lastCall?.[1]).toBeUndefined();
  });
  it('does not request during loading/error or for a native team and links undated drafts to the catalog', async () => {
    mocks.workspace.loading = true;
    const view = render(<Harness />);
    mocks.workspace.loading = false;
    mocks.workspace.error = 'Workspace failed';
    view.rerender(<Harness />);
    expect(screen.getByText('Workspace failed')).toBeInTheDocument();
    mocks.workspace.error = '';
    mocks.workspace.group = null;
    view.rerender(<Harness />);
    expect(
      screen.getByText('Bu takım için antrenman bağlamı bulunmuyor.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Tarihsiz taslakları gör' }),
    ).toHaveAttribute('href', '/app/trainings');
    expect(mocks.page).not.toHaveBeenCalled();
    expect(mocks.matches).not.toHaveBeenCalled();
  });
  it('pages matches independently with full day totals and preserved training cards', async () => {
    mocks.matches.mockImplementation(async (_g, _s, from, _until, after) =>
      toLocalDateKey(new Date(from)) === '2026-09-01'
        ? {
            items: [
              {
                id: after ? 'm2' : 'm1',
                opponent: after ? 'Second match' : 'First match',
                date: new Date(2026, 8, 1, 12).toISOString(),
                location: 'Home',
              },
            ],
            total: 30,
            nextCursor: after ? null : 'matches-next',
          }
        : { items: [], total: 0, nextCursor: null },
    );
    render(<Harness />);
    await screen.findByText('First match');
    expect(mocks.matches).toHaveBeenCalledTimes(7);
    const start = new Date(2026, 7, 31);
    for (let i = 0; i < 7; i++)
      expect(mocks.matches).toHaveBeenCalledWith(
        'g',
        's',
        addDays(start, i).toISOString(),
        addDays(start, i + 1).toISOString(),
        undefined,
      );
    const day = within(
      screen.getByRole('region', { name: '2026-09-01 maçları' }),
    );
    expect(day.getByText('30 maç')).toBeInTheDocument();
    fireEvent.click(day.getByRole('button', { name: 'Sonraki maçlar' }));
    await day.findByText('Second match');
    expect(day.queryByText('First match')).not.toBeInTheDocument();
    expect(day.getByRole('link')).toHaveAttribute('href', '/app/matches/m2');
    expect(day.getByRole('navigation')).toHaveTextContent('Sayfa 2 · 1 / 30');
    expect(mocks.page).toHaveBeenCalledTimes(7);
    expect(screen.getByText('First')).toBeInTheDocument();
    mocks.matches.mockResolvedValueOnce({
      items: [],
      total: 30,
      nextCursor: null,
    });
    fireEvent.click(day.getByRole('button', { name: 'Önceki maçlar' }));
    await waitFor(() =>
      expect(day.queryByText('Second match')).not.toBeInTheDocument(),
    );
  });

  it('never declares an empty day while match reads load or fail, and retries independently', async () => {
    mocks.page.mockResolvedValue(empty);
    let reject!: (error: Error) => void;
    mocks.matches.mockImplementationOnce(
      () =>
        new Promise((_done, fail) => {
          reject = fail;
        }),
    );
    render(<Harness />);
    await waitFor(() => expect(mocks.matches).toHaveBeenCalledTimes(7));
    const training = within(
      screen.getByRole('region', { name: '2026-08-31 antrenmanları' }),
    );
    const match = within(
      screen.getByRole('region', { name: '2026-08-31 maçları' }),
    );
    expect(
      training.queryByText('Planlanmış etkinlik yok'),
    ).not.toBeInTheDocument();
    await act(async () => reject(new Error('Matches failed')));
    expect(match.getByRole('alert')).toHaveTextContent('Matches failed');
    expect(
      training.queryByText('Planlanmış etkinlik yok'),
    ).not.toBeInTheDocument();
    fireEvent.click(match.getByRole('button', { name: 'Maçları tekrar dene' }));
    await training.findByText('Planlanmış etkinlik yok');
    expect(mocks.page).toHaveBeenCalledTimes(7);
  });

  it('resets match pages on week/scope changes and rejects late responses', async () => {
    let resolve!: (value: unknown) => void;
    mocks.matches.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.matches).toHaveBeenCalledTimes(7));
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki hafta' }));
    await waitFor(() => expect(mocks.matches).toHaveBeenCalledTimes(14));
    await act(async () =>
      resolve({ items: [{ id: 'stale', opponent: 'Stale match' }], total: 1 }),
    );
    expect(screen.queryByText('Stale match')).not.toBeInTheDocument();
    mocks.workspace.group = { id: 'g2', name: 'U19' };
    mocks.workspace.scope.teamId = 't2';
    mocks.workspace.scope.clubSeasonId = '*';
    mocks.workspace.season = undefined;
    view.rerender(<Harness />);
    await waitFor(() => expect(mocks.matches).toHaveBeenCalledTimes(21));
    expect(mocks.matches.mock.lastCall?.slice(0, 2)).toEqual(['g2', undefined]);
  });

  it('does not widen missing season context or hide training records', async () => {
    mocks.workspace.season = undefined;
    render(<Harness />);
    await screen.findByText('First');
    expect(
      screen.getAllByText('Bu sezon için maç bağlamı bulunmuyor.'),
    ).toHaveLength(7);
    expect(mocks.matches).not.toHaveBeenCalled();
    expect(
      screen.queryByText('Planlanmış etkinlik yok'),
    ).not.toBeInTheDocument();
  });

  it('uses local midnight boundaries across a daylight-saving transition', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.change(screen.getByLabelText('Hafta seç'), {
      target: { value: '2026-03-08' },
    });
    await waitFor(() => expect(mocks.matches).toHaveBeenCalledTimes(14));
    const from = new Date(2026, 2, 8);
    const until = new Date(2026, 2, 9);
    expect(mocks.matches).toHaveBeenCalledWith(
      'g',
      's',
      from.toISOString(),
      until.toISOString(),
      undefined,
    );
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/New_York')
      expect(until.getTime() - from.getTime()).toBe(23 * 3600000);
  });

  it('handles year changes and ignores a cleared date input', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.change(screen.getByLabelText('Hafta seç'), {
      target: { value: '2026-12-31' },
    });
    expect(screen.getByLabelText('Hafta seç')).toHaveValue('2026-12-28');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki hafta' }));
    expect(screen.getByLabelText('Hafta seç')).toHaveValue('2027-01-04');
    fireEvent.change(screen.getByLabelText('Hafta seç'), {
      target: { value: '' },
    });
    expect(screen.getByLabelText('Hafta seç')).toHaveValue('2027-01-04');
    fireEvent.click(screen.getByRole('button', { name: 'Bugün' }));
    expect(screen.getByLabelText('Hafta seç')).not.toHaveValue('2027-01-04');
  });
});
