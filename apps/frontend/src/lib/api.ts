import {
  clearSession,
  getSession,
  setSession,
  type SessionUser,
} from './session';

const apiBase = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
).replace(/\/$/, '');

type LoginResponse = {
  access_token: string;
  user: SessionUser;
};

export type Group = {
  id: string;
  name: string;
  ageGroup: string;
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
};

export type DrillPhase = 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';

export type Drill = {
  id: string;
  title: string;
  category: DrillPhase;
  ageGroup: string;
  durationMin: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
};

export type PlanDrill = {
  id: string;
  drillId: string;
  phase: DrillPhase;
  order: number;
  notes: string | null;
  drill: Drill;
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
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function login(email: string, password: string) {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setSession({ token: response.access_token, user: response.user });
  return response.user;
}

export function listGroups() {
  return request<Group[]>('/groups');
}

export function listGroupMembers(groupId: string) {
  return request<GroupMember[]>(`/groups/${groupId}/members`);
}

export function listSeasons() {
  return request<Season[]>('/seasons');
}

export function listMatches(seasonId: string) {
  return request<Match[]>(`/seasons/${seasonId}/matches`);
}

export function listDrills(ageGroup: string) {
  const query = new URLSearchParams({ ageGroup });
  return request<Drill[]>(`/drills?${query.toString()}`);
}

export function listTrainingPlans(groupId: string) {
  const query = new URLSearchParams({ groupId });
  return request<TrainingPlan[]>(`/training-plans?${query.toString()}`);
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
    totalDuration?: number;
    groupId?: string;
    date?: string;
    notes?: string;
  },
) {
  return request<TrainingPlan>(`/training-plans/${planId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
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
