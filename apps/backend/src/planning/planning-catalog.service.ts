import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthorizationService } from '../auth/authorization.service';
import type { AuthPrincipal } from '../auth/auth-principal';
import { PrismaService } from '../prisma/prisma.service';
import { DAY, dayKey, instant, midnight, object, text } from './planning-input';

export type PlanningEvent = {
  id: string;
  source: 'plan' | 'match' | 'event';
  kind: string;
  title: string;
  date: Date;
  duration: number;
  notes: string | null;
  location: string | null;
  topic: string | null;
  completed: boolean;
};
type EventCursor = { date: string; source: string; id: string; scope: string };
@Injectable()
export class PlanningCatalogService {
  constructor(
    private readonly db: PrismaService,
    private readonly auth: AuthorizationService,
  ) {}
  async page(actor: AuthPrincipal, input: unknown) {
    const q = object(input, [
      'groupId',
      'seasonId',
      'from',
      'until',
      'after',
      'limit',
    ]);
    const group = await this.auth.assertGroupView(actor, text(q.groupId));
    let from = new Date(instant(q.from));
    let until = new Date(instant(q.until));
    if (until <= from || until.getTime() - from.getTime() > 7 * DAY)
      throw new BadRequestException('En fazla yedi günlük aralık seçin.');
    const seasonId = q.seasonId === undefined ? null : text(q.seasonId);
    if (seasonId) {
      await this.auth.assertSeasonView(actor, seasonId);
      const season = await this.db.season.findUniqueOrThrow({
        where: { id: seasonId },
      });
      if (season.groupId !== group.id || season.clubId !== group.clubId)
        throw new BadRequestException('Sezon takım ile eşleşmiyor.');
      from = new Date(
        Math.max(from.getTime(), midnight(dayKey(season.startDate)).getTime()),
      );
      until = new Date(
        Math.min(
          until.getTime(),
          midnight(dayKey(season.endDate)).getTime() + DAY,
        ),
      );
    }
    const limit = q.limit === undefined ? 25 : Number(q.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50)
      throw new BadRequestException('Geçersiz sayfa boyutu.');
    let cursor: EventCursor | null = null;
    const scope = JSON.stringify([
      group.id,
      seasonId,
      from.toISOString(),
      until.toISOString(),
    ]);
    if (q.after !== undefined) {
      try {
        cursor = JSON.parse(
          Buffer.from(text(q.after, 1500), 'base64url').toString(),
        ) as EventCursor;
        if (
          !cursor ||
          cursor.scope !== scope ||
          !['plan', 'match', 'event'].includes(cursor.source) ||
          typeof cursor.id !== 'string' ||
          cursor.id.length > 128
        )
          throw new Error();
        instant(cursor.date);
      } catch {
        throw new BadRequestException('Geçersiz etkinlik sayfası.');
      }
    }
    const cte = Prisma.sql`WITH events AS (
      SELECT p.id, 'plan'::text source, COALESCE(d.type::text,'TRAINING') kind, p.title, p.date,
        p."totalDuration" duration, p.notes, d.location, d.topic, COALESCE(d.completed,false) completed
      FROM "TrainingPlan" p LEFT JOIN LATERAL (
        SELECT d.type,d.location,d.topic,d.completed FROM "DayPlan" d JOIN "WeekPlan" w ON w.id=d."weekId"
        JOIN "Season" s ON s.id=w."seasonId" WHERE d."trainingPlanId"=p.id AND s."groupId"=${group.id}
        AND (${seasonId}::text IS NULL OR s.id=${seasonId}) AND d.type::text <> 'GORUSME' ORDER BY d.id LIMIT 1
      ) d ON true WHERE p."clubId"=${group.clubId} AND p."groupId"=${group.id} AND p.date >= ${from} AND p.date < ${until}
      UNION ALL
      SELECT m.id,'match'::text,'MATCH'::text,m.opponent,m.date,0,m.notes,m.location,NULL::text,false FROM "Match" m
      JOIN "Season" s ON s.id=m."seasonId" WHERE s."clubId"=${group.clubId} AND s."groupId"=${group.id}
      AND (${seasonId}::text IS NULL OR s.id=${seasonId}) AND m.date >= ${from} AND m.date < ${until}
      UNION ALL
      SELECT d.id,'event'::text,d.type::text,COALESCE(d.title,'Etkinlik'),d.date,COALESCE(d.duration,0),d.notes,d.location,d.topic,d.completed
      FROM "DayPlan" d JOIN "WeekPlan" w ON w.id=d."weekId" JOIN "Season" s ON s.id=w."seasonId"
      WHERE s."clubId"=${group.clubId} AND s."groupId"=${group.id} AND d."trainingPlanId" IS NULL AND d.type::text <> 'GORUSME'
      AND (${seasonId}::text IS NULL OR s.id=${seasonId}) AND d.date >= ${from} AND d.date < ${until}
    )`;
    const boundary = cursor
      ? Prisma.sql`WHERE (date,source,id) > (${new Date(cursor.date)},${cursor.source},${cursor.id})`
      : Prisma.empty;
    const [rows, totals] = await Promise.all([
      this.db.$queryRaw<PlanningEvent[]>(
        Prisma.sql`${cte} SELECT * FROM events ${boundary} ORDER BY date,source,id LIMIT ${limit + 1}`,
      ),
      this.db.$queryRaw<
        {
          total: number;
          trainingCount: number;
          trainingMinutes: number;
          meetingCount: number;
          matchCount: number;
        }[]
      >(Prisma.sql`${cte}
        SELECT count(*)::int total,
        count(*) FILTER (WHERE source='plan' OR kind IN ('TRAINING','RECOVERY','TACTICAL'))::int "trainingCount",
        COALESCE(sum(duration) FILTER (WHERE source='plan' OR kind IN ('TRAINING','RECOVERY','TACTICAL')),0)::int "trainingMinutes",
        count(*) FILTER (WHERE kind='TOPLANTI')::int "meetingCount", count(*) FILTER (WHERE kind='MATCH')::int "matchCount" FROM events`),
    ]);
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    return {
      items,
      summary: totals[0],
      nextCursor:
        rows.length > limit && last
          ? Buffer.from(
              JSON.stringify({
                date: last.date.toISOString(),
                source: last.source,
                id: last.id,
                scope,
              }),
            ).toString('base64url')
          : null,
      limit,
    };
  }
}
