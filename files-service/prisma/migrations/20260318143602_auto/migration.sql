-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "size" INTEGER NOT NULL,
    "new_filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);
