import { S3Client } from "@aws-sdk/client-s3";

// Initialize S3 client with MinIO configuration
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // Required for MinIO
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "sarpa-assets"; 