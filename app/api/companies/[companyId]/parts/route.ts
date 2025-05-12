import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// GET all parts for a company
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const authResult = await isAuthenticated();
    if (!authResult) {
      return new NextResponse(JSON.stringify({ error: "غیر مجاز" }), {
        status: 401,
      });
    }

    if (authResult.companyId !== params.companyId) {
      return new NextResponse(JSON.stringify({ error: "غیر مجاز" }), {
        status: 403,
      });
    }

    const parts = await prisma.part.findMany({
      where: {
        companyId: params.companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(parts);
  } catch (error) {
    console.error("Error fetching parts:", error);
    return new NextResponse(
      JSON.stringify({ error: "خطا در دریافت اطلاعات قطعات" }),
      { status: 500 }
    );
  }
}

// POST create a new part
export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const authResult = await isAuthenticated();
    if (!authResult) {
      return new NextResponse(JSON.stringify({ error: "غیر مجاز" }), {
        status: 401,
      });
    }

    if (authResult.companyId !== params.companyId) {
      return new NextResponse(JSON.stringify({ error: "غیر مجاز" }), {
        status: 403,
      });
    }

    const body = await req.json();
    
    const part = await prisma.part.create({
      data: {
        name: body.name,
        partNumber: body.partNumber,
        description: body.description,
        imageUrl: body.imageUrl,
        isNoneStock: body.isNoneStock,
        isCritical: body.isCritical,
        additionalInformation: body.additionalInformation,
        companyId: params.companyId,
      },
    });

    return NextResponse.json(part);
  } catch (error) {
    console.error("Error creating part:", error);
    return new NextResponse(
      JSON.stringify({ error: "خطا در ثبت اطلاعات قطعه" }),
      { status: 500 }
    );
  }
} 