import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  getSportingWorkspaceSelection,
  getSportingCatalog,
  getLegacyWorkspaceContext,
  type Group,
  type Season,
  type SportingWorkspace,
  type WorkspaceSelection,
  type WorkspaceCatalogs,
} from './api';
import { getSession } from './session';
import {
  readWorkspaceScope,
  rememberWorkspaceScope,
  resolveWorkspaceScope,
  type WorkspaceScope,
} from './workspace-scope';

type ScopeContext = Omit<
  ReturnType<typeof resolveWorkspaceScope>,
  'club' | 'team'
> & {
  club?: NonNullable<WorkspaceSelection['club']>;
  team?: NonNullable<WorkspaceSelection['team']>;
};
type WorkspaceState = ScopeContext & {
  clubs: SportingWorkspace['clubs'];
  groups: Group[];
  group?: Group;
  seasons: Season[];
  season?: Season;
  loading: boolean;
  error: string;
  selectGroup: (id: string) => void;
  selectScope: (
    patch: Partial<WorkspaceScope>,
    options?: { preservePath?: boolean },
  ) => void;
  reload: () => Promise<void>;
  catalogs: WorkspaceCatalogs;
  catalogLoading: string | null;
  catalogError: string;
  catalogRevision: number;
  pageCatalog: (
    kind: keyof WorkspaceCatalogs,
    after?: string,
  ) => Promise<boolean>;
};
const emptyCatalogs: WorkspaceCatalogs = {
  clubs: { items: [], nextCursor: null, limit: 25 },
  seasons: { items: [], nextCursor: null, limit: 25 },
  teams: { items: [], nextCursor: null, limit: 25 },
};
function pin<T extends { id: string }>(items: T[], selected: T | null) {
  return selected && !items.some((item) => item.id === selected.id)
    ? [selected, ...items]
    : items;
}
function selectionContext(
  data: WorkspaceSelection,
  catalogs: WorkspaceCatalogs,
): ScopeContext {
  return {
    club: data.club ?? undefined,
    clubSeason: data.clubSeason ?? undefined,
    team: data.team ?? undefined,
    teamSeason: data.teamSeason ?? undefined,
    clubSeasons: pin(catalogs.seasons.items, data.clubSeason),
    teams: pin(catalogs.teams.items, data.team),
    scope: data.scope,
  };
}
const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const locationParams = new URLSearchParams(location.search);
  const queryClubId = locationParams.get('ngcsClub');
  const queryClubSeasonId = locationParams.get('ngcsSeason');
  const queryTeamId = locationParams.get('ngcsTeam');
  const user = getSession()?.user;
  const userId = user?.id ?? 'anonymous';
  const requested = useRef<Partial<WorkspaceScope>>(readWorkspaceScope(userId));
  const generation = useRef(0);
  const [data, setData] = useState<WorkspaceSelection>();
  const [catalogs, setCatalogs] = useState<WorkspaceCatalogs>(emptyCatalogs);
  const [catalogLoading, setCatalogLoading] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState('');
  const [catalogRevision, setCatalogRevision] = useState(0);
  const catalogGeneration = useRef(0);
  const [groups, setGroups] = useState<Group[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const context = data
    ? selectionContext(data, catalogs)
    : resolveWorkspaceScope({ clubs: [], teams: [] }, {});
  const group = groups.find(
    (g) =>
      g.id === context.team?.legacyGroupId && g.clubId === context.club?.id,
  );
  const season = seasons.find(
    (s) => s.groupId === group?.id && s.teamSeasonId === context.teamSeason?.id,
  );

  const reload = useCallback(async () => {
    const current = ++generation.current;
    ++catalogGeneration.current;
    setCatalogLoading(null);
    setCatalogError('');
    const isCurrent = () => current === generation.current;
    setLoading(true);
    setError('');
    try {
      const nextData = await getSportingWorkspaceSelection(requested.current);
      if (!isCurrent()) return;
      const next = selectionContext(nextData, nextData);
      const legacy = next.scope.teamId
        ? await getLegacyWorkspaceContext(next.scope)
        : { group: null, season: null };
      if (!isCurrent()) return;
      const activeGroup = legacy.group ?? undefined;
      const activeSeason = legacy.season ?? undefined;
      const nextGroups = activeGroup ? [activeGroup] : [];
      const nextSeasons = activeSeason ? [activeSeason] : [];
      setData(nextData);
      setCatalogRevision(current);
      setCatalogs({
        clubs: nextData.clubs,
        seasons: nextData.seasons,
        teams: nextData.teams,
      });
      setGroups(nextGroups);
      setSeasons(nextSeasons);
      requested.current = next.scope;
      rememberWorkspaceScope(userId, next.scope);
    } catch (cause) {
      if (isCurrent())
        setError(
          cause instanceof Error ? cause.message : 'Çalışma alanı yüklenemedi.',
        );
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (queryClubId !== null)
      requested.current = {
        clubId: queryClubId,
        clubSeasonId: queryClubSeasonId ?? '',
        teamId: queryTeamId ?? '',
      };
    const timer = window.setTimeout(() => void reload(), 0);
    return () => {
      window.clearTimeout(timer);
      // This is a request counter, not a DOM ref; invalidate every old response.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
    };
  }, [queryClubId, queryClubSeasonId, queryTeamId, reload]);

  function selectScope(
    patch: Partial<WorkspaceScope>,
    options?: { preservePath?: boolean },
  ) {
    const next = {
      ...context.scope,
      ...patch,
    };
    if (JSON.stringify(next) === JSON.stringify(context.scope)) return;
    const params = new URLSearchParams(location.search);
    params.set('ngcsClub', next.clubId);
    params.set('ngcsSeason', next.clubSeasonId);
    params.set('ngcsTeam', next.teamId);
    // Router navigation keeps existing unsaved-change blockers effective.
    // Storage changes only after navigation is accepted and scope revalidated.
    const parts = location.pathname.split('/').filter(Boolean);
    const pathname = options?.preservePath
      ? location.pathname
      : parts.length > 2
        ? `/app/${parts[1]}`
        : location.pathname;
    navigate({ pathname, search: params.toString() });
  }

  async function pageCatalog(kind: keyof WorkspaceCatalogs, after?: string) {
    const current = ++catalogGeneration.current;
    const scopeGeneration = generation.current;
    setCatalogLoading(kind);
    setCatalogError('');
    const isCurrent = () =>
      current === catalogGeneration.current &&
      scopeGeneration === generation.current;
    try {
      const page = await getSportingCatalog(
        kind,
        kind === 'clubs'
          ? { after }
          : {
              clubId: context.scope.clubId,
              clubSeasonId:
                kind === 'teams' ? context.scope.clubSeasonId : undefined,
              after,
            },
      );
      if (!isCurrent()) return false;
      // Replace the page instead of accumulating the whole catalogue in memory.
      setCatalogs((previous) => ({ ...previous, [kind]: page }));
      return true;
    } catch (cause) {
      if (isCurrent())
        setCatalogError(
          cause instanceof Error ? cause.message : 'Katalog alınamadı.',
        );
      return false;
    } finally {
      if (isCurrent()) setCatalogLoading(null);
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{
        ...context,
        clubs: pin(catalogs.clubs.items, data?.club ?? null),
        catalogs,
        catalogLoading,
        catalogError,
        catalogRevision,
        pageCatalog,
        groups,
        group,
        seasons,
        season,
        loading,
        error,
        reload,
        selectScope,
        selectGroup: (id) => {
          const team = context.teams.find((t) => t.legacyGroupId === id);
          if (team) selectScope({ clubId: team.clubId, teamId: team.id });
        },
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return context;
}
