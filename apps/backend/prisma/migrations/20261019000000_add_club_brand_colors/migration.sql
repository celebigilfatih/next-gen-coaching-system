-- Optional branding only. Existing clubs and logos are preserved.
ALTER TABLE "Club"
  ADD COLUMN "primaryColor" VARCHAR(7),
  ADD COLUMN "secondaryColor" VARCHAR(7);

ALTER TABLE "Club"
  ADD CONSTRAINT "Club_primaryColor_hex_check"
    CHECK ("primaryColor" IS NULL OR "primaryColor" ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT "Club_secondaryColor_hex_check"
    CHECK ("secondaryColor" IS NULL OR "secondaryColor" ~ '^#[0-9A-Fa-f]{6}$');
