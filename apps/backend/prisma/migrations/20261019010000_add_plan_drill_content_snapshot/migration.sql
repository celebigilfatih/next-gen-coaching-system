-- Existing phases keep their legacy reads; never infer historical content.
ALTER TABLE "PlanDrill" ADD COLUMN "contentSnapshot" JSONB;
