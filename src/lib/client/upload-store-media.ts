export interface UploadedStoreMedia {
  key: string;
  url: string;
}

/**
 * Uploads a single store logo/banner image following the two-step flow —
 * mirrors upload-post-media.ts / upload-product-media.ts, against the
 * store media endpoints.
 */
export async function uploadStoreMediaFile(file: File): Promise<UploadedStoreMedia> {
  const presignRes = await fetch("/api/seller/store/media/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });
  const presignData = await presignRes.json();
  if (!presignRes.ok || !presignData.success) {
    throw new Error(presignData.message || "Failed to prepare image upload.");
  }

  if (presignData.strategy === "direct") {
    const putRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("Failed to upload image to storage.");
    }
    return { key: presignData.key, url: presignData.publicUrl };
  }

  // Local development fallback: upload through our own server.
  const formData = new FormData();
  formData.append("file", file);
  const uploadRes = await fetch(presignData.uploadUrl, {
    method: "POST",
    body: formData,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.success) {
    throw new Error(uploadData.message || "Failed to upload image.");
  }
  return { key: uploadData.key, url: uploadData.publicUrl };
}
