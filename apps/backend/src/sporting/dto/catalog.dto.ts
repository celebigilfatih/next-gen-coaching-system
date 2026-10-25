import { BadRequestException } from '@nestjs/common';

export function parseCatalogQuery(input: unknown, selection = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Invalid catalog query');
  const value = input as Record<string, unknown>;
  const allowed = selection
    ? ['clubId', 'clubSeasonId', 'teamId']
    : [
        'clubId',
        'clubSeasonId',
        'after',
        'q',
        'limit',
        'categoryKey',
        'status',
      ];
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw new BadRequestException('Unknown catalog query field');
  for (const [key, text] of Object.entries(value)) {
    if (
      typeof text !== 'string' ||
      !text.length ||
      text.length > (key === 'q' ? 100 : 160) ||
      [...text].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127) ||
      (key !== 'q' && text.trim() !== text)
    )
      throw new BadRequestException(`Invalid ${key}`);
  }
  const limit = value.limit ?? '25';
  if (
    typeof limit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(limit) ||
    Number(limit) > 100
  )
    throw new BadRequestException('limit must be between 1 and 100');
  if (
    value.categoryKey !== undefined &&
    value.categoryKey !== 'A_TAKIM' &&
    value.categoryKey !== 'ALT_YAPI'
  )
    throw new BadRequestException('Invalid categoryKey');
  if (
    value.status !== undefined &&
    value.status !== 'ACTIVE' &&
    value.status !== 'ARCHIVED'
  )
    throw new BadRequestException('Invalid status');
  return {
    clubId: value.clubId as string | undefined,
    clubSeasonId: value.clubSeasonId as string | undefined,
    teamId: value.teamId as string | undefined,
    after: value.after as string | undefined,
    q: ((value.q ?? '') as string).trim(),
    limit: Number(limit),
    categoryKey: value.categoryKey as 'A_TAKIM' | 'ALT_YAPI' | undefined,
    status: (value.status ?? 'ACTIVE') as 'ACTIVE' | 'ARCHIVED',
  };
}

export function catalogPage<T extends { id: string }>(
  rows: T[],
  limit: number,
) {
  const items = rows.slice(0, limit);
  return {
    items,
    nextCursor: rows.length > limit ? items[items.length - 1].id : null,
    limit,
  };
}

export const catalogSearch = (q: string) =>
  q
    ? {
        name: {
          contains: q.replace(/[\\%_]/g, '\\$&'),
          mode: 'insensitive' as const,
        },
      }
    : {};
