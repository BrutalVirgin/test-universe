-- RemoveConstraints
ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_source_check";
ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_funnelStage_check";

-- AlterColumn
ALTER TABLE "Event"
ALTER COLUMN "source" TYPE TEXT USING "source"::TEXT;

ALTER TABLE "Event"
ALTER COLUMN "funnelStage" TYPE TEXT USING "funnelStage"::TEXT;

-- DropEnum
DROP TYPE IF EXISTS "Source";
DROP TYPE IF EXISTS "FunnelStage";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Event_source_idx" ON "Event"("source");
CREATE INDEX IF NOT EXISTS "Event_funnelStage_idx" ON "Event"("funnelStage");
