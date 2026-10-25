import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import { legacyWrite } from '../sporting/legacy-compatibility';
import {
  appendAutomation,
  captureEntry,
  reconcileFixture,
  type AutomationDay,
  type AutomationEntry,
} from './planning-automation';
import {
  DAY,
  dayKey,
  eventInput,
  midnight,
  object,
  programInput,
  requestId,
  text,
  type ProgramInput,
} from './planning-input';
import {
  physical,
  sessionPhases,
  templateEvents,
  templateVersion,
  type ProgramEvent,
} from './weekly-template';

type Tx = Prisma.TransactionClient;
const hash = (v: unknown) =>
  createHash('sha256').update(JSON.stringify(v)).digest('hex');
type PlanningResult = {
  state: 'completed';
  requestId: string;
  teamCount: number;
  eventCount: number;
  trainingCount: number;
  meetingCount: number;
  eventIds: string[];
  planIds: string[];
};
@Injectable()
export class PlanningService {
  private readonly log = new Logger(PlanningService.name);
  constructor(private readonly db: PrismaService) {}
  private auth(tx: Tx) {
    return new AuthorizationService(tx as PrismaService);
  }
  private async write<T>(actor: AuthPrincipal, work: (tx: Tx) => Promise<T>) {
    if (actor.role === 'PLAYER') throw new ForbiddenException();
    try {
      return await legacyWrite(this.db, async (tx) => {
        await tx.$executeRaw`SELECT id FROM "User" WHERE id=${actor.id} FOR SHARE`;
        const current = await tx.user.findUnique({
          where: { id: actor.id },
          select: { role: true, status: true, clubId: true },
        });
        if (
          !current ||
          current.status !== 'ACTIVE' ||
          current.role !== actor.role ||
          current.clubId !== actor.clubId
        )
          throw new ForbiddenException();
        return work(tx);
      });
    } catch (e) {
      if (e instanceof HttpException) throw e;
      this.log.error('WEEK_PLANNING_FAILED');
      throw new InternalServerErrorException(
        'Planlama sonucu doğrulanamadı. Aynı isteğin durumunu kontrol edin.',
      );
    }
  }
  private async lock(tx: Tx, key: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key},0))`;
  }
  private requestKey(actor: AuthPrincipal, id: string) {
    return `planning_request_${hash([actor.id, requestId(id)])}`;
  }
  private slotKey(seasonId: string, weekStart: string) {
    return `planning_slot_${hash([seasonId, weekStart])}`;
  }
  private async saved(
    tx: Tx,
    actor: AuthPrincipal,
    id: string,
    bodyHash?: string,
  ) {
    const saved = await tx.securityAuditEvent.findUnique({
      where: { id: this.requestKey(actor, id) },
    });
    if (!saved) return null;
    const metadata = saved.metadata as {
      operation?: string;
      hash?: string;
      result?: PlanningResult;
      seasonIds?: string[];
    } | null;
    if (
      saved.action !== 'WEEK_PLANNING_APPLIED' ||
      saved.actorId !== actor.id ||
      metadata?.operation !== 'PLANNING_REQUEST_V1' ||
      !metadata.result ||
      !metadata.seasonIds?.length
    )
      throw new ConflictException('Planlama sonuç kaydı doğrulanamadı.');
    for (const seasonId of metadata.seasonIds)
      await this.auth(tx).assertSeasonManage(actor, seasonId);
    if (bodyHash && metadata.hash !== bodyHash)
      throw new ConflictException('Bu istek farklı bilgilerle tamamlanmış.');
    return metadata.result;
  }
  async status(actor: AuthPrincipal, id: string) {
    requestId(id);
    return this.write(actor, async (tx) => {
      await this.lock(tx, this.requestKey(actor, id));
      return (
        (await this.saved(tx, actor, id)) ?? { state: 'not-found' as const }
      );
    });
  }
  async teams(actor: AuthPrincipal, clubSeasonId: string) {
    text(clubSeasonId);
    const rows = await this.db.season.findMany({
      where: { teamSeason: { clubSeasonId } },
      select: {
        id: true,
        clubId: true,
        groupId: true,
        group: { select: { name: true, ageGroup: true } },
        teamSeason: { select: { team: { select: { archivedAt: true } } } },
      },
      orderBy: { id: 'asc' },
    });
    const items: {
      seasonId: string;
      groupId: string;
      name: string;
      ageGroup: string;
    }[] = [];
    for (const s of rows) {
      if (s.teamSeason?.team.archivedAt) continue;
      try {
        await this.auth(this.db).assertSeasonManage(actor, s.id);
        items.push({
          seasonId: s.id,
          groupId: s.groupId,
          name: s.group.name,
          ageGroup: s.group.ageGroup,
        });
      } catch (e) {
        if (!(e instanceof ForbiddenException)) throw e;
      }
    }
    return { items };
  }
  private async snapshot(tx: Tx, actor: AuthPrincipal, input: ProgramInput) {
    const from = midnight(input.weekStart),
      until = new Date(from.getTime() + 7 * DAY);
    const teams = [] as Array<{
      seasonId: string;
      groupId: string;
      clubId: string;
      name: string;
      ageGroup: string;
      events: ProgramEvent[];
      matches: { id: string; date: Date; opponent: string }[];
      fingerprint: unknown;
      applied: boolean;
    }>;
    for (const id of input.seasonIds) {
      await this.auth(tx).assertSeasonManage(actor, id);
      const season = await tx.season.findUniqueOrThrow({ where: { id } });
      const group = await tx.playerGroup.findUniqueOrThrow({
        where: { id: season.groupId },
      });
      if (group.archivedAt)
        throw new BadRequestException(
          'Arşivlenmiş takıma program uygulanamaz.',
        );
      if (season.teamSeasonId) {
        const team = await tx.teamSeason.findUnique({
          where: { id: season.teamSeasonId },
          select: { team: { select: { archivedAt: true } } },
        });
        if (team?.team.archivedAt)
          throw new BadRequestException(
            'Arşivlenmiş takıma program uygulanamaz.',
          );
      }
      const [matches, plans, days, slot] = await Promise.all([
        tx.match.findMany({
          where: {
            seasonId: id,
            date: {
              gte: new Date(from.getTime() - 7 * DAY),
              lt: new Date(until.getTime() + 7 * DAY),
            },
          },
          select: { id: true, date: true, opponent: true, updatedAt: true },
          orderBy: { id: 'asc' },
        }),
        tx.trainingPlan.findMany({
          where: {
            clubId: season.clubId,
            groupId: season.groupId,
            date: { gte: from, lt: until },
          },
          select: {
            id: true,
            date: true,
            totalDuration: true,
            updatedAt: true,
          },
          orderBy: { id: 'asc' },
        }),
        tx.dayPlan.findMany({
          where: { week: { seasonId: id }, date: { gte: from, lt: until } },
          select: {
            id: true,
            date: true,
            duration: true,
            updatedAt: true,
            trainingPlanId: true,
            type: true,
          },
          orderBy: { id: 'asc' },
        }),
        tx.securityAuditEvent.findUnique({
          where: { id: this.slotKey(id, input.weekStart) },
          select: { id: true },
        }),
      ]);
      const events = templateEvents(
        id,
        group.ageGroup,
        input.weekStart,
        matches,
      ).filter(
        (event) =>
          dayKey(event.startsAt) >= dayKey(season.startDate) &&
          dayKey(event.startsAt) <= dayKey(season.endDate),
      );
      teams.push({
        seasonId: id,
        groupId: group.id,
        clubId: season.clubId,
        name: group.name,
        ageGroup: group.ageGroup,
        events,
        matches: matches.filter((m) => m.date >= from && m.date < until),
        applied: !!slot,
        fingerprint: {
          season: {
            id: season.id,
            startDate: season.startDate,
            endDate: season.endDate,
            updatedAt: season.updatedAt,
          },
          group: { ageGroup: group.ageGroup, updatedAt: group.updatedAt },
          matches,
          plans,
          days,
        },
      });
    }
    if (
      new Set(teams.map((t) => t.clubId)).size !== 1 ||
      new Set(teams.map((t) => t.groupId)).size !== teams.length
    )
      throw new BadRequestException(
        'Aynı kulüpte her takım için tek sezon seçin.',
      );
    const known = new Set(teams.flatMap((t) => t.events.map((e) => e.key)));
    if (input.overrides.some((o) => !known.has(o.key)))
      throw new BadRequestException('Bilinmeyen program satırı.');
    const conflicts: string[] = [];
    for (const team of teams) {
      if (team.applied)
        conflicts.push(`${team.name}: bu haftaya program zaten uygulanmış.`);
      team.events = team.events.flatMap((event) => {
        const change = input.overrides.find((o) => o.key === event.key);
        return change?.excluded
          ? []
          : [{ ...event, startsAt: change?.startsAt ?? event.startsAt }];
      });
      const season = await tx.season.findUniqueOrThrow({
        where: { id: team.seasonId },
      });
      for (const event of team.events) {
        const stamp = new Date(event.startsAt).getTime();
        if (
          stamp < from.getTime() ||
          stamp + event.duration * 60_000 > until.getTime() ||
          dayKey(event.startsAt) < dayKey(season.startDate) ||
          dayKey(new Date(stamp + event.duration * 60_000 - 1)) >
            dayKey(season.endDate)
        )
          conflicts.push(
            `${team.name}: ${event.title} seçili hafta/sezon dışında.`,
          );
      }
      const fp = team.fingerprint as {
        plans: { id: string; date: Date | null; totalDuration: number }[];
        days: {
          id: string;
          date: Date;
          duration: number | null;
          trainingPlanId: string | null;
        }[];
      };
      const blocks = [
        ...team.matches.map((m) => ({
          key: m.id,
          title: `Maç: ${m.opponent}`,
          date: m.date,
          duration: 120,
        })),
        ...fp.plans.map((p) => ({
          key: p.id,
          title: 'Mevcut antrenman',
          date: p.date!,
          duration: Math.max(1, p.totalDuration),
        })),
        ...fp.days
          .filter((d) => !d.trainingPlanId)
          .map((d) => ({
            key: d.id,
            title: 'Mevcut etkinlik',
            date: d.date,
            duration: Math.max(1, d.duration ?? 1),
          })),
      ];
      for (let i = 0; i < team.events.length; i++) {
        const event = team.events[i];
        const other = [
          ...blocks,
          ...team.events.slice(0, i).map((e) => ({
            key: e.key,
            title: e.title,
            date: new Date(e.startsAt),
            duration: e.duration,
          })),
        ];
        const a = new Date(event.startsAt).getTime(),
          b = a + event.duration * 60_000;
        const hit = other.find(
          (o) =>
            a < o.date.getTime() + o.duration * 60_000 && b > o.date.getTime(),
        );
        if (hit)
          conflicts.push(
            `${team.name}: ${event.title} ile ${hit.title} çakışıyor.`,
          );
      }
    }
    const token = hash([
      templateVersion,
      input,
      teams.map((t) => [t.fingerprint, t.applied]),
    ]);
    return { token, input, teams, conflicts };
  }
  preview(actor: AuthPrincipal, input: unknown) {
    const parsed = programInput(input);
    return this.write(actor, async (tx) => {
      const preview = await this.snapshot(tx, actor, parsed);
      return {
        ...preview,
        teams: preview.teams.map(({ fingerprint: _f, ...team }) => ({
          ...team,
          events: team.events.map((event) => ({
            ...event,
            phases: physical(event.kind)
              ? sessionPhases(team.ageGroup, event.title, event.duration)
              : [],
          })),
        })),
      };
    });
  }
  async apply(actor: AuthPrincipal, input: unknown) {
    const body = object(input, ['requestId', 'previewToken', 'program']);
    const id = requestId(body.requestId),
      token = text(body.previewToken, 64),
      program = programInput(body.program);
    const bodyHash = hash({ token, program });
    return this.write(actor, async (tx) => {
      await this.lock(tx, this.requestKey(actor, id));
      const old = await this.saved(tx, actor, id, bodyHash);
      if (old) return old;
      for (const seasonId of program.seasonIds) {
        await this.lock(tx, `planning_events:${seasonId}`);
        await this.lock(tx, this.slotKey(seasonId, program.weekStart));
      }
      const preview = await this.snapshot(tx, actor, program);
      if (preview.token !== token)
        throw new ConflictException(
          'Takvim değişmiş. Yeni önizleme hazırlayın.',
        );
      if (preview.conflicts.length)
        throw new ConflictException(preview.conflicts.join(' '));
      if (!preview.teams.some((t) => t.events.length))
        throw new BadRequestException('En az bir etkinlik seçin.');
      const result: PlanningResult = {
        state: 'completed',
        requestId: id,
        teamCount: preview.teams.length,
        eventCount: 0,
        trainingCount: 0,
        meetingCount: 0,
        eventIds: [],
        planIds: [],
      };
      for (const team of preview.teams) {
        const entries: AutomationEntry[] = [];
        for (const event of team.events) {
          const saved = await this.persist(tx, actor, event, team.ageGroup);
          if (team.ageGroup === 'SENIOR') {
            const entry = await captureEntry(tx, event, saved.id);
            // An explicit preview time is a coach decision, not a template-owned time.
            if (
              program.overrides.some((o) => o.key === event.key && o.startsAt)
            )
              entry.protected = true;
            entries.push(entry);
          }
          result.eventIds.push(saved.id);
          if (saved.trainingPlanId) result.planIds.push(saved.trainingPlanId);
          result.eventCount++;
          if (physical(event.kind)) result.trainingCount++;
          if (event.kind === 'TOPLANTI') result.meetingCount++;
        }
        if (team.ageGroup === 'SENIOR') {
          entries.push(
            ...program.overrides
              .filter(
                (o) => o.excluded && o.key.startsWith(`${team.seasonId}:`),
              )
              .map((o) => ({ key: o.key, protected: true })),
          );
          await appendAutomation(tx, actor, team.clubId, {
            seasonId: team.seasonId,
            weekStart: program.weekStart,
            revision: 1,
            entries,
          });
        }
        await tx.securityAuditEvent.create({
          data: {
            id: this.slotKey(team.seasonId, program.weekStart),
            action: 'WEEK_PLANNING_APPLIED',
            actorId: actor.id,
            clubId: team.clubId,
            metadata: {
              operation: 'PLANNING_SLOT_V1',
              seasonId: team.seasonId,
              weekStart: program.weekStart,
              templateVersion,
            },
          },
        });
      }
      await this.record(
        tx,
        actor,
        id,
        bodyHash,
        program.seasonIds,
        preview.teams[0].clubId,
        result,
      );
      return result;
    });
  }
  private async record(
    tx: Tx,
    actor: AuthPrincipal,
    id: string,
    bodyHash: string,
    seasonIds: string[],
    clubId: string,
    result: PlanningResult,
  ) {
    await tx.securityAuditEvent.create({
      data: {
        id: this.requestKey(actor, id),
        action: 'WEEK_PLANNING_APPLIED',
        actorId: actor.id,
        clubId,
        metadata: {
          operation: 'PLANNING_REQUEST_V1',
          hash: bodyHash,
          seasonIds,
          result,
        },
      },
    });
  }
  private async week(tx: Tx, seasonId: string, date: Date) {
    const season = await tx.season.findUniqueOrThrow({
      where: { id: seasonId },
    });
    const dateDay = midnight(dayKey(date));
    const first = midnight(dayKey(season.startDate));
    if (dateDay < first || dayKey(date) > dayKey(season.endDate))
      throw new BadRequestException('Etkinlik sezon dışında.');
    const weekNumber =
      Math.floor((dateDay.getTime() - first.getTime()) / (7 * DAY)) + 1;
    const startDate = new Date(first.getTime() + (weekNumber - 1) * 7 * DAY);
    const endDate = new Date(
      Math.min(
        startDate.getTime() + 7 * DAY,
        midnight(dayKey(season.endDate)).getTime() + DAY,
      ) - 1,
    );
    const week = await tx.weekPlan.upsert({
      where: { seasonId_weekNumber: { seasonId, weekNumber } },
      create: { seasonId, weekNumber, startDate, endDate },
      update: {},
    });
    return { week, season };
  }
  reconcileMatch(
    tx: Tx,
    actor: AuthPrincipal,
    oldMatch: { id: string; seasonId: string; date: Date },
    date: Date,
  ) {
    return reconcileFixture(tx, actor, oldMatch, date, {
      create: (event) => this.persist(tx, actor, event, 'SENIOR'),
      update: (event, row, contentChanged) =>
        this.updateAutomatic(tx, actor, event, row, contentChanged),
    });
  }
  private async updateAutomatic(
    tx: Tx,
    actor: AuthPrincipal,
    event: ProgramEvent,
    row: AutomationDay,
    contentChanged: boolean,
  ) {
    const date = new Date(event.startsAt);
    const { week, season } = await this.week(tx, event.seasonId, date);
    if (row.trainingPlanId) {
      await tx.trainingPlan.update({
        where: { id: row.trainingPlanId },
        data: {
          date,
          title: event.title,
          notes: event.notes,
          totalDuration: event.duration,
        },
      });
      if (contentChanged) {
        await tx.planDrill.deleteMany({
          where: { trainingPlanId: row.trainingPlanId },
        });
        await this.phases(
          tx,
          actor,
          event,
          'SENIOR',
          season,
          row.trainingPlanId,
        );
      }
    }
    await tx.dayPlan.update({
      where: { id: row.id },
      data: {
        weekId: week.id,
        dayOfWeek: new Date(`${dayKey(date)}T12:00:00Z`).getUTCDay() || 7,
        date,
        type: event.kind,
        title: event.title,
        duration: event.duration,
        notes: event.notes,
        location: event.location,
        topic: event.topic,
      },
    });
  }
  private async phases(
    tx: Tx,
    actor: AuthPrincipal,
    event: ProgramEvent,
    age: string,
    season: { clubId: string; groupId: string },
    planId: string,
  ) {
    for (const phase of sessionPhases(age, event.title, event.duration)) {
      const drill = await tx.drill.create({
        data: {
          title: phase.title.slice(0, 120),
          category: phase.phase,
          ageGroup: age,
          durationMin: phase.duration,
          difficulty: 'EASY',
          equipment: 'Top ve işaret konileri',
          scope: 'CLUB',
          clubId: season.clubId,
          groupId: season.groupId,
          createdById: actor.id,
          jsonData: {
            schemaVersion: 1,
            kind: 'tactical-board',
            pitch: { type: 'full', width: 1200, height: 800 },
            elements: [],
          },
        },
      });
      await tx.planDrill.create({
        data: {
          trainingPlanId: planId,
          drillId: drill.id,
          phase: phase.phase,
          order: phase.order,
          notes: phase.notes,
        },
      });
    }
  }
  private async persist(
    tx: Tx,
    actor: AuthPrincipal,
    event: ProgramEvent,
    age: string,
  ) {
    const date = new Date(event.startsAt),
      { week, season } = await this.week(tx, event.seasonId, date);
    if (
      dayKey(new Date(date.getTime() + event.duration * 60_000 - 1)) >
      dayKey(season.endDate)
    )
      throw new BadRequestException('Etkinlik sezon dışında bitiyor.');
    let trainingPlanId: string | undefined;
    if (physical(event.kind)) {
      const plan = await tx.trainingPlan.create({
        data: {
          title: event.title,
          clubId: season.clubId,
          groupId: season.groupId,
          coachId: actor.id,
          date,
          notes: event.notes,
          totalDuration: event.duration,
        },
      });
      trainingPlanId = plan.id;
      await this.phases(tx, actor, event, age, season, plan.id);
    }
    const weekday = new Date(`${dayKey(date)}T12:00:00Z`).getUTCDay() || 7;
    return tx.dayPlan.create({
      data: {
        weekId: week.id,
        dayOfWeek: weekday,
        date,
        type: event.kind,
        title: event.title,
        trainingPlanId,
        duration: event.duration,
        notes: event.notes,
        location: event.location,
        topic: event.topic,
      },
    });
  }
  async createEvent(actor: AuthPrincipal, input: unknown) {
    const event = eventInput(input),
      id = event.requestId!;
    return this.write(actor, async (tx) => {
      await this.lock(tx, this.requestKey(actor, id));
      const old = await this.saved(tx, actor, id, hash(event));
      if (old) return old;
      const season = await this.auth(tx).assertSeasonManage(
        actor,
        event.seasonId,
      );
      await this.lock(tx, `planning_events:${event.seasonId}`);
      await this.assertFree(
        tx,
        event.seasonId,
        new Date(event.startsAt),
        event.duration,
      );
      const group = await tx.playerGroup.findUniqueOrThrow({
        where: { id: season.groupId },
      });
      const saved = await this.persist(
        tx,
        actor,
        { ...event, key: id },
        group.ageGroup,
      );
      const result: PlanningResult = {
        state: 'completed',
        requestId: id,
        teamCount: 1,
        eventCount: 1,
        trainingCount: physical(event.kind) ? 1 : 0,
        meetingCount: event.kind === 'TOPLANTI' ? 1 : 0,
        eventIds: [saved.id],
        planIds: saved.trainingPlanId ? [saved.trainingPlanId] : [],
      };
      await this.record(
        tx,
        actor,
        id,
        hash(event),
        [season.id],
        season.clubId,
        result,
      );
      return result;
    });
  }
  private async assertFree(
    tx: Tx,
    seasonId: string,
    date: Date,
    duration: number,
    except?: string,
  ) {
    const season = await tx.season.findUniqueOrThrow({
      where: { id: seasonId },
    });
    const from = new Date(date.getTime() - DAY),
      until = new Date(date.getTime() + duration * 60_000);
    const [days, plans, matches] = await Promise.all([
      tx.dayPlan.findMany({
        where: {
          week: { seasonId },
          date: { gte: from, lt: until },
          id: except ? { not: except } : undefined,
        },
        select: { date: true, duration: true, trainingPlanId: true },
      }),
      tx.trainingPlan.findMany({
        where: {
          groupId: season.groupId,
          clubId: season.clubId,
          date: { gte: from, lt: until },
        },
        select: { date: true, totalDuration: true },
      }),
      tx.match.findMany({
        where: { seasonId, date: { gte: from, lt: until } },
        select: { date: true },
      }),
    ]);
    if (
      [
        ...days
          .filter((d) => !d.trainingPlanId)
          .map((d) => ({ date: d.date, duration: d.duration ?? 1 })),
        ...plans.map((p) => ({
          date: p.date!,
          duration: Math.max(1, p.totalDuration),
        })),
        ...matches.map((m) => ({ date: m.date, duration: 120 })),
      ].some((e) => e.date.getTime() + e.duration * 60_000 > date.getTime())
    )
      throw new ConflictException('Bu saatte takımın başka bir etkinliği var.');
  }
  updateEvent(actor: AuthPrincipal, id: string, input: unknown) {
    const event = eventInput(input, false);
    return this.write(actor, async (tx) => {
      const old = await tx.dayPlan.findUnique({
        where: { id },
        include: { week: true },
      });
      if (!old) throw new NotFoundException();
      await this.auth(tx).assertDayManage(actor, id);
      if (
        old.trainingPlanId ||
        old.type === 'GORUSME' ||
        old.type === 'MATCH' ||
        old.week.seasonId !== event.seasonId ||
        event.kind !== old.type
      )
        throw new BadRequestException(
          'Bağlı antrenmanı kendi detayından düzenleyin; etkinlik türü/sezonu değişmez.',
        );
      await this.lock(tx, `planning_events:${event.seasonId}`);
      await this.assertFree(
        tx,
        event.seasonId,
        new Date(event.startsAt),
        event.duration,
        id,
      );
      const { week } = await this.week(
        tx,
        event.seasonId,
        new Date(event.startsAt),
      );
      if (
        dayKey(
          new Date(Date.parse(event.startsAt) + event.duration * 60_000 - 1),
        ) >
        dayKey(
          (await tx.season.findUniqueOrThrow({ where: { id: event.seasonId } }))
            .endDate,
        )
      )
        throw new BadRequestException('Etkinlik sezon dışında.');
      return tx.dayPlan.update({
        where: { id },
        data: {
          weekId: week.id,
          date: new Date(event.startsAt),
          dayOfWeek:
            new Date(`${dayKey(event.startsAt)}T12:00:00Z`).getUTCDay() || 7,
          title: event.title,
          duration: event.duration,
          notes: event.notes,
          location: event.location,
          topic: event.topic,
        },
      });
    });
  }
  deleteEvent(actor: AuthPrincipal, id: string) {
    return this.write(actor, async (tx) => {
      await this.auth(tx).assertDayManage(actor, id);
      const old = await tx.dayPlan.findUniqueOrThrow({ where: { id } });
      if (old.trainingPlanId || old.type === 'GORUSME' || old.type === 'MATCH')
        throw new BadRequestException('Bu kaydı kendi detayından yönetin.');
      return tx.dayPlan.delete({ where: { id } });
    });
  }
}
