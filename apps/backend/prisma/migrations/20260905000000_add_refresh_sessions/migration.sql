-- ADR-0018: provider-neutral, rotating browser refresh sessions.
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SESSION_CREATED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SESSION_REFRESHED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SESSION_LOGGED_OUT';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SESSION_REUSE_DETECTED';

CREATE TABLE "RefreshSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "familyId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "authVersion" INTEGER NOT NULL,
  "idleExpiresAt" TIMESTAMP(3) NOT NULL,
  "absoluteExpiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "revocationReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RefreshSession_expiry_check"
    CHECK ("idleExpiresAt" <= "absoluteExpiresAt")
);

CREATE UNIQUE INDEX "RefreshSession_tokenHash_key"
  ON "RefreshSession"("tokenHash");
CREATE INDEX "RefreshSession_userId_revokedAt_idx"
  ON "RefreshSession"("userId", "revokedAt");
CREATE INDEX "RefreshSession_familyId_idx"
  ON "RefreshSession"("familyId");
CREATE INDEX "RefreshSession_idleExpiresAt_idx"
  ON "RefreshSession"("idleExpiresAt");
CREATE INDEX "RefreshSession_absoluteExpiresAt_idx"
  ON "RefreshSession"("absoluteExpiresAt");

ALTER TABLE "RefreshSession"
  ADD CONSTRAINT "RefreshSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
