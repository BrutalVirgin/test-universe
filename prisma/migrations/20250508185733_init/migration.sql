-- CreateEnum
CREATE TYPE "Source" AS ENUM ('facebook', 'tiktok');

-- CreateEnum
CREATE TYPE "FunnelStage" AS ENUM ('top', 'bottom');

-- CreateTable
CREATE TABLE "Event" (
     "id" TEXT NOT NULL,
     "eventId" TEXT NOT NULL,
     "timestamp" TIMESTAMP(3) NOT NULL,
     "source" "Source" NOT NULL,
     "funnelStage" "FunnelStage" NOT NULL,
     "eventType" TEXT NOT NULL,
     "data" JSONB NOT NULL,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

     CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_key" ON "Event"("eventId");
