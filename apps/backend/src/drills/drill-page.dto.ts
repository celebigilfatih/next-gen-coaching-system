import { BadRequestException } from '@nestjs/common';
import { isISO8601 } from 'class-validator';
import { parseAgeLabel } from '../sporting/age-label';

const invalid = () => new BadRequestException('Invalid drill page query');
function id(value: unknown): string {
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
export function parseDrillPageQuery(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw invalid();
  const q = input as Record<string, unknown>;
  if (
    Object.keys(q).some(
      (key) =>
        ![
          'groupId',
          'category',
          'kind',
          'after',
          'limit',
          'q',
          'ageGroup',
          'objective',
          'difficulty',
          'minDuration',
          'maxDuration',
          'minPlayers',
          'maxPlayers',
          'equipment',
          'source',
          'scope',
          'collection',
          'ageScope',
        ].includes(key),
    )
  )
    throw invalid();
  const groupId = id(q.groupId);
  if (q.kind !== undefined && q.kind !== 'tactical-board') throw invalid();
  const kind = q.kind as 'tactical-board' | undefined;
  if (
    q.category !== undefined &&
    !['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN'].includes(
      q.category as string,
    )
  )
    throw invalid();
  const category = q.category as
    | 'WARM_UP'
    | 'TECHNICAL'
    | 'TACTICAL'
    | 'COOL_DOWN'
    | undefined;
  const search = optionalText(q.q, 80);
  const ageGroup =
    q.ageGroup === undefined ? undefined : parseAgeLabel(id(q.ageGroup));
  const objective = optionalKey(q.objective);
  const equipment = optionalText(q.equipment, 80);
  const difficulty = optionalEnum(q.difficulty, ['EASY', 'MEDIUM', 'HARD']);
  const source = optionalEnum(q.source, [
    'NGCS',
    'OPEN_LICENSE',
    'LEGACY',
    'CLUB',
    'MINE',
  ]);
  const scope = optionalEnum(q.scope, ['GLOBAL', 'CLUB']);
  const collection = optionalEnum(q.collection, ['ngcs-starter-v1']);
  const ageScope = optionalEnum(q.ageScope, ['TEAM']);
  if (ageScope && (!collection || ageGroup !== undefined)) throw invalid();
  const minDuration = optionalInteger(q.minDuration, 1, 300);
  const maxDuration = optionalInteger(q.maxDuration, 1, 300);
  const minPlayers = optionalInteger(q.minPlayers, 1, 60);
  const maxPlayers = optionalInteger(q.maxPlayers, 1, 60);
  if (
    (minDuration && maxDuration && minDuration > maxDuration) ||
    (minPlayers && maxPlayers && minPlayers > maxPlayers)
  )
    throw invalid();
  const limit = q.limit ?? '25';
  if (
    typeof limit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(limit) ||
    +limit > 100
  )
    throw invalid();
  let after: { id: string; createdAt: Date } | undefined;
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
        !['createdAt,id', 'createdAt,id,v'].includes(
          Object.keys(value).sort().join(','),
        ) ||
        (value.v !== undefined && value.v !== 1) ||
        typeof value.createdAt !== 'string' ||
        value.createdAt.length > 40 ||
        !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value.createdAt) ||
        !isISO8601(value.createdAt, { strict: true }) ||
        !Number.isFinite(Date.parse(value.createdAt))
      )
        throw invalid();
      after = { id: id(value.id), createdAt: new Date(value.createdAt) };
    } catch {
      throw invalid();
    }
  }
  return {
    groupId,
    category,
    kind,
    after,
    limit: +limit,
    search,
    ageGroup,
    objective,
    difficulty,
    minDuration,
    maxDuration,
    minPlayers,
    maxPlayers,
    equipment,
    source,
    scope,
    collection,
    ageScope,
  };
}

function optionalText(value: unknown, max: number) {
  if (value === undefined) return undefined;
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim() !== value ||
    value.length > max ||
    [...value].some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127;
    })
  )
    throw invalid();
  return value;
}

function optionalKey(value: unknown) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(value))
    throw invalid();
  return value;
}

function optionalEnum<T extends string>(value: unknown, values: readonly T[]) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !values.includes(value as T))
    throw invalid();
  return value as T;
}

function optionalInteger(value: unknown, min: number, max: number) {
  if (value === undefined) return undefined;
  if (
    typeof value !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(value) ||
    +value < min ||
    +value > max
  )
    throw invalid();
  return +value;
}
