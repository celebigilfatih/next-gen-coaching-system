import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AttendanceController } from './attendance.controller';
import { RolesGuard } from '../auth/roles.guard';
import { ROLES_KEY } from '../auth/roles.decorator';

describe('AttendanceController authorization', () => {
  it('executes RolesGuard for attendance mutations', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      AttendanceController.prototype.mark,
    ) as unknown[];

    expect(guards).toContain(RolesGuard);

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      AttendanceController.prototype.mark,
    ) as string[];
    expect(roles).toEqual(
      expect.arrayContaining(['COACH', 'CLUB_ADMIN', 'SYSTEM_ADMIN']),
    );
  });
});
