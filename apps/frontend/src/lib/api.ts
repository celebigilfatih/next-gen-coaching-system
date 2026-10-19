import {
  clearSession,
  getSession,
  getSessionGeneration,
  setSession,
  type SessionUser,
} from './session';
import type { TacticalBoardDocumentV1 } from './tactical-board';
import {
  validateTacticalDocument,
  type TacticalDocument,
} from './tactical-document-core';

export type TacticalResource =
  | { kind: 'drill'; id: string }
  | { kind: 'plan'; planId: string; id: string }
  | { kind: 'match'; id: string };
export type TacticalDocumentEnvelope = {
  document: TacticalDocument | null;
  writeToken: string;
};

export type TacticalDrillMetadata = Omit<Drill, 'jsonData' | 'imageUrl'>;
export type TacticalDrillFields = Pick<
  Drill,
  'title' | 'category' | 'durationMin' | 'difficulty' | 'equipment'
>;
type TacticalDrillSaved = TacticalDocumentEnvelope & {
  drill: TacticalDrillMetadata;
};

export function getTacticalDrillMetadata(id: string) {
  return request<TacticalDrillMetadata>(
    `/drills/${encodeURIComponent(id)}/tactical-editor`,
  );
}

export async function saveTacticalDrill(
  id: string,
  metadata: TacticalDrillFields,
  document: TacticalDocument,
  expectedWriteToken: string,
) {
  const saved = await request<TacticalDrillSaved>(
    `/drills/${encodeURIComponent(id)}/tactical-editor`,
    {
      method: 'PUT',
      body: JSON.stringify({
        metadata,
        document: validateTacticalDocument(document),
        expectedWriteToken,
      }),
    },
  );
  return validateSavedDrill(saved);
}

export async function createTacticalDrill(input: {
  groupId: string;
  metadata: TacticalDrillFields;
  document: TacticalDocument;
  sourceId?: string;
  expectedSourceToken?: string;
}) {
  const saved = await request<TacticalDrillSaved>('/drills/tactical-editor', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      document: validateTacticalDocument(input.document),
    }),
  });
  return validateSavedDrill(saved);
}

function validateSavedDrill(saved: TacticalDrillSaved) {
  const envelope = tacticalEnvelope(saved);
  if (!envelope.document || !saved.drill?.id)
    throw new Error('Kaydedilen egzersiz doğrulanamadı. Taslak korunuyor.');
  return { drill: saved.drill, ...envelope };
}

function tacticalPath(resource: TacticalResource) {
  const id = encodeURIComponent(resource.id);
  if (resource.kind === 'drill') return `/drills/${id}/tactical-document`;
  if (resource.kind === 'match')
    return `/seasons/matches/${id}/tactical-document`;
  return `/training-plans/${encodeURIComponent(resource.planId)}/drills/${id}/tactical-document`;
}

function tacticalEnvelope(
  value: TacticalDocumentEnvelope,
): TacticalDocumentEnvelope {
  if (
    !value ||
    typeof value.writeToken !== 'string' ||
    !value.writeToken.length ||
    !('document' in value)
  )
    throw new Error('Tahta yanıtı doğrulanamadı. Taslak korunuyor.');
  return {
    document:
      value.document === null ? null : validateTacticalDocument(value.document),
    writeToken: value.writeToken,
  };
}

export async function getTacticalDocument(resource: TacticalResource) {
  return tacticalEnvelope(
    await request<TacticalDocumentEnvelope>(tacticalPath(resource)),
  );
}

export async function putTacticalDocument(
  resource: TacticalResource,
  document: TacticalDocument,
  expectedWriteToken: string,
) {
  if (!expectedWriteToken)
    throw new Error('Kaydetmeden önce tahta kayıt anahtarı okunmalıdır.');
  const valid = validateTacticalDocument(document);
  // The supplied token is never refreshed or retried after a conflict.
  const response = tacticalEnvelope(
    await request<TacticalDocumentEnvelope>(tacticalPath(resource), {
      method: 'PUT',
      body: JSON.stringify({ document: valid, expectedWriteToken }),
    }),
  );
  if (response.document === null)
    throw new Error('Kaydedilen tahta doğrulanamadı. Taslak korunuyor.');
  return response;
}

const apiBase = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
).replace(/\/$/, '');

type LoginResponse = {
  access_token: string;
  user: SessionUser;
  persistent_session?: boolean;
};

export const persistentSessionsEnabled =
  import.meta.env.VITE_PERSISTENT_SESSIONS_ENABLED === 'true';
let refreshFlight: Promise<boolean> | null = null;
let bootstrapFlight: Promise<void> | null = null;
let loggingOut = false;

async function withSessionLock<T>(action: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks)
    return navigator.locks.request('ngcs-browser-session', action);
  return action();
}

async function sessionRequest(path: string, body?: object) {
  return fetch(`${apiBase}/auth/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-NGCS-CSRF': '1',
    },
    body: JSON.stringify(body ?? {}),
  });
}

function remember(response: LoginResponse) {
  setSession({
    token: response.access_token,
    user: response.user,
    persistent: response.persistent_session === true,
  });
}

export function refreshSession(): Promise<boolean> {
  if (!persistentSessionsEnabled || loggingOut) return Promise.resolve(false);
  if (refreshFlight) return refreshFlight;
  const generation = getSessionGeneration();
  refreshFlight = withSessionLock(async () => {
    const response = await sessionRequest('refresh');
    if (generation !== getSessionGeneration()) return false;
    if (response.status === 401 || response.status === 404) {
      clearSession();
      return false;
    }
    if (!response.ok)
      throw new Error('Oturum yenilenemedi. Lütfen tekrar deneyin.');
    const result = (await response.json()) as LoginResponse;
    if (generation !== getSessionGeneration()) return false;
    remember(result);
    return true;
  }).finally(() => {
    refreshFlight = null;
  });
  return refreshFlight;
}

export function bootstrapSession(): Promise<void> {
  if (!persistentSessionsEnabled || getSession()) return Promise.resolve();
  if (!bootstrapFlight)
    bootstrapFlight = refreshSession()
      .then(() => undefined)
      .catch((error: unknown) => {
        bootstrapFlight = null;
        throw error;
      });
  return bootstrapFlight;
}

export async function logout() {
  loggingOut = true;
  try {
    if (refreshFlight) await refreshFlight;
    if (persistentSessionsEnabled && getSession()?.persistent) {
      const response = await withSessionLock(() => sessionRequest('logout'));
      if (!response.ok)
        throw new Error('Çıkış tamamlanamadı. Lütfen tekrar deneyin.');
    }
    clearSession();
  } finally {
    loggingOut = false;
  }
}

export type Group = {
  id: string;
  name: string;
  ageGroup: string;
  clubId?: string;
};

export type GroupMember = {
  id: string;
  user: SessionUser & { position?: string | null };
};

export type Season = {
  id: string;
  name: string;
  groupId: string;
  startDate: string;
  endDate: string;
  clubId?: string;
  teamSeasonId?: string | null;
};

export type DrillPhase = 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';

export type Drill = {
  id: string;
  title: string;
  category: DrillPhase;
  ageGroup: string;
  durationMin: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  equipment?: string | null;
  jsonData: unknown;
  imageUrl?: string | null;
  scope: 'GLOBAL' | 'CLUB';
  clubId: string | null;
  groupId: string | null;
  createdById: string | null;
};

export type PlanDrill = {
  id: string;
  drillId: string;
  phase: DrillPhase;
  order: number;
  notes: string | null;
  drill: Drill;
  boardSnapshot?: TacticalBoardDocumentV1 | null;
};

export type TrainingPlan = {
  id: string;
  title: string;
  groupId: string | null;
  date: string | null;
  notes: string | null;
  totalDuration: number;
  attendance?: AttendanceRecord[];
  drills?: PlanDrill[];
};

export type TrainingEditorMetadata = Omit<
  TrainingPlan,
  'drills' | 'attendance'
> & {
  drills: Array<
    Omit<PlanDrill, 'drill' | 'boardSnapshot'> & {
      drill: Pick<Drill, 'id' | 'title' | 'durationMin'>;
    }
  >;
};
export type TrainingPhaseBoard = {
  planId: string;
  planDrillId: string;
  drillId: string;
} & (
  | {
      origin: 'snapshot' | 'drill';
      status: 'ready';
      document: TacticalBoardDocumentV1;
    }
  | { origin: 'snapshot' | 'drill'; status: 'invalid'; document: null }
  | { origin: null; status: 'absent'; document: null }
);

export function getTrainingEditorMetadata(planId: string) {
  return request<TrainingEditorMetadata>(
    `/training-plans/${encodeURIComponent(planId)}/editor-metadata`,
  );
}
export function getTrainingPhaseBoard(planId: string, planDrillId: string) {
  return request<TrainingPhaseBoard>(
    `/training-plans/${encodeURIComponent(planId)}/drills/${encodeURIComponent(planDrillId)}/board`,
  );
}

export type TrainingPhaseDocument = {
  planId: string;
  planDrillId: string;
  drillId: string;
  writeToken: string;
} & (
  | {
      origin: 'snapshot' | 'drill';
      status: 'ready';
      document: TacticalDocument;
    }
  | { origin: null; status: 'absent'; document: null }
);

type PhaseDocumentEnvelope = TacticalDocumentEnvelope & {
  phase: {
    planId: string;
    planDrillId: string;
    drillId: string;
    origin: 'snapshot' | 'drill' | null;
  };
};

function phaseDocument(
  value: PhaseDocumentEnvelope,
  planId: string,
  planDrillId: string,
): TrainingPhaseDocument {
  const envelope = tacticalEnvelope(value);
  if (
    !value.phase ||
    value.phase.planId !== planId ||
    value.phase.planDrillId !== planDrillId ||
    typeof value.phase.drillId !== 'string' ||
    !value.phase.drillId
  )
    throw new Error('Tahta yanıtı seçilen fazla eşleşmiyor.');
  const identity = {
    planId,
    planDrillId,
    drillId: value.phase.drillId,
    writeToken: envelope.writeToken,
  };
  if (envelope.document === null && value.phase.origin === null)
    return { ...identity, status: 'absent', document: null, origin: null };
  if (
    envelope.document &&
    (value.phase.origin === 'snapshot' || value.phase.origin === 'drill')
  )
    return {
      ...identity,
      status: 'ready',
      document: envelope.document,
      origin: value.phase.origin,
    };
  throw new Error('Geçersiz tahta kaynağı.');
}

export async function getTrainingPhaseDocument(
  planId: string,
  planDrillId: string,
) {
  const value = await request<PhaseDocumentEnvelope>(
    tacticalPath({ kind: 'plan', planId, id: planDrillId }),
  );
  return phaseDocument(value, planId, planDrillId);
}

export async function putTrainingPhaseDocument(
  planId: string,
  planDrillId: string,
  document: TacticalDocument,
  expectedWriteToken: string,
) {
  if (!expectedWriteToken) throw new Error('Tahta kayıt anahtarı bulunamadı.');
  const value = await request<PhaseDocumentEnvelope>(
    tacticalPath({ kind: 'plan', planId, id: planDrillId }),
    {
      method: 'PUT',
      body: JSON.stringify({
        document: validateTacticalDocument(document),
        expectedWriteToken,
      }),
    },
  );
  const saved = phaseDocument(value, planId, planDrillId);
  if (saved.status !== 'ready' || saved.origin !== 'snapshot')
    throw new Error('Kaydedilen snapshot doğrulanamadı.');
  return saved;
}

export type AttendanceRecord = {
  id: string;
  planId: string;
  playerId: string;
  status: 'PRESENT' | 'ABSENT';
};

export type MatchAnalysis = {
  summary: string;
  opponentFormation: string;
  focus: string;
};

export type Match = {
  id: string;
  seasonId: string;
  groupId: string | null;
  date: string;
  opponent: string;
  location: string;
  competition: string | null;
  opponentAnalysis: unknown;
  ourFormation: string | null;
  notes: string | null;
  tacticalBoard: TacticalBoardDocumentV1 | null;
};

export type MatchCatalogItem = Pick<
  Match,
  | 'id'
  | 'seasonId'
  | 'date'
  | 'opponent'
  | 'location'
  | 'competition'
  | 'ourFormation'
  | 'notes'
> & { result: string | null; hasBoard: boolean };
export type MatchMetadata = Omit<Match, 'tacticalBoard'> & {
  hasBoard: boolean;
};
export type MatchCatalogPage = CatalogPage<MatchCatalogItem> & {
  total: number;
};
export function getMatchPage(
  groupId: string,
  seasonId?: string,
  after?: string,
) {
  const query = new URLSearchParams({ groupId, limit: '25' });
  if (seasonId) query.set('seasonId', seasonId);
  if (after) query.set('after', after);
  return request<MatchCatalogPage>(`/matches/catalog/page?${query}`);
}
export function getMatchDetail(
  matchId: string,
  groupId: string,
  seasonId?: string,
) {
  const query = new URLSearchParams({ groupId });
  if (seasonId) query.set('seasonId', seasonId);
  return request<Match>(
    `/matches/catalog/detail/${encodeURIComponent(matchId)}?${query}`,
  );
}
export function getMatchMetadata(
  matchId: string,
  groupId: string,
  seasonId?: string,
) {
  const query = new URLSearchParams({ groupId });
  if (seasonId) query.set('seasonId', seasonId);
  return request<MatchMetadata>(
    `/matches/catalog/metadata/${encodeURIComponent(matchId)}?${query}`,
  );
}
export async function getMatchTotal(groupId: string, seasonId?: string) {
  const query = new URLSearchParams({ groupId, limit: '1' });
  if (seasonId) query.set('seasonId', seasonId);
  const page = await request<MatchCatalogPage>(
    `/matches/catalog/page?${query}`,
  );
  return page.total;
}

// Half-open local calendar day boundaries are supplied as absolute timestamps.
export function getMatchDayPage(
  groupId: string,
  seasonId: string | undefined,
  from: string,
  until: string,
  after?: string,
) {
  const query = new URLSearchParams({ groupId, from, until, limit: '25' });
  if (seasonId) query.set('seasonId', seasonId);
  if (after) query.set('after', after);
  return request<MatchCatalogPage>(`/matches/catalog/page?${query}`);
}

// Same chronological season summary as the dashboard, without a full match list.
export function getMatchOverview(groupId: string, seasonId?: string) {
  const query = new URLSearchParams({ groupId, limit: '3' });
  if (seasonId) query.set('seasonId', seasonId);
  return request<MatchCatalogPage>(`/matches/catalog/page?${query}`);
}

export type SportingTeam = {
  id: string;
  clubId: string;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  ageGroupLabel: string | null;
  minimumAge: number | null;
  maximumAge: number | null;
  legacyGroupId: string | null;
  archivedAt?: string | null;
  teamSeasons: Array<{
    id: string;
    clubSeason: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
  }>;
};

export type SportingWorkspace = {
  clubs: { id: string; name: string }[];
  teams: SportingTeam[];
};

export function getSportingWorkspace() {
  return request<SportingWorkspace>('/sporting/workspace');
}

export type CatalogPage<T> = {
  items: T[];
  nextCursor: string | null;
  limit: number;
};
export type CatalogItems = {
  clubs: SportingWorkspace['clubs'][number];
  seasons: SportingTeam['teamSeasons'][number]['clubSeason'];
  teams: SportingTeam;
};
export type WorkspaceCatalogs = {
  [K in keyof CatalogItems]: CatalogPage<CatalogItems[K]>;
};
export type WorkspaceSelection = WorkspaceCatalogs & {
  club: CatalogItems['clubs'] | null;
  clubSeason: CatalogItems['seasons'] | null;
  team: SportingTeam | null;
  teamSeason: SportingTeam['teamSeasons'][number] | null;
  scope: { clubId: string; clubSeasonId: string; teamId: string };
};
export function getSportingWorkspaceSelection(
  scope: Partial<WorkspaceSelection['scope']>,
) {
  const query = new URLSearchParams();
  Object.entries(scope).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return request<WorkspaceSelection>(
    `/sporting/workspace/selection?${query.toString()}`,
  );
}
export function getSportingCatalog<K extends keyof CatalogItems>(
  kind: K,
  options: {
    clubId?: string;
    clubSeasonId?: string;
    after?: string;
    q?: string;
    categoryKey?: 'A_TAKIM' | 'ALT_YAPI';
    status?: 'ACTIVE' | 'ARCHIVED';
  },
) {
  const query = new URLSearchParams({ limit: '25' });
  Object.entries(options).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const path =
    kind === 'teams' ? '/sporting/teams/page' : `/sporting/catalog/${kind}`;
  return request<CatalogPage<CatalogItems[K]>>(`${path}?${query.toString()}`);
}

export type TeamClassification = 'FIRST_TEAM' | 'ACADEMY';

export function createSportingTeam(input: {
  clubId: string;
  clubSeasonId: string;
  name: string;
  ageGroupLabel: string;
  classification: TeamClassification;
}) {
  return request<SportingTeam>('/sporting/teams', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateSportingTeam(
  teamId: string,
  input: { name?: string; ageGroupLabel?: string },
) {
  return request<SportingTeam>(
    `/sporting/teams/${encodeURIComponent(teamId)}`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}

export function archiveSportingTeam(teamId: string) {
  return request<SportingTeam>(
    `/sporting/teams/${encodeURIComponent(teamId)}/archive`,
    { method: 'POST', body: '{}' },
  );
}

export function restoreSportingTeam(teamId: string) {
  return request<SportingTeam>(
    `/sporting/teams/${encodeURIComponent(teamId)}/restore`,
    { method: 'POST', body: '{}' },
  );
}

export type SportingAssignment = {
  id: string;
  assignmentType: SportingAssignmentType;
  validFrom: string;
  validTo: string | null;
  reason: string | null;
  source: string | null;
  team: Pick<
    SportingTeam,
    'id' | 'name' | 'categoryLabel' | 'ageGroupLabel' | 'legacyGroupId'
  > | null;
  teamSeason: {
    id: string;
    clubSeason: {
      id?: string;
      name: string;
      startDate?: string;
      endDate?: string;
    };
  } | null;
  roleDefinition: {
    id: string;
    key: string;
    name: string;
    systemKey: string | null;
  };
};

export type SportingAssignmentType =
  | 'LEGACY_MEMBER'
  | 'PRIMARY_REGISTERED'
  | 'TRAINING_GUEST'
  | 'MATCH_ELIGIBLE'
  | 'LOAN_IN'
  | 'LOAN_OUT'
  | 'INTERNATIONAL_DUTY'
  | 'STAFF';

export type SportingPosition = 'KALECI' | 'DEFANS' | 'ORTA_SAHA' | 'FORVET';
export type SportingPlayerPositionFilter = SportingPosition | 'UNASSIGNED';
export type SportingPlayerSort = 'NAME_ASC' | 'NAME_DESC';

export type SportingPlayer = {
  id: string;
  clubId: string;
  displayName: string;
  birthDate: string | null;
  playerProfile: {
    preferredFoot: 'LEFT' | 'RIGHT' | 'BOTH' | 'UNKNOWN' | null;
    primaryPosition: SportingPosition | null;
    secondaryPositions: unknown;
  };
  assignments: Array<{
    id: string;
    assignmentType: SportingAssignmentType;
    team: { id: string; name: string; ageGroupLabel: string | null } | null;
    roleDefinition: { name: string; systemKey: string | null };
  }>;
};

export type SportingPlayer360 = Omit<SportingPlayer, 'assignments'> & {
  asOf: string;
  account: { id: string; status: string } | null;
  assignments: SportingAssignment[];
  availabilityPeriods?: Array<{
    id: string;
    status: SportingAvailabilityStatus;
    validFrom: string;
    validTo: string | null;
    restrictionSummary: string | null;
    source: string | null;
  }>;
  evidence: {
    attendance: Record<string, number>;
    matchParticipation: null;
  };
};

export type AssignmentPageInfo = {
  nextCursor: string | null;
  limit: number;
  total: number;
};
export type SportingPlayer360Page = SportingPlayer360 & {
  assignmentPage: AssignmentPageInfo & {
    activeCount: number;
    historyVisible: boolean;
  };
};

export type PlayerNoteCategory =
  | 'GENERAL'
  | 'TRAINING'
  | 'MATCH'
  | 'TECHNICAL'
  | 'TACTICAL'
  | 'DEVELOPMENT';
export type PlayerNoteFollowUpStatus = 'OPEN' | 'DONE' | 'CANCELLED';
export type PlayerNote = {
  id: string;
  clubId: string;
  personId: string;
  originTeamId: string;
  authorId: string;
  category: PlayerNoteCategory;
  body: string;
  observedAt: string;
  followUpAt: string | null;
  followUpStatus: PlayerNoteFollowUpStatus | null;
  version: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  originTeam: { id: string; name: string };
  author: { id: string; name: string };
  teamGrants: Array<{ id: string; name: string }>;
  permissions: {
    canEdit: boolean;
    canArchive: boolean;
    canShare: boolean;
  };
};
export type PlayerNotePage = {
  items: PlayerNote[];
  nextCursor: string | null;
  limit: number;
  total: number;
  summary: { openFollowUps: number };
  permissions: { canCreate: boolean; canShare: boolean };
};
export type PlayerActivityItem = {
  id: string;
  cursorId: string;
  kind: 'ASSIGNMENT' | 'TRAINING_ATTENDANCE';
  occurredAt: string;
  title: string;
  detail: string;
  status: string;
  source: string | null;
  team: { id: string; name: string } | null;
  link: string | null;
};
export type PlayerActivityPage = {
  items: PlayerActivityItem[];
  nextCursor: string | null;
  limit: number;
};
export type SportingTeamRosterPage = Omit<SportingTeamRoster, 'team'> & {
  team: Pick<SportingTeam, 'id' | 'clubId' | 'name' | 'categoryLabel'>;
  page: AssignmentPageInfo & {
    playerAssignments: number;
    staffAssignments: number;
  };
};

export function getSportingRosterPage(
  teamId: string,
  options: { asOf: string; after?: string; teamSeasonId?: string },
) {
  const query = new URLSearchParams({ asOf: options.asOf, limit: '25' });
  if (options.after) query.set('after', options.after);
  if (options.teamSeasonId) query.set('teamSeasonId', options.teamSeasonId);
  return request<SportingTeamRosterPage>(
    `/sporting/teams/${teamId}/roster/page?${query}`,
  );
}
export function getSportingPlayer360Page(
  personId: string,
  options: { asOf: string; after?: string },
) {
  const query = new URLSearchParams({ asOf: options.asOf, limit: '25' });
  if (options.after) query.set('after', options.after);
  return request<SportingPlayer360Page>(
    `/sporting/players/${personId}/assignments/page?${query}`,
  );
}

export function getPlayerNotePage(
  personId: string,
  options: {
    after?: string;
    q?: string;
    category?: PlayerNoteCategory;
    followUpStatus?: PlayerNoteFollowUpStatus;
    teamId?: string;
    status?: 'ACTIVE' | 'ARCHIVED';
    limit?: number;
  } = {},
) {
  const query = new URLSearchParams({ limit: String(options.limit ?? 20) });
  if (options.after) query.set('after', options.after);
  if (options.q) query.set('q', options.q);
  if (options.category) query.set('category', options.category);
  if (options.followUpStatus)
    query.set('followUpStatus', options.followUpStatus);
  if (options.teamId) query.set('teamId', options.teamId);
  if (options.status) query.set('status', options.status);
  return request<PlayerNotePage>(
    `/sporting/players/${encodeURIComponent(personId)}/notes/page?${query}`,
  );
}

export function createPlayerNote(
  personId: string,
  input: {
    originTeamId: string;
    category: PlayerNoteCategory;
    body: string;
    observedAt: string;
    followUpAt?: string | null;
    followUpStatus?: PlayerNoteFollowUpStatus | null;
  },
) {
  return request<PlayerNote>(
    `/sporting/players/${encodeURIComponent(personId)}/notes`,
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export function updatePlayerNote(
  personId: string,
  noteId: string,
  input: {
    expectedVersion: number;
    category: PlayerNoteCategory;
    body: string;
    observedAt: string;
    followUpAt?: string | null;
    followUpStatus?: PlayerNoteFollowUpStatus | null;
  },
) {
  return request<PlayerNote>(
    `/sporting/players/${encodeURIComponent(personId)}/notes/${encodeURIComponent(noteId)}`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}

export function archivePlayerNote(
  personId: string,
  noteId: string,
  expectedVersion: number,
) {
  return request<PlayerNote>(
    `/sporting/players/${encodeURIComponent(personId)}/notes/${encodeURIComponent(noteId)}/archive`,
    { method: 'POST', body: JSON.stringify({ expectedVersion }) },
  );
}

export function restorePlayerNote(
  personId: string,
  noteId: string,
  expectedVersion: number,
) {
  return request<PlayerNote>(
    `/sporting/players/${encodeURIComponent(personId)}/notes/${encodeURIComponent(noteId)}/restore`,
    { method: 'POST', body: JSON.stringify({ expectedVersion }) },
  );
}

export function replacePlayerNoteShares(
  personId: string,
  noteId: string,
  expectedVersion: number,
  teamIds: string[],
) {
  return request<PlayerNote>(
    `/sporting/players/${encodeURIComponent(personId)}/notes/${encodeURIComponent(noteId)}/shares`,
    {
      method: 'PUT',
      body: JSON.stringify({ expectedVersion, teamIds }),
    },
  );
}

export function getPlayerNoteRevisions(personId: string, noteId: string) {
  return request<{
    items: Array<{
      id: string;
      version: number;
      body: string;
      createdAt: string;
      editedBy: { id: string; name: string };
    }>;
    nextCursor: string | null;
  }>(
    `/sporting/players/${encodeURIComponent(personId)}/notes/${encodeURIComponent(noteId)}/revisions/page?limit=100`,
  );
}

export function getPlayerActivityPage(personId: string, after?: string) {
  const query = new URLSearchParams({ limit: '20' });
  if (after) query.set('after', after);
  return request<PlayerActivityPage>(
    `/sporting/players/${encodeURIComponent(personId)}/activity/page?${query}`,
  );
}

export type SportingAvailabilityStatus =
  | 'AVAILABLE'
  | 'MODIFIED'
  | 'UNAVAILABLE'
  | 'RETURNING'
  | 'SUSPENDED'
  | 'INTERNATIONAL_DUTY'
  | 'OTHER';

export type SportingTeamRoster = {
  team: SportingTeam;
  asOf: string;
  assignments: Array<{
    id: string;
    assignmentType: SportingAssignmentType;
    validFrom: string;
    validTo: string | null;
    reason: string | null;
    source: string | null;
    person: {
      id: string;
      displayName: string;
      birthDate: string | null;
      playerProfile: SportingPlayer['playerProfile'] | null;
      staffProfile: { title: string | null } | null;
    };
    roleDefinition: SportingAssignment['roleDefinition'];
    teamSeason: {
      id: string;
      clubSeason: { name: string };
    } | null;
  }>;
};

export type SportingRole = {
  id: string;
  key: string;
  name: string;
  systemKey: string | null;
  capabilities: Array<{ capability: string }>;
};

export type AccountRole = SessionUser['role'];
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';
export type ManagedAccount = SessionUser & {
  status: AccountStatus;
  createdAt: string;
  club: { name: string } | null;
};
export type AccountPage = {
  items: ManagedAccount[];
  nextCursor: string | null;
  limit: number;
  total: number;
  summary: { active: number; suspended: number };
};
export type AccountTokenResult = {
  token?: string;
  delivery?: { status: 'accepted' };
};
export type InvitationResult = AccountTokenResult & {
  invitation: {
    id: string;
    email: string;
    role: AccountRole;
    clubId: string | null;
    expiresAt: string;
    createdAt: string;
  };
};
export type PasswordResetResult = AccountTokenResult & {
  passwordReset: {
    id: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
  };
};

async function request<T>(
  path: string,
  init?: RequestInit,
  retried = false,
): Promise<T> {
  const generation = getSessionGeneration();
  const token = getSession()?.token;
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401 && generation !== getSessionGeneration())
    throw new Error('Oturum değişti. Lütfen işlemi tekrar deneyin.');
  if (response.status === 401 && !retried && getSession()?.persistent) {
    // Another request may already have refreshed this exact rejected token.
    if (
      (getSession()?.token !== token || (await refreshSession())) &&
      getSession()
    )
      return request<T>(path, init, true);
  }
  if (response.status === 401) clearSession();
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message;
    throw new Error(message || `İstek başarısız (${response.status})`);
  }

  return (await response.json()) as T;
}

async function publicAccountRequest<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    credentials: 'omit',
    cache: 'no-store',
    referrerPolicy: 'no-referrer',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      'Bağlantı geçersiz, süresi dolmuş veya daha önce kullanılmış olabilir.',
    );
  }
  return (await response.json()) as T;
}

export function acceptInvitation(
  token: string,
  name: string,
  password: string,
) {
  return publicAccountRequest<SessionUser>('/accounts/invitations/accept', {
    token,
    name,
    password,
  });
}

export function completePasswordReset(token: string, newPassword: string) {
  return publicAccountRequest<{ success: true }>(
    '/accounts/password-resets/complete',
    { token, newPassword },
  );
}

export function getAccountPage(options: {
  after?: string;
  q?: string;
  role?: AccountRole;
  status?: AccountStatus;
  clubId?: string;
}) {
  const query = new URLSearchParams({ limit: '25' });
  if (options.after) query.set('after', options.after);
  if (options.q) query.set('q', options.q);
  if (options.role) query.set('role', options.role);
  if (options.status) query.set('status', options.status);
  if (options.clubId) query.set('clubId', options.clubId);
  return request<AccountPage>(`/accounts?${query.toString()}`);
}

export function createAccountInvitation(input: {
  email: string;
  role: AccountRole;
  clubId?: string;
}) {
  return request<InvitationResult>('/accounts/invitations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function changeAccountAccess(
  accountId: string,
  input: { role?: AccountRole; clubId?: string | null },
) {
  return request<SessionUser>(
    `/accounts/${encodeURIComponent(accountId)}/access`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}

export function setAccountStatus(accountId: string, status: AccountStatus) {
  const action = status === 'ACTIVE' ? 'reactivate' : 'suspend';
  return request<SessionUser & { status: AccountStatus }>(
    `/accounts/${encodeURIComponent(accountId)}/${action}`,
    { method: 'POST' },
  );
}

export function issueAccountPasswordReset(accountId: string) {
  return request<PasswordResetResult>(
    `/accounts/${encodeURIComponent(accountId)}/password-reset`,
    { method: 'POST' },
  );
}

export function revokeAccountSessions(accountId: string) {
  return request<{ success: true; reauthenticationRequired?: boolean }>(
    `/accounts/${encodeURIComponent(accountId)}/revoke-sessions`,
    { method: 'POST' },
  );
}

export async function login(email: string, password: string) {
  if (persistentSessionsEnabled) {
    if (refreshFlight) await refreshFlight;
    const response = await withSessionLock(() =>
      sessionRequest('login', { email, password }),
    );
    if (!response.ok)
      throw new Error('Giriş yapılamadı. E-posta ve parolanızı kontrol edin.');
    const result = (await response.json()) as LoginResponse;
    remember(result);
    return result.user;
  }
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  remember(response);
  return response.user;
}

export function listGroups() {
  return request<Group[]>('/groups');
}

export function listGroupMembers(groupId: string) {
  return request<GroupMember[]>(`/groups/${groupId}/members`);
}
export function getPlayerMemberPage(
  groupId: string,
  after?: string,
  limit = 25,
) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (after) query.set('after', after);
  return request<CatalogPage<GroupMember> & { total: number }>(
    `/groups/${encodeURIComponent(groupId)}/members/players/page?${query}`,
  );
}

export function listSeasons() {
  return request<Season[]>('/seasons');
}

export function listSportingTeams(clubId?: string) {
  const query = new URLSearchParams();
  if (clubId) query.set('clubId', clubId);
  const suffix = query.size ? `?${query.toString()}` : '';
  return request<SportingTeam[]>(`/sporting/teams${suffix}`);
}

export function getSportingTeamRoster(
  teamId: string,
  options?: { asOf?: string; teamSeasonId?: string },
) {
  const query = new URLSearchParams();
  if (options?.asOf) query.set('asOf', options.asOf);
  if (options?.teamSeasonId) query.set('teamSeasonId', options.teamSeasonId);
  const suffix = query.size ? `?${query.toString()}` : '';
  return request<SportingTeamRoster>(
    `/sporting/teams/${teamId}/roster${suffix}`,
  );
}

export function listSportingPlayers(options?: {
  clubId?: string;
  teamId?: string;
}) {
  const query = new URLSearchParams();
  if (options?.clubId) query.set('clubId', options.clubId);
  if (options?.teamId) query.set('teamId', options.teamId);
  const suffix = query.size ? `?${query.toString()}` : '';
  return request<SportingPlayer[]>(`/sporting/players${suffix}`);
}

export function getSportingPlayer(personId: string, asOf?: string) {
  const query = new URLSearchParams();
  if (asOf) query.set('asOf', asOf);
  const suffix = query.size ? `?${query.toString()}` : '';
  return request<SportingPlayer360>(`/sporting/players/${personId}${suffix}`);
}

export type LegacyWorkspaceContext = {
  group: Group | null;
  season: Season | null;
};
export function getLegacyWorkspaceContext(scope: {
  teamId: string;
  clubId: string;
  clubSeasonId: string;
}) {
  const query = new URLSearchParams({
    teamId: scope.teamId,
    clubId: scope.clubId,
  });
  if (scope.clubSeasonId) query.set('clubSeasonId', scope.clubSeasonId);
  return request<LegacyWorkspaceContext>(
    `/sporting/workspace/legacy-metadata?${query}`,
  );
}
export function getAssignmentOptions(
  kind: 'teams' | 'roles',
  clubId: string,
  after?: string,
) {
  const query = new URLSearchParams({ clubId, limit: '25' });
  if (after) query.set('after', after);
  return request<CatalogPage<{ id: string; name: string }>>(
    `/sporting/${kind}/page?${query}`,
  );
}

export type SportingPlayerPage = {
  items: SportingPlayer[];
  nextCursor: string | null;
  limit: number;
  total: number;
  summary: {
    total: number;
    positions: Record<SportingPlayerPositionFilter, number>;
  };
};

export function getSportingPlayerPage(options: {
  teamId: string;
  clubId?: string;
  after?: string;
  q?: string;
  position?: SportingPlayerPositionFilter;
  sort?: SportingPlayerSort;
}) {
  const query = new URLSearchParams({ teamId: options.teamId, limit: '25' });
  if (options.clubId) query.set('clubId', options.clubId);
  if (options.after) query.set('after', options.after);
  if (options.q) query.set('q', options.q);
  if (options.position) query.set('position', options.position);
  if (options.sort) query.set('sort', options.sort);
  return request<SportingPlayerPage>(
    `/sporting/players/page?${query.toString()}`,
  );
}

export function listSportingRoles(clubId?: string) {
  const query = new URLSearchParams();
  if (clubId) query.set('clubId', clubId);
  const suffix = query.size ? `?${query.toString()}` : '';
  return request<SportingRole[]>(`/sporting/roles${suffix}`);
}

export function createSportingAssignment(input: {
  personId: string;
  teamId?: string;
  teamSeasonId?: string;
  roleDefinitionId: string;
  assignmentType: SportingAssignmentType;
  validFrom: string;
  validTo?: string;
  reason?: string;
}) {
  return request<SportingAssignment>('/sporting/assignments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function transitionSportingPrimary(input: {
  personId: string;
  teamId: string;
  teamSeasonId?: string;
  roleDefinitionId: string;
  validAt: string;
  reason?: string;
}) {
  return request<{
    endedAssignmentId: string | null;
    assignment: SportingAssignment;
  }>('/sporting/assignments/transition-primary', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listMatches(seasonId: string) {
  return request<Match[]>(`/seasons/${seasonId}/matches`);
}

export function listDrills(ageGroup?: string, groupId?: string) {
  const query = new URLSearchParams();
  if (ageGroup) query.set('ageGroup', ageGroup);
  if (groupId) query.set('groupId', groupId);
  return request<Drill[]>(`/drills?${query.toString()}`);
}

export function getDrill(drillId: string) {
  return request<Drill>(`/drills/${drillId}`);
}

export function createDrill(input: {
  title: string;
  category: DrillPhase;
  ageGroup: string;
  durationMin: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  equipment?: string;
  jsonData: TacticalBoardDocumentV1;
  scope?: 'GLOBAL' | 'CLUB';
  clubId?: string;
  groupId?: string;
}) {
  return request<Drill>('/drills', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateDrill(
  drillId: string,
  input: Partial<{
    title: string;
    category: DrillPhase;
    ageGroup: string;
    durationMin: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    equipment: string;
    jsonData: TacticalBoardDocumentV1;
  }>,
) {
  return request<Drill>(`/drills/${drillId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function listTrainingPlans(groupId: string) {
  const query = new URLSearchParams({ groupId });
  return request<TrainingPlan[]>(`/training-plans?${query.toString()}`);
}

export type TrainingPlanCatalogPage = CatalogPage<
  Pick<
    TrainingPlan,
    'id' | 'title' | 'groupId' | 'date' | 'notes' | 'totalDuration'
  > & { phaseCount: number }
> & {
  summary: {
    total: number;
    scheduled: number;
    undated: number;
    totalDuration: number;
    presentAttendance: number;
  };
};
export function getTrainingPlanPage(
  groupId: string,
  seasonId?: string,
  after?: string,
) {
  const query = new URLSearchParams({ groupId, limit: '25' });
  if (seasonId) query.set('seasonId', seasonId);
  if (after) query.set('after', after);
  return request<TrainingPlanCatalogPage>(
    `/training-plans/catalog/page?${query.toString()}`,
  );
}

// Full-scope counters with only the three most recent scalar plan projections.
export function getTrainingOverview(groupId: string, seasonId?: string) {
  const query = new URLSearchParams({ groupId, limit: '3' });
  if (seasonId) query.set('seasonId', seasonId);
  return request<TrainingPlanCatalogPage>(
    `/training-plans/catalog/page?${query.toString()}`,
  );
}

export function getTrainingDayPage(
  groupId: string,
  seasonId: string | undefined,
  from: string,
  until: string,
  after?: string,
) {
  const query = new URLSearchParams({ groupId, from, until, limit: '25' });
  if (seasonId) query.set('seasonId', seasonId);
  if (after) query.set('after', after);
  return request<TrainingPlanCatalogPage>(
    `/training-plans/catalog/page?${query.toString()}`,
  );
}

export function getTrainingPlan(planId: string) {
  return request<TrainingPlan>(
    `/training-plans/${encodeURIComponent(planId)}/editor`,
  );
}

export type PlanAttendancePage = {
  items: Array<{
    id: string;
    playerId: string;
    name: string;
    status: 'PRESENT' | 'ABSENT' | null;
  }>;
  total: number;
  presentTotal: number;
  limit: number;
  nextCursor: string | null;
};
export function getPlanAttendancePage(planId: string, after?: string) {
  const query = new URLSearchParams({ planId, limit: '25' });
  if (after) query.set('after', after);
  return request<PlanAttendancePage>(`/attendance/page?${query}`);
}

export type DrillCatalogItem = Pick<
  Drill,
  | 'id'
  | 'title'
  | 'category'
  | 'ageGroup'
  | 'durationMin'
  | 'difficulty'
  | 'equipment'
  | 'scope'
> & {
  isBoard: boolean;
  createdAt: string;
  contentVersion: number | null;
  summary: string | null;
  objectiveKey: string | null;
  objectiveLabel: string | null;
  themes: string[];
  playerMin: number | null;
  playerMax: number | null;
  areaLengthM: number | null;
  areaWidthM: number | null;
  source: {
    kind: 'NGCS_ORIGINAL' | 'OPEN_LICENSE' | 'LEGACY';
    title: string;
    license: 'NGCS_PROPRIETARY' | 'CC0' | 'CC_BY_4_0' | 'LEGACY_UNVERIFIED';
    attribution: string | null;
  };
};
export type DrillCatalogPage = CatalogPage<DrillCatalogItem> & {
  total: number;
  ageGroup: string;
};
export function getDrillPage(
  groupId: string,
  category?: DrillPhase,
  after?: string,
) {
  const query = new URLSearchParams({ groupId, limit: '25' });
  if (category) query.set('category', category);
  if (after) query.set('after', after);
  return request<DrillCatalogPage>(`/drills/catalog/page?${query}`);
}

export type DrillCatalogFilters = {
  q?: string;
  ageGroup?: string;
  objective?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  minDuration?: number;
  maxDuration?: number;
  minPlayers?: number;
  maxPlayers?: number;
  equipment?: string;
  source?: 'NGCS' | 'OPEN_LICENSE' | 'LEGACY' | 'CLUB' | 'MINE';
  scope?: 'GLOBAL' | 'CLUB';
};

export function getFilteredDrillPage(
  groupId: string,
  category: DrillPhase | undefined,
  filters: DrillCatalogFilters,
  after?: string,
) {
  const query = new URLSearchParams({ groupId, limit: '25' });
  if (category) query.set('category', category);
  if (after) query.set('after', after);
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  return request<DrillCatalogPage>(`/drills/catalog/page?${query}`);
}

export type DrillContentStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type DrillContentDetail = {
  drill: {
    id: string;
    scope: 'GLOBAL' | 'CLUB';
    clubId: string | null;
    groupId: string | null;
  };
  version: null | {
    id: string;
    version: number;
    status: DrillContentStatus;
    title: string;
    summary: string;
    category: DrillPhase;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    objectiveKey: string;
    objectiveLabel: string;
    themes: string[];
    durationMin: number;
    playerMin: number | null;
    playerMax: number | null;
    areaLengthM: number | null;
    areaWidthM: number | null;
    equipmentItems: string[];
    organization: string;
    steps: string[];
    coachingPoints: string[];
    progressions: string[];
    regressions: string[];
    constraints: string[];
    safetyNotes: string | null;
    boardDocument: TacticalBoardDocumentV1 | null;
    source: DrillCatalogItem['source'] & {
      sourceUrl?: string | null;
      author?: string | null;
      changes?: string | null;
      licenseVerifiedAt?: string | null;
    };
    ageVariants: Array<{
      ageGroup: string;
      durationMin: number;
      playerMin: number | null;
      playerMax: number | null;
      areaLengthM: number | null;
      areaWidthM: number | null;
      rules: string[];
      coachingPoints: string[];
    }>;
  };
  variant: DrillContentDetail['version'] extends infer V
    ? V extends { ageVariants: Array<infer A> }
      ? A | null
      : null
    : null;
  provenance: string;
};

export function getDrillContent(drillId: string, ageGroup?: string) {
  const query = new URLSearchParams();
  if (ageGroup) query.set('ageGroup', ageGroup);
  return request<DrillContentDetail>(
    `/drills/${encodeURIComponent(drillId)}/content?${query}`,
  );
}

export type DrillContentQueueItem = NonNullable<
  DrillContentDetail['version']
> & {
  status: DrillContentStatus;
  drillId: string;
  createdBy: { id: string; name: string } | null;
  reviewedBy: { id: string; name: string } | null;
  publishedBy: { id: string; name: string } | null;
  reviewComment: string | null;
  updatedAt: string;
};

export function getDrillContentQueue(status: DrillContentStatus) {
  return request<{ items: DrillContentQueueItem[]; total: number }>(
    `/drills/content/queue?status=${status}`,
  );
}

export function transitionDrillContent(
  versionId: string,
  action: 'submit' | 'approve' | 'reject' | 'publish' | 'archive',
  comment?: string,
) {
  return request<DrillContentQueueItem>(
    `/drills/content/${encodeURIComponent(versionId)}/${action}`,
    {
      method: 'POST',
      body:
        action === 'approve' || action === 'reject'
          ? JSON.stringify({ comment: comment || undefined })
          : undefined,
    },
  );
}

// Reuse the authorized full total without downloading the exercise library.
export function getDrillOverview(groupId: string) {
  const query = new URLSearchParams({ groupId, limit: '1' });
  return request<DrillCatalogPage>(`/drills/catalog/page?${query}`);
}

export function getTacticalDrillPage(groupId: string, after?: string) {
  const query = new URLSearchParams({
    groupId,
    kind: 'tactical-board',
    limit: '25',
  });
  if (after) query.set('after', after);
  return request<DrillCatalogPage>(`/drills/catalog/page?${query}`);
}

export type AttendancePlanPage = Omit<
  TrainingPlanCatalogPage,
  'items' | 'summary'
> & {
  items: Array<
    Omit<TrainingPlanCatalogPage['items'][number], 'phaseCount'> & {
      presentCount: number;
    }
  >;
  summary: TrainingPlanCatalogPage['summary'] & { playerCount: number };
};
export function getAttendancePlanPage(
  groupId: string,
  seasonId?: string,
  after?: string,
) {
  const query = new URLSearchParams({ groupId, limit: '25' });
  if (seasonId) query.set('seasonId', seasonId);
  if (after) query.set('after', after);
  return request<AttendancePlanPage>(
    `/training-plans/catalog/attendance/page?${query}`,
  );
}

export function listAttendance(planId: string) {
  const query = new URLSearchParams({ planId });
  return request<AttendanceRecord[]>(`/attendance?${query.toString()}`);
}

export function createTrainingPlan(input: {
  title: string;
  groupId: string;
  date: string;
  notes?: string;
}) {
  return request<TrainingPlan>('/training-plans', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTrainingPlan(
  planId: string,
  input: {
    title?: string;
    date?: string;
    notes?: string;
  },
) {
  return request<TrainingPlan>(
    `/training-plans/${encodeURIComponent(planId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
}

export function deleteTrainingPlan(planId: string) {
  return request<TrainingPlan>(
    `/training-plans/${encodeURIComponent(planId)}`,
    {
      method: 'DELETE',
    },
  );
}

export function replaceTrainingPlanDrills(
  planId: string,
  drills: Array<{
    drillId: string;
    phase: DrillPhase;
    order: number;
    notes?: string;
  }>,
) {
  return request<TrainingPlan>(`/training-plans/${planId}/drills`, {
    method: 'PUT',
    body: JSON.stringify({ drills }),
  });
}

export function addTrainingPlanDrill(
  planId: string,
  input: { drillId: string; phase: DrillPhase; order: number },
) {
  return request<{ id: string }>(`/training-plans/${planId}/drills`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function markAttendance(input: {
  planId: string;
  playerId: string;
  status: 'PRESENT' | 'ABSENT';
}) {
  return request('/attendance', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateMatch(
  matchId: string,
  input: {
    opponentAnalysis: MatchAnalysis;
    ourFormation: string;
    notes: string;
  },
) {
  return request<Match>(`/seasons/matches/${matchId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function updatePlanDrillBoard(
  planId: string,
  planDrillId: string,
  boardSnapshot: TacticalBoardDocumentV1,
) {
  return request<PlanDrill>(
    `/training-plans/${planId}/drills/${planDrillId}/board`,
    {
      method: 'PUT',
      body: JSON.stringify({ boardSnapshot }),
    },
  );
}

export function updateMatchTacticalBoard(
  matchId: string,
  tacticalBoard: TacticalBoardDocumentV1,
) {
  return request<Match>(`/seasons/matches/${matchId}/tactical-board`, {
    method: 'PUT',
    body: JSON.stringify({ tacticalBoard }),
  });
}
