-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('member', 'author', 'admin');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'member';

-- CreateTable
CREATE TABLE "public"."refresh_token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
