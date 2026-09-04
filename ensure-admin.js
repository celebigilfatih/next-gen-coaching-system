const { PrismaClient } = require("./apps/backend/node_modules/@prisma/client");
const bcrypt = require("./apps/backend/node_modules/bcrypt");

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "System Admin";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (!email || !password) {
  throw new Error("BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required");
}

if (password.length < 12) {
  throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters");
}

const prisma = new PrismaClient({ datasourceUrl: databaseUrl });

async function ensureSystemAdmin() {
  const [existingAdmin, systemAdminCount] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.count({ where: { role: "SYSTEM_ADMIN" } }),
  ]);

  if (existingAdmin) {
    if (existingAdmin.role !== "SYSTEM_ADMIN") {
      throw new Error(`Existing account ${email} is not a SYSTEM_ADMIN; refusing to change its role`);
    }

    console.log("System admin already exists:", existingAdmin.email);
    return;
  }

  if (systemAdminCount > 0) {
    throw new Error("A SYSTEM_ADMIN already exists; additional system admins must use an authenticated invitation");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.$transaction(async (transaction) => {
    const created = await transaction.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "SYSTEM_ADMIN",
      },
    });
    await transaction.securityAuditEvent.create({
      data: {
        action: "SYSTEM_ADMIN_BOOTSTRAPPED",
        targetUserId: created.id,
      },
    });
    return created;
  });

  console.log("System admin created:", admin.email);
}

ensureSystemAdmin()
  .catch((error) => {
    console.error("Failed to ensure system admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
