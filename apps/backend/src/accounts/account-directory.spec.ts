import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AccountLifecycleService } from './account-lifecycle.service';
import { parseAccountPageQuery } from './dto/account-page.dto';

const principal = (
  role: AuthPrincipal['role'],
  clubId: string | null,
): AuthPrincipal => ({
  id: 'actor',
  userId: 'actor',
  email: 'actor@example.test',
  role,
  clubId,
});

describe('account directory', () => {
  it('parses only bounded account filters', () => {
    expect(
      parseAccountPageQuery({
        after: 'account-a',
        limit: '100',
        q: '  Coach  ',
        role: 'COACH',
        status: 'ACTIVE',
        clubId: 'club-a',
      }),
    ).toEqual({
      after: 'account-a',
      limit: 100,
      q: 'Coach',
      role: 'COACH',
      status: 'ACTIVE',
      clubId: 'club-a',
    });
  });

  it.each([
    null,
    [],
    { limit: '0' },
    { limit: '101' },
    { role: 'OWNER' },
    { status: 'DELETED' },
    { clubId: ' club-a' },
    { q: 'x'.repeat(101) },
    { scope: 'all' },
  ])('rejects malformed account query %j', (query) => {
    expect(() => parseAccountPageQuery(query)).toThrow(BadRequestException);
  });

  it('forces a club administrator to its own tenant and counts before cursor', async () => {
    const rows = [
      {
        id: 'account-b',
        name: 'Coach',
        email: 'coach@example.test',
        role: 'COACH',
        status: 'ACTIVE',
        clubId: 'club-a',
        club: { name: 'Club A' },
        createdAt: new Date(),
      },
      { id: 'account-c' },
    ];
    const user = {
      findMany: jest.fn().mockResolvedValue(rows),
      count: jest
        .fn()
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(2),
    };
    const prisma = {
      user,
      $transaction: jest.fn((operations: Promise<unknown>[]) =>
        Promise.all(operations),
      ),
    };
    const service = new AccountLifecycleService(prisma as any);

    const result = await service.listAccounts(
      principal('CLUB_ADMIN', 'club-a'),
      parseAccountPageQuery({
        after: 'account-a',
        limit: '1',
        q: 'coach',
        clubId: 'club-b',
      }),
    );

    expect(user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          clubId: 'club-a',
          id: { gt: 'account-a' },
        }),
        take: 2,
      }),
    );
    expect(user.count.mock.calls[0][0].where).not.toHaveProperty('id');
    expect(result).toEqual({
      items: [rows[0]],
      nextCursor: 'account-b',
      limit: 1,
      total: 8,
      summary: { active: 6, suspended: 2 },
    });
  });

  it('allows a system administrator to select a club scope', async () => {
    const user = {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    };
    const service = new AccountLifecycleService({
      user,
      $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
    } as any);

    await service.listAccounts(
      principal('SYSTEM_ADMIN', null),
      parseAccountPageQuery({ clubId: 'club-b' }),
    );

    expect(user.findMany.mock.calls[0][0].where.clubId).toBe('club-b');
  });

  it('fails closed for operational roles at the service boundary', async () => {
    const service = new AccountLifecycleService({} as any);
    await expect(
      service.listAccounts(
        principal('COACH', 'club-a'),
        parseAccountPageQuery({}),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
