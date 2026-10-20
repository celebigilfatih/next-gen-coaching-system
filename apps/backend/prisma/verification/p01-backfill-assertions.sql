-- Fails the verification run if P0.1 did not preserve and map legacy facts.

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "Person" WHERE "clubId" = 'verify-club') <> 2 THEN
    RAISE EXCEPTION 'Expected two Person rows';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM "User"
    WHERE "id" = 'verify-player' AND "personId" = 'verify-player'
  ) THEN
    RAISE EXCEPTION 'Expected deterministic User to Person mapping';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM "PlayerProfile"
    WHERE "personId" = 'verify-player' AND "primaryPosition" = 'ORTA_SAHA'
  ) THEN
    RAISE EXCEPTION 'Expected PlayerProfile facts to be preserved';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM "StaffProfile" WHERE "personId" = 'verify-coach'
  ) THEN
    RAISE EXCEPTION 'Expected StaffProfile mapping';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM "Team"
    WHERE "id" = 'verify-u17' AND "legacyGroupId" = 'verify-u17'
  ) THEN
    RAISE EXCEPTION 'Expected PlayerGroup to Team compatibility mapping';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM "Season" s
    JOIN "TeamSeason" ts ON ts."id" = s."teamSeasonId"
    JOIN "ClubSeason" cs ON cs."id" = ts."clubSeasonId"
    WHERE s."id" = 'verify-season'
      AND ts."teamId" = 'verify-u17'
      AND cs."name" = '2026/27'
  ) THEN
    RAISE EXCEPTION 'Expected Season to TeamSeason mapping';
  END IF;
  IF (SELECT COUNT(*) FROM "SportingAssignment" WHERE "source" = 'PLAYER_GROUP_BACKFILL_V1') <> 2 THEN
    RAISE EXCEPTION 'Expected two legacy assignment rows';
  END IF;
  IF EXISTS (
    SELECT 1 FROM "SportingAssignment"
    WHERE "source" = 'PLAYER_GROUP_BACKFILL_V1'
      AND "assignmentType" <> 'LEGACY_MEMBER'
  ) THEN
    RAISE EXCEPTION 'Legacy membership must not be guessed as primary';
  END IF;
END $$;
