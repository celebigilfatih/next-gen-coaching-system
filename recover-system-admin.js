const bcrypt = require("./apps/backend/node_modules/bcrypt");
const { PrismaClient } = require("./apps/backend/node_modules/@prisma/client");

const CONFIRMATION = "RECOVER_SYSTEM_ADMIN";

function readRecoveryInput(env) {
  const email = env.RECOVERY_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.RECOVERY_ADMIN_PASSWORD;
  const approvalReference = env.RECOVERY_APPROVAL_REFERENCE?.trim();

  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (!email) throw new Error("RECOVERY_ADMIN_EMAIL is required");
  if (!password || password.length < 12) {
    throw new Error("RECOVERY_ADMIN_PASSWORD must be at least 12 characters");
  }
  if (!approvalReference || approvalReference.length > 200 || /[\r\n]/.test(approvalReference)) {
    throw new Error("RECOVERY_APPROVAL_REFERENCE must be a single line of 1-200 characters");
  }
  if (env.RECOVERY_CONFIRM !== CONFIRMATION) {
    throw new Error(`RECOVERY_CONFIRM must equal ${CONFIRMATION}`);
  }
  return { email, password, approvalReference };
}

async function recoverSystemAdmin({
  prisma,
  env = process.env,
  hashPassword = (password) => bcrypt.hash(password, 10),
}) {
  const input = readRecoveryInput(env);
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const target = await transaction.user.findUnique({
      where: { email: input.email },
      select: { id: true, role: true },
    });
    if (!target || target.role !== "SYSTEM_ADMIN") {
      throw new Error("Eligible system admin not found");
    }

    const update = await transaction.user.updateMany({
      where: { id: target.id, role: "SYSTEM_ADMIN" },
      data: {
        passwordHash,
        status: "ACTIVE",
        authVersion: { increment: 1 },
      },
    });
    if (update.count !== 1) throw new Error("System admin recovery conflict");

    await transaction.refreshSession.updateMany({
      where: { userId: target.id, revokedAt: null },
      data: { revokedAt: now, revocationReason: "EMERGENCY_RECOVERY" },
    });
    await transaction.passwordResetToken.updateMany({
      where: { userId: target.id, consumedAt: null, revokedAt: null },
      data: { revokedAt: now },
    });
    await transaction.securityAuditEvent.create({
      data: {
        action: "SYSTEM_ADMIN_RECOVERED",
        targetUserId: target.id,
        metadata: { approvalReference: input.approvalReference },
      },
    });
  });
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await recoverSystemAdmin({ prisma });
    console.log("System admin recovery completed");
  } catch {
    console.error("System admin recovery failed");
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { readRecoveryInput, recoverSystemAdmin };

if (require.main === module) void main();
