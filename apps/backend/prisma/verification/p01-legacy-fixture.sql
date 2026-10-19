-- Disposable-database fixture for rehearsing the P0.1 legacy backfill.
-- Apply after migrations through 20260906010000 and before 20260906020000.

INSERT INTO "Club" ("id", "name", "createdAt", "updatedAt")
VALUES ('verify-club', 'Verification Club', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "User" (
  "id", "name", "email", "passwordHash", "role", "clubId", "birthDate",
  "position", "createdAt", "updatedAt"
)
VALUES
  (
    'verify-coach', 'Verification Coach', 'verify-coach@example.test', 'not-used',
    'COACH', 'verify-club', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'verify-player', 'Verification Player', 'verify-player@example.test', 'not-used',
    'PLAYER', 'verify-club', '2010-03-12T00:00:00Z', 'ORTA_SAHA',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  );

INSERT INTO "PlayerGroup" (
  "id", "name", "clubId", "ageGroup", "category", "createdAt", "updatedAt"
)
VALUES (
  'verify-u17', 'U17', 'verify-club', 'U18', 'ALT_YAPI',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO "GroupMember" ("id", "userId", "groupId", "createdAt")
VALUES
  ('verify-membership-coach', 'verify-coach', 'verify-u17', '2026-01-01T00:00:00Z'),
  ('verify-membership-player', 'verify-player', 'verify-u17', '2026-01-02T00:00:00Z');

INSERT INTO "Season" (
  "id", "name", "clubId", "groupId", "startDate", "endDate", "userId",
  "createdAt", "updatedAt"
)
VALUES (
  'verify-season', '2026/27', 'verify-club', 'verify-u17',
  '2026-07-01T00:00:00Z', '2027-06-30T00:00:00Z', 'verify-coach',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
