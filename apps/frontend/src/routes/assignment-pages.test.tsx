import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamDetailRoute from './team-detail';
import PlayerDetailRoute from './player-detail';

const api = vi.hoisted(() => ({
  getSportingRosterPage: vi.fn(),
  getSportingPlayer360Page: vi.fn(),
  createSportingAssignment: vi.fn(),
  listSportingRoles: vi.fn(),
  listSportingTeams: vi.fn(),
  transitionSportingPrimary: vi.fn(),
  getPlayerActivityPage: vi.fn(),
}));
vi.mock('../lib/api', () => api);
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { role: 'PLAYER' } }),
}));
const assignment = (id: string) => ({
  id,
  validFrom: '2026-01-01T00:00:00Z',
  validTo: '2026-02-01T00:00:00Z',
  assignmentType: 'TRAINING_GUEST',
  reason: null,
  source: 'TEST',
  team: { name: id },
  roleDefinition: { name: 'Player' },
  person: { id, displayName: id, playerProfile: {}, staffProfile: null },
});
const roster = (id: string, nextCursor: string | null = null) => ({
  team: { name: 'U17', categoryLabel: 'Altyapı' },
  assignments: [assignment(id)],
  page: {
    total: 100,
    playerAssignments: 90,
    staffAssignments: 10,
    limit: 25,
    nextCursor,
  },
});
const player = (id: string, nextCursor: string | null = null) => ({
  id: 'p',
  clubId: 'club',
  displayName: 'Arda',
  birthDate: null,
  playerProfile: {},
  account: null,
  asOf: '2026-09-06T12:00:00Z',
  assignments: [assignment(id)],
  evidence: { attendance: {} },
  assignmentPage: {
    total: 120,
    activeCount: 33,
    historyVisible: true,
    limit: 25,
    nextCursor,
  },
});
function Jump() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/app/teams/t?asOf=2026-08-01')}>
      Başka tarih
    </button>
  );
}
function setup(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Jump />
      <Routes>
        <Route path="/app/teams/:teamId" element={<TeamDetailRoute />} />
        <Route path="/app/players/:personId" element={<PlayerDetailRoute />} />
      </Routes>
    </MemoryRouter>,
  );
}
describe('dated assignment pages', () => {
  it('does not call an empty continuation a missing history', async () => {
    api.getSportingPlayer360Page
      .mockResolvedValueOnce(player('First', 'next'))
      .mockResolvedValueOnce({ ...player('unused'), assignments: [] })
      .mockResolvedValueOnce(player('First', 'next'));
    setup('/app/players/p?tab=journey');
    await screen.findByText('First');
    fireEvent.click(screen.getByText('Sonraki sayfa'));
    await screen.findByText('Bu sayfada atama bulunmuyor');
    expect(
      screen.queryByText('Atama geçmişi bulunmuyor'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/0 \/ 120 atama/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Önceki sayfa'));
    await screen.findByText('First');
  });
  beforeEach(() => {
    vi.clearAllMocks();
    api.getPlayerActivityPage.mockResolvedValue({
      items: [],
      nextCursor: null,
      limit: 20,
    });
  });
  it('keeps full roster counts independent of the current page and resets on date change', async () => {
    api.getSportingRosterPage
      .mockResolvedValueOnce(roster('First', 'cursor'))
      .mockResolvedValueOnce(roster('Second'))
      .mockResolvedValueOnce(roster('Dated'));
    setup('/app/teams/t?asOf=2026-09-06&teamSeasonId=ts');
    await screen.findByText('First');
    expect(
      screen.getByText(/90 oyuncu ataması · 10 teknik ekip ataması/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    expect(api.getSportingRosterPage).toHaveBeenLastCalledWith('t', {
      asOf: '2026-09-06T12:00:00.000Z',
      teamSeasonId: 'ts',
      after: 'cursor',
    });
    expect(screen.getByText(/1 \/ 100 atama/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Kadro tarihi'), {
      target: { value: '2026-08-01' },
    });
    await screen.findByText('Dated');
    expect(api.getSportingRosterPage).toHaveBeenLastCalledWith('t', {
      asOf: '2026-08-01T12:00:00.000Z',
      teamSeasonId: 'ts',
      after: undefined,
    });
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
  });
  it('ignores a pending response from the previous date', async () => {
    let resolve!: (value: ReturnType<typeof roster>) => void;
    api.getSportingRosterPage
      .mockReturnValueOnce(
        new Promise((r) => {
          resolve = r;
        }),
      )
      .mockResolvedValueOnce(roster('New date'));
    setup('/app/teams/t?asOf=2026-09-06');
    await waitFor(() =>
      expect(api.getSportingRosterPage).toHaveBeenCalledOnce(),
    );
    fireEvent.click(screen.getByText('Başka tarih'));
    await screen.findByText('New date');
    await act(async () => resolve(roster('Old date')));
    expect(screen.queryByText('Old date')).not.toBeInTheDocument();
  });
  it('shows an error instead of stale/empty roster data and retries', async () => {
    api.getSportingRosterPage
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(roster('Recovered'));
    setup('/app/teams/t');
    await screen.findByText('Network unavailable');
    expect(screen.queryByText('Bu sayfada atama yok')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Tekrar dene'));
    await screen.findByText('Recovered');
  });
  it('uses the full active count when a history page contains only ended assignments', async () => {
    api.getSportingPlayer360Page
      .mockResolvedValueOnce(player('History A', 'next'))
      .mockResolvedValueOnce(player('History B'))
      .mockResolvedValueOnce(player('History A', 'next'));
    setup('/app/players/p?tab=journey&asOf=2026-09-06');
    await screen.findByText('History A');
    expect(
      document.querySelector('.player-profile-header'),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 120 atama/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sonraki sayfa'));
    await screen.findByText('History B');
    expect(screen.queryByText('History A')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Önceki sayfa'));
    await screen.findByText('History A');
    expect(api.getSportingPlayer360Page).toHaveBeenLastCalledWith('p', {
      asOf: '2026-09-06T12:00:00.000Z',
      after: undefined,
    });
  });
  it('does not call an inaccessible history empty and retries a profile failure', async () => {
    api.getSportingPlayer360Page
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValueOnce({
        ...player('Active only'),
        assignmentPage: {
          total: 1,
          activeCount: 1,
          historyVisible: false,
          limit: 25,
          nextCursor: null,
        },
      });
    setup('/app/players/p?tab=journey');
    await screen.findByText('Forbidden');
    expect(
      screen.queryByText('Atama geçmişi bulunmuyor'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Tekrar dene'));
    await screen.findByText('Active only');
    expect(
      screen.getByText(/Yalnız seçilen tarihte aktif/),
    ).toBeInTheDocument();
  });
});
