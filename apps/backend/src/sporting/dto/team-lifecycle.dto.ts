import { BadRequestException } from '@nestjs/common';
import { parseAgeLabel } from '../age-label';

export type TeamClassification = 'FIRST_TEAM' | 'ACADEMY';

export interface CreateSportingTeamDto {
  clubId: string;
  clubSeasonId: string;
  name: string;
  ageGroupLabel: string;
  classification: TeamClassification;
}

export interface UpdateSportingTeamDto {
  name?: string;
  ageGroupLabel?: string;
}

function body(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Invalid team body');
  return input as Record<string, unknown>;
}

function exactFields(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw new BadRequestException('Unknown team body field');
}

function identifier(value: unknown, field: string): string {
  if (
    typeof value !== 'string' ||
    value.length < 1 ||
    value.length > 160 ||
    value !== value.trim() ||
    [...value].some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  )
    throw new BadRequestException(`${field} is invalid`);
  return value;
}

function teamName(value: unknown): string {
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    value.length < 1 ||
    value.length > 80 ||
    [...value].some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  )
    throw new BadRequestException(
      'name must contain 1 to 80 trimmed characters',
    );
  return value.normalize('NFKC');
}

export function parseCreateSportingTeamBody(
  input: unknown,
): CreateSportingTeamDto {
  const value = body(input);
  exactFields(value, [
    'clubId',
    'clubSeasonId',
    'name',
    'ageGroupLabel',
    'classification',
  ]);
  if (
    value.classification !== 'FIRST_TEAM' &&
    value.classification !== 'ACADEMY'
  )
    throw new BadRequestException('Invalid classification');
  const clubSeasonId = identifier(value.clubSeasonId, 'clubSeasonId');
  if (clubSeasonId === '*')
    throw new BadRequestException('A specific clubSeasonId is required');
  return {
    clubId: identifier(value.clubId, 'clubId'),
    clubSeasonId,
    name: teamName(value.name),
    ageGroupLabel: parseAgeLabel(value.ageGroupLabel, 'ageGroupLabel'),
    classification: value.classification,
  };
}

export function parseUpdateSportingTeamBody(
  input: unknown,
): UpdateSportingTeamDto {
  const value = body(input);
  exactFields(value, ['name', 'ageGroupLabel']);
  const result = {
    name: value.name === undefined ? undefined : teamName(value.name),
    ageGroupLabel:
      value.ageGroupLabel === undefined
        ? undefined
        : parseAgeLabel(value.ageGroupLabel, 'ageGroupLabel'),
  };
  if (result.name === undefined && result.ageGroupLabel === undefined)
    throw new BadRequestException('At least one team field is required');
  return result;
}
