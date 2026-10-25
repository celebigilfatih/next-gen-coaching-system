import { BadRequestException } from '@nestjs/common';
import type {
  Difficulty,
  DrillCategory,
  DrillLicenseType,
  DrillSourceKind,
} from '@prisma/client';
import { parseAgeLabel } from '../sporting/age-label';
import { validateTacticalBoardDocument } from '../tactics/tactical-board';

const invalid = (message: string): never => {
  throw new BadRequestException(message);
};

export type DrillContentInput = {
  drillId?: string;
  title: string;
  summary: string;
  category: DrillCategory;
  difficulty: Difficulty;
  objectiveKey: string;
  objectiveLabel: string;
  themes: string[];
  durationMin: number;
  playerMin: number;
  playerMax: number;
  areaLengthM?: number;
  areaWidthM?: number;
  equipmentItems: string[];
  organization: string;
  steps: string[];
  coachingPoints: string[];
  progressions: string[];
  regressions: string[];
  constraints: string[];
  safetyNotes?: string;
  boardDocument: Record<string, unknown>;
  source: {
    kind: Exclude<DrillSourceKind, 'LEGACY'>;
    title: string;
    sourceUrl?: string;
    author?: string;
    license: Exclude<DrillLicenseType, 'LEGACY_UNVERIFIED'>;
    attribution?: string;
    changes?: string;
    contentHash: string;
  };
  ageVariants: Array<{
    ageGroup: string;
    durationMin: number;
    playerMin: number;
    playerMax: number;
    areaLengthM?: number;
    areaWidthM?: number;
    rules: string[];
    coachingPoints: string[];
  }>;
};

export function parseDrillContentBody(value: unknown): DrillContentInput {
  const body = record(value, 'body');
  exactKeys(body, [
    'drillId',
    'title',
    'summary',
    'category',
    'difficulty',
    'objectiveKey',
    'objectiveLabel',
    'themes',
    'durationMin',
    'playerMin',
    'playerMax',
    'areaLengthM',
    'areaWidthM',
    'equipmentItems',
    'organization',
    'steps',
    'coachingPoints',
    'progressions',
    'regressions',
    'constraints',
    'safetyNotes',
    'boardDocument',
    'source',
    'ageVariants',
  ]);
  const category = enumeration(body.category, 'category', [
    'WARM_UP',
    'TECHNICAL',
    'TACTICAL',
    'COOL_DOWN',
  ]) as DrillCategory;
  const difficulty = enumeration(body.difficulty, 'difficulty', [
    'EASY',
    'MEDIUM',
    'HARD',
  ]) as Difficulty;
  const playerMin = integer(body.playerMin, 'playerMin', 1, 60);
  const playerMax = integer(body.playerMax, 'playerMax', playerMin, 60);
  const source = parseSource(body.source);
  const ageVariants = array(body.ageVariants, 'ageVariants', 1, 10).map(
    (entry, index) => parseVariant(entry, index),
  );
  if (
    new Set(ageVariants.map((item) => item.ageGroup)).size !==
    ageVariants.length
  )
    invalid('ageVariants must use unique age groups');
  const boardDocument = validateTacticalBoardDocument(body.boardDocument);
  return {
    drillId: optionalId(body.drillId, 'drillId'),
    title: text(body.title, 'title', 1, 120),
    summary: text(body.summary, 'summary', 20, 600),
    category,
    difficulty,
    objectiveKey: key(body.objectiveKey, 'objectiveKey'),
    objectiveLabel: text(body.objectiveLabel, 'objectiveLabel', 2, 100),
    themes: stringArray(body.themes, 'themes', 1, 12, 50),
    durationMin: integer(body.durationMin, 'durationMin', 1, 300),
    playerMin,
    playerMax,
    areaLengthM: optionalInteger(body.areaLengthM, 'areaLengthM', 5, 130),
    areaWidthM: optionalInteger(body.areaWidthM, 'areaWidthM', 5, 100),
    equipmentItems: stringArray(
      body.equipmentItems,
      'equipmentItems',
      0,
      20,
      80,
    ),
    organization: text(body.organization, 'organization', 20, 2000),
    steps: stringArray(body.steps, 'steps', 1, 20, 500),
    coachingPoints: stringArray(
      body.coachingPoints,
      'coachingPoints',
      1,
      20,
      500,
    ),
    progressions: stringArray(body.progressions, 'progressions', 1, 12, 500),
    regressions: stringArray(body.regressions, 'regressions', 1, 12, 500),
    constraints: stringArray(body.constraints, 'constraints', 0, 12, 500),
    safetyNotes: optionalText(body.safetyNotes, 'safetyNotes', 1000),
    boardDocument,
    source,
    ageVariants,
  };
}

export function parseReviewBody(value: unknown) {
  const body = record(value, 'body');
  exactKeys(body, ['comment']);
  return { comment: optionalText(body.comment, 'comment', 1000) ?? null };
}

export function parseDrillContentQueueQuery(value: unknown) {
  const query = record(value, 'query');
  exactKeys(query, ['status']);
  return {
    status:
      query.status === undefined
        ? undefined
        : enumeration(query.status, 'status', [
            'DRAFT',
            'IN_REVIEW',
            'APPROVED',
            'PUBLISHED',
            'ARCHIVED',
          ]),
  };
}

export function parseDrillContentDetailQuery(value: unknown) {
  const query = record(value, 'query');
  exactKeys(query, ['ageGroup']);
  return {
    ageGroup:
      query.ageGroup === undefined
        ? undefined
        : parseAgeLabel(text(query.ageGroup, 'ageGroup', 1, 32)),
  };
}

function parseSource(value: unknown): DrillContentInput['source'] {
  const source = record(value, 'source');
  exactKeys(source, [
    'kind',
    'title',
    'sourceUrl',
    'author',
    'license',
    'attribution',
    'changes',
    'contentHash',
  ]);
  const kind = enumeration(source.kind, 'source.kind', [
    'NGCS_ORIGINAL',
    'OPEN_LICENSE',
  ]) as DrillContentInput['source']['kind'];
  const license = enumeration(source.license, 'source.license', [
    'NGCS_PROPRIETARY',
    'CC0',
    'CC_BY_4_0',
  ]) as DrillContentInput['source']['license'];
  const sourceUrl = optionalText(source.sourceUrl, 'source.sourceUrl', 2048);
  const author = optionalText(source.author, 'source.author', 160);
  const attribution = optionalText(
    source.attribution,
    'source.attribution',
    1000,
  );
  if (kind === 'NGCS_ORIGINAL' && license !== 'NGCS_PROPRIETARY')
    invalid('NGCS original content must use NGCS_PROPRIETARY');
  if (kind === 'OPEN_LICENSE') {
    if (!['CC0', 'CC_BY_4_0'].includes(license))
      invalid('Open content must use CC0 or CC_BY_4_0');
    if (
      !sourceUrl ||
      !/^https:\/\//i.test(sourceUrl) ||
      !author ||
      !attribution
    )
      invalid('Open content requires https sourceUrl, author and attribution');
  }
  return {
    kind,
    title: text(source.title, 'source.title', 2, 200),
    sourceUrl,
    author,
    license,
    attribution,
    changes: optionalText(source.changes, 'source.changes', 1000),
    contentHash: hash(source.contentHash),
  };
}

function parseVariant(value: unknown, index: number) {
  const label = `ageVariants[${index}]`;
  const variant = record(value, label);
  exactKeys(variant, [
    'ageGroup',
    'durationMin',
    'playerMin',
    'playerMax',
    'areaLengthM',
    'areaWidthM',
    'rules',
    'coachingPoints',
  ]);
  const playerMin = integer(variant.playerMin, `${label}.playerMin`, 1, 60);
  return {
    ageGroup: parseAgeLabel(text(variant.ageGroup, `${label}.ageGroup`, 1, 32)),
    durationMin: integer(variant.durationMin, `${label}.durationMin`, 1, 300),
    playerMin,
    playerMax: integer(variant.playerMax, `${label}.playerMax`, playerMin, 60),
    areaLengthM: optionalInteger(
      variant.areaLengthM,
      `${label}.areaLengthM`,
      5,
      130,
    ),
    areaWidthM: optionalInteger(
      variant.areaWidthM,
      `${label}.areaWidthM`,
      5,
      100,
    ),
    rules: stringArray(variant.rules, `${label}.rules`, 1, 12, 500),
    coachingPoints: stringArray(
      variant.coachingPoints,
      `${label}.coachingPoints`,
      1,
      12,
      500,
    ),
  };
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    invalid(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((field) => !allowed.includes(field)))
    invalid('Unknown field');
}

function text(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
): string {
  if (typeof value !== 'string') invalid(`${label} must be a string`);
  const result = (value as string).trim();
  if (
    result.length < minimum ||
    result.length > maximum ||
    [...result].some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127;
    })
  )
    invalid(`${label} is invalid`);
  return result;
}

function optionalText(
  value: unknown,
  label: string,
  maximum: number,
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return text(value, label, 1, maximum);
}

function optionalId(value: unknown, label: string): string | undefined {
  const result = optionalText(value, label, 160);
  if (result && !/^[A-Za-z0-9_-]+$/.test(result))
    invalid(`${label} is invalid`);
  return result;
}

function key(value: unknown, label: string): string {
  const result = text(value, label, 1, 64);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(result)) invalid(`${label} is invalid`);
  return result;
}

function hash(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))
    invalid('source.contentHash must be a SHA-256 hexadecimal value');
  return value as string;
}

function enumeration(value: unknown, label: string, values: string[]): string {
  if (typeof value !== 'string' || !values.includes(value))
    invalid(`${label} is invalid`);
  return value as string;
}

function integer(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
): number {
  if (
    !Number.isInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  )
    invalid(`${label} is invalid`);
  return value as number;
}

function optionalInteger(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
): number | undefined {
  if (value === undefined || value === null) return undefined;
  return integer(value, label, minimum, maximum);
}

function array(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
): unknown[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum)
    invalid(`${label} is invalid`);
  return value as unknown[];
}

function stringArray(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
  itemMaximum: number,
): string[] {
  const values = array(value, label, minimum, maximum).map((item, index) =>
    text(item, `${label}[${index}]`, 1, itemMaximum),
  );
  if (new Set(values).size !== values.length)
    invalid(`${label} must be unique`);
  return values;
}
