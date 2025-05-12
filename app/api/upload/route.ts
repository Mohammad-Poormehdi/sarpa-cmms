import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { uploadFile } from "@/lib/s3-utils";
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
    // Check if the request is multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${nanoid()}-${Date.now()}.${fileExt}`;
    
    // Read file as buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to S3
    const result = await uploadFile(fileBuffer, fileName, file.type);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Return the uploaded file info
    return NextResponse.json({
      success: true,
      fileUrl: result.url,
      fileName: fileName,
      originalName: file.name
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Increase payload size limit for file uploads (default is 4MB)
export const config = {
  api: {
    bodyParser: false,
    // Allow up to 10MB uploads
    responseLimit: '10mb',
  },
}; 