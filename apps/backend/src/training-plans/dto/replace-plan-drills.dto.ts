import { BadRequestException } from '@nestjs/common';

export interface PlanDrillInput {
  drillId: string;
  phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';
  order: number;
  notes?: string;
  expectedVersionId?: string;
}

export interface ReplacePlanDrillsDto {
  drills: PlanDrillInput[];
}

const phases = new Set(['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN']);

// Shared runtime validation: preserve the existing service contract and limits.
export function validatePlanDrillEntries(
  entries: unknown,
): asserts entries is PlanDrillInput[] {
  if (!Array.isArray(entries) || entries.length > 50) {
    throw new BadRequestException('drills must contain at most 50 entries');
  }
  if (
    entries.some(
      (entry) =>
        !entry ||
        typeof entry.drillId !== 'string' ||
        !entry.drillId ||
        !phases.has(entry.phase) ||
        !Number.isInteger(entry.order) ||
        entry.order < 0 ||
        (entry.notes !== undefined && typeof entry.notes !== 'string') ||
        (entry.expectedVersionId !== undefined &&
          (typeof entry.expectedVersionId !== 'string' ||
            !entry.expectedVersionId.trim() ||
            entry.expectedVersionId.length > 128)),
    )
  ) {
    throw new BadRequestException('Invalid plan drill entry');
  }
}

export function parseReplacePlanDrillsBody(
  body: unknown,
): ReplacePlanDrillsDto {
  const entries =
    body !== null && typeof body === 'object' && 'drills' in body
      ? body.drills
      : undefined;
  validatePlanDrillEntries(entries);
  return { drills: entries };
}

export function parsePlanDrillBody(body: unknown): PlanDrillInput {
  const entries = [body];
  validatePlanDrillEntries(entries);
  return entries[0];
}
