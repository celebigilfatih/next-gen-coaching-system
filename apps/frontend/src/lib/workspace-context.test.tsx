import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceProvider, useWorkspace } from './workspace-context';
import { readWorkspaceScope, resolveWorkspaceScope } from './workspace-scope';
import type { SportingWorkspace } from './api';

const api = vi.hoisted(() => ({
  getSportingWorkspaceSelection: vi.fn(),
  getSportingCatalog: vi.fn(),
  getLegacyWorkspaceContext: vi.fn(),
  listGroups: vi.fn(),
  listSeasons: vi.fn(),
  listMatches: vi.fn(),
  listTrainingPlans: vi.fn(),
  listDrills: vi.fn(),
  listGroupMembers: vi.fn(),
}));
vi.mock('./api', () => api);
vi.mock('./session', () => ({
  getSession: () => ({ user: { id: 'coach-a', role: 'COACH' } }),
}));

const season = (id: string, startDate = '2026-01-01') => ({
  id,
  name: id,
  startDate,
  endDate: '2026-12-31',
});
const team = (id: string, clubId: string, seasons: string[]) => ({
  id,
  clubId,
  name: id,
  legacyGroupId: `group-${id}`,
  categoryKey: 'ALT_YAPI',
  categoryLabel: 'Altyapı',
  ageGroupLabel: 'U18',
  minimumAge: null,
  maximumAge: null,
  teamSeasons: seasons.map((s) => ({
    id: `${id}-${s}`,
    clubSeason: season(s, s === 'old' ? '2025-01-01' : undefined),
  })),
});
const data: SportingWorkspace = {
  clubs: [
    { id: 'club-a', name: 'A' },
    { id: 'club-b', name: 'B' },
  ],
  teams: [
    team('a', 'club-a', ['current', 'old']),
    team('b', 'club-a', ['current']),
    team('c', 'club-b', []),
  ],
};
function Probe() {
  const state = useWorkspace();
  const location = useLocation();
  return (
    <div>
      <p>{state.loading ? 'Loading' : `Ready ${state.team?.id}:`}</p>
      <p>Season {state.season?.id ?? 'none'}</p>
      <p>Options {state.teams.map((t) => t.id).join(',')}</p>
      <p>Catalog {state.catalogError || state.catalogLoading || 'ready'}</p>
      <p>Path {location.pathname}</p>
      <button onClick={() => void state.pageCatalog('teams', 'a')}>
        Catalog next
      </button>
      <button onClick={() => state.selectScope({ teamId: 'b' })}>B</button>
      <button
        onClick={() =>
          state.selectScope({ teamId: 'b' }, { preservePath: true })
        }
      >
        Preserve B
      </button>
      <button onClick={() => state.selectScope({ teamId: 'a' })}>A</button>
      <button onClick={() => state.selectScope({ clubSeasonId: 'old' })}>
        Old
      </button>
      <button
        onClick={() =>
          state.selectScope({ clubId: 'club-b', clubSeasonId: '*' })
        }
      >
        Club B
      </button>
    </div>
  );
}
function mount(path = '/app/week') {
  return render(
    <RouterProvider
      router={createMemoryRouter(
        [
          {
            path: '*',
            element: (
              <WorkspaceProvider>
                <Probe />
              </WorkspaceProvider>
            ),
          },
        ],
        { initialEntries: [path] },
      )}
    />,
  );
}

describe('workspace scope integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.getSportingWorkspaceSelection.mockImplementation(async (desired) => {
      const state = resolveWorkspaceScope(data, desired);
      const page = (items: unknown[]) => ({
        items,
        nextCursor: null,
        limit: 25,
      });
      return {
        ...state,
        clubs: page(data.clubs),
        seasons: page(state.clubSeasons),
        teams: page(state.teams),
      };
    });
    const groups = data.teams.map((t) => ({
      id: t.legacyGroupId,
      name: t.name,
      clubId: t.clubId,
      ageGroup: 'U18',
    }));
    const seasons = [
      {
        ...season('legacy-current'),
        groupId: 'group-a',
        teamSeasonId: 'a-current',
      },
      {
        ...season('legacy-old', '2025-01-01'),
        groupId: 'group-a',
        teamSeasonId: 'a-old',
      },
    ];
    api.getLegacyWorkspaceContext.mockImplementation(async (scope) => {
      const resolved = resolveWorkspaceScope(data, scope);
      return {
        group:
          groups.find((g) => g.id === resolved.team?.legacyGroupId) ?? null,
        season:
          seasons.find((s) => s.teamSeasonId === resolved.teamSeason?.id) ??
          null,
        get matches() {
          throw new Error('Metadata must not load shared matches');
        },
      };
    });
    api.listTrainingPlans.mockRejectedValue(
      new Error('Full plan read forbidden'),
    );
    api.listMatches.mockResolvedValue([]);
    api.listDrills.mockResolvedValue([]);
    api.listGroupMembers.mockRejectedValue(
      new Error('Full members read forbidden'),
    );
  });

  it('revalidates stored identifiers against the current club and season grants', () => {
    expect(
      resolveWorkspaceScope(data, {
        clubId: 'forbidden',
        teamId: 'c',
        clubSeasonId: 'forbidden',
      }).scope,
    ).toEqual({ clubId: 'club-a', teamId: 'a', clubSeasonId: 'current' });
    expect(
      resolveWorkspaceScope(data, {
        clubId: 'club-a',
        teamId: 'b',
        clubSeasonId: 'old',
      }).team?.id,
    ).toBe('a');
    expect(
      resolveWorkspaceScope(data, { clubId: 'club-b', clubSeasonId: '*' }).team
        ?.id,
    ).toBe('c');
  });

  it('completes a team switch, ignores a late response, and never falls back to another team season', async () => {
    let resolveB!: (value: unknown) => void;
    const metadata = api.getLegacyWorkspaceContext.getMockImplementation()!;
    api.getLegacyWorkspaceContext.mockImplementation((scope) =>
      scope.teamId === 'b'
        ? new Promise((resolve) => {
            resolveB = resolve;
          })
        : metadata(scope),
    );
    mount();
    await screen.findByText('Ready a:');
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    await waitFor(() =>
      expect(api.getLegacyWorkspaceContext).toHaveBeenCalledWith(
        expect.objectContaining({ teamId: 'b' }),
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Club B' }));
    await screen.findByText('Ready c:');
    await act(async () =>
      resolveB({
        group: { id: 'group-b', name: 'Stale B', clubId: 'club-a' },
        season: null,
      }),
    );
    expect(screen.queryByText('Ready b:')).not.toBeInTheDocument();
    expect(api.listGroupMembers).not.toHaveBeenCalled();
    expect(readWorkspaceScope('coach-a').teamId).toBe('c');
    expect(screen.getByText('Season none')).toBeInTheDocument();
    expect(readWorkspaceScope('coach-b')).toEqual({});
  });

  it('preserves a nested route when a route-owned team selection requests it', async () => {
    mount('/app/teams/first-team');
    await screen.findByText('Ready a:');
    fireEvent.click(screen.getByRole('button', { name: 'Preserve B' }));
    await screen.findByText('Ready b:');
    expect(screen.getByText('Path /app/teams/first-team')).toBeInTheDocument();
  });

  it('loads the chosen season matches and clears them in a season-less club', async () => {
    mount();
    await screen.findByText('Ready a:');
    fireEvent.click(screen.getByRole('button', { name: 'Old' }));
    await screen.findByText('Season legacy-old');
    await waitFor(() =>
      expect(api.getLegacyWorkspaceContext).toHaveBeenCalledWith({
        clubId: 'club-a',
        teamId: 'a',
        clubSeasonId: 'old',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Club B' }));
    await screen.findByText('Ready c:');
    expect(screen.getByText('Season none')).toBeInTheDocument();
    expect(readWorkspaceScope('coach-a').clubId).toBe('club-b');
    expect(api.listGroups).not.toHaveBeenCalled();
    expect(api.listSeasons).not.toHaveBeenCalled();
    expect(api.listMatches).not.toHaveBeenCalled();
  });

  it('rejects malformed saved values without breaking initial loading', async () => {
    localStorage.setItem('ngcs.workspace.v1.coach-a', '{broken');
    mount();
    await screen.findByText('Ready a:');
    expect(readWorkspaceScope('coach-a').teamId).toBe('a');
  });

  it('pins the selected team outside the loaded catalog page without reloading resources', async () => {
    api.getSportingCatalog.mockResolvedValue({
      items: [data.teams[1]],
      nextCursor: null,
      limit: 25,
    });
    mount();
    await screen.findByText('Ready a:');
    const reads = api.getLegacyWorkspaceContext.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Catalog next' }));
    await waitFor(() => expect(api.getSportingCatalog).toHaveBeenCalled());
    await screen.findByText('Options a,b');
    expect(readWorkspaceScope('coach-a').teamId).toBe('a');
    expect(api.getLegacyWorkspaceContext).toHaveBeenCalledTimes(reads);
    expect(api.listGroupMembers).not.toHaveBeenCalled();
    expect(api.listDrills).not.toHaveBeenCalled();
    expect(api.listTrainingPlans).not.toHaveBeenCalled();
  });

  it('ignores a late catalog response from a previous scope', async () => {
    let resolvePage!: (value: unknown) => void;
    api.getSportingCatalog.mockReturnValue(
      new Promise((resolve) => {
        resolvePage = resolve;
      }),
    );
    mount();
    await screen.findByText('Ready a:');
    fireEvent.click(screen.getByRole('button', { name: 'Catalog next' }));
    await waitFor(() => expect(api.getSportingCatalog).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Club B' }));
    await screen.findByText('Ready c:');
    await act(async () =>
      resolvePage({ items: [data.teams[1]], nextCursor: null, limit: 25 }),
    );
    expect(screen.getByText('Options c')).toBeInTheDocument();
  });
});
