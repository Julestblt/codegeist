/*
  Warnings:

  - You are about to drop the column `line` on the `Issue` table. All the data in the column will be lost.
  - Added the required column `scanId` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "line",
ADD COLUMN     "lines" INTEGER[],
ADD COLUMN     "scanId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
