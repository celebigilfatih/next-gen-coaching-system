-- Player 360 canonical notes. Additive: legacy PlayerCoachNote is preserved.

CREATE TYPE "PlayerNoteCategory" AS ENUM (
  'GENERAL', 'TRAINING', 'MATCH', 'TECHNICAL', 'TACTICAL', 'DEVELOPMENT'
);
CREATE TYPE "PlayerNoteFollowUpStatus" AS ENUM ('OPEN', 'DONE', 'CANCELLED');

ALTER TYPE "SportingCapability" ADD VALUE 'PLAYER_NOTE_VIEW';
ALTER TYPE "SportingCapability" ADD VALUE 'PLAYER_NOTE_MANAGE';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'PLAYER_NOTE_CREATED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'PLAYER_NOTE_UPDATED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'PLAYER_NOTE_ARCHIVED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'PLAYER_NOTE_RESTORED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'PLAYER_NOTE_SHARES_CHANGED';

CREATE TABLE "PlayerNote" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "originTeamId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "category" "PlayerNoteCategory" NOT NULL,
  "body" TEXT NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "followUpAt" TIMESTAMP(3),
  "followUpStatus" "PlayerNoteFollowUpStatus",
  "version" INTEGER NOT NULL DEFAULT 1,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlayerNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlayerNote_body_length_check" CHECK (char_length("body") BETWEEN 1 AND 4000),
  CONSTRAINT "PlayerNote_version_check" CHECK ("version" > 0),
  CONSTRAINT "PlayerNote_follow_up_check" CHECK (
    ("followUpAt" IS NULL AND "followUpStatus" IS NULL) OR
    ("followUpAt" IS NOT NULL AND "followUpStatus" IS NOT NULL)
  )
);

CREATE TABLE "PlayerNoteRevision" (
  "id" TEXT NOT NULL,
  "noteId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "category" "PlayerNoteCategory" NOT NULL,
  "body" TEXT NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "followUpAt" TIMESTAMP(3),
  "followUpStatus" "PlayerNoteFollowUpStatus",
  "editedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerNoteRevision_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlayerNoteRevision_body_length_check" CHECK (char_length("body") BETWEEN 1 AND 4000),
  CONSTRAINT "PlayerNoteRevision_version_check" CHECK ("version" > 0),
  CONSTRAINT "PlayerNoteRevision_follow_up_check" CHECK (
    ("followUpAt" IS NULL AND "followUpStatus" IS NULL) OR
    ("followUpAt" IS NOT NULL AND "followUpStatus" IS NOT NULL)
  )
);

CREATE TABLE "PlayerNoteTeamGrant" (
  "id" TEXT NOT NULL,
  "noteId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "grantedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerNoteTeamGrant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlayerNote_clubId_personId_archivedAt_observedAt_id_idx"
  ON "PlayerNote"("clubId", "personId", "archivedAt", "observedAt", "id");
CREATE INDEX "PlayerNote_originTeamId_archivedAt_observedAt_id_idx"
  ON "PlayerNote"("originTeamId", "archivedAt", "observedAt", "id");
CREATE INDEX "PlayerNote_authorId_idx" ON "PlayerNote"("authorId");
CREATE UNIQUE INDEX "PlayerNoteRevision_noteId_version_key"
  ON "PlayerNoteRevision"("noteId", "version");
CREATE INDEX "PlayerNoteRevision_noteId_createdAt_id_idx"
  ON "PlayerNoteRevision"("noteId", "createdAt", "id");
CREATE UNIQUE INDEX "PlayerNoteTeamGrant_noteId_teamId_key"
  ON "PlayerNoteTeamGrant"("noteId", "teamId");
CREATE INDEX "PlayerNoteTeamGrant_teamId_noteId_idx"
  ON "PlayerNoteTeamGrant"("teamId", "noteId");

ALTER TABLE "PlayerNote" ADD CONSTRAINT "PlayerNote_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerNote" ADD CONSTRAINT "PlayerNote_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerNote" ADD CONSTRAINT "PlayerNote_originTeamId_fkey"
  FOREIGN KEY ("originTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlayerNote" ADD CONSTRAINT "PlayerNote_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlayerNoteRevision" ADD CONSTRAINT "PlayerNoteRevision_noteId_fkey"
  FOREIGN KEY ("noteId") REFERENCES "PlayerNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerNoteRevision" ADD CONSTRAINT "PlayerNoteRevision_editedById_fkey"
  FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlayerNoteTeamGrant" ADD CONSTRAINT "PlayerNoteTeamGrant_noteId_fkey"
  FOREIGN KEY ("noteId") REFERENCES "PlayerNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerNoteTeamGrant" ADD CONSTRAINT "PlayerNoteTeamGrant_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerNoteTeamGrant" ADD CONSTRAINT "PlayerNoteTeamGrant_grantedById_fkey"
  FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
