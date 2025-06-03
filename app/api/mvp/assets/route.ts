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

    // Fetch all assets for the specified company
    const assets = await prisma.asset.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        additionalWorkers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parts: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            description: true,
            isNoneStock: true,
            isCritical: true,
            minimumQuantity: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        maintenances: {
          select: {
            id: true,
            title: true,
            description: true,
            frequency: true,
            timeUnit: true,
            nextDueDate: true,
            status: true,
          },
        },
        workOrders: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
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
        data: assets,
        count: assets.length 
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}
