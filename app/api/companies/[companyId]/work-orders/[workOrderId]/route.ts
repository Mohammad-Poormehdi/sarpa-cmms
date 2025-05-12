import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET handler for fetching a single work order
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string; workOrderId: string } }
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
    
    // Get the work order
    const workOrder = await prisma.workOrder.findUnique({
      where: {
        id: params.workOrderId,
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
    });
    
    if (!workOrder) {
      return NextResponse.json(
        { error: "دستور کار یافت نشد" },
        { status: 404 }
      );
    }
    
    // Verify that the work order belongs to the correct company
    if (workOrder.companyId !== params.companyId) {
      return NextResponse.json(
        { error: "شما به این منبع دسترسی ندارید" },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      data: workOrder,
    });
    
  } catch (error) {
    console.error("Error fetching work order:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دستور کار" },
      { status: 500 }
    );
  }
}

// PUT handler for updating a work order
export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string; workOrderId: string } }
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
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        { error: "عنوان دستور کار الزامی است" },
        { status: 400 }
      );
    }
    
    // Verify that the work order exists and belongs to the company
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: {
        id: params.workOrderId,
      },
    });
    
    if (!existingWorkOrder) {
      return NextResponse.json(
        { error: "دستور کار یافت نشد" },
        { status: 404 }
      );
    }
    
    if (existingWorkOrder.companyId !== params.companyId) {
      return NextResponse.json(
        { error: "شما به این منبع دسترسی ندارید" },
        { status: 403 }
      );
    }
    
    // Parse date if provided
    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    
    // Update the work order
    const updatedWorkOrder = await prisma.workOrder.update({
      where: {
        id: params.workOrderId,
      },
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        dueDate: dueDate,
        assignedToId: data.assignedToId || null,
        assetId: data.assetId || null,
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
      message: "دستور کار با موفقیت بروزرسانی شد",
      data: updatedWorkOrder,
    });
    
  } catch (error) {
    console.error("Error updating work order:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی دستور کار" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a work order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string; workOrderId: string } }
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
    
    // Verify that the work order exists and belongs to the company
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: {
        id: params.workOrderId,
      },
    });
    
    if (!existingWorkOrder) {
      return NextResponse.json(
        { error: "دستور کار یافت نشد" },
        { status: 404 }
      );
    }
    
    if (existingWorkOrder.companyId !== params.companyId) {
      return NextResponse.json(
        { error: "شما به این منبع دسترسی ندارید" },
        { status: 403 }
      );
    }
    
    // Delete the work order
    await prisma.workOrder.delete({
      where: {
        id: params.workOrderId,
      },
    });
    
    return NextResponse.json({
      message: "دستور کار با موفقیت حذف شد",
    });
    
  } catch (error) {
    console.error("Error deleting work order:", error);
    return NextResponse.json(
      { error: "خطا در حذف دستور کار" },
      { status: 500 }
    );
  }
} 