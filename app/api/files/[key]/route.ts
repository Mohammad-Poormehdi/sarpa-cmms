import { NextRequest, NextResponse } from "next/server";
import { getPresignedViewUrl, FOLDER_PREFIX } from "@/lib/s3-utils";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  // Verify user authentication
  const user = await isAuthenticated();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {

    let  key = params.key;

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    // Get presigned URL for viewing
    // The getPresignedViewUrl function will handle adding the folder prefix if needed
    const result = await getPresignedViewUrl(key);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      presignedUrl: result.presignedUrl
    });
  } catch (error) {
    console.error("Get file error:", error);
    return NextResponse.json(
      { error: "Failed to get file URL" },
      { status: 500 }
    );
  }
} 