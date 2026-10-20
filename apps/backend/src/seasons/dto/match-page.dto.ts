import { BadRequestException } from '@nestjs/common';
import { isISO8601 } from 'class-validator';
import type { Prisma } from '@prisma/client';

const invalid = () => new BadRequestException('Invalid match page query');
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
function timestamp(value: unknown): Date {
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
export function parseMatchPageQuery(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw invalid();
  const q = input as Record<string, unknown>;
  if (
    Object.keys(q).some(
      (key) =>
        !['groupId', 'seasonId', 'limit', 'after', 'from', 'until'].includes(
          key,
        ),
    )
  )
    throw invalid();
  const groupId = identifier(q.groupId);
  const seasonId =
    q.seasonId === undefined ? undefined : identifier(q.seasonId);
  const limit = q.limit === undefined ? '25' : q.limit;
  if (
    typeof limit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(limit) ||
    +limit > 100
  )
    throw invalid();
  let period: { from: Date; until: Date } | undefined;
  if (q.from !== undefined || q.until !== undefined) {
    const from = timestamp(q.from);
    const until = timestamp(q.until);
    if (
      until.getTime() <= from.getTime() ||
      until.getTime() - from.getTime() > 8 * 86400000
    )
      throw invalid();
    period = { from, until };
  }
  let after: { id: string; date: Date } | undefined;
  if (q.after !== undefined) {
    if (
      typeof q.after !== 'string' ||
      q.after.length > 512 ||
      !/^[A-Za-z0-9_-]+$/.test(q.after)
    )
      throw invalid();
    try {
      const value = JSON.parse(
        Buffer.from(q.after, 'base64url').toString('utf8'),
      ) as Record<string, unknown>;
      if (
        !value ||
        Array.isArray(value) ||
        Object.keys(value).sort().join(',') !== 'date,id'
      )
        throw invalid();
      after = { id: identifier(value.id), date: timestamp(value.date) };
    } catch {
      throw invalid();
    }
  }
  return { groupId, seasonId, limit: +limit, period, after };
}
export function parseMatchDetailQuery(matchId: unknown, input: unknown) {
  const query = parseMatchPageQuery(input);
  if (
    Object.keys(input as object).some(
      (key) => !['groupId', 'seasonId'].includes(key),
    )
  )
    throw invalid();
  return {
    id: identifier(matchId),
    groupId: query.groupId,
    seasonId: query.seasonId,
  };
}
export function matchBoundary(
  after: ReturnType<typeof parseMatchPageQuery>['after'],
): Prisma.MatchWhereInput {
  return after
    ? {
        OR: [
          { date: { gt: after.date } },
          { date: after.date, id: { gt: after.id } },
        ],
      }
    : {};
}
export function matchCursor(row: { id: string; date: Date }) {
  return Buffer.from(
    JSON.stringify({ id: row.id, date: row.date.toISOString() }),
  ).toString('base64url');
}
