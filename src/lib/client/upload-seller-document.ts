export interface UploadedSellerDocument {
  key: string;
}

/**
 * Uploads a single verification document following the presign flow —
 * mirrors upload-post-media.ts/upload-reel-media.ts, but against the
 * PRIVATE document endpoints. No public URL is ever returned; only the
 * storage key, which is meaningless to the client without a later
 * authorized admin request.
 */
export async function uploadSellerDocumentFile(file: File): Promise<UploadedSellerDocument> {
  const presignRes = await fetch("/api/seller/documents/presign", {
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
    throw new Error(presignData.message || "Failed to prepare document upload.");
  }

  if (presignData.strategy === "direct") {
    const putRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("Failed to upload document to storage.");
    }
    return { key: presignData.key };
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
    throw new Error(uploadData.message || "Failed to upload document.");
  }
  return { key: uploadData.key };
}
