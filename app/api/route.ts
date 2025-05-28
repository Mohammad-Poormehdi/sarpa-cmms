import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CORS configuration
const allowedOrigins = "*"; // Allow all origins
const allowedMethods = ["POST", "OPTIONS"];
const allowedHeaders = ["Content-Type", "Authorization"];

// Helper function to handle CORS
function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", allowedOrigins);
  response.headers.set("Access-Control-Allow-Methods", allowedMethods.join(", "));
  response.headers.set("Access-Control-Allow-Headers", allowedHeaders.join(", "));
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  return setCorsHeaders(response);
}

// POST route to fetch preventive maintenances for a specific company
export async function POST(request: NextRequest) {
  console.log(`🚀 [API] Starting POST request for company-specific preventive maintenances`);
  
  try {
    // Parse request body to get companyId
    const body = await request.json();
    const { companyId } = body;
    
    if (!companyId) {
      console.log(`❌ [API] Missing companyId in request body`);
      const response = NextResponse.json(
        { message: "شناسه شرکت الزامی است" },
        { status: 400 }
      );
      return setCorsHeaders(response);
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
    });
    
    console.log(`✅ [API] Successfully retrieved ${preventiveMaintenanceRecords.length} records`);
    
    const response = NextResponse.json(
      { 
        message: "برنامه های نگهداری پیشگیرانه با موفقیت دریافت شدند",
        data: preventiveMaintenanceRecords 
      },
      { status: 200 }
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    console.error(`❌ [API] Error retrieving preventive maintenance records:`, error);
    const response = NextResponse.json(
      { message: "خطا در دریافت برنامه های نگهداری پیشگیرانه" },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}
