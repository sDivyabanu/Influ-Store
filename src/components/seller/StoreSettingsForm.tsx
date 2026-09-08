"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, AlertCircle, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/features/toast/toast-context";
import { uploadStoreMediaFile } from "@/lib/client/upload-store-media";
import {
  STORE_NAME_MAX_LENGTH,
  STORE_DESCRIPTION_MAX_LENGTH,
  ALLOWED_STORE_IMAGE_MIME_TYPES,
  MAX_STORE_IMAGE_SIZE_BYTES,
} from "@/lib/constants/store";
import { slugify } from "@/lib/utils/slug";
import { MyStoreItem } from "@/types/store";

interface StoreSettingsFormProps {
  initialStore: MyStoreItem | null;
}

export function StoreSettingsForm({ initialStore }: StoreSettingsFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [storeName, setStoreName] = useState(initialStore?.storeName ?? "");
  const [slug, setSlug] = useState(initialStore?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialStore));
  const [description, setDescription] = useState(initialStore?.description ?? "");
  const [website, setWebsite] = useState(initialStore?.website ?? "");
  const [logoUrl, setLogoUrl] = useState(initialStore?.logoUrl ?? null);
  const [logoKey, setLogoKey] = useState<string | undefined>(undefined);
  const [bannerUrl, setBannerUrl] = useState(initialStore?.bannerUrl ?? null);
  const [bannerKey, setBannerKey] = useState<string | undefined>(undefined);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleNameChange(value: string) {
    setStoreName(value);
    if (!slugTouched) setSlug(slugify(value, 40));
  }

  async function handleImageSelected(file: File | undefined, kind: "logo" | "banner") {
    if (!file) return;
    setError("");

    if (!ALLOWED_STORE_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_STORE_IMAGE_MIME_TYPES)[number])) {
      setError(`"${file.name}" isn't a supported image type (JPG, PNG, or WEBP).`);
      return;
    }
    if (file.size > MAX_STORE_IMAGE_SIZE_BYTES) {
      setError(`"${file.name}" is larger than ${MAX_STORE_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
      return;
    }

    const setUploading = kind === "logo" ? setUploadingLogo : setUploadingBanner;
    setUploading(true);
    try {
      const uploaded = await uploadStoreMediaFile(file);
      if (kind === "logo") {
        setLogoUrl(uploaded.url);
        setLogoKey(uploaded.key);
      } else {
        setBannerUrl(uploaded.url);
        setBannerKey(uploaded.key);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSaving(true);

    try {
      const res = await fetch("/api/seller/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          website: website.trim() || undefined,
          ...(logoKey !== undefined ? { logoKey } : {}),
          ...(bannerKey !== undefined ? { bannerKey } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.errors) setFieldErrors(data.errors);
        throw new Error(data.message || "Failed to save your storefront.");
      }
      showToast(initialStore ? "Storefront updated" : "Storefront created!");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save your storefront.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Store details</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            This is how your storefront appears to shoppers.
          </p>
        </div>

        <Input
          label="Store name"
          value={storeName}
          onChange={(e) => handleNameChange(e.target.value.slice(0, STORE_NAME_MAX_LENGTH))}
          error={fieldErrors.storeName?.[0]}
          placeholder="e.g. Maya's Style Studio"
          required
        />

        <Input
          label="Store URL"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value, 40));
          }}
          error={fieldErrors.slug?.[0]}
          helperText={slug ? `influstore.com/store/${slug}` : undefined}
          placeholder="your-store-name"
          required
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, STORE_DESCRIPTION_MAX_LENGTH))}
          charCount={description.length}
          maxCharCount={STORE_DESCRIPTION_MAX_LENGTH}
          placeholder="Tell shoppers what your store is about..."
          rows={4}
        />

        <Input
          label="Website (optional)"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          error={fieldErrors.website?.[0]}
          placeholder="https://example.com"
          rightIcon={<ExternalLink className="h-4 w-4" />}
        />
      </Card>

      <Card className="space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Branding</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            JPG, PNG, or WEBP — up to {MAX_STORE_IMAGE_SIZE_BYTES / (1024 * 1024)}MB each.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Logo
            </p>
            <label
              className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-center transition hover:border-fuchsia-400"
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Store logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 p-4">
                  <ImagePlus className="h-6 w-6 text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-500">
                    {uploadingLogo ? "Uploading..." : "Upload logo"}
                  </span>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept={ALLOWED_STORE_IMAGE_MIME_TYPES.join(",")}
                onChange={(e) => handleImageSelected(e.target.files?.[0], "logo")}
                className="hidden"
                disabled={uploadingLogo}
                aria-label="Upload store logo"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Banner
            </p>
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-center transition hover:border-fuchsia-400">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Store banner" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 p-4">
                  <ImagePlus className="h-6 w-6 text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-500">
                    {uploadingBanner ? "Uploading..." : "Upload banner"}
                  </span>
                </div>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept={ALLOWED_STORE_IMAGE_MIME_TYPES.join(",")}
                onChange={(e) => handleImageSelected(e.target.files?.[0], "banner")}
                className="hidden"
                disabled={uploadingBanner}
                aria-label="Upload store banner"
              />
            </label>
          </div>
        </div>
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

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={saving}
          disabled={uploadingLogo || uploadingBanner}
          className="min-w-[160px]"
        >
          {initialStore ? "Save changes" : "Create storefront"}
        </Button>
      </div>
    </form>
  );
}
