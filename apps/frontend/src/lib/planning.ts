export type PlanningKind =
  | 'TRAINING'
  | 'RECOVERY'
  | 'TACTICAL'
  | 'TOPLANTI'
  | 'REST';
export const planningLabels: Record<PlanningKind | 'MATCH', string> = {
  TRAINING: 'Antrenman',
  RECOVERY: 'Toparlanma',
  TACTICAL: 'Taktik çalışma',
  TOPLANTI: 'Toplantı',
  REST: 'İzin / dinlenme',
  MATCH: 'Maç',
};
export type PlanningEvent = {
  id: string;
  source: 'plan' | 'match' | 'event';
  kind: PlanningKind | 'MATCH';
  title: string;
  date: string;
  duration: number;
  notes: string | null;
  location: string | null;
  topic: string | null;
  completed: boolean;
};
export type PlanningPage = {
  items: PlanningEvent[];
  nextCursor: string | null;
  limit: number;
  summary: {
    total: number;
    trainingCount: number;
    trainingMinutes: number;
    meetingCount: number;
    matchCount: number;
  };
};
export type PlanningTeam = {
  seasonId: string;
  groupId: string;
  name: string;
  ageGroup: string;
};
export type ProgramInput = {
  weekStart: string;
  seasonIds: string[];
  overrides: Array<{ key: string; excluded: boolean; startsAt?: string }>;
};
export type ProgramEvent = {
  phases?: Array<{
    phase: string;
    title: string;
    duration: number;
    notes: string;
  }>;
  key: string;
  seasonId: string;
  kind: PlanningKind;
  title: string;
  startsAt: string;
  duration: number;
  notes: string;
  topic: string;
  location: string;
};
export type ProgramPreview = {
  token: string;
  input: ProgramInput;
  conflicts: string[];
  teams: Array<
    PlanningTeam & {
      events: ProgramEvent[];
      matches: Array<{ id: string; date: string; opponent: string }>;
      applied: boolean;
    }
  >;
};
export type PlanningResult = {
  state: 'completed';
  requestId: string;
  teamCount: number;
  eventCount: number;
  trainingCount: number;
  meetingCount: number;
  eventIds: string[];
  planIds: string[];
};
export type ApplyProgram = {
  requestId: string;
  previewToken: string;
  program: ProgramInput;
};
export type PlanningEventInput = {
  requestId?: string;
  seasonId: string;
  kind: PlanningKind;
  title: string;
  startsAt: string;
  duration: number;
  notes: string;
  location: string;
  topic: string;
};
export const planningRequestPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function localInput(value: string) {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function planningTime(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
