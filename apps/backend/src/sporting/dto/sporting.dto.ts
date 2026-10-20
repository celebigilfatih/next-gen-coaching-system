import { BadRequestException } from '@nestjs/common';
import type { SportingAssignmentType } from '@prisma/client';
import { isISO8601 } from 'class-validator';

const assignmentTypes: SportingAssignmentType[] = [
  'LEGACY_MEMBER',
  'PRIMARY_REGISTERED',
  'TRAINING_GUEST',
  'MATCH_ELIGIBLE',
  'LOAN_IN',
  'LOAN_OUT',
  'INTERNATIONAL_DUTY',
  'STAFF',
];

function objectBody(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Invalid sporting resource body');
  return input as Record<string, unknown>;
}

export function sportingIdentifier(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0)
    throw new BadRequestException(`${field} is required`);
  return value;
}

function optionalIdentifier(value: unknown, field: string) {
  return value == null ? undefined : sportingIdentifier(value, field);
}

function optionalString(value: unknown, field: string) {
  if (value == null) return undefined;
  if (typeof value !== 'string')
    throw new BadRequestException(`${field} must be a string`);
  return value;
}

export function sportingDate(value: unknown, field: string): Date {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (
    typeof value === 'string' &&
    value.trim() === value &&
    isISO8601(value, { strict: true }) &&
    Number.isFinite(Date.parse(value))
  )
    return new Date(value);
  throw new BadRequestException(`${field} must be a valid date`);
}

export function optionalAsOf(value: unknown): Date {
  return value === undefined ? new Date() : sportingDate(value, 'asOf');
}

export interface CreateSportingAssignmentDto {
  personId: string;
  teamId?: string;
  teamSeasonId?: string;
  roleDefinitionId: string;
  assignmentType: SportingAssignmentType;
  validFrom: Date;
  validTo?: Date;
  reason?: string;
}

export function parseCreateAssignmentBody(
  input: unknown,
): CreateSportingAssignmentDto {
  const body = objectBody(input);
  if (
    typeof body.assignmentType !== 'string' ||
    !assignmentTypes.includes(body.assignmentType as SportingAssignmentType)
  )
    throw new BadRequestException('Invalid assignmentType');
  const result: CreateSportingAssignmentDto = {
    personId: sportingIdentifier(body.personId, 'personId'),
    teamId: optionalIdentifier(body.teamId, 'teamId'),
    teamSeasonId: optionalIdentifier(body.teamSeasonId, 'teamSeasonId'),
    roleDefinitionId: sportingIdentifier(
      body.roleDefinitionId,
      'roleDefinitionId',
    ),
    assignmentType: body.assignmentType as SportingAssignmentType,
    validFrom: sportingDate(body.validFrom, 'validFrom'),
    validTo:
      body.validTo == null ? undefined : sportingDate(body.validTo, 'validTo'),
    reason: optionalString(body.reason, 'reason'),
  };
  if (result.validTo && result.validTo <= result.validFrom)
    throw new BadRequestException('validTo must be after validFrom');
  return result;
}

export interface EndSportingAssignmentDto {
  validTo: Date;
  reason?: string;
}

export function parseEndAssignmentBody(
  input: unknown,
): EndSportingAssignmentDto {
  const body = objectBody(input);
  return {
    validTo: sportingDate(body.validTo, 'validTo'),
    reason: optionalString(body.reason, 'reason'),
  };
}

export interface TransitionPrimaryAssignmentDto {
  personId: string;
  teamId: string;
  teamSeasonId?: string;
  roleDefinitionId: string;
  validAt: Date;
  reason?: string;
}

export function parseTransitionPrimaryBody(
  input: unknown,
): TransitionPrimaryAssignmentDto {
  const body = objectBody(input);
  return {
    personId: sportingIdentifier(body.personId, 'personId'),
    teamId: sportingIdentifier(body.teamId, 'teamId'),
    teamSeasonId: optionalIdentifier(body.teamSeasonId, 'teamSeasonId'),
    roleDefinitionId: sportingIdentifier(
      body.roleDefinitionId,
      'roleDefinitionId',
    ),
    validAt: sportingDate(body.validAt, 'validAt'),
    reason: optionalString(body.reason, 'reason'),
  };
}
