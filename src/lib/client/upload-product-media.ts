export interface UploadedProductMedia {
  key: string;
  url: string;
}

/**
 * Uploads a single product image following the two-step flow: ask the
 * backend where the bytes should go (presign), then send them there
 * directly. Works transparently against either backend — see
 * media-upload-shared.ts. Mirrors upload-post-media.ts / upload-store-media.ts.
 */
export async function uploadProductMediaFile(file: File): Promise<UploadedProductMedia> {
  const presignRes = await fetch("/api/seller/products/media/presign", {
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
