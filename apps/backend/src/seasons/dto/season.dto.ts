import { BadRequestException } from '@nestjs/common';
import type { DayType, Prisma } from '@prisma/client';
import {
  seasonBody,
  stringField,
  idField,
  nullableString,
  intField,
  nullableInt,
  seasonDate,
  jsonField,
} from './season-input';

export interface CreateSeasonDto {
  name: string;
  clubId: string;
  groupId: string;
  startDate: Date;
  endDate: Date;
}
export interface CreateWeekDto {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  notes?: string | null;
}
export interface UpdateWeekDto {
  notes?: string | null;
  totalLoad?: number;
}
export interface CreateDayDto {
  dayOfWeek: number;
  date: Date;
  type?: DayType;
  title?: string | null;
  trainingPlanId?: string | null;
  drillIds?: string[] | null;
  duration?: number | null;
  intensity?: number | null;
  notes?: string | null;
}
export interface CreateMatchDto {
  date: Date;
  opponent: string;
  location: string;
  competition?: string | null;
  notes?: string | null;
  groupId?: string | null;
}
export interface UpdateMatchDto {
  date?: Date;
  opponent?: string;
  location?: string;
  competition?: string | null;
  result?: string | null;
  opponentAnalysis?: Prisma.JsonValue;
  ourFormation?: string | null;
  notes?: string | null;
  videoLinks?: Prisma.JsonValue;
}

export function parseCreateSeasonBody(input: unknown): CreateSeasonDto {
  const body = seasonBody(input);
  return {
    name: stringField(body.name, 'name'),
    clubId: idField(body.clubId, 'clubId'),
    groupId: idField(body.groupId, 'groupId'),
    startDate: seasonDate(body.startDate, 'startDate'),
    endDate: seasonDate(body.endDate, 'endDate'),
  };
}
export function parseCreateWeekBody(input: unknown): CreateWeekDto {
  const body = seasonBody(input);
  return {
    weekNumber: intField(body.weekNumber, 'weekNumber'),
    startDate: seasonDate(body.startDate, 'startDate'),
    endDate: seasonDate(body.endDate, 'endDate'),
    notes: nullableString(body.notes, 'notes'),
  };
}
export function parseUpdateWeekBody(input: unknown): UpdateWeekDto {
  const body = seasonBody(input);
  return {
    notes: nullableString(body.notes, 'notes'),
    totalLoad:
      body.totalLoad === undefined
        ? undefined
        : intField(body.totalLoad, 'totalLoad'),
  };
}
export function parseCreateDayBody(input: unknown): CreateDayDto {
  const body = seasonBody(input);
  const type = body.type;
  if (
    type !== undefined &&
    type !== 'TRAINING' &&
    type !== 'MATCH' &&
    type !== 'REST' &&
    type !== 'RECOVERY' &&
    type !== 'TACTICAL'
  )
    throw new BadRequestException('Invalid day type');
  const drillIds = body.drillIds;
  if (
    drillIds != null &&
    (!Array.isArray(drillIds) || drillIds.some((id) => typeof id !== 'string'))
  )
    throw new BadRequestException('drillIds must be an array of strings');
  return {
    dayOfWeek: intField(body.dayOfWeek, 'dayOfWeek'),
    date: seasonDate(body.date, 'date'),
    type,
    title: nullableString(body.title, 'title'),
    trainingPlanId:
      body.trainingPlanId == null
        ? body.trainingPlanId
        : idField(body.trainingPlanId, 'trainingPlanId'),
    drillIds,
    duration: nullableInt(body.duration, 'duration'),
    intensity: nullableInt(body.intensity, 'intensity'),
    notes: nullableString(body.notes, 'notes'),
  };
}
export function parseCreateMatchBody(input: unknown): CreateMatchDto {
  const body = seasonBody(input);
  return {
    date: seasonDate(body.date, 'date'),
    opponent: stringField(body.opponent, 'opponent'),
    location: stringField(body.location, 'location'),
    competition: nullableString(body.competition, 'competition'),
    notes: nullableString(body.notes, 'notes'),
    groupId: nullableString(body.groupId, 'groupId'),
  };
}
export function parseUpdateMatchBody(input: unknown): UpdateMatchDto {
  const body = seasonBody(input);
  return {
    // Preserve the route's legacy null/empty-date no-op; do not clear required date.
    date:
      body.date === undefined || body.date === null || body.date === ''
        ? undefined
        : seasonDate(body.date, 'date'),
    opponent:
      body.opponent === undefined
        ? undefined
        : stringField(body.opponent, 'opponent'),
    location:
      body.location === undefined
        ? undefined
        : stringField(body.location, 'location'),
    competition: nullableString(body.competition, 'competition'),
    result: nullableString(body.result, 'result'),
    opponentAnalysis: jsonField(body.opponentAnalysis, 'opponentAnalysis'),
    ourFormation: nullableString(body.ourFormation, 'ourFormation'),
    notes: nullableString(body.notes, 'notes'),
    videoLinks: jsonField(body.videoLinks, 'videoLinks'),
  };
}
