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
