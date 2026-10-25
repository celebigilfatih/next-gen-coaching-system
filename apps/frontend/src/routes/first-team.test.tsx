import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FirstTeamRoute from './first-team';

const mocks = vi.hoisted(() => ({
  catalog: vi.fn(),
  players: vi.fn(),
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
  role: 'SYSTEM_ADMIN',
  selectScope: vi.fn(),
  reload: vi.fn(),
  workspace: {
    scope: {
      clubId: 'club-a',
      clubSeasonId: 'season-a',
      teamId: 'academy-a',
    },
    club: { id: 'club-a', name: 'NGCS' },
    clubSeason: { id: 'season-a', name: '2026–27' },
    loading: false,
    error: '',
  },
}));

vi.mock('../lib/api', () => ({
  getSportingCatalog: mocks.catalog,
  getSportingPlayerPage: mocks.players,
  createSportingTeam: mocks.createTeam,
  updateSportingTeam: mocks.updateTeam,
  archiveSportingTeam: vi.fn(),
}));
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { role: mocks.role } }),
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    selectScope: mocks.selectScope,
    reload: mocks.reload,
  }),
}));

const firstTeam = {
  id: 'first-a',
  clubId: 'club-a',
  name: 'A Takım',
  categoryKey: 'A_TAKIM',
  categoryLabel: 'A Takım',
  ageGroupLabel: 'SENIOR',
  minimumAge: null,
  maximumAge: null,
  legacyGroupId: 'group-first',
  archivedAt: null,
  teamSeasons: [],
};
const playerPage = {
  items: [
    {
      id: 'person-a',
      clubId: 'club-a',
      displayName: 'Deniz Yılmaz',
      birthDate: null,
      playerProfile: {
        preferredFoot: 'RIGHT',
        primaryPosition: 'DEFANS',
        secondaryPositions: null,
      },
      assignments: [
        { id: 'assignment-a', assignmentType: 'PRIMARY_REGISTERED' },
      ],
    },
  ],
  nextCursor: null,
  limit: 25,
  total: 1,
  summary: {
    total: 1,
    positions: {
      KALECI: 0,
      DEFANS: 1,
      ORTA_SAHA: 0,
      FORVET: 0,
      UNASSIGNED: 0,
    },
  },
};

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/app/teams/first-team']}>
      <FirstTeamRoute />
    </MemoryRouter>,
  );
}

describe('first-team roster center', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.role = 'SYSTEM_ADMIN';
    mocks.workspace = {
      scope: {
        clubId: 'club-a',
        clubSeasonId: 'season-a',
        teamId: 'academy-a',
      },
      club: { id: 'club-a', name: 'NGCS' },
      clubSeason: { id: 'season-a', name: '2026–27' },
      loading: false,
      error: '',
    };
    mocks.catalog.mockResolvedValue({
      items: [firstTeam],
      nextCursor: null,
      limit: 25,
    });
    mocks.players.mockResolvedValue(playerPage);
  });

  it('opens the roster center directly and aligns workspace without changing the route', async () => {
    renderRoute();
    await screen.findByText('Deniz Yılmaz');
    expect(
      screen.getByRole('heading', { name: 'A Takım Oyuncuları' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Takım Yönetimi')).not.toBeInTheDocument();
    expect(mocks.catalog).toHaveBeenCalledWith(
      'teams',
      expect.objectContaining({
        clubId: 'club-a',
        clubSeasonId: 'season-a',
        categoryKey: 'A_TAKIM',
        status: 'ACTIVE',
      }),
    );
    expect(mocks.selectScope).toHaveBeenCalledWith(
      { teamId: 'first-a' },
      { preservePath: true },
    );
    expect(screen.getByRole('link', { name: /Antrenmanlar/ })).toHaveAttribute(
      'href',
      expect.stringContaining('ngcsTeam=first-a'),
    );
    expect(
      screen.getByRole('button', { name: /Takım bilgilerini düzenle/ }),
    ).toBeInTheDocument();
  });

  it('keeps coach access read-only', async () => {
    mocks.role = 'COACH';
    renderRoute();
    await screen.findByText('Deniz Yılmaz');
    expect(
      screen.queryByRole('button', { name: /Takım bilgilerini düzenle/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the exact-season creation path only to a system administrator', async () => {
    mocks.catalog.mockResolvedValue({ items: [], nextCursor: null, limit: 25 });
    renderRoute();
    await screen.findByText('Bu kapsamda A Takım bulunamadı');
    expect(
      screen.getByRole('button', { name: /A Takımı oluştur/ }),
    ).toBeEnabled();
    expect(mocks.players).not.toHaveBeenCalled();
  });
});
