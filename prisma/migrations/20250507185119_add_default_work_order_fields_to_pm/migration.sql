/*
  Warnings:

  - You are about to drop the column `defaultAssignedToId` on the `PreventiveMaintenance` table. All the data in the column will be lost.
  - You are about to drop the column `defaultInstructions` on the `PreventiveMaintenance` table. All the data in the column will be lost.
  - You are about to drop the column `defaultWorkOrderDescription` on the `PreventiveMaintenance` table. All the data in the column will be lost.
  - You are about to drop the column `defaultWorkOrderPriority` on the `PreventiveMaintenance` table. All the data in the column will be lost.
  - You are about to drop the column `defaultWorkOrderTitle` on the `PreventiveMaintenance` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDuration` on the `PreventiveMaintenance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PreventiveMaintenance" DROP CONSTRAINT "PreventiveMaintenance_defaultAssignedToId_fkey";

-- AlterTable
ALTER TABLE "PreventiveMaintenance" DROP COLUMN "defaultAssignedToId",
DROP COLUMN "defaultInstructions",
DROP COLUMN "defaultWorkOrderDescription",
DROP COLUMN "defaultWorkOrderPriority",
DROP COLUMN "defaultWorkOrderTitle",
DROP COLUMN "estimatedDuration",
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "workOrderDescription" TEXT,
ADD COLUMN     "workOrderPriority" "WorkOrderPriority",
ADD COLUMN     "workOrderTitle" TEXT;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenance" ADD CONSTRAINT "PreventiveMaintenance_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
