import apiClient from "@/app/api/client";

export interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export const getUploadUrl = async (
  fileType: string,
  fileName: string,
  isPermanent: boolean = false
): Promise<UploadUrlResponse> => {
  try {
    const response = await apiClient.post("/api/file/upload-url", {
      fileType,
      fileName,
      isPermanent,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting upload URL:", error);
    throw new Error("Failed to get upload URL");
  }
};

export const uploadFile = async (
  file: File | Blob,
  fileName: string,
  fileType: string,
  isPermanent: boolean = false
): Promise<string> => {
  try {
    // Get pre-signed URL
    const { uploadUrl, publicUrl } = await getUploadUrl(fileType, fileName, isPermanent);

    // Upload file directly to cloud storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": fileType,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file");
    }

    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
};

export const uploadImage = async (
  file: File | Blob,
  fileName: string
): Promise<string> => {
  return uploadFile(file, fileName, file.type, true);
};

export const uploadVideo = async (
  file: File | Blob,
  fileName: string
): Promise<string> => {
  return uploadFile(file, fileName, file.type, true);
};
