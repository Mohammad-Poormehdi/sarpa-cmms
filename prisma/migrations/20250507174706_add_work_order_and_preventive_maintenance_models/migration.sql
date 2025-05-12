/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `PreventiveMaintenance` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `PreventiveMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PreventiveMaintenance" DROP CONSTRAINT "PreventiveMaintenance_assignedToId_fkey";

-- AlterTable
ALTER TABLE "PreventiveMaintenance" DROP COLUMN "assignedToId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenance" ADD CONSTRAINT "PreventiveMaintenance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
