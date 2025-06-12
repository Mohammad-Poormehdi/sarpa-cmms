import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

// GET route to fetch preventive maintenances for a specific company
export async function GET(request: NextRequest) {
  console.log(`🚀 [API] Starting GET request for company-specific preventive maintenances`);
  
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      console.log(`❌ [API] Missing companyId in query parameters`);
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log(`🔍 [API] Fetching preventive maintenance records for company: ${companyId}`);
    
    // Retrieve preventive maintenance records for the specified company
    const preventiveMaintenanceRecords = await prisma.preventiveMaintenance.findMany({
      where: {
        companyId: companyId,
      },
      include: {
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
        assignedTo: {
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
    
    console.log(`✅ [API] Successfully retrieved ${preventiveMaintenanceRecords.length} records`);
    
    return NextResponse.json(
      { 
        success: true,
        data: preventiveMaintenanceRecords,
        count: preventiveMaintenanceRecords.length 
      },
      { status: 200, headers: corsHeaders }
    );
    
  } catch (error) {
    console.error(`❌ [API] Error retrieving preventive maintenance records:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}
