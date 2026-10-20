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
import { clearSession, setSession } from '../lib/session';
import type { PlanningPage } from '../lib/planning';
const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  workspace: {
    group: { id: 'g', name: 'U16' } as { id: string; name: string } | null,
    season: { id: 's', name: 'Season' } as
      | { id: string; name: string }
      | undefined,
    scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({ getPlanningPage: mocks.page }));
vi.mock('../components/week-planning-dialogs', () => ({
  WeekProgramDialog: () => null,
  WeekEventDialog: () => null,
  WeekDeleteDialog: () => null,
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    get matches() {
      throw new Error('No shared matches');
    },
    get plans() {
      throw new Error('No shared plans');
    },
  }),
}));
const empty: PlanningPage = {
  items: [],
  limit: 25,
  nextCursor: null,
  summary: {
    total: 0,
    trainingCount: 0,
    trainingMinutes: 0,
    meetingCount: 0,
    matchCount: 0,
  },
};
function page(next = false): PlanningPage {
  return {
    ...empty,
    nextCursor: next ? null : 'cursor',
    summary: {
      total: 32,
      trainingCount: 30,
      trainingMinutes: 1800,
      meetingCount: 1,
      matchCount: 1,
    },
    items: next
      ? [
          {
            id: 'second',
            source: 'plan',
            kind: 'TRAINING',
            title: 'Second',
            date: new Date(2026, 8, 1, 16).toISOString(),
            duration: 60,
            notes: null,
            location: null,
            topic: null,
            completed: false,
          },
        ]
      : [
          {
            id: 'first',
            source: 'plan',
            kind: 'TRAINING',
            title: 'First',
            date: new Date(2026, 8, 1, 10).toISOString(),
            duration: 60,
            notes: null,
            location: null,
            topic: null,
            completed: false,
          },
          {
            id: 'meeting',
            source: 'event',
            kind: 'TOPLANTI',
            title: 'Maç toplantısı',
            date: new Date(2026, 8, 1, 12).toISOString(),
            duration: 25,
            notes: 'Örnek',
            location: 'Toplantı alanı',
            topic: 'Oyun planı',
            completed: false,
          },
          {
            id: 'match',
            source: 'match',
            kind: 'MATCH',
            title: 'Match',
            date: new Date(2026, 8, 1, 16).toISOString(),
            duration: 0,
            notes: null,
            location: 'Home',
            topic: null,
            completed: false,
          },
        ],
  };
}
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
describe('unified bounded daily calendar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearSession();
    mocks.workspace = {
      group: { id: 'g', name: 'U16' },
      season: { id: 's', name: 'Season' },
      scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
      loading: false,
      error: '',
    };
    mocks.page.mockImplementation(async (_g, _s, from, _until, after) =>
      toLocalDateKey(new Date(from)) === '2026-09-01' ? page(!!after) : empty,
    );
  });
  it('renders seven days, chronological mixed records and real full summaries', async () => {
    const { container } = render(<Harness />);
    await screen.findByText('First');
    expect(
      screen.getByRole('heading', { name: 'Haftalık Plan' }),
    ).toBeInTheDocument();
    expect(container.querySelector('.week-reference__hero img')).not.toBeNull();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(7);
    const day = within(
      screen.getByRole('region', { name: '2026-09-01 etkinlikleri' }),
    );
    expect(
      day.getByText('30 antrenman · 1800 dk · 1 toplantı · 1 maç'),
    ).toBeInTheDocument();
    expect(day.getByText('Oyun planı')).toBeInTheDocument();
    expect(day.getByRole('link', { name: /Match/ })).toHaveAttribute(
      'href',
      '/app/matches/match',
    );
    expect(screen.queryByText(/sağlık skoru/i)).not.toBeInTheDocument();
  });
  it('requests seven half-open local days and pages one day with stable full totals', async () => {
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
      screen.getByRole('region', { name: '2026-09-01 etkinlikleri' }),
    );
    fireEvent.click(day.getByRole('button', { name: 'Sonraki' }));
    await day.findByText('Second');
    expect(day.queryByText('First')).not.toBeInTheDocument();
    expect(day.getByText(/1800 dk/)).toBeInTheDocument();
    expect(mocks.page).toHaveBeenCalledTimes(8);
    fireEvent.click(day.getByRole('button', { name: 'Önceki' }));
    await day.findByText('First');
  });
  it('retains failed cursor and retries without claiming the day is empty', async () => {
    render(<Harness />);
    await screen.findByText('First');
    mocks.page.mockRejectedValueOnce(new Error('Day failed'));
    const day = within(
      screen.getByRole('region', { name: '2026-09-01 etkinlikleri' }),
    );
    fireEvent.click(day.getByRole('button', { name: 'Sonraki' }));
    expect(await day.findByRole('alert')).toHaveTextContent('Day failed');
    expect(day.queryByText('Planlanmış etkinlik yok')).not.toBeInTheDocument();
    fireEvent.click(day.getByRole('button', { name: 'Tekrar dene' }));
    await day.findByText('Second');
    expect(mocks.page.mock.lastCall?.[4]).toBe('cursor');
  });
  it('resets week and scope, preserves URL and rejects late old responses', async () => {
    let resolve!: (v: PlanningPage) => void;
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
    await act(async () =>
      resolve({ ...page(), items: [{ ...page().items[0], title: 'Stale' }] }),
    );
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    mocks.workspace.season = undefined;
    mocks.workspace.scope.clubSeasonId = '*';
    view.rerender(<Harness />);
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(21));
    expect(mocks.page.mock.lastCall?.[1]).toBeUndefined();
  });
  it('does not widen unresolved season scope or load while context is missing', async () => {
    mocks.workspace.loading = true;
    const view = render(<Harness />);
    mocks.workspace.loading = false;
    mocks.workspace.error = 'Workspace failed';
    view.rerender(<Harness />);
    expect(screen.getByText('Workspace failed')).toBeInTheDocument();
    mocks.workspace.error = '';
    mocks.workspace.season = undefined;
    view.rerender(<Harness />);
    expect(
      screen.getByText('Seçili sezon için takvim bağlamı bulunmuyor.'),
    ).toBeInTheDocument();
    mocks.workspace.group = null;
    view.rerender(<Harness />);
    expect(
      screen.getByText('Bu takım için antrenman bağlamı bulunmuyor.'),
    ).toBeInTheDocument();
    expect(mocks.page).not.toHaveBeenCalled();
    expect(
      screen.getByRole('link', { name: 'Tarihsiz taslakları gör' }),
    ).toHaveAttribute('href', '/app/trainings');
  });
  it('only exposes management controls to supported management roles', async () => {
    setSession({
      token: 'test',
      user: {
        id: 'admin',
        name: 'Admin',
        email: 'test@example.test',
        role: 'SYSTEM_ADMIN',
        clubId: null,
      },
    });
    const view = render(<Harness />);
    await screen.findByText('First');
    expect(screen.getByRole('button', { name: 'Etkinlik ekle' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'First düzenle' }),
    ).toBeInTheDocument();
    act(() =>
      setSession({
        token: 'test',
        user: {
          id: 'player',
          name: 'Player',
          email: 'player@example.test',
          role: 'PLAYER',
          clubId: 'c',
        },
      }),
    );
    view.rerender(<Harness />);
    expect(
      screen.queryByRole('button', { name: 'Etkinlik ekle' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'First düzenle' }),
    ).not.toBeInTheDocument();
  });
  it('handles local midnight, year transitions and cleared date inputs', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.change(screen.getByLabelText('Hafta seç'), {
      target: { value: '2026-03-08' },
    });
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(14));
    expect(mocks.page).toHaveBeenCalledWith(
      'g',
      's',
      new Date(2026, 2, 8).toISOString(),
      new Date(2026, 2, 9).toISOString(),
      undefined,
    );
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
  });
});
