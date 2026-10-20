-- PostgreSQL requires enum additions to be committed before the values are used.
-- Existing role definitions receive the approved note defaults in a follow-up migration.

INSERT INTO "RoleCapability" ("id", "roleDefinitionId", "capability", "createdAt")
SELECT 'pnote_' || substr(md5(fr."id" || ':' || capability.value), 1, 24),
       fr."id", capability.value::"SportingCapability", CURRENT_TIMESTAMP
FROM "FunctionalRole" fr
CROSS JOIN (VALUES ('PLAYER_NOTE_VIEW'), ('PLAYER_NOTE_MANAGE')) AS capability(value)
WHERE fr."systemKey" IN ('HEAD_COACH', 'ASSISTANT_COACH', 'SPORTING_DIRECTOR', 'ACADEMY_DIRECTOR')
   OR fr."key" = 'LEGACY_STAFF'
ON CONFLICT ("roleDefinitionId", "capability") DO NOTHING;

INSERT INTO "RoleCapability" ("id", "roleDefinitionId", "capability", "createdAt")
SELECT 'pnote_' || substr(md5(fr."id" || ':PLAYER_NOTE_VIEW'), 1, 24),
       fr."id", 'PLAYER_NOTE_VIEW'::"SportingCapability", CURRENT_TIMESTAMP
FROM "FunctionalRole" fr
WHERE fr."systemKey" = 'TEAM_MANAGER'
ON CONFLICT ("roleDefinitionId", "capability") DO NOTHING;
