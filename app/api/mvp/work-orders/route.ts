import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch all work orders for the specified company
    const workOrders = await prisma.workOrder.findMany({
      where: {
        companyId: companyId,
      },
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
            description: true,
            model: true,
            serialNumber: true,
          },
        },
        preventiveMaintenance: {
          select: {
            id: true,
            title: true,
            description: true,
            frequency: true,
            timeUnit: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      { 
        success: true,
        data: workOrders,
        count: workOrders.length 
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      status = 'pending',
      priority = 'medium',
      dueDate,
      preventiveMaintenanceId,
      assignedToId,
      assetId,
      companyId 
    } = body;

    // بررسی فیلدهای اجباری
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!preventiveMaintenanceId) {
      return NextResponse.json(
        { error: 'Preventive Maintenance ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // بررسی وجود preventive maintenance
    const preventiveMaintenance = await prisma.preventiveMaintenance.findFirst({
      where: {
        id: preventiveMaintenanceId,
        companyId: companyId,
      },
    });

    if (!preventiveMaintenance) {
      return NextResponse.json(
        { error: 'Preventive Maintenance not found or does not belong to this company' },
        { status: 404, headers: corsHeaders }
      );
    }

    // بررسی وجود کاربر مسئول (در صورت ارائه)
    if (assignedToId) {
      const assignedUser = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          companyId: companyId,
        },
      });

      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Assigned user not found or does not belong to this company' },
          { status: 404, headers: corsHeaders }
        );
      }
    }

    // بررسی وجود asset (در صورت ارائه)
    if (assetId) {
      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          companyId: companyId,
        },
      });

      if (!asset) {
        return NextResponse.json(
          { error: 'Asset not found or does not belong to this company' },
          { status: 404, headers: corsHeaders }
        );
      }
    }

    // ایجاد work order جدید
    const newWorkOrder = await prisma.workOrder.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        preventiveMaintenanceId,
        assignedToId,
        assetId,
        companyId,
      },
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
            description: true,
            model: true,
            serialNumber: true,
          },
        },
        preventiveMaintenance: {
          select: {
            id: true,
            title: true,
            description: true,
            frequency: true,
            timeUnit: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Work order created successfully',
        data: newWorkOrder 
      },
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error creating work order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}
