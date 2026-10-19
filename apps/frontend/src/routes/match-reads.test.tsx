import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MatchDetailRoute from './match-detail';
import { MatchNotifications } from '../components/match-notifications';
import { setSession } from '../lib/session';

const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  total: vi.fn(),
  update: vi.fn(),
  board: vi.fn(),
  info: vi.fn(),
  errorToast: vi.fn(),
  matchId: 'm',
  workspace: {
    group: { id: 'g' } as { id: string } | undefined,
    season: { id: 's' } as { id: string } | undefined,
    scope: { clubId: 'c', teamId: 't', clubSeasonId: 'cs' },
    loading: false,
    error: '',
    reload: vi.fn(),
  },
}));
vi.mock('react-router', async (original) => ({
  ...(await original<typeof import('react-router')>()),
  useParams: () => ({ matchId: mocks.matchId }),
}));
vi.mock('../lib/api', () => ({
  getMatchMetadata: mocks.detail,
  getMatchTotal: mocks.total,
  updateMatch: mocks.update,
  updateMatchTacticalBoard: mocks.board,
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    get matches() {
      throw new Error('Shared matches forbidden');
    },
  }),
}));
vi.mock('sonner', () => ({
  toast: { info: mocks.info, error: mocks.errorToast, success: vi.fn() },
}));
vi.mock('../components/tactics/tactical-board-editor', () => ({
  TacticalBoardEditor: () => <div>Board editor</div>,
}));
const match = {
  id: 'm',
  opponent: 'Opponent',
  date: '2026-09-01T12:00:00Z',
  location: 'Home',
  competition: 'Test League',
  notes: 'Original',
  ourFormation: '4-4-2',
  opponentAnalysis: 'Legacy analysis',
  tacticalBoard: null,
};
const detail = () => (
  <MemoryRouter>
    <MatchDetailRoute />
  </MemoryRouter>
);
describe('independent match detail and shell count', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setSession({
      token: 'synthetic',
      user: {
        id: 'coach',
        name: 'Coach',
        email: 'coach@example.test',
        role: 'COACH',
        clubId: 'c',
      },
    });
    mocks.matchId = 'm';
    mocks.workspace = {
      group: { id: 'g' },
      season: { id: 's' },
      scope: { clubId: 'c', teamId: 't', clubSeasonId: 'cs' },
      loading: false,
      error: '',
      reload: vi.fn(),
    };
    mocks.detail.mockResolvedValue(match);
    mocks.total.mockResolvedValue(130);
    mocks.update.mockResolvedValue(match);
  });
  it('reads one scoped detail and preserves legacy analysis and explicit writes', async () => {
    render(detail());
    await screen.findByRole('heading', { name: 'Opponent', level: 1 });
    expect(mocks.detail).toHaveBeenCalledWith('m', 'g', 's');
    expect(screen.getByLabelText('Rakip analizi')).toHaveValue(
      'Legacy analysis',
    );
    fireEvent.change(screen.getByLabelText('Koç notu'), {
      target: { value: 'Draft' },
    });
    expect(mocks.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Analizi kaydet' }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith(
        'm',
        expect.objectContaining({ notes: 'Draft' }),
      ),
    );
  });
  it('renders the approved match-detail hierarchy from real match fields', async () => {
    render(detail());
    await screen.findByRole('heading', { name: 'Opponent', level: 1 });
    expect(
      screen.getByRole('region', { name: 'Maç hazırlığı özeti' }),
    ).toHaveTextContent('Test League');
    expect(screen.getByText('Hazırlık ve taktik planı')).toBeInTheDocument();
    expect(screen.getByText('Maç Özeti')).toBeInTheDocument();
    expect(screen.getByText('Manuel kayıt')).toBeInTheDocument();
    expect(
      document.querySelector('.match-detail-reference__hero'),
    ).toBeTruthy();
    expect(
      screen.getByRole('tab', { name: 'Taktik tahtası' }),
    ).toBeInTheDocument();
  });
  it('shows read failure and retries only the detail', async () => {
    mocks.detail.mockRejectedValueOnce(new Error('Not in selected scope'));
    render(detail());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Not in selected scope',
    );
    expect(screen.queryByLabelText('Koç notu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Maçı tekrar yükle' }));
    await screen.findByRole('heading', { name: 'Opponent', level: 1 });
    expect(mocks.workspace.reload).not.toHaveBeenCalled();
  });
  it('discards a late old detail on route/scope change and does not widen missing season', async () => {
    let resolve!: (value: unknown) => void;
    mocks.detail.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(detail());
    await waitFor(() => expect(mocks.detail).toHaveBeenCalledTimes(1));
    mocks.matchId = 'm2';
    mocks.workspace.scope.teamId = 't2';
    mocks.detail.mockResolvedValue({ ...match, id: 'm2', opponent: 'New' });
    view.rerender(detail());
    await screen.findByRole('heading', { name: 'New', level: 1 });
    await act(async () => resolve(match));
    expect(
      screen.queryByRole('heading', { name: 'Opponent' }),
    ).not.toBeInTheDocument();
    mocks.workspace.season = undefined;
    view.rerender(detail());
    expect(
      screen.getByText('Bu takım ve sezon için maç bağlamı bulunmuyor.'),
    ).toBeInTheDocument();
    expect(mocks.detail).toHaveBeenCalledTimes(2);
    mocks.workspace.scope.clubSeasonId = '*';
    view.rerender(detail());
    await waitFor(() =>
      expect(mocks.detail).toHaveBeenLastCalledWith('m2', 'g', undefined),
    );
  });
  it('uses full count, not page length, with independent error retry', async () => {
    mocks.total.mockRejectedValueOnce(new Error('Offline'));
    render(<MatchNotifications />);
    const button = screen.getByRole('button', { name: 'Bildirimler' });
    await waitFor(() => expect(button).toHaveTextContent('!'));
    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveTextContent('130'));
    fireEvent.click(button);
    expect(mocks.info).toHaveBeenCalledWith('130 maç çalışma alanında hazır.');
    expect(mocks.workspace.reload).not.toHaveBeenCalled();
  });
  it('clears old count during scope changes and keeps zero distinct from loading', async () => {
    let resolve!: (value: number) => void;
    mocks.total.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<MatchNotifications />);
    await waitFor(() => expect(mocks.total).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Bildirimler' })).toBeDisabled();
    mocks.workspace.scope.teamId = 't2';
    mocks.total.mockResolvedValue(0);
    view.rerender(<MatchNotifications />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Bildirimler' })).toBeEnabled(),
    );
    await act(async () => resolve(130));
    expect(screen.queryByText('130')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bildirimler' }));
    expect(mocks.info).toHaveBeenCalledWith('Yeni bildiriminiz yok.');
  });
  it('does not request count or detail without resolved workspace scope', () => {
    mocks.workspace.season = undefined;
    render(
      <MemoryRouter>
        <MatchDetailRoute />
        <MatchNotifications />
      </MemoryRouter>,
    );
    expect(mocks.total).not.toHaveBeenCalled();
    expect(mocks.detail).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Bildirimler' })).toBeDisabled();
  });
});
