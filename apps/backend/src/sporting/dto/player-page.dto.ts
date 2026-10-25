import { BadRequestException } from '@nestjs/common';

export const playerPositionFilters = [
  'KALECI',
  'DEFANS',
  'ORTA_SAHA',
  'FORVET',
  'UNASSIGNED',
] as const;
export type PlayerPositionFilter = (typeof playerPositionFilters)[number];

export const playerPageSorts = ['NAME_ASC', 'NAME_DESC'] as const;
export type PlayerPageSort = (typeof playerPageSorts)[number];

type PlayerNameCursor = {
  v: 1;
  sort: PlayerPageSort;
  name: string;
  id: string;
};

const hasControlCharacter = (value: string) =>
  [...value].some(
    (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
  );

// Engineering request bounds, not a promised pilot capacity or latency SLO.
export function parsePlayerPageQuery(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Invalid player page query');
  const query = input as Record<string, unknown>;
  const allowed = [
    'teamId',
    'clubId',
    'after',
    'limit',
    'q',
    'position',
    'sort',
  ];
  if (Object.keys(query).some((key) => !allowed.includes(key)))
    throw new BadRequestException('Unknown player page query field');
  const identifier = (key: string, required = false) => {
    const value = query[key];
    if (value === undefined && !required) return undefined;
    if (
      typeof value !== 'string' ||
      !value.length ||
      value.length > 160 ||
      value.trim() !== value ||
      hasControlCharacter(value)
    )
      throw new BadRequestException(`Invalid ${key}`);
    return value;
  };
  const teamId = identifier('teamId', true)!;
  const clubId = identifier('clubId');
  const rawAfter = query.after;
  if (
    rawAfter !== undefined &&
    (typeof rawAfter !== 'string' ||
      !rawAfter.length ||
      rawAfter.length > 512 ||
      rawAfter.trim() !== rawAfter ||
      hasControlCharacter(rawAfter))
  )
    throw new BadRequestException('Invalid after');
  const after = rawAfter as string | undefined;
  const rawLimit = query.limit ?? '25';
  if (
    typeof rawLimit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(rawLimit) ||
    Number(rawLimit) > 100
  )
    throw new BadRequestException('limit must be between 1 and 100');
  const q = query.q ?? '';
  if (typeof q !== 'string' || q.length > 100 || hasControlCharacter(q))
    throw new BadRequestException('Invalid player search');
  const position = query.position;
  if (
    position !== undefined &&
    (typeof position !== 'string' ||
      !playerPositionFilters.includes(position as PlayerPositionFilter))
  )
    throw new BadRequestException('Invalid player position');
  const sort = query.sort;
  if (
    sort !== undefined &&
    (typeof sort !== 'string' ||
      !playerPageSorts.includes(sort as PlayerPageSort))
  )
    throw new BadRequestException('Invalid player sort');
  if (!sort && after && after.length > 160)
    throw new BadRequestException('Invalid after');
  return {
    teamId,
    clubId,
    after,
    limit: Number(rawLimit),
    q: q.trim(),
    position: position as PlayerPositionFilter | undefined,
    sort: sort as PlayerPageSort | undefined,
  };
}

export function decodePlayerNameCursor(
  value: string,
  sort: PlayerPageSort,
): PlayerNameCursor {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    );
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new Error('Invalid payload');
    const cursor = parsed as Record<string, unknown>;
    if (
      Object.keys(cursor).some(
        (key) => !['v', 'sort', 'name', 'id'].includes(key),
      ) ||
      cursor.v !== 1 ||
      cursor.sort !== sort ||
      typeof cursor.name !== 'string' ||
      !cursor.name.length ||
      cursor.name.length > 160 ||
      hasControlCharacter(cursor.name) ||
      typeof cursor.id !== 'string' ||
      !cursor.id.length ||
      cursor.id.length > 160 ||
      hasControlCharacter(cursor.id)
    )
      throw new Error('Invalid payload');
    return cursor as PlayerNameCursor;
  } catch {
    throw new BadRequestException('Invalid player page cursor');
  }
}

export function encodePlayerNameCursor(
  row: { id: string; displayName: string },
  sort: PlayerPageSort,
) {
  return Buffer.from(
    JSON.stringify({ v: 1, sort, name: row.displayName, id: row.id }),
    'utf8',
  ).toString('base64url');
}
