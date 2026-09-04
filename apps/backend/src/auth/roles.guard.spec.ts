import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type { Role } from './roles.decorator';

function contextFor(role?: Role): ExecutionContext {
  return {
    getHandler: () => contextFor,
    getClass: () => RolesGuard,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('does not treat CLUB_ADMIN as a global SYSTEM_ADMIN', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['SYSTEM_ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(contextFor('CLUB_ADMIN'))).toBe(false);
    expect(guard.canActivate(contextFor('SYSTEM_ADMIN'))).toBe(true);
  });

  it('allows CLUB_ADMIN only when the route explicitly requests it', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['CLUB_ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(contextFor('CLUB_ADMIN'))).toBe(true);
    expect(guard.canActivate(contextFor('COACH'))).toBe(false);
  });
});
