export interface UploadedReelMedia {
  key: string;
  url: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface VideoProbeResult {
  duration?: number;
  width?: number;
  height?: number;
}

/**
 * Reads duration/dimensions from a video file entirely client-side via a
 * hidden <video> element. This is the only duration signal Phase 4 has —
 * there's no server-side media probing (no ffmpeg/transcoding
 * infrastructure yet, see reel.service.ts) — so the server treats the
 * submitted duration as a bounded hint, not a verified fact.
 */
export function probeVideoFile(file: File): Promise<VideoProbeResult> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      resolve({
        duration: Number.isFinite(video.duration) ? Math.round(video.duration) : undefined,
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
      });
      URL.revokeObjectURL(objectUrl);
    };
    video.onerror = () => {
      resolve({});
      URL.revokeObjectURL(objectUrl);
    };
    video.src = objectUrl;
  });
}

/**
 * Uploads a single reel video following the two-step flow: ask the
 * backend where the bytes should go (presign), then send them there
 * directly. Mirrors upload-post-media.ts's uploadPostMediaFile.
 */
export async function uploadReelMediaFile(file: File): Promise<UploadedReelMedia> {
  const presignRes = await fetch("/api/reels/media/presign", {
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
    throw new Error(presignData.message || "Failed to prepare video upload.");
  }

  const probe = await probeVideoFile(file);

  if (presignData.strategy === "direct") {
    const putRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("Failed to upload video to storage.");
    }
    return { key: presignData.key, url: presignData.publicUrl, ...probe };
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
    throw new Error(uploadData.message || "Failed to upload video.");
  }
  return { key: uploadData.key, url: uploadData.publicUrl, ...probe };
}
