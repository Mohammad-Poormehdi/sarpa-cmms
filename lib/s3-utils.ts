import { 
  PutObjectCommand, 
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "./s3-client";

// Folder prefix for all files
export const FOLDER_PREFIX = "sarpa-cmms/";

// Check if bucket exists, create if it doesn't
export async function ensureBucketExists(bucketName: string = BUCKET_NAME) {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket ${bucketName} exists`);
  } catch (error) {
    console.log(`Creating bucket ${bucketName}...`);
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket ${bucketName} created`);
  }
}

// Upload file to S3
export async function uploadFile(file: Buffer, fileName: string, mimetype: string, bucketName: string = BUCKET_NAME) {
  // Add folder prefix to the filename
  const key = `${FOLDER_PREFIX}${fileName}`;
  
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: mimetype
  };

  await ensureBucketExists(bucketName);
  
  try {
    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);
    return {
      success: true,
      key: key,
      url: `${process.env.S3_ENDPOINT}/${bucketName}/${key}`
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: "Failed to upload file"
    };
  }
}

// Generate a presigned URL for uploading a file directly from client
export async function getPresignedUploadUrl(fileName: string, mimetype: string, bucketName: string = BUCKET_NAME) {
  await ensureBucketExists(bucketName);
  
  // Add folder prefix to the filename
  const key = `${FOLDER_PREFIX}${fileName}`;
  
  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: mimetype
  };

  try {
    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    
    return {
      success: true,
      presignedUrl,
      key: key,
      url: `${process.env.S3_ENDPOINT}/${bucketName}/${key}`
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      success: false,
      error: "Failed to generate presigned URL"
    };
  }
}

// Get a presigned URL for viewing/downloading a file
export async function getPresignedViewUrl(fileName: string, bucketName: string = BUCKET_NAME) {
  // If the key doesn't already include the folder prefix, add it
  const key = fileName.startsWith(FOLDER_PREFIX) ? fileName : `${FOLDER_PREFIX}${fileName}`;
  
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    const command = new GetObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    
    return {
      success: true,
      presignedUrl
    };
  } catch (error) {
    console.error("Error generating download URL:", error);
    return {
      success: false,
      error: "Failed to generate download URL"
    };
  }
}

// List files in bucket
export async function listFiles(prefix: string = "", bucketName: string = BUCKET_NAME) {
  // Include the folder prefix in the search
  const fullPrefix = prefix ? `${FOLDER_PREFIX}${prefix}` : FOLDER_PREFIX;
  
  const params = {
    Bucket: bucketName,
    Prefix: fullPrefix
  };

  try {
    const command = new ListObjectsV2Command(params);
    const response = await s3Client.send(command);
    
    // Remove folder prefix from keys for cleaner results
    const files = (response.Contents || []).map(file => ({
      ...file,
      Key: file.Key?.replace(FOLDER_PREFIX, '')
    }));
    
    return {
      success: true,
      files
    };
  } catch (error) {
    console.error("Error listing files:", error);
    return {
      success: false,
      error: "Failed to list files"
    };
  }
}

// Delete a file
export async function deleteFile(fileName: string, bucketName: string = BUCKET_NAME) {
  // If the key doesn't already include the folder prefix, add it
  const key = fileName.startsWith(FOLDER_PREFIX) ? fileName : `${FOLDER_PREFIX}${fileName}`;
  
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      success: false,
      error: "Failed to delete file"
    };
  }
} 