import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string; pmId: string } }
) {
  console.log(`[PM Update] Starting PUT request for PM ID: ${params.pmId} in company: ${params.companyId}`);
  try {
    // Authenticate the user
    console.log(`[PM Update] Authenticating user...`);
    const session = await isAuthenticated();
    if (!session) {
      console.log(`[PM Update] Authentication failed: No valid session`);
      return NextResponse.json(
        { message: "احراز هویت با خطا مواجه شد" },
        { status: 401 }
      );
    }
    console.log(`[PM Update] User authenticated successfully: ${session.id} (${session.email})`);

    // Ensure the user belongs to the company they're trying to modify
    console.log(`[PM Update] Checking company access: User company ${session.companyId} vs Requested company ${params.companyId}`);
    if (session.companyId !== params.companyId) {
      console.log(`[PM Update] Access denied: User does not belong to requested company`);
      return NextResponse.json(
        { message: "شما به این شرکت دسترسی ندارید" },
        { status: 403 }
      );
    }
    console.log(`[PM Update] Company access verified for company: ${params.companyId}`);

    // Parse the request body
    console.log(`[PM Update] Parsing request body...`);
    const data = await request.json();
    console.log(`[PM Update] Request data received for PM update:`, {
      title: data.title,
      scheduleType: data.scheduleType,
      frequency: data.frequency,
      timeUnit: data.timeUnit,
      createWorkOrderNow: !!data.createWorkOrderNow,
      assetId: data.assetId || 'Not specified'
    });

    // Check if the preventive maintenance exists and belongs to the company
    console.log(`[PM Update] Checking if PM exists in the company...`);
    const existingPM = await prisma.preventiveMaintenance.findFirst({
      where: {
        id: params.pmId,
        companyId: params.companyId,
      },
      include: {
        workOrders: true,
      },
    });

    if (!existingPM) {
      console.log(`[PM Update] PM not found or does not belong to company: ${params.companyId}`);
      return NextResponse.json(
        { message: "برنامه نگهداری پیشگیرانه یافت نشد" },
        { status: 404 }
      );
    }
    console.log(`[PM Update] Found existing PM: ${existingPM.id}, has work orders: ${existingPM.workOrders.length > 0}`);

    // Update the preventive maintenance record
    console.log(`[PM Update] Updating preventive maintenance record...`);
    const updatedPM = await prisma.preventiveMaintenance.update({
      where: {
        id: params.pmId,
      },
      data: {
        title: data.title,
        description: data.description,
        scheduleType: data.scheduleType,
        frequency: data.frequency,
        timeUnit: data.timeUnit,
        createWOsDaysBeforeDue: data.createWOsDaysBeforeDue,
        startDate: data.startDate,
        endDate: data.endDate,
        nextDueDate: data.nextDueDate,
        assetId: data.assetId || undefined,
      },
    });
    console.log(`[PM Update] PM updated successfully: ${updatedPM.id}`);

    // Handle work orders
    const existingWorkOrder = existingPM.workOrders[0]; // Get the first work order if any
    if (existingWorkOrder) {
      console.log(`[PM Update] Updating existing work order: ${existingWorkOrder.id}`);
      // Update existing work order
      const updatedWorkOrder = await prisma.workOrder.update({
        where: {
          id: existingWorkOrder.id,
        },
        data: {
          title: data.workOrderTitle,
          description: data.workOrderDescription,
          priority: data.workOrderPriority,
          assignedToId: data.assignedToId || undefined,
          assetId: data.assetId || undefined,
        },
      });
      console.log(`[PM Update] Work order updated successfully: ${updatedWorkOrder.id}`);
    } else if (data.createWorkOrderNow) {
      console.log(`[PM Update] Creating new work order for existing PM...`);
      // Create a new work order if requested
      const newWorkOrder = await prisma.workOrder.create({
        data: {
          title: data.workOrderTitle,
          description: data.workOrderDescription,
          priority: data.workOrderPriority,
          status: "pending",
          dueDate: data.nextDueDate,
          preventiveMaintenanceId: params.pmId,
          assignedToId: data.assignedToId || undefined,
          assetId: data.assetId || undefined,
          companyId: params.companyId,
        },
      });
      console.log(`[PM Update] New work order created successfully: ${newWorkOrder.id}`);
    } else {
      console.log(`[PM Update] No work order creation or update required`);
    }

    console.log(`[PM Update] Process completed successfully, returning response`);
    return NextResponse.json({
      message: "برنامه نگهداری پیشگیرانه با موفقیت بروزرسانی شد",
      data: updatedPM,
    });
  } catch (error) {
    console.error(`[PM Update] Error updating preventive maintenance:`, error);
    return NextResponse.json(
      { message: "خطا در بروزرسانی برنامه نگهداری پیشگیرانه" },
      { status: 500 }
    );
  }
}

// Get a specific preventive maintenance by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string; pmId: string } }
) {
  console.log(`[PM Retrieve] Starting GET request for PM ID: ${params.pmId} in company: ${params.companyId}`);
  try {
    // Authenticate the user
    console.log(`[PM Retrieve] Authenticating user...`);
    const session = await isAuthenticated();
    if (!session) {
      console.log(`[PM Retrieve] Authentication failed: No valid session`);
      return NextResponse.json(
        { message: "احراز هویت با خطا مواجه شد" },
        { status: 401 }
      );
    }
    console.log(`[PM Retrieve] User authenticated successfully: ${session.id} (${session.email})`);

    // Ensure the user belongs to the company they're trying to access
    console.log(`[PM Retrieve] Checking company access: User company ${session.companyId} vs Requested company ${params.companyId}`);
    if (session.companyId !== params.companyId) {
      console.log(`[PM Retrieve] Access denied: User does not belong to requested company`);
      return NextResponse.json(
        { message: "شما به این شرکت دسترسی ندارید" },
        { status: 403 }
      );
    }
    console.log(`[PM Retrieve] Company access verified for company: ${params.companyId}`);

    // Fetch the preventive maintenance with its associated work orders
    console.log(`[PM Retrieve] Fetching PM details with relations...`);
    const preventiveMaintenance = await prisma.preventiveMaintenance.findFirst({
      where: {
        id: params.pmId,
        companyId: params.companyId,
      },
      include: {
        workOrders: true,
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!preventiveMaintenance) {
      console.log(`[PM Retrieve] PM not found or does not belong to company: ${params.companyId}`);
      return NextResponse.json(
        { message: "برنامه نگهداری پیشگیرانه یافت نشد" },
        { status: 404 }
      );
    }
    
    console.log(`[PM Retrieve] PM found: ${preventiveMaintenance.id}, has work orders: ${preventiveMaintenance.workOrders.length > 0}`);
    console.log(`[PM Retrieve] Process completed successfully, returning PM data`);
    return NextResponse.json(preventiveMaintenance);
  } catch (error) {
    console.error(`[PM Retrieve] Error fetching preventive maintenance:`, error);
    return NextResponse.json(
      { message: "خطا در دریافت اطلاعات برنامه نگهداری پیشگیرانه" },
      { status: 500 }
    );
  }
} 