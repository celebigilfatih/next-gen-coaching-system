import { BadRequestException, ConflictException } from '@nestjs/common';
import { resolvePlanContent, projectPlanContent } from './plan-drill-content';
import { TrainingPlansService } from './training-plans.service';

const board = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'training', width: 750, height: 550 },
  elements: [],
};
function source() {
  return {
    id: 'd',
    title: 'Source title',
    category: 'TACTICAL',
    durationMin: 99,
    scope: 'GLOBAL',
    clubId: null,
    groupId: null,
    _count: { versions: 1 },
    versions: [
      {
        id: 'v1',
        version: 1,
        title: 'Pres oyunu',
        summary: 'Üç koridorda birlikte baskı.',
        category: 'TACTICAL',
        difficulty: 'MEDIUM',
        durationMin: 99,
        objectiveLabel: 'Baskı tetikleyicisi',
        playerMin: 8,
        playerMax: 16,
        equipmentItems: ['koni'],
        organization: 'Üç koridor.',
        steps: ['Top yönüne kay.'],
        coachingPoints: ['Birlikte çık.'],
        progressions: ['İki temas.'],
        regressions: ['Alanı büyüt.'],
        constraints: [],
        safetyNotes: null,
        boardDocument: board,
        source: {
          kind: 'ORIGINAL',
          title: 'Özgün',
          license: 'NGCS_PROPRIETARY',
          sourceUrl: null,
          attribution: null,
        },
        ageVariants: [
          {
            ageGroup: 'U14',
            durationMin: 18,
            playerMin: 8,
            playerMax: 14,
            areaLengthM: 30,
            areaWidthM: 20,
            rules: ['Üç pas.'],
            coachingPoints: ['Çevre kontrolü.'],
          },
        ],
      },
    ],
  };
}
function legacySource() {
  const drill = source();
  const version = drill.versions[0];
  return {
    ...drill,
    jsonData: null,
    versions: [
      {
        ...version,
        summary: 'Mevcut kayıt; içerik kaynağı ve uzman onayı doğrulanmadı.',
        organization: '',
        steps: [],
        coachingPoints: [],
        progressions: [],
        regressions: [],
        boardDocument: null,
        source: {
          ...version.source,
          kind: 'LEGACY',
          license: 'LEGACY_UNVERIFIED',
        },
      },
    ],
  };
}
function setup(
  drill: ReturnType<typeof source> | ReturnType<typeof legacySource> = source(),
) {
  const rows = [
    {
      id: 'old',
      drillId: 'old-drill',
      phase: 'TACTICAL',
      order: 2,
      notes: 'Korunacak',
      contentSnapshot: { schemaVersion: 1, title: 'Old', durationMin: 7 },
      boardSnapshot: board,
      drill: { durationMin: 500 },
    },
  ];
  const tx = {
    trainingPlan: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'p',
        clubId: 'c',
        groupId: 'g',
        group: { ageGroup: 'U14' },
      }),
      update: jest.fn(),
    },
    drill: { findUnique: jest.fn().mockResolvedValue(drill) },
    planDrill: {
      findMany: jest.fn().mockImplementation(async () => rows),
      create: jest.fn().mockImplementation(async ({ data }) => {
        const row = { ...data, id: 'new', drill };
        rows.push(row);
        return row;
      }),
    },
    dayPlan: { updateMany: jest.fn() },
  };
  const prisma = { $transaction: jest.fn((operation) => operation(tx)) };
  return {
    drill,
    rows,
    tx,
    service: new TrainingPlansService(prisma as never),
  };
}

describe('ready drill plan content', () => {
  it('attaches a boardless migrated legacy version and freezes its exact-age duration', async () => {
    const s = setup(legacySource());
    const old = structuredClone(s.rows[0]);
    const added = await s.service.addDrill(
      'p',
      'd',
      'TACTICAL',
      0,
      undefined,
      'v1',
    );
    expect(added.boardSnapshot).toBeUndefined();
    expect(added.contentSnapshot).toMatchObject({
      sourceVersionId: 'v1',
      ageGroup: 'U14',
      durationMin: 18,
      steps: [],
      source: { license: 'LEGACY_UNVERIFIED' },
    });
    expect(s.tx.trainingPlan.update).toHaveBeenCalledWith({
      where: { id: 'p' },
      data: { totalDuration: 25 },
    });
    expect(s.tx.dayPlan.updateMany).toHaveBeenCalledWith({
      where: { trainingPlanId: 'p' },
      data: { duration: 25 },
    });
    expect(s.rows[0]).toEqual(old);
  });
  it('also permits a new boardless legacy phase through replaceDrills', async () => {
    const s = setup(legacySource());
    const createMany = jest.fn();
    Object.assign(s.tx.drill, {
      findMany: jest.fn().mockResolvedValue([s.drill]),
    });
    Object.assign(s.tx.planDrill, { deleteMany: jest.fn(), createMany });
    s.tx.planDrill.findMany.mockResolvedValue([]);
    s.tx.trainingPlan.update.mockResolvedValue({ drills: [] });
    await s.service.replaceDrills('p', [
      { drillId: 'd', phase: 'TACTICAL', order: 0, expectedVersionId: 'v1' },
    ]);
    expect(createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          drillId: 'd',
          boardSnapshot: undefined,
          contentSnapshot: expect.objectContaining({
            sourceVersionId: 'v1',
            durationMin: 18,
          }),
        }),
      ],
    });
    expect(s.tx.dayPlan.updateMany).toHaveBeenCalledWith({
      where: { trainingPlanId: 'p' },
      data: { duration: 18 },
    });
  });
  it.each([
    ['v2', 'U14', ConflictException],
    ['v1', 'U13', BadRequestException],
  ])(
    'keeps version and exact-age guards for boardless legacy content',
    (expected, age, error) => {
      expect(() =>
        resolvePlanContent(
          legacySource() as never,
          age as string,
          expected as string,
        ),
      ).toThrow(error);
    },
  );
  it.each([
    ['ORIGINAL', 'NGCS_PROPRIETARY', null],
    ['LEGACY', 'NGCS_PROPRIETARY', null],
    ['ORIGINAL', 'LEGACY_UNVERIFIED', null],
    ['LEGACY', 'LEGACY_UNVERIFIED', {}],
  ])(
    'still rejects missing professional or malformed legacy boards (%s/%s)',
    (kind, license, boardDocument) => {
      const drill = legacySource();
      Object.assign(drill.versions[0], { boardDocument });
      Object.assign(drill.versions[0].source, { kind, license });
      expect(() => resolvePlanContent(drill as never, 'U14', 'v1')).toThrow(
        BadRequestException,
      );
    },
  );
  it('validates and preserves a migrated legacy diagram when one exists', () => {
    const drill = legacySource();
    Object.assign(drill.versions[0], { boardDocument: board });
    expect(
      resolvePlanContent(drill as never, 'U14', 'v1').boardSnapshot,
    ).toEqual(board);
  });
  it('rechecks a revoked actor inside the attachment transaction', async () => {
    const s = setup();
    Object.assign(s.tx, {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          status: 'SUSPENDED',
          role: 'COACH',
          clubId: 'c',
        }),
      },
    });
    await expect(
      s.service.addDrill('p', 'd', 'TACTICAL', 0, undefined, 'v1', {
        id: 'coach',
        role: 'COACH',
        clubId: 'c',
      } as never),
    ).rejects.toThrow('Plan erişimi değişti');
    expect(s.tx.planDrill.create).not.toHaveBeenCalled();
  });
  it('freezes the exact age and published board, appends and uses frozen totals', async () => {
    const s = setup();
    const added = await s.service.addDrill(
      'p',
      'd',
      'WARM_UP',
      0,
      'Yeni not',
      'v1',
    );
    expect(added).toMatchObject({
      phase: 'TACTICAL',
      order: 3,
      notes: 'Yeni not',
      boardSnapshot: board,
      contentSnapshot: {
        sourceVersionId: 'v1',
        ageGroup: 'U14',
        durationMin: 18,
        title: 'Pres oyunu',
        rules: ['Üç pas.'],
      },
    });
    expect(s.tx.trainingPlan.update).toHaveBeenCalledWith({
      where: { id: 'p' },
      data: { totalDuration: 25 },
    });
    expect(s.tx.dayPlan.updateMany).toHaveBeenCalledWith({
      where: { trainingPlanId: 'p' },
      data: { duration: 25 },
    });
    expect(s.rows[0]).toMatchObject({
      id: 'old',
      notes: 'Korunacak',
      boardSnapshot: board,
    });
  });
  it.each([
    ['v2', 'U14', ConflictException],
    ['v1', 'U13', BadRequestException],
  ])(
    'rejects a changed version or unsupported exact age',
    (expected, age, error) => {
      expect(() =>
        resolvePlanContent(
          source() as never,
          age as string,
          expected as string,
        ),
      ).toThrow(error);
    },
  );
  it('never treats an unpublished version as a legacy drill', () => {
    expect(() =>
      resolvePlanContent({ ...source(), versions: [] } as never, 'U14'),
    ).toThrow(BadRequestException);
    expect(
      resolvePlanContent(
        { ...source(), _count: { versions: 0 }, versions: [] } as never,
        'U14',
      ),
    ).toEqual({ contentSnapshot: undefined, boardSnapshot: undefined });
  });
  it('retains frozen title and duration when the source changes; legacy rows still use the source', () => {
    const result = projectPlanContent({
      drills: [
        {
          contentSnapshot: {
            schemaVersion: 1,
            title: 'Frozen',
            durationMin: 18,
          },
          drill: { title: 'Changed', durationMin: 90 },
        },
        { drill: { title: 'Legacy', durationMin: 9 } },
      ],
    });
    expect(result.drills.map((item) => item.drill)).toEqual([
      { title: 'Frozen', durationMin: 18 },
      { title: 'Legacy', durationMin: 9 },
    ]);
  });
  it('rejects duplicate attachments without writing or changing totals', async () => {
    const s = setup();
    s.rows[0].drillId = 'd';
    await expect(
      s.service.addDrill('p', 'd', 'TACTICAL', 0, undefined, 'v1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(s.tx.planDrill.create).not.toHaveBeenCalled();
    expect(s.tx.trainingPlan.update).not.toHaveBeenCalled();
  });
  it('projects frozen board absence without changing legacy source fallback or light metadata', () => {
    const contentSnapshot = {
      schemaVersion: 1,
      title: 'Frozen',
      durationMin: 5,
    };
    const result = projectPlanContent({
      drills: [
        {
          contentSnapshot,
          boardSnapshot: null,
          drill: { title: 'Changed', durationMin: 9, jsonData: board },
        },
        {
          contentSnapshot: null,
          boardSnapshot: null,
          drill: { title: 'Legacy', durationMin: 9, jsonData: board },
        },
        { contentSnapshot, drill: { title: 'Light', durationMin: 9 } },
      ],
    });
    expect(result.drills[0].drill).toEqual({
      title: 'Frozen',
      durationMin: 5,
      jsonData: null,
    });
    expect(result.drills[1].drill.jsonData).toEqual(board);
    expect(result.drills[2].drill).toEqual({ title: 'Frozen', durationMin: 5 });
  });
});
