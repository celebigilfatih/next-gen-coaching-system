import { BadRequestException } from '@nestjs/common';
import {
  groupBody,
  groupText,
  parseAgeGroup,
} from '../../groups/dto/group.dto';

export interface CreateClubDto {
  name: string;
  logo?: string | null;
  description?: string | null;
}

export interface UpdateClubDto {
  name?: string;
  logo?: string | null;
  description?: string | null;
}

export interface CreateClubGroupDto {
  name: string;
  ageGroup: string;
}

function clubBody(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BadRequestException('Invalid club body');
  }
  return input as Record<string, unknown>;
}

function nullableText(value: unknown, field: string) {
  return value === undefined || value === null
    ? value
    : groupText(value, field);
}

export function parseCreateClubBody(input: unknown): CreateClubDto {
  const body = clubBody(input);
  return {
    name: groupText(body.name, 'name'),
    logo: nullableText(body.logo, 'logo'),
    description: nullableText(body.description, 'description'),
  };
}

export function parseUpdateClubBody(input: unknown): UpdateClubDto {
  const body = clubBody(input);
  return {
    name: body.name === undefined ? undefined : groupText(body.name, 'name'),
    logo: nullableText(body.logo, 'logo'),
    description: nullableText(body.description, 'description'),
  };
}

export function parseCreateClubGroupBody(input: unknown): CreateClubGroupDto {
  const body = groupBody(input);
  return {
    name: groupText(body.name, 'name'),
    ageGroup: parseAgeGroup(body.ageGroup),
  };
}
