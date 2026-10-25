import { BadRequestException } from '@nestjs/common';
import { isISO8601 } from 'class-validator';

const invalid = () => new BadRequestException('Invalid assignment page query');
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
export function parseAssignmentPageQuery(input: unknown, roster = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw invalid();
  const query = input as Record<string, unknown>;
  const allowed = [
    'asOf',
    'after',
    'limit',
    ...(roster ? ['teamSeasonId'] : []),
  ];
  if (Object.keys(query).some((k) => !allowed.includes(k))) throw invalid();
  const asOf = timestamp(query.asOf);
  const rawLimit = query.limit ?? '25';
  if (
    typeof rawLimit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(rawLimit) ||
    Number(rawLimit) > 100
  )
    throw invalid();
  let after: { id: string; validFrom: Date } | undefined;
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
        Object.keys(decoded).sort().join(',') !== 'id,validFrom'
      )
        throw invalid();
      after = {
        id: identifier(decoded.id),
        validFrom: timestamp(decoded.validFrom),
      };
    } catch {
      throw invalid();
    }
  }
  return {
    asOf,
    limit: Number(rawLimit),
    after,
    teamSeasonId:
      query.teamSeasonId === undefined
        ? undefined
        : identifier(query.teamSeasonId),
  };
}
export type AssignmentPageQuery = ReturnType<typeof parseAssignmentPageQuery>;
export function assignmentBoundary(after: AssignmentPageQuery['after']) {
  return after
    ? {
        OR: [
          { validFrom: { lt: after.validFrom } },
          { validFrom: after.validFrom, id: { lt: after.id } },
        ],
      }
    : {};
}
export function assignmentCursor(
  rows: Array<{ id: string; validFrom: Date }>,
  limit: number,
) {
  const last = rows[limit - 1];
  return rows.length > limit && last
    ? Buffer.from(
        JSON.stringify({
          id: last.id,
          validFrom: last.validFrom.toISOString(),
        }),
      ).toString('base64url')
    : null;
}
