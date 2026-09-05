import { StatsService } from './stats.service';

describe('StatsService tenant boundaries', () => {
  const prisma = {
    trainingPlan: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: { count: jest.fn() },
    drill: { findMany: jest.fn() },
    match: { findMany: jest.fn() },
  };
  const service = new StatsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.trainingPlan.count.mockResolvedValue(0);
    prisma.trainingPlan.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);
    prisma.drill.findMany.mockResolvedValue([]);
    prisma.match.findMany.mockResolvedValue([]);
  });

  it('limits a club dashboard to global and same-club drills with a safe projection', async () => {
    await service.getDashboardStats('club-a');

    expect(prisma.drill.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ scope: 'GLOBAL' }, { scope: 'CLUB', clubId: 'club-a' }],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        ageGroup: true,
        durationMin: true,
        difficulty: true,
        scope: true,
        clubId: true,
        groupId: true,
        createdAt: true,
      },
    });
  });

  it('preserves the global system-admin dashboard when no club is selected', async () => {
    await service.getDashboardStats();

    expect(prisma.drill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });
});
