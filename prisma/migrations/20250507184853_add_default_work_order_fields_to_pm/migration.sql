-- AlterTable
ALTER TABLE "PreventiveMaintenance" ADD COLUMN     "defaultAssignedToId" TEXT,
ADD COLUMN     "defaultInstructions" TEXT,
ADD COLUMN     "defaultWorkOrderDescription" TEXT,
ADD COLUMN     "defaultWorkOrderPriority" "WorkOrderPriority",
ADD COLUMN     "defaultWorkOrderTitle" TEXT,
ADD COLUMN     "estimatedDuration" INTEGER;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenance" ADD CONSTRAINT "PreventiveMaintenance_defaultAssignedToId_fkey" FOREIGN KEY ("defaultAssignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
