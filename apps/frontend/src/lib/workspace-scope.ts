import type { SportingWorkspace } from './api';

export type WorkspaceScope = {
  clubId: string;
  clubSeasonId: string;
  teamId: string;
};

export function workspaceSeasonLabel(
  scope: Pick<WorkspaceScope, 'clubSeasonId'>,
  seasonName: string | undefined,
  missingLabel = 'Sezon TBD',
) {
  // Only the validated explicit all-seasons scope means all seasons.
  return scope.clubSeasonId === '*'
    ? 'Tüm sezonlar'
    : (seasonName ?? missingLabel);
}

export function resolveWorkspaceScope(
  data: SportingWorkspace,
  desired: Partial<WorkspaceScope>,
) {
  const club = data.clubs.find((c) => c.id === desired.clubId) ?? data.clubs[0];
  const clubTeams = data.teams.filter((t) => t.clubId === club?.id);
  const clubSeasons = [
    ...new Map(
      clubTeams.flatMap((t) =>
        t.teamSeasons.map((s) => [s.clubSeason.id, s.clubSeason] as const),
      ),
    ).values(),
  ].sort(
    (a, b) =>
      b.startDate.localeCompare(a.startDate) || a.id.localeCompare(b.id),
  );
  const clubSeason =
    desired.clubSeasonId === '*'
      ? undefined
      : (clubSeasons.find((s) => s.id === desired.clubSeasonId) ??
        clubSeasons[0]);
  const teams = clubTeams.filter(
    (t) =>
      !clubSeason ||
      t.teamSeasons.some((s) => s.clubSeason.id === clubSeason.id),
  );
  const team = teams.find((t) => t.id === desired.teamId) ?? teams[0];
  const teamSeason = team?.teamSeasons.find(
    (s) => s.clubSeason.id === clubSeason?.id,
  );
  return {
    club,
    clubSeasons,
    clubSeason,
    teams,
    team,
    teamSeason,
    scope: {
      clubId: club?.id ?? '',
      clubSeasonId: desired.clubSeasonId === '*' ? '*' : (clubSeason?.id ?? ''),
      teamId: team?.id ?? '',
    },
  };
}

export function readWorkspaceScope(userId: string): Partial<WorkspaceScope> {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(`ngcs.workspace.v1.${userId}`) ?? '{}',
    );
    if (!value || typeof value !== 'object') return {};
    return Object.fromEntries(
      ['clubId', 'clubSeasonId', 'teamId'].flatMap((key) => {
        const id = (value as Record<string, unknown>)[key];
        return typeof id === 'string' && id.length <= 160 ? [[key, id]] : [];
      }),
    );
  } catch {
    return {};
  }
}

export function rememberWorkspaceScope(userId: string, scope: WorkspaceScope) {
  try {
    localStorage.setItem(`ngcs.workspace.v1.${userId}`, JSON.stringify(scope));
  } catch {
    /* Restricted browser storage does not prevent the workspace from working. */
  }
}
