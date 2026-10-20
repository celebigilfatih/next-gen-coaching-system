import { BadRequestException } from '@nestjs/common';
import type {
  PlayerNoteCategory,
  PlayerNoteFollowUpStatus,
} from '@prisma/client';
import { sportingDate, sportingIdentifier } from './sporting.dto';

const categories: PlayerNoteCategory[] = [
  'GENERAL',
  'TRAINING',
  'MATCH',
  'TECHNICAL',
  'TACTICAL',
  'DEVELOPMENT',
];
const followUpStatuses: PlayerNoteFollowUpStatus[] = [
  'OPEN',
  'DONE',
  'CANCELLED',
];

function object(input: unknown, message: string) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException(message);
  return input as Record<string, unknown>;
}

function only(body: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(body).some((key) => !allowed.includes(key)))
    throw new BadRequestException('Unknown player note field');
}

function category(value: unknown) {
  if (
    typeof value !== 'string' ||
    !categories.includes(value as PlayerNoteCategory)
  )
    throw new BadRequestException('Invalid category');
  return value as PlayerNoteCategory;
}

function noteBody(value: unknown) {
  if (typeof value !== 'string') throw new BadRequestException('Invalid note');
  const trimmed = value.trim();
  if (!trimmed.length || trimmed.length > 4000)
    throw new BadRequestException('Note must be between 1 and 4000 characters');
  return trimmed;
}

function expectedVersion(value: unknown) {
  if (!Number.isInteger(value) || Number(value) < 1)
    throw new BadRequestException('Invalid expectedVersion');
  return Number(value);
}

function followUp(body: Record<string, unknown>) {
  const hasDate = body.followUpAt !== undefined && body.followUpAt !== null;
  const hasStatus =
    body.followUpStatus !== undefined && body.followUpStatus !== null;
  if (hasDate !== hasStatus)
    throw new BadRequestException(
      'followUpAt and followUpStatus must be supplied together',
    );
  if (!hasDate) return { followUpAt: null, followUpStatus: null };
  if (
    typeof body.followUpStatus !== 'string' ||
    !followUpStatuses.includes(body.followUpStatus as PlayerNoteFollowUpStatus)
  )
    throw new BadRequestException('Invalid followUpStatus');
  return {
    followUpAt: sportingDate(body.followUpAt, 'followUpAt'),
    followUpStatus: body.followUpStatus as PlayerNoteFollowUpStatus,
  };
}

export function parseCreatePlayerNote(input: unknown) {
  const body = object(input, 'Invalid player note body');
  only(body, [
    'originTeamId',
    'category',
    'body',
    'observedAt',
    'followUpAt',
    'followUpStatus',
  ]);
  return {
    originTeamId: sportingIdentifier(body.originTeamId, 'originTeamId'),
    category: category(body.category),
    body: noteBody(body.body),
    observedAt: sportingDate(body.observedAt, 'observedAt'),
    ...followUp(body),
  };
}

export function parseUpdatePlayerNote(input: unknown) {
  const body = object(input, 'Invalid player note body');
  only(body, [
    'expectedVersion',
    'category',
    'body',
    'observedAt',
    'followUpAt',
    'followUpStatus',
  ]);
  return {
    expectedVersion: expectedVersion(body.expectedVersion),
    category: category(body.category),
    body: noteBody(body.body),
    observedAt: sportingDate(body.observedAt, 'observedAt'),
    ...followUp(body),
  };
}

export function parseVersionBody(input: unknown) {
  const body = object(input, 'Invalid player note version body');
  only(body, ['expectedVersion']);
  return { expectedVersion: expectedVersion(body.expectedVersion) };
}

export function parseShareBody(input: unknown) {
  const body = object(input, 'Invalid player note share body');
  only(body, ['teamIds', 'expectedVersion']);
  if (
    !Array.isArray(body.teamIds) ||
    body.teamIds.length > 50 ||
    new Set(body.teamIds).size !== body.teamIds.length
  )
    throw new BadRequestException('Invalid teamIds');
  return {
    expectedVersion: expectedVersion(body.expectedVersion),
    teamIds: body.teamIds.map((value) => sportingIdentifier(value, 'teamId')),
  };
}

type NoteCursor = { v: 1; observedAt: string; id: string };

function decodeCursor(value: unknown): NoteCursor | undefined {
  if (value === undefined) return undefined;
  if (
    typeof value !== 'string' ||
    !value.length ||
    value.length > 512 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  )
    throw new BadRequestException('Invalid cursor');
  try {
    const cursor = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
    if (
      cursor.v !== 1 ||
      Object.keys(cursor).sort().join(',') !== 'id,observedAt,v'
    )
      throw new Error();
    return {
      v: 1,
      observedAt: sportingDate(cursor.observedAt, 'cursor').toISOString(),
      id: sportingIdentifier(cursor.id, 'cursor'),
    };
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}

export function encodeNoteCursor(row: { id: string; observedAt: Date }) {
  return Buffer.from(
    JSON.stringify({
      v: 1,
      observedAt: row.observedAt.toISOString(),
      id: row.id,
    }),
  ).toString('base64url');
}

export function parsePlayerNotePage(input: unknown) {
  const query = object(input, 'Invalid player note query');
  const allowed = [
    'after',
    'limit',
    'q',
    'category',
    'followUpStatus',
    'teamId',
    'status',
  ];
  if (Object.keys(query).some((key) => !allowed.includes(key)))
    throw new BadRequestException('Unknown player note query field');
  const rawLimit = query.limit ?? '20';
  if (
    typeof rawLimit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(rawLimit) ||
    Number(rawLimit) > 100
  )
    throw new BadRequestException('limit must be between 1 and 100');
  const q = query.q === undefined ? '' : String(query.q).trim();
  if (q.length > 200) throw new BadRequestException('Invalid q');
  const parsedCategory =
    query.category === undefined ? undefined : category(query.category);
  const parsedStatus = query.followUpStatus;
  if (
    parsedStatus !== undefined &&
    (typeof parsedStatus !== 'string' ||
      !followUpStatuses.includes(parsedStatus as PlayerNoteFollowUpStatus))
  )
    throw new BadRequestException('Invalid followUpStatus');
  if (
    query.status !== undefined &&
    query.status !== 'ACTIVE' &&
    query.status !== 'ARCHIVED'
  )
    throw new BadRequestException('Invalid status');
  return {
    after: decodeCursor(query.after),
    limit: Number(rawLimit),
    q,
    category: parsedCategory,
    followUpStatus: parsedStatus as PlayerNoteFollowUpStatus | undefined,
    teamId:
      query.teamId === undefined
        ? undefined
        : sportingIdentifier(query.teamId, 'teamId'),
    status: (query.status ?? 'ACTIVE') as 'ACTIVE' | 'ARCHIVED',
  };
}

export function parseActivityPage(input: unknown) {
  const query = object(input, 'Invalid player activity query');
  if (Object.keys(query).some((key) => !['after', 'limit'].includes(key)))
    throw new BadRequestException('Unknown player activity query field');
  const rawLimit = query.limit ?? '20';
  if (
    typeof rawLimit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(rawLimit) ||
    Number(rawLimit) > 100
  )
    throw new BadRequestException('limit must be between 1 and 100');
  return { after: decodeCursor(query.after), limit: Number(rawLimit) };
}
