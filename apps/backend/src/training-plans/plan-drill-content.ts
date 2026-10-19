import { Prisma } from '@prisma/client';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { validateTacticalBoardDocument } from '../tactics/tactical-board';

export const planSourceSelect = {
  id: true,
  title: true,
  category: true,
  durationMin: true,
  scope: true,
  clubId: true,
  groupId: true,
  jsonData: true,
  _count: { select: { versions: true } },
  versions: {
    where: { status: 'PUBLISHED' },
    take: 1,
    include: { ageVariants: true, source: true },
  },
} satisfies Prisma.DrillSelect;

type Source = Prisma.DrillGetPayload<{ select: typeof planSourceSelect }>;

export function resolvePlanContent(
  source: Source,
  age: string | undefined,
  expectedVersionId?: string,
) {
  const version = source.versions?.[0];
  if (expectedVersionId && version?.id !== expectedVersionId)
    throw new ConflictException(
      'Egzersiz sürümü değişti. İçeriği yeniden inceleyin.',
    );
  if (!version) {
    if (source._count?.versions)
      throw new BadRequestException('Yayınlanmamış egzersiz plana eklenemez.');
    return { contentSnapshot: undefined, boardSnapshot: undefined };
  }
  const variant = version.ageVariants.find((item) => item.ageGroup === age);
  if (!variant)
    throw new BadRequestException(
      'Bu takım yaşı için yayınlanmış uyarlama bulunmuyor.',
    );
  const board = validateTacticalBoardDocument(version.boardDocument);
  const contentSnapshot = {
    schemaVersion: 1,
    sourceVersionId: version.id,
    sourceVersion: version.version,
    ageGroup: variant.ageGroup,
    title: version.title,
    summary: version.summary,
    category: version.category,
    difficulty: version.difficulty,
    durationMin: variant.durationMin,
    objectiveLabel: version.objectiveLabel,
    playerMin: variant.playerMin,
    playerMax: variant.playerMax,
    areaLengthM: variant.areaLengthM,
    areaWidthM: variant.areaWidthM,
    equipmentItems: version.equipmentItems,
    organization: version.organization,
    steps: version.steps,
    coachingPoints: version.coachingPoints,
    progressions: version.progressions,
    regressions: version.regressions,
    constraints: version.constraints,
    safetyNotes: version.safetyNotes,
    rules: variant.rules,
    variantCoachingPoints: variant.coachingPoints,
    source: {
      title: version.source.title,
      license: version.source.license,
      sourceUrl: version.source.sourceUrl,
      attribution: version.source.attribution,
    },
  };
  return {
    contentSnapshot: contentSnapshot as Prisma.InputJsonValue,
    boardSnapshot: board as unknown as Prisma.InputJsonValue,
  };
}

export function frozenContent(
  value: unknown,
): { title: string; durationMin: number } | undefined {
  if (!value || typeof value !== 'object') return;
  const snapshot = value as Record<string, unknown>;
  if (
    snapshot.schemaVersion === 1 &&
    typeof snapshot.title === 'string' &&
    typeof snapshot.durationMin === 'number' &&
    Number.isInteger(snapshot.durationMin) &&
    snapshot.durationMin > 0
  )
    return { title: snapshot.title, durationMin: snapshot.durationMin };
}

export function planDrillDuration(entry: {
  contentSnapshot?: unknown;
  drill: { durationMin: number };
}) {
  return (
    frozenContent(entry.contentSnapshot)?.durationMin ?? entry.drill.durationMin
  );
}

export function projectPlanContent<
  T extends {
    drills: Array<{
      contentSnapshot?: unknown;
      drill: { title: string; durationMin: number };
    }>;
  },
>(plan: T): T {
  if (!Array.isArray(plan.drills)) return plan;
  return {
    ...plan,
    drills: plan.drills.map((entry) => ({
      ...entry,
      drill: { ...entry.drill, ...frozenContent(entry.contentSnapshot) },
    })),
  };
}
