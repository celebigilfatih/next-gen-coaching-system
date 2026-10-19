import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DrillContentStatus } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import {
  parseDrillContentBody,
  parseDrillContentDetailQuery,
  parseDrillContentQueueQuery,
} from './drill-content.dto';
import { DrillContentService } from './drill-content.service';

const board = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'full', width: 1200, height: 800 },
  elements: [],
};

const content = () => ({
  title: 'Yön değiştirerek pas oyunu',
  summary:
    'Oyuncuların baskı altında doğru açıyla destek verip yön değiştirmesini geliştirir.',
  category: 'TECHNICAL',
  difficulty: 'MEDIUM',
  objectiveKey: 'passing',
  objectiveLabel: 'Pas ve destek',
  themes: ['pas', 'ilk kontrol'],
  durationMin: 20,
  playerMin: 8,
  playerMax: 16,
  areaLengthM: 30,
  areaWidthM: 24,
  equipmentItems: ['top', 'koni'],
  organization:
    'Otuz metreye yirmi dört metrelik alanı iki koridora bölün ve oyuncuları dengeli dağıtın.',
  steps: ['Topu bir koridordan diğerine en fazla üç pasla taşıyın.'],
  coachingPoints: ['Pas öncesi omuz kontrolü ve açık vücut açısı isteyin.'],
  progressions: ['Temas sayısını ikiye düşürün.'],
  regressions: ['Alanı beş metre genişletin.'],
  constraints: ['Her yön değişiminde merkez oyuncusu kullanılmalıdır.'],
  safetyNotes: 'Oyuncuların çalışma alanları arasında güvenli mesafe bırakın.',
  boardDocument: board,
  source: {
    kind: 'NGCS_ORIGINAL',
    title: 'NGCS başlangıç paketi',
    license: 'NGCS_PROPRIETARY',
    contentHash: 'a'.repeat(64),
  },
  ageVariants: [
    {
      ageGroup: 'U16',
      durationMin: 20,
      playerMin: 8,
      playerMax: 16,
      areaLengthM: 30,
      areaWidthM: 24,
      rules: ['Üç pas içinde yön değiştir.'],
      coachingPoints: ['Pas öncesi çevre kontrolü yap.'],
    },
  ],
});

const author = {
  id: 'author',
  userId: 'author',
  email: 'author@ngcs.local',
  role: 'COACH',
  clubId: 'club',
} as AuthPrincipal;

const systemAdmin = {
  id: 'system-admin',
  userId: 'system-admin',
  email: 'system.admin@ngcs.local',
  role: 'SYSTEM_ADMIN',
  clubId: null,
} as AuthPrincipal;

describe('professional drill content', () => {
  it('accepts a complete original draft and rejects unknown fields', () => {
    expect(parseDrillContentBody(content())).toEqual(
      expect.objectContaining({ title: 'Yön değiştirerek pas oyunu' }),
    );
    expect(() =>
      parseDrillContentBody({ ...content(), authorId: 'claimed-author' }),
    ).toThrow(BadRequestException);
  });

  it('requires verifiable attribution for open-license sources', () => {
    const value = content();
    value.source = {
      kind: 'OPEN_LICENSE',
      title: 'Açık kaynak',
      license: 'CC_BY_4_0',
      contentHash: 'b'.repeat(64),
    } as typeof value.source;
    expect(() => parseDrillContentBody(value)).toThrow(BadRequestException);
  });

  it('rejects unknown content query fields and invalid status values', () => {
    expect(() => parseDrillContentQueueQuery({ status: 'READY' })).toThrow(
      BadRequestException,
    );
    expect(() => parseDrillContentQueueQuery({ clubId: 'claimed' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      parseDrillContentDetailQuery({ ageGroup: 'U16', extra: true }),
    ).toThrow(BadRequestException);
  });

  it('prevents an author from approving their own submitted version', async () => {
    const prisma = {
      drillVersion: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'version-1',
          drillId: 'drill-1',
          sourceId: 'source-1',
          version: 1,
          status: DrillContentStatus.IN_REVIEW,
          createdById: author.id,
        }),
      },
    };
    const authorization = {
      assertSportingCapability: jest.fn().mockResolvedValue(undefined),
    };
    const service = new DrillContentService(
      prisma as never,
      authorization as never,
    );

    await expect(
      service.approve(author, 'version-1', {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(authorization.assertSportingCapability).toHaveBeenCalledWith(
      author,
      'DRILL_CONTENT_REVIEW',
      'club',
    );
  });

  it('allows only a system administrator to publish an expert-approved version', async () => {
    const updated = {
      id: 'version-1',
      drillId: 'drill-1',
      version: 1,
      title: 'Yön değiştirerek pas oyunu',
      category: 'TECHNICAL',
      difficulty: 'MEDIUM',
      durationMin: 20,
      equipmentItems: ['top', 'koni'],
      boardDocument: board,
      ageVariants: [{ ageGroup: 'U16', durationMin: 20 }],
    };
    const tx = {
      drillVersion: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue(updated),
      },
      drill: {
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn().mockResolvedValue({ jsonData: board }),
      },
      securityAuditEvent: { create: jest.fn().mockResolvedValue({}) },
    };
    const prisma = {
      drillVersion: {
        findUnique: jest.fn().mockResolvedValue({
          ...updated,
          status: DrillContentStatus.APPROVED,
          reviewedById: 'reviewer',
        }),
      },
      $transaction: jest.fn((operation) => operation(tx)),
    };
    const service = new DrillContentService(prisma as never, {} as never);

    await expect(service.publish(author, 'version-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.publish(systemAdmin, 'version-1')).resolves.toBe(
      updated,
    );
    expect(tx.drillVersion.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          drillId: 'drill-1',
          status: DrillContentStatus.PUBLISHED,
        }),
      }),
    );
    expect(tx.drill.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'drill-1' } }),
    );
    expect(tx.securityAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'DRILL_CONTENT_PUBLISHED',
        metadata: {
          drillId: 'drill-1',
          versionId: 'version-1',
          version: 1,
        },
      }),
    });
  });
});
