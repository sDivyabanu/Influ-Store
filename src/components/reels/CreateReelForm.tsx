"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Video, X, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/features/toast/toast-context";
import { uploadReelMediaFile, probeVideoFile } from "@/lib/client/upload-reel-media";
import {
  SUPPORTED_REEL_MIME_TYPES,
  MAX_REEL_SIZE_BYTES,
  MAX_REEL_DURATION_SECONDS,
} from "@/lib/constants/reel";
import { POST_CAPTION_MAX_LENGTH } from "@/lib/constants/post";
import { cn } from "@/lib/utils/cn";

interface SelectedVideo {
  file: File;
  previewUrl: string;
  duration?: number;
}

export function CreateReelForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [video, setVideo] = useState<SelectedVideo | null>(null);
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (video) URL.revokeObjectURL(video.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError("");

    if (!SUPPORTED_REEL_MIME_TYPES.includes(file.type as (typeof SUPPORTED_REEL_MIME_TYPES)[number])) {
      setError("That file isn't a supported video type. Use MP4 or WEBM.");
      resetFileInputs();
      return;
    }
    if (file.size > MAX_REEL_SIZE_BYTES) {
      setError(`Video is larger than ${MAX_REEL_SIZE_BYTES / (1024 * 1024)}MB.`);
      resetFileInputs();
      return;
    }

    setValidating(true);
    const probe = await probeVideoFile(file);
    setValidating(false);

    if (probe.duration && probe.duration > MAX_REEL_DURATION_SECONDS) {
      setError(
        `Reels can be up to ${MAX_REEL_DURATION_SECONDS} seconds long — this video is ${probe.duration}s.`
      );
      resetFileInputs();
      return;
    }

    setVideo((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file), duration: probe.duration };
    });
    resetFileInputs();
  }

  function resetFileInputs() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (replaceInputRef.current) replaceInputRef.current.value = "";
  }

  function removeVideo() {
    setVideo((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  }

  async function handlePublish(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!video) {
      setError("Select a video to publish.");
      return;
    }

    setPublishing(true);
    try {
      const uploaded = await uploadReelMediaFile(video.file);

      const response = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          mediaKey: uploaded.key,
          duration: uploaded.duration,
          width: uploaded.width,
          height: uploaded.height,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to publish reel.");
      }

      URL.revokeObjectURL(video.previewUrl);
      showToast("Reel published!");
      router.push(`/reel/${data.reel.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while publishing.");
      setPublishing(false);
    }
  }

  return (
    <form onSubmit={handlePublish} className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      {/* VIDEO */}
      <Card className="p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Video</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            MP4 or WEBM, up to {MAX_REEL_SIZE_BYTES / (1024 * 1024)}MB and {MAX_REEL_DURATION_SECONDS}{" "}
            seconds.
          </p>
        </div>

        {!video ? (
          <label
            className={cn(
              "flex aspect-[9/16] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-center transition hover:border-fuchsia-400 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-500/5",
              validating && "pointer-events-none opacity-60"
            )}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-500/10 text-fuchsia-500">
              <Video className="h-6 w-6" />
            </div>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {validating ? "Checking video..." : "Upload a video"}
            </p>
            <p className="mt-1.5 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
              Vertical video works best for Reels.
            </p>
            <span className="mt-5 rounded-full bg-neutral-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-black">
              Choose video
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_REEL_MIME_TYPES.join(",")}
              onChange={(e) => handleFileSelected(e.target.files)}
              className="hidden"
              aria-label="Upload reel video"
              disabled={validating}
            />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-black">
              <video
                src={video.previewUrl}
                className="h-full w-full object-contain"
                controls
                playsInline
                muted
              />
              <button
                type="button"
                onClick={removeVideo}
                aria-label="Remove video"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {video.duration ? `${video.duration}s selected. ` : ""}
              <label
                htmlFor="reel-video-replace"
                className="cursor-pointer font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
              >
                Change video
              </label>
              <input
                ref={replaceInputRef}
                id="reel-video-replace"
                type="file"
                accept={SUPPORTED_REEL_MIME_TYPES.join(",")}
                onChange={(e) => handleFileSelected(e.target.files)}
                className="hidden"
              />
            </p>
          </div>
        )}
      </Card>

      {/* DETAILS */}
      <div className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Caption</h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Write something about this reel. Use #hashtags to categorize it.
            </p>
          </div>

          <Textarea
            placeholder="Share the story behind this reel..."
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, POST_CAPTION_MAX_LENGTH))}
            charCount={caption.length}
            maxCharCount={POST_CAPTION_MAX_LENGTH}
            rows={8}
            aria-label="Reel caption"
          />
        </Card>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={publishing}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={publishing}
            disabled={!video || validating}
            className="min-w-[160px]"
          >
            {publishing ? "Publishing..." : "Publish reel"}
          </Button>
        </div>
      </div>
    </form>
  );
}
