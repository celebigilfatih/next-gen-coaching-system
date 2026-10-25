import { BadRequestException } from '@nestjs/common';
import { isISO8601 } from 'class-validator';
import type { Prisma } from '@prisma/client';

const invalid = () =>
  new BadRequestException('Invalid training plan page query');
function identifier(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.length ||
    value.length > 160 ||
    value.trim() !== value ||
    [...value].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127)
  )
    throw invalid();
  return value;
}
function timestamp(value: unknown): Date | null {
  if (value === null) return null;
  if (
    typeof value !== 'string' ||
    value.length > 40 ||
    !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
    !isISO8601(value, { strict: true }) ||
    !Number.isFinite(Date.parse(value))
  )
    throw invalid();
  return new Date(value);
}
export function parseTrainingPlanPageQuery(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw invalid();
  const query = input as Record<string, unknown>;
  if (
    Object.keys(query).some(
      (key) =>
        !['groupId', 'seasonId', 'limit', 'after', 'from', 'until'].includes(
          key,
        ),
    )
  )
    throw invalid();
  const groupId = identifier(query.groupId);
  const seasonId =
    query.seasonId === undefined ? undefined : identifier(query.seasonId);
  let period: { from: Date; until: Date } | undefined;
  if (query.from !== undefined || query.until !== undefined) {
    const from = timestamp(query.from);
    const until = timestamp(query.until);
    if (
      !from ||
      !until ||
      until.getTime() <= from.getTime() ||
      until.getTime() - from.getTime() > 8 * 86_400_000
    )
      throw invalid();
    period = { from, until };
  }
  const limit = query.limit ?? '25';
  if (
    typeof limit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(limit) ||
    Number(limit) > 100
  )
    throw invalid();
  let after: { id: string; date: Date | null } | undefined;
  if (query.after !== undefined) {
    if (
      typeof query.after !== 'string' ||
      query.after.length > 512 ||
      !/^[A-Za-z0-9_-]+$/.test(query.after)
    )
      throw invalid();
    try {
      const decoded = JSON.parse(
        Buffer.from(query.after, 'base64url').toString('utf8'),
      ) as Record<string, unknown>;
      if (
        !decoded ||
        Array.isArray(decoded) ||
        Object.keys(decoded).sort().join(',') !== 'date,id'
      )
        throw invalid();
      after = { id: identifier(decoded.id), date: timestamp(decoded.date) };
    } catch {
      throw invalid();
    }
  }
  return { groupId, seasonId, limit: Number(limit), after, period };
}
export function trainingPlanBoundary(
  after: ReturnType<typeof parseTrainingPlanPageQuery>['after'],
): Prisma.TrainingPlanWhereInput {
  if (!after) return {};
  if (after.date === null) return { date: null, id: { lt: after.id } };
  return {
    OR: [
      { date: { lt: after.date } },
      { date: after.date, id: { lt: after.id } },
      { date: null },
    ],
  };
}
export function trainingPlanCursor(row: { id: string; date: Date | null }) {
  return Buffer.from(
    JSON.stringify({ id: row.id, date: row.date?.toISOString() ?? null }),
  ).toString('base64url');
}
