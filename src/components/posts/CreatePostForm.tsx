"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/features/toast/toast-context";
import { useAuth } from "@/features/auth/auth-context";
import { uploadPostMediaFile } from "@/lib/client/upload-post-media";
import { ProductTagSelector } from "@/components/products/ProductTagSelector";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_POST_MEDIA_COUNT,
  POST_CAPTION_MAX_LENGTH,
} from "@/lib/constants/post";
import { cn } from "@/lib/utils/cn";

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function CreatePostForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<SelectedImage[]>([]);
  const [caption, setCaption] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");

    const validated: SelectedImage[] = [];
    for (const file of Array.from(fileList)) {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
        setError(`"${file.name}" isn't a supported image type (JPG, PNG, WEBP, or GIF).`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`"${file.name}" is larger than ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
        continue;
      }
      validated.push({ id: makeId(), file, previewUrl: URL.createObjectURL(file) });
    }

    setImages((current) => {
      const combined = [...current, ...validated];
      if (combined.length > MAX_POST_MEDIA_COUNT) {
        setError(`You can add up to ${MAX_POST_MEDIA_COUNT} images per post.`);
        return combined.slice(0, MAX_POST_MEDIA_COUNT);
      }
      return combined;
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  function moveImage(id: string, direction: -1 | 1) {
    setImages((current) => {
      const index = current.findIndex((image) => image.id === id);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function handlePublish(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Add at least one image to publish.");
      return;
    }

    setPublishing(true);
    try {
      const uploaded = [];
      for (const image of images) {
        uploaded.push(await uploadPostMediaFile(image.file));
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          media: uploaded.map((item) => ({
            key: item.key,
            width: item.width,
            height: item.height,
          })),
          productIds,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to publish post.");
      }

      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      showToast("Post published!");
      router.push(`/post/${data.post.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while publishing.");
      setPublishing(false);
    }
  }

  return (
    <form onSubmit={handlePublish} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* IMAGES */}
      <Card className="p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Photos</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Add up to {MAX_POST_MEDIA_COUNT} images. JPG, PNG, WEBP, or GIF — max{" "}
            {MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB each.
          </p>
        </div>

        {images.length === 0 ? (
          <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-center transition hover:border-fuchsia-400 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-500/5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-500/10 text-fuchsia-500">
              <ImagePlus className="h-6 w-6" />
            </div>
            <p className="font-semibold text-neutral-900 dark:text-white">Upload images</p>
            <p className="mt-1.5 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
              Choose one or more photos for your post.
            </p>
            <span className="mt-5 rounded-full bg-neutral-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-black">
              Choose photos
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
              aria-label="Upload post images"
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
                >
                  <img
                    src={image.previewUrl}
                    alt={`Selected photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-1.5 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        aria-label={`Remove photo ${index + 1}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, -1)}
                        disabled={index === 0}
                        aria-label={`Move photo ${index + 1} earlier`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-30"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, 1)}
                        disabled={index === images.length - 1}
                        aria-label={`Move photo ${index + 1} later`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-30"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {images.length < MAX_POST_MEDIA_COUNT && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 transition hover:border-fuchsia-400 hover:text-fuchsia-500">
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-xs font-medium">Add more</span>
                  <input
                    type="file"
                    accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
                    multiple
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                    aria-label="Add more photos"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {images.length}/{MAX_POST_MEDIA_COUNT} photos selected. Hover a photo to remove or reorder it.
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
              Write something about this post. Use #hashtags to categorize it.
            </p>
          </div>

          <Textarea
            placeholder="Share the story behind this post..."
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, POST_CAPTION_MAX_LENGTH))}
            charCount={caption.length}
            maxCharCount={POST_CAPTION_MAX_LENGTH}
            rows={8}
            aria-label="Post caption"
          />
        </Card>

        {user?.role === "SELLER" && (
          <Card className="p-6 sm:p-8 space-y-3">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Tag products</h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Tag your own products so shoppers can find and buy what&apos;s in this post.
              </p>
            </div>
            <ProductTagSelector selectedProductIds={productIds} onChange={setProductIds} />
          </Card>
        )}

        {error && (
          <div
            role="alert"
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
            )}
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={publishing}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={publishing} className="min-w-[160px]">
            {publishing ? "Publishing..." : "Publish post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
