-- CreateTable
CREATE TABLE "public"."segment_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segmentsToInclude" TEXT[],
    "segmentsToExclude" TEXT[],

    CONSTRAINT "segment_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "segment_groups_name_key" ON "public"."segment_groups"("name");
