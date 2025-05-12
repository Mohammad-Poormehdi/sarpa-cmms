import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// GET a specific part
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string; partId: string } }
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

    const part = await prisma.part.findUnique({
      where: {
        id: params.partId,
        companyId: params.companyId,
      },
    });

    if (!part) {
      return new NextResponse(JSON.stringify({ error: "قطعه یافت نشد" }), {
        status: 404,
      });
    }

    return NextResponse.json(part);
  } catch (error) {
    console.error("Error fetching part:", error);
    return new NextResponse(
      JSON.stringify({ error: "خطا در دریافت اطلاعات قطعه" }),
      { status: 500 }
    );
  }
}

// PUT update a part
export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string; partId: string } }
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

    const body = await request.json();

    // Check if part exists and belongs to the company
    const existingPart = await prisma.part.findUnique({
      where: {
        id: params.partId,
        companyId: params.companyId,
      },
    });

    if (!existingPart) {
      return new NextResponse(JSON.stringify({ error: "قطعه یافت نشد" }), {
        status: 404,
      });
    }

    const updatedPart = await prisma.part.update({
      where: {
        id: params.partId,
      },
      data: {
        name: body.name,
        partNumber: body.partNumber,
        description: body.description,
        imageUrl: body.imageUrl,
        isNoneStock: body.isNoneStock,
        isCritical: body.isCritical,
        additionalInformation: body.additionalInformation,
      },
    });

    return NextResponse.json(updatedPart);
  } catch (error) {
    console.error("Error updating part:", error);
    return new NextResponse(
      JSON.stringify({ error: "خطا در بروزرسانی اطلاعات قطعه" }),
      { status: 500 }
    );
  }
}

// DELETE a part
export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string; partId: string } }
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

    // Check if part exists and belongs to the company
    const existingPart = await prisma.part.findUnique({
      where: {
        id: params.partId,
        companyId: params.companyId,
      },
    });

    if (!existingPart) {
      return new NextResponse(JSON.stringify({ error: "قطعه یافت نشد" }), {
        status: 404,
      });
    }

    await prisma.part.delete({
      where: {
        id: params.partId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting part:", error);
    return new NextResponse(
      JSON.stringify({ error: "خطا در حذف قطعه" }),
      { status: 500 }
    );
  }
} 