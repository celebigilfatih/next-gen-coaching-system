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
function setup() {
  const drill = source();
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
});
