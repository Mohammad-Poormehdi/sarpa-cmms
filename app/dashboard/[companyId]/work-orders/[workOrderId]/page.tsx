import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkOrderPriority, WorkOrderStatus } from "@prisma/client";
import WorkOrderForm from "@/components/dashboard/work-orders/work-order-form";

type User = {
  id: string;
  name: string;
};

type Asset = {
  id: string;
  name: string;
};

type WorkOrderFormValues = {
  title: string;
  description?: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  dueDate?: Date | null;
  assignedToId?: string | null;
  assetId?: string | null;
};

// Get users for the company for assignment
async function getUsers(companyId: string): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });
  return users;
}

// Get assets for the company
async function getAssets(companyId: string): Promise<Asset[]> {
  const assets = await prisma.asset.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });
  return assets;
}

// Get preventive maintenances for the company
async function getPreventiveMaintenances(companyId: string): Promise<{ id: string; title: string }[]> {
  const pms = await prisma.preventiveMaintenance.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      title: true,
    },
  });
  return pms;
}

// Get work order data for editing
async function getWorkOrder(workOrderId: string): Promise<WorkOrderFormValues | null> {
  const workOrder = await prisma.workOrder.findUnique({
    where: {
      id: workOrderId,
    },
    select: {
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      assignedToId: true,
      assetId: true,
    },
  });

  return workOrder;
}

// Helper function to convert null to undefined for form compatibility
function prepareFormData(data: WorkOrderFormValues): any {
  return {
    title: data.title,
    description: data.description || undefined,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate || undefined,
    assignedToId: data.assignedToId || undefined,
    assetId: data.assetId || undefined,
  };
}

export default async function EditWorkOrderPage({
  params,
}: {
  params: { companyId: string; workOrderId: string };
}) {
  const user = await isAuthenticated();
  
  if (!user) {
    redirect("/login");
  }

  const [users, assets, workOrder] = await Promise.all([
    getUsers(params.companyId),
    getAssets(params.companyId),
    getWorkOrder(params.workOrderId),
  ]);

  if (!workOrder) {
    notFound();
  }
  
  // Convert null values to undefined for the form
  const formData = prepareFormData(workOrder);

  return (
    <div className="p-6">
      <WorkOrderForm
        companyId={params.companyId}
        workOrderId={params.workOrderId}
        assets={assets}
        users={users}
        initialData={formData}
      />
    </div>
  );
}
