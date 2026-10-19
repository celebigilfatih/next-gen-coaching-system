import { BadRequestException } from '@nestjs/common';
import type { TeamCategory } from '@prisma/client';
import { parseAgeLabel } from '../../sporting/age-label';

const TEAM_CATEGORIES = new Set<TeamCategory>(['ALT_YAPI', 'A_TAKIM']);

export interface CreateGroupDto {
  clubId: string;
  name: string;
  ageGroup: string;
  category?: TeamCategory | null | '';
}

export interface UpdateGroupDto {
  name?: string;
  ageGroup?: string;
  category?: TeamCategory;
}

export interface GroupMemberDto {
  userId: string;
}

export function groupBody(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BadRequestException('Invalid group body');
  }
  return input as Record<string, unknown>;
}

export function groupText(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new BadRequestException(`${field} must be a string`);
  }
  return value;
}

export function groupIdentifier(value: unknown, field: string): string {
  const result = groupText(value, field);
  if (!result) throw new BadRequestException(`${field} is required`);
  return result;
}

export function parseAgeGroup(value: unknown): string {
  return parseAgeLabel(value);
}

function parseCreateCategory(
  value: unknown,
): TeamCategory | null | '' | undefined {
  // Preserve the existing create default for omitted, null and empty category.
  if (value === undefined || value === null || value === '') return value;
  if (
    typeof value !== 'string' ||
    !TEAM_CATEGORIES.has(value as TeamCategory)
  ) {
    throw new BadRequestException('Invalid category');
  }
  return value as TeamCategory;
}

function parseUpdateCategory(value: unknown): TeamCategory | undefined {
  if (value === undefined) return undefined;
  if (
    typeof value !== 'string' ||
    !TEAM_CATEGORIES.has(value as TeamCategory)
  ) {
    throw new BadRequestException('Invalid category');
  }
  return value as TeamCategory;
}

export function parseCreateGroupBody(input: unknown): CreateGroupDto {
  const body = groupBody(input);
  return {
    clubId: groupIdentifier(body.clubId, 'clubId'),
    name: groupText(body.name, 'name'),
    ageGroup: parseAgeGroup(body.ageGroup),
    category: parseCreateCategory(body.category),
  };
}

export function parseCreateGroupClubId(input: unknown): string {
  return groupIdentifier(groupBody(input).clubId, 'clubId');
}

export function parseUpdateGroupBody(input: unknown): UpdateGroupDto {
  const body = groupBody(input);
  return {
    name: body.name === undefined ? undefined : groupText(body.name, 'name'),
    ageGroup:
      body.ageGroup === undefined ? undefined : parseAgeGroup(body.ageGroup),
    category: parseUpdateCategory(body.category),
  };
}

export function parseGroupMemberBody(input: unknown): GroupMemberDto {
  const body = groupBody(input);
  return { userId: groupIdentifier(body.userId, 'userId') };
}
