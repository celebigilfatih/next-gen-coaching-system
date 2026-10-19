import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MatchesRoute from './matches';

const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  day: vi.fn(),
  reload: vi.fn(),
  workspace: {
    group: { id: 'g', name: 'U17' } as { id: string; name: string } | null,
    season: { id: 's' } as { id: string } | null,
    scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({
  getMatchPage: mocks.page,
  getMatchDayPage: mocks.day,
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    reload: mocks.reload,
    get matches() {
      throw new Error('Shared match array must not be read');
    },
  }),
}));
function page(name = 'First', nextCursor: string | null = 'next') {
  return {
    items: [
      {
        id: name,
        opponent: name,
        date: '2026-09-01T12:00:00Z',
        seasonId: 's',
        location: 'HOME',
        competition: 'League',
        result: name === 'First' ? '2 - 1' : null,
        notes: 'Coach note',
        ourFormation: '4-3-3',
        hasBoard: name === 'First',
      },
    ],
    total: 31,
    nextCursor,
    limit: 25,
  };
}
function Harness() {
  return (
    <MemoryRouter>
      <MatchesRoute />
    </MemoryRouter>
  );
}
describe('independent match catalog', () => {
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
      page(after ? 'Second' : 'First', after ? null : 'next'),
    );
    mocks.day.mockResolvedValue(page('Filtered', null));
  });
  it('renders the reference hierarchy and preserves match fields, totals and detail links across pages', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(
      screen.getByRole('heading', { name: 'Maç Takvimi', level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Kapsamdaki Maçlar', level: 2 }),
    ).toBeInTheDocument();
    expect(mocks.page).toHaveBeenLastCalledWith('g', 's', undefined);
    expect(screen.getByLabelText('Maç kapsamı özeti')).toHaveTextContent(
      '31 maç',
    );
    expect(
      screen.getByRole('link', { name: 'First maç detayını aç' }),
    ).toHaveAttribute('href', '/app/matches/First');
    expect(screen.getByText('Tahta hazır')).toBeInTheDocument();
    expect(screen.getByText('Coach note')).toBeInTheDocument();
    expect(screen.getByText('2 - 1')).toBeInTheDocument();
    expect(screen.getByText('İç saha')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByText('Tahta yok')).toBeInTheDocument();
    expect(mocks.page).toHaveBeenLastCalledWith('g', 's', 'next');
    expect(screen.getByRole('navigation')).toHaveTextContent(
      'Sayfa 2 · 1 / 31',
    );
    expect(
      screen.getByRole('button', { name: 'Sonraki sayfa' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('First');
  });
  it('filters through local half-open day bounds and clears back to the full catalog', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.change(screen.getByLabelText('Maç tarihi'), {
      target: { value: '2026-09-01' },
    });
    await screen.findByText('Filtered');
    const from = new Date(2026, 8, 1);
    const until = new Date(2026, 8, 2);
    expect(mocks.day).toHaveBeenLastCalledWith(
      'g',
      's',
      from.toISOString(),
      until.toISOString(),
      undefined,
    );
    expect(
      screen.getByRole('heading', { name: 'Seçili Günün Maçları' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tüm maçları göster' }));
    await screen.findByText('First');
    expect(mocks.page).toHaveBeenLastCalledWith('g', 's', undefined);
    expect(screen.getByLabelText('Maç tarihi')).toHaveValue('');
  });
  it('resets on team/season changes and discards stale responses', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    mocks.page.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(1));
    mocks.workspace.group = { id: 'g2', name: 'U19' };
    mocks.workspace.scope.teamId = 't2';
    view.rerender(<Harness />);
    await screen.findByText('First');
    await act(async () => resolve(page('Stale')));
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    mocks.workspace.scope.clubSeasonId = '*';
    mocks.workspace.season = null;
    view.rerender(<Harness />);
    expect(screen.queryByText('Second')).not.toBeInTheDocument();
    await screen.findByText('First');
    expect(mocks.page).toHaveBeenLastCalledWith('g2', undefined, undefined);
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
  });
  it('distinguishes loading and failed continuation, retrying only its own read', async () => {
    render(<Harness />);
    expect(screen.getByLabelText('Maçlar yükleniyor')).toBeInTheDocument();
    await screen.findByText('First');
    mocks.page.mockRejectedValueOnce(new Error('Read failed'));
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Read failed');
    expect(screen.queryByText('Planlanmış maç yok')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Second');
    expect(mocks.reload).not.toHaveBeenCalled();
  });
  it('never broadens a missing selected season to all seasons or fetches failed/loading context', () => {
    mocks.workspace.loading = true;
    const view = render(<Harness />);
    expect(screen.getByLabelText('Maç kapsamı yükleniyor')).toBeInTheDocument();
    mocks.workspace.loading = false;
    mocks.workspace.error = 'Workspace failed';
    view.rerender(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    expect(mocks.reload).toHaveBeenCalledOnce();
    mocks.workspace.error = '';
    mocks.workspace.season = null;
    view.rerender(<Harness />);
    expect(
      screen.getByRole('heading', { name: 'Maç bağlamı bulunmuyor' }),
    ).toBeInTheDocument();
    mocks.workspace.scope.clubSeasonId = '*';
    mocks.workspace.group = null;
    view.rerender(<Harness />);
    expect(mocks.page).not.toHaveBeenCalled();
  });
  it('distinguishes an empty continuation from zero matches and permits returning', async () => {
    render(<Harness />);
    await screen.findByText('First');
    mocks.page.mockResolvedValueOnce({
      ...page(),
      items: [],
      nextCursor: null,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText(/Bu sayfada maç yok/);
    expect(screen.getByLabelText('Maç kapsamı özeti')).toHaveTextContent('31');
    mocks.page.mockResolvedValueOnce({
      ...page(),
      items: [],
      nextCursor: null,
      total: 0,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('Planlanmış maç yok');
    expect(screen.getByLabelText('Maç kapsamı özeti')).toHaveTextContent(
      '0 maç',
    );
  });
});
