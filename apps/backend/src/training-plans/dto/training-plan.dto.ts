import { BadRequestException } from '@nestjs/common';
import { isISO8601, isRFC3339 } from 'class-validator';

export interface UpdateTrainingPlanDto {
  title?: string;
  totalDuration?: number;
  groupId?: string | null;
  date?: string | Date | null;
  notes?: string | null;
}

export interface CreateTrainingPlanDto {
  title: string;
  clubId: string;
  coachId: string;
  groupId?: string | null;
  date?: string | Date | null;
  notes?: string | null;
}

export function trainingPlanBody(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BadRequestException('Invalid training plan body');
  }
  return input as Record<string, unknown>;
}

function text(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new BadRequestException(`${field} must be a string`);
  }
  return value;
}

function identifier(value: unknown, field: string): string {
  const result = text(value, field);
  if (!result) throw new BadRequestException(`${field} is required`);
  return result;
}

function nullableText(value: unknown, field: string) {
  return value === undefined || value === null ? value : text(value, field);
}

function dateValue(value: unknown): string | Date | null | undefined {
  if (value === undefined || value === null) return value;
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  // Match the existing DateTime transport: an actual date with time and offset.
  if (
    typeof value === 'string' &&
    isRFC3339(value) &&
    isISO8601(value.slice(0, 10), { strict: true }) &&
    Number.isFinite(Date.parse(value))
  )
    return value;
  throw new BadRequestException('date must be a valid timestamp with timezone');
}

function sharedFields(body: Record<string, unknown>) {
  return {
    groupId:
      body.groupId === undefined || body.groupId === null
        ? body.groupId
        : identifier(body.groupId, 'groupId'),
    date: dateValue(body.date),
    notes: nullableText(body.notes, 'notes'),
  };
}

export function parseCreateTrainingPlanBody(
  input: unknown,
): CreateTrainingPlanDto {
  const body = trainingPlanBody(input);
  return {
    title: text(body.title, 'title'),
    clubId: identifier(body.clubId, 'clubId'),
    coachId: identifier(body.coachId, 'coachId'),
    ...sharedFields(body),
  };
}

export function parseUpdateTrainingPlanBody(
  input: unknown,
): UpdateTrainingPlanDto {
  const body = trainingPlanBody(input);
  const duration = body.totalDuration;
  // Prisma Int is signed 32-bit; a business duration range remains a separate decision.
  if (
    duration !== undefined &&
    (typeof duration !== 'number' ||
      !Number.isInteger(duration) ||
      duration < -2147483648 ||
      duration > 2147483647)
  )
    throw new BadRequestException('totalDuration must be a 32-bit integer');
  return {
    title: body.title === undefined ? undefined : text(body.title, 'title'),
    totalDuration: duration,
    ...sharedFields(body),
  };
}
