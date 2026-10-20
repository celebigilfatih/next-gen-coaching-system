import { BadRequestException, ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { DAY, dayKey, midnight } from './planning-input';
import {
  physical,
  sessionPhases,
  templateEvents,
  type ProgramEvent,
} from './weekly-template';

type Tx = Prisma.TransactionClient;
const operation = 'PLANNING_AUTOMATION_V1';
export const planningClock = { today: () => dayKey(new Date()) };
export type AutomationEntry = {
  key: string;
  event?: ProgramEvent;
  dayId?: string;
  planId?: string | null;
  fingerprint?: string;
  protected?: boolean;
  retired?: boolean;
};
export type AutomationState = {
  seasonId: string;
  weekStart: string;
  revision: number;
  entries: AutomationEntry[];
};
export type PlanningSyncResult = {
  status: 'updated' | 'not-enrolled';
  updated: number;
  created: number;
  retired: number;
  protected: number;
  weeks: string[];
};
const include = Prisma.validator<Prisma.DayPlanInclude>()({
  trainingPlan: {
    include: {
      drills: {
        include: { drill: true },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      },
      _count: { select: { attendance: true, dayPlans: true } },
    },
  },
});
export type AutomationDay = Prisma.DayPlanGetPayload<{
  include: typeof include;
}>;
function canonical(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => [key, canonical(v)]),
    );
  return value;
}
function without(value: object, fields: string[]) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !fields.includes(key)),
  );
}
export function fingerprint(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}
export function readAutomationDay(tx: Tx, id: string) {
  return tx.dayPlan.findUnique({ where: { id }, include });
}
export async function captureEntry(
  tx: Tx,
  event: ProgramEvent,
  dayId: string,
): Promise<AutomationEntry> {
  const row = await readAutomationDay(tx, dayId);
  if (!row) throw new ConflictException('Program kaydı bulunamadı.');
  return {
    key: event.key,
    event,
    dayId,
    planId: row.trainingPlanId,
    fingerprint: fingerprint(row),
  };
}
export async function loadAutomation(tx: Tx, seasonId: string, clubId: string) {
  const rows = await tx.securityAuditEvent.findMany({
    where: {
      clubId,
      action: 'WEEK_PLANNING_APPLIED',
      AND: [
        { metadata: { path: ['operation'], equals: operation } },
        { metadata: { path: ['seasonId'], equals: seasonId } },
      ],
    },
    select: { metadata: true },
  });
  const states = new Map<string, AutomationState>();
  for (const row of rows) {
    const state = row.metadata as unknown as AutomationState;
    if (
      !Array.isArray(state.entries) ||
      !Number.isSafeInteger(state.revision) ||
      state.revision < 1
    )
      throw new ConflictException('Otomatik program kaynağı doğrulanamadı.');
    const previous = states.get(state.weekStart);
    if (!previous || previous.revision < state.revision)
      states.set(state.weekStart, state);
  }
  return states;
}
export async function appendAutomation(
  tx: Tx,
  actor: AuthPrincipal,
  clubId: string,
  state: AutomationState,
) {
  await tx.securityAuditEvent.create({
    data: {
      action: 'WEEK_PLANNING_APPLIED',
      actorId: actor.id,
      clubId,
      metadata: JSON.parse(
        JSON.stringify({ operation, ...state }),
      ) as Prisma.InputJsonValue,
    },
  });
}
export function calendarMonday(date: Date) {
  const local = midnight(dayKey(date));
  const weekday = new Date(local.getTime() + 3 * 3_600_000).getUTCDay() || 7;
  return dayKey(new Date(local.getTime() - (weekday - 1) * DAY));
}
export function shouldProtect(
  entry: AutomationEntry,
  row: AutomationDay | null,
  today: string,
) {
  return !!(
    entry.protected ||
    !row ||
    row.completed ||
    dayKey(row.date) < today ||
    row.trainingPlan?._count.attendance ||
    (row.trainingPlan && row.trainingPlan._count.dayPlans !== 1) ||
    fingerprint(row) !== entry.fingerprint
  );
}
/** Strict adoption of the known original rollout, never a current-value baseline of arbitrary data. */
export function matchesOriginal(
  row: AutomationDay | null,
  event: ProgramEvent,
  ownerId: string,
  clubId: string,
  groupId: string,
) {
  if (!row || row.createdAt.getTime() !== row.updatedAt.getTime()) return false;
  const trainingPlan = row.trainingPlan;
  const day = without(row, [
    'id',
    'weekId',
    'createdAt',
    'updatedAt',
    'trainingPlan',
    'trainingPlanId',
  ]);
  if (
    fingerprint(day) !==
    fingerprint({
      dayOfWeek:
        new Date(`${dayKey(event.startsAt)}T12:00:00Z`).getUTCDay() || 7,
      date: event.startsAt,
      type: event.kind,
      title: event.title,
      drillIds: null,
      duration: event.duration,
      intensity: null,
      notes: event.notes,
      location: event.location,
      topic: event.topic,
      opponent: null,
      competition: null,
      completed: false,
    })
  )
    return false;
  if (!physical(event.kind)) return !trainingPlan;
  if (
    !trainingPlan ||
    trainingPlan.createdAt.getTime() !== trainingPlan.updatedAt.getTime() ||
    trainingPlan._count.attendance ||
    trainingPlan._count.dayPlans !== 1
  )
    return false;
  const drills = trainingPlan.drills;
  const plan = without(trainingPlan, [
    'id',
    'createdAt',
    'updatedAt',
    'drills',
    '_count',
  ]);
  if (
    fingerprint(plan) !==
    fingerprint({
      title: event.title,
      clubId,
      coachId: ownerId,
      totalDuration: event.duration,
      groupId,
      date: event.startsAt,
      notes: event.notes,
    })
  )
    return false;
  const expected = sessionPhases('SENIOR', event.title, event.duration);
  if (drills.length !== expected.length) return false;
  return drills.every((phase, index) => {
    const target = expected[index];
    const { createdAt, updatedAt } = phase.drill;
    const drill = without(phase.drill, ['id', 'createdAt', 'updatedAt']);
    return (
      createdAt.getTime() === updatedAt.getTime() &&
      !phase.boardSnapshot &&
      !phase.contentSnapshot &&
      phase.phase === target.phase &&
      phase.order === target.order &&
      phase.notes === target.notes &&
      fingerprint(drill) ===
        fingerprint({
          title: target.title.slice(0, 120),
          category: target.phase,
          ageGroup: 'SENIOR',
          durationMin: target.duration,
          difficulty: 'EASY',
          equipment: 'Top ve işaret konileri',
          imageUrl: null,
          scope: 'CLUB',
          clubId,
          groupId,
          createdById: ownerId,
          jsonData: {
            schemaVersion: 1,
            kind: 'tactical-board',
            pitch: { type: 'full', width: 1200, height: 800 },
            elements: [],
          },
        })
    );
  });
}
type Callbacks = {
  create: (event: ProgramEvent) => Promise<{ id: string }>;
  update: (
    event: ProgramEvent,
    row: AutomationDay,
    contentChanged: boolean,
  ) => Promise<void>;
};
/** Called only inside the authorized Serializable match mutation. */
export async function reconcileFixture(
  tx: Tx,
  actor: AuthPrincipal,
  oldMatch: { id: string; seasonId: string; date: Date },
  nextDate: Date,
  callbacks: Callbacks,
): Promise<PlanningSyncResult> {
  const result: PlanningSyncResult = {
    status: 'not-enrolled',
    updated: 0,
    created: 0,
    retired: 0,
    protected: 0,
    weeks: [],
  };
  const season = await tx.season.findUniqueOrThrow({
    where: { id: oldMatch.seasonId },
    include: { group: true },
  });
  if (season.group.ageGroup !== 'SENIOR') return result;
  const states = await loadAutomation(tx, season.id, season.clubId);
  const affected = new Set(
    [oldMatch.date, nextDate].flatMap((date) =>
      [-7, 0, 7].map((offset) =>
        calendarMonday(new Date(date.getTime() + offset * DAY)),
      ),
    ),
  );
  const weeks = [...affected].filter((week) => states.has(week)).sort();
  if (!weeks.length) return result;
  result.status = 'updated';
  result.weeks = weeks;
  const today = planningClock.today();
  const from = midnight(weeks[0]),
    until = new Date(midnight(weeks.at(-1)!).getTime() + 7 * DAY);
  const matches = await tx.match.findMany({
    where: {
      seasonId: season.id,
      date: {
        gte: new Date(from.getTime() - 7 * DAY),
        lt: new Date(until.getTime() + 7 * DAY),
      },
    },
    orderBy: { date: 'asc' },
  });
  const cleanDayIds: string[] = [],
    cleanPlanIds: string[] = [];
  const work: Array<{
    state: AutomationState;
    entries: AutomationEntry[];
    desired: ProgramEvent[];
    clean: Map<string, AutomationDay>;
  }> = [];
  for (const weekStart of weeks) {
    let desired: ProgramEvent[];
    try {
      desired = templateEvents(season.id, 'SENIOR', weekStart, matches);
    } catch (error) {
      if (!(error instanceof BadRequestException)) throw error;
      throw new ConflictException(
        `Otomatik program hazırlanamadı. Maç tarihi kaydedilmedi. ${error.message}`,
      );
    }
    desired = desired.filter(
      (event) =>
        dayKey(event.startsAt) >= dayKey(season.startDate) &&
        dayKey(event.startsAt) <= dayKey(season.endDate) &&
        dayKey(event.startsAt) >= today,
    );
    const state = states.get(weekStart)!;
    const entries = state.entries.map((entry) => ({ ...entry }));
    const clean = new Map<string, AutomationDay>();
    for (const entry of entries) {
      if (entry.retired) continue;
      const row = entry.dayId ? await readAutomationDay(tx, entry.dayId) : null;
      if (shouldProtect(entry, row, today)) {
        entry.protected = true;
        result.protected++;
      } else {
        clean.set(entry.key, row!);
        cleanDayIds.push(row!.id);
        if (row!.trainingPlanId) cleanPlanIds.push(row!.trainingPlanId);
      }
    }
    work.push({
      state,
      entries,
      desired: desired.filter(
        (event) =>
          !entries.some((entry) => entry.key === event.key && entry.protected),
      ),
      clean,
    });
  }
  const [plans, days] = await Promise.all([
    tx.trainingPlan.findMany({
      where: {
        clubId: season.clubId,
        groupId: season.groupId,
        date: { gte: from, lt: until },
        id: { notIn: cleanPlanIds },
      },
      select: { date: true, totalDuration: true },
    }),
    tx.dayPlan.findMany({
      where: {
        week: { seasonId: season.id },
        date: { gte: from, lt: until },
        trainingPlanId: null,
        id: { notIn: cleanDayIds },
      },
      select: { date: true, duration: true },
    }),
  ]);
  const fixed = [
    ...plans.map((plan) => ({
      start: plan.date!.getTime(),
      duration: Math.max(1, plan.totalDuration),
    })),
    ...days.map((day) => ({
      start: day.date.getTime(),
      duration: Math.max(1, day.duration ?? 1),
    })),
  ];
  const generated = work
    .flatMap((item) => item.desired)
    .map((event) => ({
      start: Date.parse(event.startsAt),
      duration: event.duration,
    }));
  const fixtures = matches.map((match) => ({
    start: match.date.getTime(),
    duration: 120,
  }));
  const overlaps = (
    a: { start: number; duration: number },
    b: { start: number; duration: number },
  ) =>
    a.start < b.start + b.duration * 60_000 &&
    b.start < a.start + a.duration * 60_000;
  if (
    generated.some((event, index) =>
      [...fixed, ...fixtures, ...generated.slice(0, index)].some((other) =>
        overlaps(event, other),
      ),
    ) ||
    fixed.some((event) =>
      overlaps(event, { start: nextDate.getTime(), duration: 120 }),
    )
  )
    throw new ConflictException(
      'Yeni maç programı mevcut veya elle düzenlenmiş bir kayıtla çakışıyor. Maç tarihi ve program değiştirilmedi. Çakışmayı düzenleyip tekrar deneyin.',
    );

  for (const item of work) {
    for (const entry of item.entries) {
      const row = item.clean.get(entry.key);
      const target = item.desired.find((event) => event.key === entry.key);
      if (row && (!target || physical(row.type) !== physical(target.kind))) {
        await tx.dayPlan.delete({ where: { id: row.id } });
        if (row.trainingPlanId) {
          await tx.planDrill.deleteMany({
            where: { trainingPlanId: row.trainingPlanId },
          });
          await tx.trainingPlan.delete({ where: { id: row.trainingPlanId } });
        }
        entry.dayId = undefined;
        entry.planId = undefined;
        entry.fingerprint = undefined;
        entry.retired = true;
        result.retired++;
      }
    }
    for (const event of item.desired) {
      let entry = item.entries.find((value) => value.key === event.key);
      if (!entry) {
        entry = { key: event.key };
        item.entries.push(entry);
      }
      if (entry.protected) continue;
      if (!entry.dayId) {
        const created = await callbacks.create(event);
        Object.assign(entry, await captureEntry(tx, event, created.id), {
          retired: false,
        });
        result.created++;
      } else if (fingerprint(entry.event) !== fingerprint(event)) {
        const previous = entry.event!;
        const contentChanged =
          previous.title !== event.title ||
          previous.duration !== event.duration ||
          previous.kind !== event.kind ||
          previous.notes !== event.notes;
        await callbacks.update(
          event,
          item.clean.get(event.key)!,
          contentChanged,
        );
        Object.assign(entry, await captureEntry(tx, event, entry.dayId));
        result.updated++;
      }
    }
    await appendAutomation(tx, actor, season.clubId, {
      ...item.state,
      revision: item.state.revision + 1,
      entries: item.entries,
    });
  }
  return result;
}
