export interface UploadedPostMedia {
  key: string;
  url: string;
  width?: number;
  height?: number;
}

function readImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.naturalWidth || undefined, height: img.naturalHeight || undefined });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

/**
 * Uploads a single image following the two-step flow: ask the backend
 * where the bytes should go (presign), then send them there directly.
 * Works transparently against either backend — see media-upload.service.ts.
 */
export async function uploadPostMediaFile(file: File): Promise<UploadedPostMedia> {
  const presignRes = await fetch("/api/posts/media/presign", {
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

  const dimensions = await readImageDimensions(file);

  if (presignData.strategy === "direct") {
    const putRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("Failed to upload image to storage.");
    }
    return { key: presignData.key, url: presignData.publicUrl, ...dimensions };
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
  return { key: uploadData.key, url: uploadData.publicUrl, ...dimensions };
}
