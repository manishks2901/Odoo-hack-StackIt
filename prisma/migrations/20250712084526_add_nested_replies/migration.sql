-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
