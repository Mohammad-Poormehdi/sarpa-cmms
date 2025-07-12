"use server";

import { db } from "@/lib/db";
import { getSortParams } from "@/lib/utils";
import { WorkOrderPriority, WorkOrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type WorkOrdersSearchParams = {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  priority?: string;
};

export async function getWorkOrders(companyId: string, searchParams?: WorkOrdersSearchParams) {
  try {
    const { sortBy, sortOrder } = getSortParams(searchParams);

    // Prepare filters
    let where: any = { companyId };
    
    if (searchParams?.status) {
      where.status = searchParams.status as WorkOrderStatus;
    }
    
    if (searchParams?.priority) {
      where.priority = searchParams.priority as WorkOrderPriority;
    }
    
    // Get total count
    const totalWorkOrders = await db.workOrder.count({ where });
    
    // Get work orders
    const workOrders = await db.workOrder.findMany({
      where,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
        preventiveMaintenance: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return {
      data: workOrders,
      total: totalWorkOrders,
    };
  } catch (error) {
    console.error("Error fetching work orders:", error);
    throw error;
  }
}

export async function deletePart(partId: string, companyId: string) {
  try {
    // First check if the part belongs to the company for security
    const part = await db.part.findFirst({
      where: {
        id: partId,
        companyId: companyId,
      },
    });

    if (!part) {
      return { success: false, error: "قطعه یافت نشد یا شما مجاز به حذف آن نیستید" };
    }

    // Delete the part
    await db.part.delete({
      where: {
        id: partId,
      },
    });

    // Revalidate the parts page
    revalidatePath(`/dashboard/${companyId}/parts`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting part:", error);
    return { success: false, error: "خطا در حذف قطعه. لطفا دوباره تلاش کنید" };
  }
} 