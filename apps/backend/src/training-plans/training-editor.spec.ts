import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import type { AuthorizationService } from '../auth/authorization.service';
import type { PrismaService } from '../prisma/prisma.service';
import { TrainingEditorController } from './training-editor.controller';
import { TrainingEditorService } from './training-editor.service';
import {
  assertEditorReadQuery,
  editorReadIdentifier,
} from './dto/editor-read.dto';

const principal = {
  id: 'coach',
  role: 'COACH',
  clubId: 'club',
} as AuthPrincipal;
const identity = { planId: 'plan', planDrillId: 'phase', drillId: 'source' };
const board = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'full', width: 1200, height: 800 },
  elements: [],
};

function setup() {
  const findUnique = jest.fn().mockResolvedValue({ id: 'plan', drills: [] });
  const queryRaw = jest
    .fn()
    .mockResolvedValue([{ ...identity, origin: 'snapshot', document: board }]);
  const assertPlanView = jest.fn().mockResolvedValue({ id: 'plan' });
  const assertPlanDrillSourceView = jest.fn().mockResolvedValue({
    id: 'phase',
    drill: { id: 'source' },
  });
  const service = new TrainingEditorService(
    {
      trainingPlan: { findUnique },
      $queryRaw: queryRaw,
    } as unknown as PrismaService,
    {
      assertPlanView,
      assertPlanDrillSourceView,
    } as unknown as AuthorizationService,
  );
  return {
    service,
    findUnique,
    queryRaw,
    assertPlanView,
    assertPlanDrillSourceView,
  };
}

describe('training editor read input', () => {
  it.each([
    undefined,
    null,
    1,
    [],
    {},
    '',
    ' x',
    'x ',
    'x\ny',
    'x\x7fy',
    'x'.repeat(161),
  ])('rejects malformed or unbounded identifier %j', (value) => {
    expect(() => editorReadIdentifier(value)).toThrow(BadRequestException);
  });
  it('accepts bounded identifiers without treating them as SQL', () => {
    expect(editorReadIdentifier('x'.repeat(160))).toHaveLength(160);
    expect(editorReadIdentifier("quote'--")).toBe("quote'--");
    expect(() => assertEditorReadQuery({})).not.toThrow();
  });
  it.each([
    undefined,
    null,
    [],
    'x',
    { limit: '1' },
    { clubId: 'other' },
    { include: 'drill' },
  ])('rejects any query controls %j', (input) => {
    expect(() => assertEditorReadQuery(input)).toThrow(BadRequestException);
  });
});

describe('training editor reads', () => {
  afterEach(() => jest.restoreAllMocks());

  it('selects complete scalar metadata in deterministic phase/order/id order', async () => {
    const s = setup();
    await expect(s.service.metadata(principal, 'plan', {})).resolves.toEqual({
      id: 'plan',
      drills: [],
    });
    expect(s.assertPlanView).toHaveBeenCalledWith(principal, 'plan');
    expect(s.findUnique).toHaveBeenCalledWith({
      where: { id: 'plan' },
      select: {
        id: true,
        title: true,
        groupId: true,
        date: true,
        notes: true,
        totalDuration: true,
        drills: {
          orderBy: [{ phase: 'asc' }, { order: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            drillId: true,
            phase: true,
            order: true,
            notes: true,
            contentSnapshot: true,
            drill: { select: { id: true, title: true, durationMin: true } },
          },
        },
      },
    });
    expect(s.queryRaw).not.toHaveBeenCalled();
    expect(s.assertPlanDrillSourceView).not.toHaveBeenCalled();
    expect(s.assertPlanView.mock.invocationCallOrder[0]).toBeLessThan(
      s.findUnique.mock.invocationCallOrder[0],
    );
  });

  it('rejects malformed input before authorization or content queries', async () => {
    const s = setup();
    await expect(s.service.metadata(principal, ' bad', {})).rejects.toThrow(
      BadRequestException,
    );
    await expect(s.service.board(principal, 'plan', '', {})).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      s.service.board(principal, 'plan', 'phase', { role: 'SYSTEM_ADMIN' }),
    ).rejects.toThrow(BadRequestException);
    expect(s.assertPlanView).not.toHaveBeenCalled();
    expect(s.queryRaw).not.toHaveBeenCalled();
    expect(s.findUnique).not.toHaveBeenCalled();
  });

  it('denies both reads before touching content when plan access is denied', async () => {
    const s = setup();
    s.assertPlanView.mockRejectedValue(new ForbiddenException());
    await expect(s.service.metadata(principal, 'plan', {})).rejects.toThrow(
      ForbiddenException,
    );
    await expect(
      s.service.board(principal, 'plan', 'phase', {}),
    ).rejects.toThrow(ForbiddenException);
    expect(s.findUnique).not.toHaveBeenCalled();
    expect(s.assertPlanDrillSourceView).not.toHaveBeenCalled();
    expect(s.queryRaw).not.toHaveBeenCalled();
  });

  it.each([new ForbiddenException(), new NotFoundException()])(
    'denies inaccessible or mismatched source before board SQL',
    async (error) => {
      const s = setup();
      s.assertPlanDrillSourceView.mockRejectedValue(error);
      await expect(
        s.service.board(principal, 'plan', 'phase', {}),
      ).rejects.toBe(error);
      expect(s.queryRaw).not.toHaveBeenCalled();
    },
  );

  it('checks plan then source and binds all three IDs into one effective JSON query', async () => {
    const s = setup();
    await expect(
      s.service.board(principal, 'plan', 'phase', {}),
    ).resolves.toEqual({
      ...identity,
      origin: 'snapshot',
      status: 'ready',
      document: board,
    });
    expect(s.assertPlanDrillSourceView).toHaveBeenCalledWith(
      principal,
      'plan',
      'phase',
    );
    expect(s.assertPlanView.mock.invocationCallOrder[0]).toBeLessThan(
      s.assertPlanDrillSourceView.mock.invocationCallOrder[0],
    );
    expect(
      s.assertPlanDrillSourceView.mock.invocationCallOrder[0],
    ).toBeLessThan(s.queryRaw.mock.invocationCallOrder[0]);
    const sql = s.queryRaw.mock.calls[0][0] as Prisma.Sql;
    expect(sql.values).toEqual(['plan', 'phase', 'source']);
    expect(sql.text).toContain('NULLIF(pd."boardSnapshot", \'null\'::jsonb)');
    expect(sql.text).toContain('COALESCE(');
    expect(sql.text).not.toContain('SELECT *');
    expect(s.queryRaw).toHaveBeenCalledTimes(1);
    expect(s.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 after an authorized plan or phase disappeared', async () => {
    const s = setup();
    s.findUnique.mockResolvedValue(null);
    s.queryRaw.mockResolvedValue([]);
    await expect(s.service.metadata(principal, 'plan', {})).rejects.toThrow(
      NotFoundException,
    );
    await expect(
      s.service.board(principal, 'plan', 'phase', {}),
    ).rejects.toThrow(NotFoundException);
  });

  it.each(['snapshot', 'drill'] as const)(
    'validates effective %s data',
    async (origin) => {
      const s = setup();
      s.queryRaw.mockResolvedValue([{ ...identity, origin, document: board }]);
      expect(await s.service.board(principal, 'plan', 'phase', {})).toEqual({
        ...identity,
        origin,
        status: 'ready',
        document: board,
      });
    },
  );

  it.each([
    false,
    0,
    '',
    { legacy: 'private-content' },
    { ...board, extra: true },
    { ...board, kind: 'unknown' },
    { ...board, elements: [{ id: 'x', type: 'unknown' }] },
    {
      ...board,
      elements: Array.from({ length: 251 }, (_, i) => ({
        id: `p${i}`,
        type: 'ball',
        x: 1,
        y: 1,
      })),
    },
    { ...board, extra: 'x'.repeat(100_000) },
  ])(
    'suppresses invalid stored content case %# without fallback or logging',
    async (document) => {
      const s = setup();
      const log = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      s.queryRaw.mockResolvedValue([
        { ...identity, origin: 'snapshot', document },
      ]);
      expect(await s.service.board(principal, 'plan', 'phase', {})).toEqual({
        ...identity,
        origin: 'snapshot',
        status: 'invalid',
        document: null,
      });
      expect(log).not.toHaveBeenCalled();
      expect(s.queryRaw).toHaveBeenCalledTimes(1);
    },
  );

  it('distinguishes absent from invalid and accepts 250 valid elements', async () => {
    const s = setup();
    s.queryRaw.mockResolvedValueOnce([
      { ...identity, origin: null, document: null },
    ]);
    expect(await s.service.board(principal, 'plan', 'phase', {})).toEqual({
      ...identity,
      origin: null,
      status: 'absent',
      document: null,
    });
    const document = {
      ...board,
      elements: Array.from({ length: 250 }, (_, i) => ({
        id: `p${i}`,
        type: 'ball',
        x: 1,
        y: 1,
      })),
    };
    s.queryRaw.mockResolvedValueOnce([
      { ...identity, origin: 'drill', document },
    ]);
    expect((await s.service.board(principal, 'plan', 'phase', {})).status).toBe(
      'ready',
    );
  });

  it.each(['plan-auth', 'source-auth', 'metadata', 'board'])(
    'contains raw persistence error at %s',
    async (stage) => {
      const s = setup();
      const log = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const failure = new Error('private SQL params and source data');
      const isMetadata = stage === 'metadata' || stage === 'plan-auth';
      if (stage === 'plan-auth') s.assertPlanView.mockRejectedValue(failure);
      if (stage === 'source-auth')
        s.assertPlanDrillSourceView.mockRejectedValue(failure);
      if (stage === 'metadata') s.findUnique.mockRejectedValue(failure);
      if (stage === 'board') s.queryRaw.mockRejectedValue(failure);
      const error = await (
        isMetadata
          ? s.service.metadata(principal, 'plan', {})
          : s.service.board(principal, 'plan', 'phase', {})
      ).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect((error as InternalServerErrorException).getResponse()).toEqual({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
      expect(log).toHaveBeenCalledWith(
        isMetadata
          ? 'TRAINING_EDITOR_METADATA_READ_FAILED'
          : 'TRAINING_EDITOR_BOARD_READ_FAILED',
      );
      expect(log).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveProperty('cause');
    },
  );

  it('forwards identity and input through the two controller actions', async () => {
    const metadata = jest.fn().mockResolvedValue({});
    const getBoard = jest.fn().mockResolvedValue({});
    const controller = new TrainingEditorController({
      metadata,
      board: getBoard,
    } as unknown as TrainingEditorService);
    await controller.metadata({ user: principal }, 'plan', {});
    await controller.board({ user: principal }, 'plan', 'phase', {});
    expect(metadata).toHaveBeenCalledWith(principal, 'plan', {});
    expect(getBoard).toHaveBeenCalledWith(principal, 'plan', 'phase', {});
  });
});
