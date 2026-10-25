import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService legacy mutation adapter', () => {
  const cases = [
    [
      'playerPerformance',
      'createPlayerPerformance',
      'updatePlayerPerformance',
      {
        rating: '7.5',
        speed: '8',
        technique: '7',
        endurance: '6',
        tactical: '9',
        form: '8',
      },
      {
        rating: 7.5,
        speed: 8,
        technique: 7,
        endurance: 6,
        tactical: 9,
        form: 8,
      },
    ],
    [
      'videoAnalysis',
      'createVideoAnalysis',
      'updateVideoAnalysis',
      { clipsCount: '3' },
      { clipsCount: 3 },
    ],
    [
      'analysisReport',
      'createReport',
      'updateReport',
      { title: 'Report' },
      { title: 'Report' },
    ],
    [
      'teamPerformance',
      'createTeamPerformance',
      'updateTeamPerformance',
      {
        rating: '7.5',
        passAccuracy: '80',
        possession: '55',
        shotsOnTarget: '4',
        goalsScored: '2',
        goalsConceded: '1',
      },
      {
        rating: 7.5,
        passAccuracy: 80,
        possession: 55,
        shotsOnTarget: 4,
        goalsScored: 2,
        goalsConceded: 1,
      },
    ],
    [
      'scoutingReport',
      'createScoutingReport',
      'updateScoutingReport',
      { opponent: 'Demo' },
      { opponent: 'Demo' },
    ],
    [
      'matchAnalysis',
      'createMatchAnalysis',
      'updateMatchAnalysisStandalone',
      {
        rating: '7.5',
        passAccuracy: '80',
        possession: '55',
        shotsOnTarget: '4',
        goalsScored: '2',
        goalsConceded: '1',
      },
      {
        rating: 7.5,
        passAccuracy: 80,
        possession: 55,
        shotsOnTarget: 4,
        goalsScored: 2,
        goalsConceded: 1,
      },
    ],
  ] as const;

  it.each(cases)(
    '%s preserves omissions, conversions and the caller payload',
    async (model, create, update, values, expected) => {
      const delegate = { create: jest.fn(), update: jest.fn() };
      const service = new AnalyticsService({
        [model]: delegate,
      } as unknown as PrismaService);
      const input = Object.freeze({
        id: 'caller-id',
        createdAt: 'caller-created',
        updatedAt: 'caller-updated',
        date: '2026-09-05T12:00:00.000Z',
        ...values,
        ...(model === 'playerPerformance'
          ? { player: { id: 'nested-player' }, playerId: 'player-id' }
          : {}),
      });
      const data = {
        date: new Date(input.date),
        ...expected,
        ...(model === 'playerPerformance' ? { playerId: 'player-id' } : {}),
      };
      await service[create](input);
      expect(delegate.create).toHaveBeenCalledWith({ data });
      await service[update]('route-id', input);
      expect(delegate.update).toHaveBeenCalledWith({
        where: { id: 'route-id' },
        data,
      });
      expect(input.date).toBe('2026-09-05T12:00:00.000Z');
      expect(input.id).toBe('caller-id');
    },
  );

  it('keeps the Match allowlist and route identity', async () => {
    const update = jest.fn();
    const service = new AnalyticsService({
      match: { update },
    } as unknown as PrismaService);
    await service.updateMatchAnalysis('route-match', {
      id: 'other-match',
      createdAt: 'ignored',
      updatedAt: 'ignored',
      notes: 'Demo note',
      date: '2026-09-05T12:00:00.000Z',
      tacticalBoard: { ignored: true },
      seasonId: 'other-season',
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'route-match' },
      data: { notes: 'Demo note', date: new Date('2026-09-05T12:00:00.000Z') },
    });
  });

  it('preserves null/undefined rejection before any database call', async () => {
    const service = new AnalyticsService({} as PrismaService);
    for (const input of [null, undefined]) {
      for (const [, create, update] of cases) {
        await expect(service[create](input)).rejects.toBeInstanceOf(TypeError);
        await expect(service[update]('route-id', input)).rejects.toBeInstanceOf(
          TypeError,
        );
      }
      await expect(
        service.updateMatchAnalysis('route-match', input),
      ).rejects.toBeInstanceOf(TypeError);
    }
  });
});
