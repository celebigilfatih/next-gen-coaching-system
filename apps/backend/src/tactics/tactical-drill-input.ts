import { BadRequestException } from '@nestjs/common';
import type { Difficulty, DrillCategory } from '@prisma/client';

export function strictObject(value: unknown, keys: string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new BadRequestException('Invalid tactical drill request');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !keys.includes(key)))
    throw new BadRequestException('Unknown tactical drill field');
  return input;
}

export function tacticalDrillMetadata(value: unknown) {
  const input = strictObject(value, [
    'title',
    'category',
    'durationMin',
    'difficulty',
    'equipment',
  ]);
  if (
    typeof input.title !== 'string' ||
    !input.title.trim() ||
    input.title.trim().length > 120 ||
    typeof input.category !== 'string' ||
    !['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN'].includes(
      input.category,
    ) ||
    typeof input.difficulty !== 'string' ||
    !['EASY', 'MEDIUM', 'HARD'].includes(input.difficulty) ||
    typeof input.durationMin !== 'number' ||
    !Number.isInteger(input.durationMin) ||
    input.durationMin < 1 ||
    input.durationMin > 300 ||
    (input.equipment != null &&
      (typeof input.equipment !== 'string' || input.equipment.length > 500))
  )
    throw new BadRequestException('Invalid tactical drill metadata');
  return {
    title: input.title.trim(),
    category: input.category as DrillCategory,
    durationMin: input.durationMin,
    difficulty: input.difficulty as Difficulty,
    equipment: (input.equipment as string | null | undefined) ?? null,
  };
}

export const drillMetadataSelect = {
  id: true,
  title: true,
  category: true,
  ageGroup: true,
  durationMin: true,
  difficulty: true,
  equipment: true,
  scope: true,
  clubId: true,
  groupId: true,
  createdById: true,
} as const;
