import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthPrincipal } from '../auth/auth-principal';
import {
  TacticalDocumentService,
  type TacticalResource,
} from './tactical-document.service';
import {
  assertLegacyTacticalRead,
  tacticalWriteToken,
} from './tactical-persistence';
import { DrillsService } from '../drills/drills.service';
import { AuthorizationService } from '../auth/authorization.service';
import { TrainingPlansService } from '../training-plans/training-plans.service';
import { SeasonsService } from '../seasons/seasons.service';
import { DrillContentService } from '../drills/drill-content.service';

const v1 = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'full', width: 1200, height: 800 },
  elements: [],
};
const v2 = {
  schemaVersion: 2,
  kind: 'tactical-board',
  scenes: [
    {
      id: 'scene',
      title: 'Scene',
      holdMs: 1000,
      transition: 'cut',
      transitionMs: 0,
      board: v1,
    },
  ],
};
const coach: AuthPrincipal = {
  id: 'coach',
  userId: 'coach',
  email: 'synthetic@example.test',
  role: 'COACH',
  clubId: 'club',
};
const resources: TacticalResource[] = [
  { kind: 'drill', id: 'drill' },
  { kind: 'plan', id: 'phase', planId: 'plan' },
  { kind: 'match', id: 'match' },
];

function fixture() {
  const drill = {
    id: 'drill',
    scope: 'CLUB',
    clubId: 'club',
    groupId: 'group',
    createdById: 'coach',
    jsonData: structuredClone(v1) as any,
    title: 'Plan',
    category: 'TACTICAL',
    ageGroup: 'U18',
    difficulty: 'MEDIUM',
    durationMin: 10,
  };
  const phase = {
    id: 'phase',
    drillId: 'drill',
    trainingPlanId: 'plan',
    boardSnapshot: null as any,
    drill,
  };
  const match = { id: 'match', seasonId: 'season', tacticalBoard: null as any };
  const tx = {
    drill: {
      findUnique: jest.fn(async () => drill),
      update: jest.fn(async ({ data }) => Object.assign(drill, data)),
      create: jest.fn(async ({ data }) => ({ id: 'copy', ...data })),
      findMany: jest.fn(async () => [drill]),
    },
    drillVersion: { count: jest.fn(async () => 0) },
    planDrill: {
      findFirst: jest.fn(async () => phase),
      findMany: jest.fn(async () => [phase]),
      update: jest.fn(async ({ data }) => Object.assign(phase, data)),
      deleteMany: jest.fn(),
    },
    trainingPlan: {
      findUnique: jest.fn(async () => ({
        id: 'plan',
        clubId: 'club',
        groupId: 'group',
      })),
    },
    match: {
      findUnique: jest.fn(async () => match),
      update: jest.fn(async ({ data }) => Object.assign(match, data)),
    },
    season: {
      findUnique: jest.fn(async () => ({
        id: 'season',
        clubId: 'club',
        groupId: 'group',
      })),
    },
    groupMember: { findFirst: jest.fn(async () => ({ id: 'member' }) as any) },
    playerGroup: {
      findUnique: jest.fn(async () => ({
        id: 'group',
        clubId: 'club',
        archivedAt: null,
        ageGroup: 'U18',
      })),
    },
  };
  const prisma = { ...tx, $transaction: jest.fn(async (work) => work(tx)) };
  return {
    tx,
    prisma,
    drill,
    phase,
    match,
    service: new TacticalDocumentService(prisma as unknown as PrismaService),
  };
}

describe('Versioned tactical persistence', () => {
  it('returns authorized plan provenance and changes it only after the whole snapshot is saved', async () => {
    const { service, phase, drill } = fixture();
    drill.jsonData = v2;
    const source = await service.read(coach, resources[1]);
    expect(source.phase).toEqual({
      planId: 'plan',
      planDrillId: 'phase',
      drillId: 'drill',
      origin: 'drill',
    });
    process.env.TACTICAL_V2_WRITES_ENABLED = 'true';
    const snapshot = await service.write(coach, resources[1], {
      document: v2,
      expectedWriteToken: source.writeToken,
    });
    expect(snapshot.phase?.origin).toBe('snapshot');
    expect(snapshot.writeToken).not.toBe(source.writeToken);
    expect(phase.boardSnapshot).toEqual(v2);
    drill.jsonData = v1;
    expect(await service.read(coach, resources[1])).toEqual(snapshot);
  });
  it('returns null origin only when both plan snapshot and source are absent', async () => {
    const { service, drill } = fixture();
    drill.jsonData = null;
    const result = await service.read(coach, resources[1]);
    expect(result.document).toBeNull();
    expect(result.phase?.origin).toBeNull();
  });
  it('keeps a frozen boardless phase and its write token unchanged after a source edit', async () => {
    const { service, phase, drill } = fixture();
    Object.assign(phase, {
      contentSnapshot: { schemaVersion: 1, title: 'Frozen', durationMin: 5 },
    });
    drill.jsonData = null;
    const before = await service.read(coach, resources[1]);
    expect(before.document).toBeNull();
    drill.jsonData = v1;
    expect(await service.read(coach, resources[1])).toEqual(before);
    expect(phase.boardSnapshot).toBeNull();
  });
  it('permits an explicit first plan board using the absent token after the source becomes V2', async () => {
    const { service, phase, drill } = fixture();
    Object.assign(phase, {
      contentSnapshot: { schemaVersion: 1, title: 'Frozen', durationMin: 5 },
    });
    drill.jsonData = null;
    const before = await service.read(coach, resources[1]);
    drill.jsonData = v2;
    const saved = await service.write(coach, resources[1], {
      document: v1,
      expectedWriteToken: before.writeToken,
    });
    expect(saved.document).toEqual(v1);
    expect(saved.phase?.origin).toBe('snapshot');
    expect(phase.boardSnapshot).toEqual(v1);
    drill.jsonData = null;
    expect(await service.read(coach, resources[1])).toEqual(saved);
  });
  it('allows the legacy first-board save for frozen absence even when the source is V2', async () => {
    const { prisma, phase, drill } = fixture();
    Object.assign(phase, {
      contentSnapshot: { schemaVersion: 1, title: 'Frozen', durationMin: 5 },
    });
    drill.jsonData = v2;
    const saved = await new TrainingPlansService(
      prisma as unknown as PrismaService,
    ).updateBoardSnapshot('plan', 'phase', v1);
    expect(saved.boardSnapshot).toEqual(v1);
    expect(phase.boardSnapshot).toEqual(v1);
    expect(drill.jsonData).toEqual(v2);
  });
  it('does not add plan identities to unrelated resource responses', async () => {
    const { service } = fixture();
    expect(await service.read(coach, resources[0])).not.toHaveProperty('phase');
    expect(await service.read(coach, resources[2])).not.toHaveProperty('phase');
  });
  const metadata = {
    title: 'Updated',
    category: 'TACTICAL',
    durationMin: 25,
    difficulty: 'MEDIUM',
    equipment: 'Balls',
  };
  it.each([
    { title: '' },
    { durationMin: 0 },
    { durationMin: 301 },
    { category: ['TACTICAL'] },
    { difficulty: ['MEDIUM'] },
    { equipment: 1 },
  ])('rejects invalid metadata without persistence: %j', async (invalid) => {
    const { service, tx } = fixture();
    await expect(
      service.createDrill(coach, {
        groupId: 'group',
        metadata: { ...metadata, ...invalid },
        document: v1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.drill.create).not.toHaveBeenCalled();
  });
  it('selects board-free drill metadata and rejects unknown query fields', async () => {
    const { service, tx } = fixture();
    await service.drillMetadata(coach, 'drill');
    for (const [args] of tx.drill.findUnique.mock.calls as unknown as [
      { select: Record<string, boolean> },
    ][]) {
      expect(args.select.jsonData).toBeUndefined();
    }
    await expect(
      service.drillMetadata(coach, 'drill', { rogue: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('saves metadata and document in one transaction and rejects stale updates before metadata writes', async () => {
    const { service, drill, tx } = fixture();
    const before = await service.read(coach, resources[0]);
    const saved = await service.saveDrill(coach, 'drill', {
      metadata,
      document: v1,
      expectedWriteToken: before.writeToken,
    });
    expect(saved.drill.title).toBe('Updated');
    expect(drill.durationMin).toBe(25);
    tx.drill.update.mockClear();
    await expect(
      service.saveDrill(coach, 'drill', {
        metadata,
        document: v1,
        expectedWriteToken: 'td1_' + '0'.repeat(64),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.drill.update).not.toHaveBeenCalled();
  });
  it('derives club, age and author from the authorized target and rechecks the copy source token', async () => {
    const { service, tx } = fixture();
    const { writeToken } = await service.read(coach, resources[0]);
    const input = {
      groupId: 'group',
      metadata,
      document: v1,
      sourceId: 'drill',
      expectedSourceToken: writeToken,
    };
    const result = await service.createDrill(coach, input);
    expect(result.drill).toMatchObject({
      id: 'copy',
      clubId: 'club',
      groupId: 'group',
      createdById: 'coach',
      ageGroup: 'U18',
      scope: 'CLUB',
    });
    tx.drill.create.mockClear();
    await expect(
      service.createDrill(coach, { ...input, expectedSourceToken: 'old' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.drill.create).not.toHaveBeenCalled();
  });
  it.each(['clubId', 'createdById', 'scope', 'ageGroup', 'jsonData'])(
    'rejects ownership or legacy field %s in tactical create',
    async (key) => {
      await expect(
        fixture().service.createDrill(coach, {
          groupId: 'group',
          metadata,
          document: v1,
          [key]: 'forged',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
  it('rejects nested unknown metadata, PLAYER, foreign group and disabled V2 without a create', async () => {
    const { service, tx } = fixture();
    const input = { groupId: 'group', metadata, document: v1 };
    await expect(
      service.createDrill(coach, {
        ...input,
        metadata: { ...metadata, ageGroup: 'U12' },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.createDrill({ ...coach, role: 'PLAYER' }, input),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.createDrill({ ...coach, clubId: 'other' }, input),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.createDrill(coach, { ...input, document: v2 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.drill.create).not.toHaveBeenCalled();
  });
  it('preserves global review workflow and denies a revoked copy source', async () => {
    const { service, tx, drill } = fixture();
    drill.scope = 'GLOBAL';
    await expect(
      service.saveDrill({ ...coach, role: 'SYSTEM_ADMIN' }, 'drill', {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
    tx.drillVersion.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    await expect(
      service.createDrill(coach, {
        groupId: 'group',
        metadata,
        document: v1,
        sourceId: 'drill',
        expectedSourceToken: 'old',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.drill.create).not.toHaveBeenCalled();
  });
  const previousFlag = process.env.TACTICAL_V2_WRITES_ENABLED;
  beforeEach(() => {
    delete process.env.TACTICAL_V2_WRITES_ENABLED;
  });
  afterAll(() => {
    if (previousFlag === undefined)
      delete process.env.TACTICAL_V2_WRITES_ENABLED;
    else process.env.TACTICAL_V2_WRITES_ENABLED = previousFlag;
  });

  it('canonical hash ignores object key order but binds identity, null and array order', () => {
    expect(tacticalWriteToken('a', { a: 1, b: 2 })).toBe(
      tacticalWriteToken('a', { b: 2, a: 1 }),
    );
    expect(tacticalWriteToken('a', [1, 2])).not.toBe(
      tacticalWriteToken('a', [2, 1]),
    );
    expect(tacticalWriteToken('a', null)).not.toBe(
      tacticalWriteToken('b', null),
    );
    expect(tacticalWriteToken('a', null)).not.toBe(tacticalWriteToken('a', {}));
  });

  it.each(resources)(
    'reads, writes V1 and rejects stale tokens: $kind',
    async (resource) => {
      const { service, prisma } = fixture();
      const initial = await service.read(coach, resource);
      const result = await service.write(coach, resource, {
        document: v1,
        expectedWriteToken: initial.writeToken,
      });
      expect(result.document).toEqual(v1);
      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
        isolationLevel: 'Serializable',
      });
      await expect(
        service.write(coach, resource, {
          document: v1,
          expectedWriteToken: 'td1_' + '0'.repeat(64),
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    },
  );

  it.each(resources)(
    'gates V2 writes, but not V2 reads or downgrade protection: $kind',
    async (resource) => {
      const { service } = fixture();
      const initial = await service.read(coach, resource);
      await expect(
        service.write(coach, resource, {
          document: v2,
          expectedWriteToken: initial.writeToken,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      process.env.TACTICAL_V2_WRITES_ENABLED = 'true';
      const saved = await service.write(coach, resource, {
        document: v2,
        expectedWriteToken: initial.writeToken,
      });
      delete process.env.TACTICAL_V2_WRITES_ENABLED;
      expect((await service.read(coach, resource)).document).toEqual(v2);
      await expect(
        service.write(coach, resource, {
          document: v1,
          expectedWriteToken: saved.writeToken,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    },
  );

  it.each(resources)(
    'denies player writes, cross-tenant and revoked membership before body validation: $kind',
    async (resource) => {
      const { service, tx } = fixture();
      await expect(
        service.write({ ...coach, role: 'PLAYER' }, resource, null),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.read({ ...coach, clubId: 'other' }, resource),
      ).rejects.toBeInstanceOf(ForbiddenException);
      tx.groupMember.findFirst.mockResolvedValue(null);
      await expect(service.write(coach, resource, null)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(tx.drill.update).not.toHaveBeenCalled();
      expect(tx.planDrill.update).not.toHaveBeenCalled();
      expect(tx.match.update).not.toHaveBeenCalled();
    },
  );

  it.each(resources)(
    'permits own-club admin and system admin management: $kind',
    async (resource) => {
      const { service } = fixture();
      for (const role of ['CLUB_ADMIN', 'SYSTEM_ADMIN'] as const) {
        const principal = { ...coach, role };
        const initial = await service.read(principal, resource);
        await expect(
          service.write(principal, resource, {
            document: v1,
            expectedWriteToken: initial.writeToken,
          }),
        ).resolves.toHaveProperty('document', v1);
      }
    },
  );

  it('denies another coach ownership and global writes, including system admin', async () => {
    const { service, drill } = fixture();
    drill.createdById = 'other';
    await expect(service.write(coach, resources[0], {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    drill.scope = 'GLOBAL';
    await expect(
      service.write({ ...coach, role: 'SYSTEM_ADMIN' }, resources[0], {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not expose unpublished global content to operational roles', async () => {
    const { service, tx, drill } = fixture();
    drill.scope = 'GLOBAL';
    tx.drillVersion.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    await expect(service.read(coach, resources[0])).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it.each([
    null,
    [],
    {},
    { document: v1 },
    { document: v1, expectedWriteToken: 'bad' },
  ])('rejects malformed bodies %#', async (body) => {
    await expect(
      fixture().service.write(coach, resources[0], body),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unknown ownership/body fields, query fields and invalid/null documents', async () => {
    const { service, tx } = fixture();
    const { writeToken } = await service.read(coach, resources[0]);
    for (const document of [null, { ...v1, rogue: true }]) {
      await expect(
        service.write(coach, resources[0], {
          document,
          expectedWriteToken: writeToken,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
    await expect(
      service.write(coach, resources[0], {
        document: v1,
        expectedWriteToken: writeToken,
        authorId: 'other',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.read(coach, resources[0], { clubId: 'other' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.drill.update).not.toHaveBeenCalled();
  });

  it('tracks source changes and snapshot provenance, then isolates a saved snapshot', async () => {
    const { service, drill, phase } = fixture();
    const before = await service.read(coach, resources[1]);
    drill.jsonData = v2;
    const changed = await service.read(coach, resources[1]);
    expect(changed.writeToken).not.toBe(before.writeToken);
    await expect(
      service.write(coach, resources[1], {
        document: v1,
        expectedWriteToken: before.writeToken,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    process.env.TACTICAL_V2_WRITES_ENABLED = 'true';
    const saved = await service.write(coach, resources[1], {
      document: v2,
      expectedWriteToken: changed.writeToken,
    });
    expect(saved.writeToken).not.toBe(changed.writeToken);
    drill.jsonData = v1;
    expect(await service.read(coach, resources[1])).toEqual(saved);
    phase.drillId = 'other-source';
    expect((await service.read(coach, resources[1])).writeToken).not.toBe(
      saved.writeToken,
    );
  });

  it('does not fall back from malformed snapshot to a valid source', async () => {
    const { service, phase } = fixture();
    phase.boardSnapshot = { schemaVersion: 2 };
    await expect(service.read(coach, resources[1])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rechecks source scope even with a saved snapshot', async () => {
    const { service, drill, phase } = fixture();
    phase.boardSnapshot = v1;
    drill.clubId = 'other';
    await expect(service.read(coach, resources[1])).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('uses explicit 404 for missing resource', async () => {
    const { service, tx } = fixture();
    tx.drill.findUnique.mockResolvedValue(null as never);
    await expect(service.read(coach, resources[0])).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps serialization failure to 409 without retry or private logging', async () => {
    const { service, prisma } = fixture();
    prisma.$transaction.mockRejectedValue({
      code: 'P2034',
      message: 'private body',
    });
    await expect(service.read(coach, resources[0])).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('contains unexpected persistence errors without body/cause', async () => {
    const { service, prisma } = fixture();
    const log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    try {
      prisma.$transaction.mockRejectedValue(new Error('private body'));
      const error = await service
        .read(coach, resources[0])
        .catch((error: unknown) => error);
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error).not.toHaveProperty('cause');
      expect(log).toHaveBeenCalledWith('TACTICAL_DOCUMENT_PERSISTENCE_FAILED');
    } finally {
      log.mockRestore();
    }
  });

  it.each([v1, null, {}])(
    'blocks legacy drill overwrite %# while preserving metadata-only updates',
    async (incoming) => {
      const { prisma, drill } = fixture();
      drill.jsonData = v2;
      const service = new DrillsService(
        prisma as unknown as PrismaService,
        new AuthorizationService(prisma as unknown as PrismaService),
      );
      await expect(
        service.update(coach, drill.id, { jsonData: incoming }),
      ).rejects.toBeInstanceOf(ConflictException);
      await service.update(coach, drill.id, { title: 'Metadata' });
      expect(drill.jsonData).toEqual(v2);
      expect(prisma.drill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ jsonData: expect.anything() }),
        }),
      );
    },
  );

  it('blocks legacy phase replacement, source downgrade and match overwrite', async () => {
    const { prisma, drill, match, tx } = fixture();
    drill.jsonData = v2;
    const plans = new TrainingPlansService(prisma as unknown as PrismaService);
    await expect(
      plans.updateBoardSnapshot('plan', 'phase', v1),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      plans.replaceDrills('plan', [
        { drillId: 'drill', phase: 'TACTICAL', order: 0 },
      ]),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.planDrill.deleteMany).not.toHaveBeenCalled();
    match.tacticalBoard = v2;
    await expect(
      new SeasonsService(
        prisma as unknown as PrismaService,
      ).updateMatchTacticalBoard('match', v1),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.match.update).not.toHaveBeenCalled();
  });

  it('rejects editorial publication over an existing V2 before any version/archive/audit writes', async () => {
    const tx = {
      drill: {
        findUnique: jest.fn().mockResolvedValue({ jsonData: v2 }),
        update: jest.fn(),
      },
      drillVersion: { updateMany: jest.fn(), update: jest.fn() },
      securityAuditEvent: { create: jest.fn() },
    };
    const prisma = {
      drillVersion: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'version',
          drillId: 'drill',
          status: 'APPROVED',
          reviewedById: 'reviewer',
          boardDocument: v1,
        }),
      },
      $transaction: jest.fn(async (work) => work(tx)),
    };
    const service = new DrillContentService(
      prisma as unknown as PrismaService,
      {} as AuthorizationService,
    );
    await expect(
      service.publish({ ...coach, role: 'SYSTEM_ADMIN' }, 'version'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.drill.update).not.toHaveBeenCalled();
    expect(tx.drillVersion.updateMany).not.toHaveBeenCalled();
    expect(tx.securityAuditEvent.create).not.toHaveBeenCalled();
  });

  it('rejects V2 in nested legacy reads instead of returning an empty board', () => {
    expect(() =>
      assertLegacyTacticalRead({ drills: [{ drill: { jsonData: v2 } }] }),
    ).toThrow(ConflictException);
    expect(() =>
      assertLegacyTacticalRead({ tacticalBoard: { schemaVersion: 2 } }),
    ).toThrow(ConflictException);
    expect(assertLegacyTacticalRead({ jsonData: v1 })).toEqual({
      jsonData: v1,
    });
  });
});
