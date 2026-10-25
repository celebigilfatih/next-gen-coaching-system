/* eslint-disable @typescript-eslint/no-require-imports */
const {
  readRecoveryInput,
  recoverSystemAdmin,
}: {
  readRecoveryInput: (env: NodeJS.ProcessEnv) => unknown;
  recoverSystemAdmin: (input: {
    prisma: Record<string, unknown>;
    env: NodeJS.ProcessEnv;
    hashPassword: (password: string) => Promise<string>;
  }) => Promise<void>;
} = require('../../../../recover-system-admin.js');

const validEnv = {
  DATABASE_URL: 'postgresql://not-logged',
  RECOVERY_ADMIN_EMAIL: 'admin@example.com',
  RECOVERY_ADMIN_PASSWORD: 'replacement-password',
  RECOVERY_APPROVAL_REFERENCE: 'INC-2026-0042',
  RECOVERY_CONFIRM: 'RECOVER_SYSTEM_ADMIN',
};

describe('recover-system-admin maintenance command', () => {
  it('requires an explicit confirmation and a strong password', () => {
    expect(() =>
      readRecoveryInput({ ...validEnv, RECOVERY_CONFIRM: 'yes' }),
    ).toThrow('RECOVERY_CONFIRM');
    expect(() =>
      readRecoveryInput({ ...validEnv, RECOVERY_ADMIN_PASSWORD: 'short' }),
    ).toThrow('at least 12 characters');
  });

  it('reactivates only an existing system admin in one transaction', async () => {
    const transaction = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'system-1',
          role: 'SYSTEM_ADMIN',
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      refreshSession: { updateMany: jest.fn() },
      passwordResetToken: { updateMany: jest.fn() },
      securityAuditEvent: { create: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(transaction)),
    };

    await recoverSystemAdmin({
      prisma,
      env: validEnv,
      hashPassword: jest.fn().mockResolvedValue('safe-hash'),
    });

    expect(transaction.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'system-1', role: 'SYSTEM_ADMIN' },
      data: {
        passwordHash: 'safe-hash',
        status: 'ACTIVE',
        authVersion: { increment: 1 },
      },
    });
    expect(transaction.refreshSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'system-1', revokedAt: null },
      }),
    );
    expect(transaction.passwordResetToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'system-1',
          consumedAt: null,
          revokedAt: null,
        },
      }),
    );
    expect(transaction.securityAuditEvent.create).toHaveBeenCalledWith({
      data: {
        action: 'SYSTEM_ADMIN_RECOVERED',
        targetUserId: 'system-1',
        metadata: { approvalReference: 'INC-2026-0042' },
      },
    });
  });

  it('refuses to create or promote a non-system account', async () => {
    const transaction = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'coach-1', role: 'COACH' }),
        updateMany: jest.fn(),
      },
      refreshSession: { updateMany: jest.fn() },
      passwordResetToken: { updateMany: jest.fn() },
      securityAuditEvent: { create: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(transaction)),
    };

    await expect(
      recoverSystemAdmin({
        prisma,
        env: validEnv,
        hashPassword: jest.fn().mockResolvedValue('safe-hash'),
      }),
    ).rejects.toThrow('Eligible system admin not found');
    expect(transaction.user.updateMany).not.toHaveBeenCalled();
    expect(transaction.securityAuditEvent.create).not.toHaveBeenCalled();
  });
});
