import { notFound } from "next/navigation";
import PreventiveMaintenanceForm from "@/components/dashboard/preventive-maintenance/preventive-maintenance-form";
import type { Asset, User } from "@/components/dashboard/preventive-maintenance/preventive-maintenance-form";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import PMWorkOrdersTable from "@/components/dashboard/preventive-maintenance/pm-work-orders-table";

// Reusing the same schema types as the form component
const formSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  scheduleType: z.enum(["regularInterval", "afterCompletion"]),
  frequency: z.number(),
  timeUnit: z.enum(["day", "week", "month", "year"]),
  createWOsDaysBeforeDue: z.number().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  nextDueDate: z.date(),
  assignedToId: z.string().optional(),
  assetId: z.string().optional(),
  workOrderTitle: z.string(),
  workOrderDescription: z.string().optional(),
  workOrderPriority: z.enum(["none", "low", "medium", "high"]),
});

type FormData = z.infer<typeof formSchema>;

// Define a WorkOrder type for the table
export type WorkOrder = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  assignedToId: string | null;
  assignedToName?: string;
};

// This would be replaced with actual data fetching
async function getPreventiveMaintenanceData(pmId: string, companyId: string): Promise<{
  formData: Partial<FormData> | null;
  workOrders: WorkOrder[];
}> {
  // If pmId is "new", return null form data and empty work orders
  if (pmId === "new") {
    return { formData: null, workOrders: [] };
  }

  // Fetch the preventive maintenance data from the database
  const pm = await prisma.preventiveMaintenance.findFirst({
    where: {
      id: pmId,
      companyId: companyId,
    },
    include: {
      workOrders: {
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          assignedTo: {
            select: {
              name: true
            }
          }
        }
      },
    },
  });

  if (!pm) {
    return { formData: null, workOrders: [] };
  }

  // Get the most recent work order or undefined if none exists
  const latestWorkOrder = pm.workOrders.length > 0 ? pm.workOrders[0] : undefined;

  // Format work orders for the table
  const workOrders: WorkOrder[] = pm.workOrders.map(wo => ({
    id: wo.id,
    title: wo.title,
    status: wo.status,
    priority: wo.priority,
    dueDate: wo.dueDate,
    assignedToId: wo.assignedToId,
    assignedToName: wo.assignedTo?.name
  }));

  // Transform the data to match our form schema
  const formData: Partial<FormData> = {
    title: pm.title,
    description: pm.description || undefined,
    scheduleType: pm.scheduleType,
    frequency: pm.frequency,
    timeUnit: pm.timeUnit,
    createWOsDaysBeforeDue: pm.createWOsDaysBeforeDue || undefined,
    startDate: pm.startDate,
    endDate: pm.endDate || undefined,
    nextDueDate: pm.nextDueDate,
    assignedToId: latestWorkOrder?.assignedToId || undefined,
    assetId: pm.assetId || undefined,
    
    // Work order template data
    workOrderTitle: latestWorkOrder?.title || pm.title,
    workOrderDescription: latestWorkOrder?.description || undefined,
    workOrderPriority: latestWorkOrder?.priority || "medium",
  };

  return { formData, workOrders };
}

// Fetch assets from the database using Prisma
async function getAssets(companyId: string): Promise<Asset[]> {
  const assets = await prisma.asset.findMany({
    where: {
      companyId: companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return assets;
}

// Fetch users from the database using Prisma
async function getUsers(companyId: string): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: {
      companyId: companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return users;
}

export default async function PreventiveMaintenancePage({
  params,
}: {
  params: { companyId: string; pm_id: string };
}) {
  // Fetch assets and users
  const [assets, users, pmResult] = await Promise.all([
    getAssets(params.companyId),
    getUsers(params.companyId),
    getPreventiveMaintenanceData(params.pm_id, params.companyId)
  ]);

  const { formData, workOrders } = pmResult;

  // If we're editing a PM that doesn't exist, return 404
  if (params.pm_id !== "new" && !formData) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PreventiveMaintenanceForm
        companyId={params.companyId}
        pmId={params.pm_id === "new" ? undefined : params.pm_id}
        assets={assets}
        users={users}
        initialData={formData || undefined}
      />
      
      {params.pm_id !== "new" && workOrders.length > 0 && (
        <div >
          <h2 className="text-xl font-semibold mb-4">سوابق دستور کارها</h2>
          <PMWorkOrdersTable 
            workOrders={workOrders} 
            companyId={params.companyId} 
          />
        </div>
      )}
    </div>
  );
}
