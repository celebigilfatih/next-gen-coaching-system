import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamsRoute, { TeamDirectoryRoute, type TeamView } from './teams';

const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  archive: vi.fn(),
  restore: vi.fn(),
  reload: vi.fn(),
  select: vi.fn(),
  role: 'SYSTEM_ADMIN',
  loading: false,
  error: '',
  scope: { clubId: 'club-a', clubSeasonId: 'season-a', teamId: 'selected' },
}));
vi.mock('../lib/api', () => ({
  getSportingCatalog: mocks.page,
  createSportingTeam: mocks.create,
  updateSportingTeam: mocks.update,
  archiveSportingTeam: mocks.archive,
  restoreSportingTeam: mocks.restore,
}));
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { role: mocks.role } }),
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    scope: mocks.scope,
    clubSeason: { id: 'season-a', name: '2026–27' },
    selectScope: mocks.select,
    reload: mocks.reload,
    loading: mocks.loading,
    error: mocks.error,
  }),
}));

const team = (
  id: string,
  categoryKey: 'A_TAKIM' | 'ALT_YAPI' = 'ALT_YAPI',
) => ({
  id,
  clubId: 'club-a',
  name: id,
  categoryKey,
  categoryLabel: categoryKey === 'A_TAKIM' ? 'A Takım' : 'Altyapı',
  ageGroupLabel: categoryKey === 'A_TAKIM' ? 'SENIOR' : 'U17',
  minimumAge: null,
  maximumAge: null,
  legacyGroupId: id,
  archivedAt: null,
  teamSeasons: [],
});
const page = (
  id: string,
  nextCursor: string | null = null,
  categoryKey: 'A_TAKIM' | 'ALT_YAPI' = 'ALT_YAPI',
) => ({ items: [team(id, categoryKey)], nextCursor, limit: 25 });
const view = (teamView: TeamView = 'first-team') => (
  <MemoryRouter>
    <TeamDirectoryRoute view={teamView} />
  </MemoryRouter>
);

describe('A Takım and academy management', () => {
  beforeEach(() => {
    mocks.page.mockReset();
    mocks.create.mockReset();
    mocks.update.mockReset();
    mocks.archive.mockReset();
    mocks.restore.mockReset();
    mocks.reload.mockReset().mockResolvedValue(undefined);
    mocks.select.mockReset();
    mocks.role = 'SYSTEM_ADMIN';
    mocks.loading = false;
    mocks.error = '';
    mocks.scope = {
      clubId: 'club-a',
      clubSeasonId: 'season-a',
      teamId: 'selected',
    };
  });

  it('redirects legacy team URLs to the separate sidebar destinations', async () => {
    render(
      <MemoryRouter initialEntries={['/app/teams?view=academy&q=U12']}>
        <Routes>
          <Route path="/app/teams" element={<TeamsRoute />} />
          <Route
            path="/app/teams/academy"
            element={<h1>Academy destination</h1>}
          />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: 'Academy destination' });
  });

  it('renders the protected first-team destination without page tabs', async () => {
    mocks.page.mockResolvedValue(page('A Takım', null, 'A_TAKIM'));
    const rendered = render(view());
    await waitFor(() =>
      expect(
        rendered.container.querySelectorAll('.team-reference-card'),
      ).toHaveLength(1),
    );
    expect(mocks.page).toHaveBeenCalledWith(
      'teams',
      expect.objectContaining({
        categoryKey: 'A_TAKIM',
        status: 'ACTIVE',
      }),
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Takımı arşivle' }),
    ).not.toBeInTheDocument();
  });

  it('renders the academy destination without tabs and enables its paged directory', async () => {
    mocks.page.mockResolvedValue(page('U17', 'cursor-a'));
    render(view('academy'));
    await screen.findAllByText('U17');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(mocks.page).toHaveBeenCalledWith(
      'teams',
      expect.objectContaining({
        categoryKey: 'ALT_YAPI',
        status: 'ACTIVE',
      }),
    );
    expect(screen.getByRole('button', { name: 'Sonraki sayfa' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /Altyapı takımı ekle/ }),
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: /Arşivdekiler/ })).toBeEnabled();
  });

  it('keeps mutation controls hidden for coach and player roles', async () => {
    mocks.role = 'COACH';
    mocks.page.mockResolvedValue(page('U17'));
    const rendered = render(view('academy'));
    await screen.findAllByText('U17');
    expect(
      screen.queryByRole('button', { name: /Altyapı takımı ekle/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Arşivdekiler/ }),
    ).not.toBeInTheDocument();
    expect(
      rendered.container.querySelector('[aria-label="U17 takım işlemleri"]'),
    ).not.toBeInTheDocument();
  });

  it('allows only SYSTEM_ADMIN to create the first team', async () => {
    mocks.role = 'CLUB_ADMIN';
    mocks.page.mockResolvedValue({ items: [], nextCursor: null, limit: 25 });
    const rendered = render(view());
    await screen.findByText('A Takım henüz oluşturulmamış');
    expect(
      screen.queryByRole('button', { name: /A Takımı oluştur/ }),
    ).not.toBeInTheDocument();
    rendered.unmount();

    mocks.role = 'SYSTEM_ADMIN';
    render(view());
    expect(
      await screen.findByRole('button', { name: /A Takımı oluştur/ }),
    ).toBeEnabled();
  });

  it('requires an exact season before creating a team', async () => {
    mocks.scope = { ...mocks.scope, clubSeasonId: '*' };
    mocks.page.mockResolvedValue({ items: [], nextCursor: null, limit: 25 });
    render(view('academy'));
    expect(
      await screen.findByRole('button', { name: /Altyapı takımı ekle/ }),
    ).toBeDisabled();
  });

  it('pages and searches academy teams without changing workspace implicitly', async () => {
    mocks.page
      .mockResolvedValueOnce(page('U17', 'cursor-a'))
      .mockResolvedValueOnce(page('U19'))
      .mockResolvedValueOnce(page('Remote'));
    render(view('academy'));
    await screen.findAllByText('U17');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findAllByText('U19');
    expect(mocks.page).toHaveBeenLastCalledWith(
      'teams',
      expect.objectContaining({ after: 'cursor-a' }),
    );
    fireEvent.change(screen.getByLabelText('Takım ara'), {
      target: { value: 'Remote' },
    });
    await screen.findAllByText('Remote');
    expect(mocks.page).toHaveBeenLastCalledWith(
      'teams',
      expect.objectContaining({ q: 'Remote', after: undefined }),
    );
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it('ignores stale academy responses after a season change', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    mocks.page
      .mockReturnValueOnce(new Promise((done) => (resolve = done)))
      .mockResolvedValueOnce(page('New season'));
    const rendered = render(view('academy'));
    await waitFor(() => expect(mocks.page).toHaveBeenCalledOnce());
    mocks.scope = { ...mocks.scope, clubSeasonId: 'season-b' };
    rendered.rerender(view('academy'));
    await screen.findAllByText('New season');
    await act(async () => resolve(page('Old season')));
    expect(screen.queryByText('Old season')).not.toBeInTheDocument();
  });

  it('keeps workspace and catalog failures explicit', async () => {
    mocks.error = 'Workspace forbidden';
    const rendered = render(view());
    expect(screen.getByRole('alert')).toHaveTextContent('Workspace forbidden');
    expect(mocks.page).not.toHaveBeenCalled();
    rendered.unmount();

    mocks.error = '';
    mocks.page.mockRejectedValueOnce(new Error('Network unavailable'));
    render(view('academy'));
    await screen.findByText('Network unavailable');
    expect(screen.getByRole('button', { name: 'Tekrar dene' })).toBeEnabled();
  });
});
