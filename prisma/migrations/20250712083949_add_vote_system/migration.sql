/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Answer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UP', 'DOWN');

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "downvotes",
DROP COLUMN "upvotes";

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "userId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_answerId_key" ON "Vote"("userId", "answerId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
