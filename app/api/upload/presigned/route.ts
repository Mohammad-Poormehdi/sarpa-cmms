import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getPresignedUploadUrl } from "@/lib/s3-utils";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Verify user authentication
  const user = await isAuthenticated();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { filename, contentType } = await req.json();
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and contentType are required" },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExt = filename.split(".").pop();
    const uniqueFileName = `${nanoid()}-${Date.now()}.${fileExt}`;
    
    // Get presigned URL
    const result = await getPresignedUploadUrl(uniqueFileName, contentType);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      presignedUrl: result.presignedUrl,
      key: result.key,
      url: result.url,
      originalName: filename
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
} 