import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { PrismaClient, WorkOrderStatus, WorkOrderPriority } from "@prisma/client";

const prisma = new PrismaClient();

// Define types for request data
interface WorkOrderRequestData {
  title: string;
  description?: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  dueDate?: string | Date;
  assignedToId?: string;
  assetId?: string;
  preventiveMaintenanceId?: string; // This is marked as optional here but will be handled in the API
}

// POST handler for creating a new work order
export async function POST(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    // Authenticate user
    const user = await isAuthenticated();
    
    if (user.companyId !== params.companyId) {
      return NextResponse.json(
        { error: "شما به این منبع دسترسی ندارید" },
        { status: 403 }
      );
    }
    
    const data: WorkOrderRequestData = await request.json();
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        { error: "عنوان دستور کار الزامی است" },
        { status: 400 }
      );
    }
    
    // Create a default preventive maintenance if none is provided
    let preventiveMaintenanceId = data.preventiveMaintenanceId;
    
    if (!preventiveMaintenanceId) {
      // Create a default preventive maintenance for standalone work orders
      const defaultPM = await prisma.preventiveMaintenance.create({
        data: {
          title: `دستور کار ${data.title}`,
          description: "برنامه نگهداری پیشگیرانه خودکار ایجاد شده برای دستور کار مستقل",
          scheduleType: "regularInterval",
          frequency: 1,
          timeUnit: "day",
          startDate: new Date(),
          nextDueDate: new Date(),
          status: "pending",
          createdById: user.id,
          companyId: params.companyId,
        },
      });
      
      preventiveMaintenanceId = defaultPM.id;
    }
    
    // Parse date if provided
    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    
    // Create the work order
    const workOrder = await prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status || "pending",
        priority: data.priority || "medium",
        dueDate: dueDate,
        preventiveMaintenanceId: preventiveMaintenanceId,
        assignedToId: data.assignedToId || null,
        assetId: data.assetId || null,
        companyId: params.companyId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: "دستور کار با موفقیت ایجاد شد",
      data: workOrder,
    });
    
  } catch (error) {
    console.error("Error creating work order:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد دستور کار" },
      { status: 500 }
    );
  }
}

// PUT handler for updating an existing work order
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    // Authenticate user
    const user = await isAuthenticated();
    
    if (user.companyId !== params.companyId) {
      return NextResponse.json(
        { error: "شما به این منبع دسترسی ندارید" },
        { status: 403 }
      );
    }
    
    // Get all work orders for the company
    const workOrders = await prisma.workOrder.findMany({
      where: {
        companyId: params.companyId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({
      data: workOrders,
    });
    
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دستورات کار" },
      { status: 500 }
    );
  }
} 