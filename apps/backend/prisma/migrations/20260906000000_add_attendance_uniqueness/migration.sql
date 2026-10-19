-- Refuse to guess which status is authoritative when historical duplicates exist.
-- Resolve duplicates explicitly before retrying this migration.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Attendance"
        GROUP BY "planId", "playerId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Attendance duplicate pairs exist; resolve them before applying the uniqueness constraint'
            USING ERRCODE = '23505';
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_planId_playerId_key" ON "Attendance"("planId", "playerId");
