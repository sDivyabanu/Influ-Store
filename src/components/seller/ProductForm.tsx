"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ImagePlus, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/features/toast/toast-context";
import { uploadProductMediaFile } from "@/lib/client/upload-product-media";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/post";
import {
  DEFAULT_PRODUCT_CURRENCY,
  MAX_PRODUCT_MEDIA_COUNT,
  MAX_PRODUCT_OPTIONS,
  OPTION_NAME_MAX_LENGTH,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  SKU_MAX_LENGTH,
  SUPPORTED_CURRENCIES,
} from "@/lib/constants/product";
import { ProductDetailItem, VariantOptionValueMap } from "@/types/product";
import { cn } from "@/lib/utils/cn";

interface ProductFormProps {
  initialProduct?: ProductDetailItem;
}

interface OptionDraft {
  id: string;
  name: string;
  valuesText: string;
}

interface VariantDraft {
  id: string;
  sku: string;
  price: string;
  stock: string;
  isActive: boolean;
  optionValues: VariantOptionValueMap;
}

interface MediaDraft {
  id: string;
  previewUrl: string;
  key?: string;
  uploading: boolean;
  altText: string;
}

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function makeEmptyVariant(optionValues: VariantOptionValueMap): VariantDraft {
  return { id: makeId(), sku: "", price: "", stock: "0", isActive: true, optionValues };
}

function sameCombo(a: VariantOptionValueMap, b: VariantOptionValueMap): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => a[k] === b[k]);
}

function parseOptions(options: OptionDraft[]): { name: string; values: string[] }[] {
  return options
    .map((o) => ({
      name: o.name.trim(),
      values: Array.from(new Set(o.valuesText.split(",").map((v) => v.trim()).filter(Boolean))),
    }))
    .filter((o) => o.name && o.values.length > 0);
}

function buildCombos(parsedOptions: { name: string; values: string[] }[]): VariantOptionValueMap[] {
  return parsedOptions.reduce<VariantOptionValueMap[]>(
    (acc, option) => acc.flatMap((combo) => option.values.map((value) => ({ ...combo, [option.name]: value }))),
    [{}]
  );
}

function optionsMatchVariants(parsedOptions: { name: string; values: string[] }[], variants: VariantDraft[]): boolean {
  if (parsedOptions.length === 0) {
    return variants.length === 1 && Object.keys(variants[0].optionValues).length === 0;
  }
  const combos = buildCombos(parsedOptions);
  if (combos.length !== variants.length) return false;
  return combos.every((combo) => variants.some((v) => sameCombo(v.optionValues, combo)));
}

export function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [category, setCategory] = useState(initialProduct?.category ?? "OTHER");
  const [currency, setCurrency] = useState(initialProduct?.currency ?? DEFAULT_PRODUCT_CURRENCY);
  const [compareAtPrice, setCompareAtPrice] = useState(initialProduct?.compareAtPrice?.amount ?? "");
  const [status, setStatus] = useState(initialProduct?.status ?? "DRAFT");

  const [options, setOptions] = useState<OptionDraft[]>(
    initialProduct?.options.map((o) => ({ id: o.id, name: o.name, valuesText: o.values.map((v) => v.value).join(", ") })) ?? []
  );
  const [variants, setVariants] = useState<VariantDraft[]>(
    initialProduct
      ? initialProduct.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price.amount,
          stock: String(v.stock),
          isActive: v.isActive,
          optionValues: v.optionValues,
        }))
      : [makeEmptyVariant({})]
  );

  const [media, setMedia] = useState<MediaDraft[]>(
    initialProduct?.media.map((m) => ({ id: m.id, previewUrl: m.mediaUrl, key: m.key, uploading: false, altText: m.altText ?? "" })) ?? []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    return () => {
      media.forEach((m) => {
        if (!initialProduct?.media.some((im) => im.mediaUrl === m.previewUrl)) {
          URL.revokeObjectURL(m.previewUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addOption() {
    if (options.length >= MAX_PRODUCT_OPTIONS) return;
    setOptions((current) => [...current, { id: makeId(), name: "", valuesText: "" }]);
  }

  function updateOption(id: string, patch: Partial<OptionDraft>) {
    setOptions((current) => current.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function removeOption(id: string) {
    setOptions((current) => current.filter((o) => o.id !== id));
  }

  function regenerateVariants() {
    const parsed = parseOptions(options);
    if (parsed.length === 0) {
      setVariants((current) => (current.length > 0 ? [{ ...current[0], optionValues: {} }] : [makeEmptyVariant({})]));
      return;
    }
    const combos = buildCombos(parsed);
    setVariants((current) =>
      combos.map((combo) => {
        const match = current.find((v) => sameCombo(v.optionValues, combo));
        return match ? { ...match, optionValues: combo } : makeEmptyVariant(combo);
      })
    );
  }

  function updateVariant(id: string, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");

    const files = Array.from(fileList);
    const room = MAX_PRODUCT_MEDIA_COUNT - media.length;
    if (files.length > room) {
      setError(`You can add up to ${MAX_PRODUCT_MEDIA_COUNT} images.`);
    }

    for (const file of files.slice(0, Math.max(room, 0))) {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
        setError(`"${file.name}" isn't a supported image type (JPG, PNG, WEBP, or GIF).`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`"${file.name}" is larger than ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
        continue;
      }

      const id = makeId();
      const previewUrl = URL.createObjectURL(file);
      setMedia((current) => [...current, { id, previewUrl, uploading: true, altText: "" }]);

      uploadProductMediaFile(file)
        .then((uploaded) => {
          setMedia((current) => current.map((m) => (m.id === id ? { ...m, key: uploaded.key, uploading: false } : m)));
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to upload image.");
          setMedia((current) => current.filter((m) => m.id !== id));
        });
    }
  }

  function removeMedia(id: string) {
    setMedia((current) => {
      const target = current.find((m) => m.id === id);
      if (target && !initialProduct?.media.some((im) => im.mediaUrl === target.previewUrl)) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((m) => m.id !== id);
    });
  }

  function moveMedia(id: string, direction: -1 | 1) {
    setMedia((current) => {
      const index = current.findIndex((m) => m.id === id);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  const mediaBusy = media.some((m) => m.uploading);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const parsedOptions = parseOptions(options);
    if (!optionsMatchVariants(parsedOptions, variants)) {
      setError('Click "Generate variants" to sync your variants with your options before saving.');
      return;
    }
    if (variants.some((v) => !v.price || Number(v.price) <= 0)) {
      setError("Every variant needs a price greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        currency,
        compareAtPrice: compareAtPrice.trim() ? Number(compareAtPrice) : undefined,
        options: parsedOptions,
        variants: variants.map((v) => ({
          sku: v.sku.trim() || undefined,
          price: Number(v.price),
          stock: Number(v.stock) || 0,
          isActive: v.isActive,
          optionValues: v.optionValues,
        })),
        media: media.filter((m) => m.key).map((m) => ({ key: m.key!, altText: m.altText.trim() || undefined })),
        status,
      };

      const res = await fetch(
        initialProduct ? `/api/seller/products/${initialProduct.id}` : "/api/seller/products",
        {
          method: initialProduct ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.errors) setFieldErrors(data.errors);
        throw new Error(data.message || "Failed to save product.");
      }

      showToast(initialProduct ? "Product updated" : "Product created");
      router.push("/seller/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
      setSaving(false);
    }
  }

  const parsedOptionsPreview = parseOptions(options);
  const isSimpleProduct = parsedOptionsPreview.length === 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        {/* MEDIA */}
        <Card className="p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Photos</h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Add up to {MAX_PRODUCT_MEDIA_COUNT} images. JPG, PNG, WEBP, or GIF — max{" "}
              {MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB each.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item, index) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
              >
                <img src={item.previewUrl} alt={`Product photo ${index + 1}`} className="h-full w-full object-cover" />
                {item.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
                    Uploading...
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-1.5 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeMedia(item.id)}
                      aria-label={`Remove photo ${index + 1}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => moveMedia(item.id, -1)}
                      disabled={index === 0}
                      aria-label={`Move photo ${index + 1} earlier`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveMedia(item.id, 1)}
                      disabled={index === media.length - 1}
                      aria-label={`Move photo ${index + 1} later`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {media.length < MAX_PRODUCT_MEDIA_COUNT && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 transition hover:border-fuchsia-400 hover:text-fuchsia-500">
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs font-medium">Add photo</span>
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
                  multiple
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                  aria-label="Upload product photos"
                />
              </label>
            )}
          </div>
        </Card>

        {/* OPTIONS + VARIANTS */}
        <Card className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Options & variants</h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Leave options empty for a simple product with a single price and stock count.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <div key={option.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 sm:flex-row sm:items-center">
                <input
                  value={option.name}
                  onChange={(e) => updateOption(option.id, { name: e.target.value.slice(0, OPTION_NAME_MAX_LENGTH) })}
                  placeholder="Option name (e.g. Size)"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 px-3 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-fuchsia-500/80 sm:w-40"
                />
                <input
                  value={option.valuesText}
                  onChange={(e) => updateOption(option.id, { valuesText: e.target.value })}
                  placeholder="Values, comma separated (e.g. S, M, L)"
                  className="w-full flex-1 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 px-3 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-fuchsia-500/80"
                />
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  aria-label="Remove option"
                  className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full text-neutral-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 sm:self-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {options.length < MAX_PRODUCT_OPTIONS && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add option
              </Button>
            )}
            {!isSimpleProduct && (
              <Button type="button" variant="outline" size="sm" onClick={regenerateVariants} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Generate variants
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              {isSimpleProduct ? "Price & stock" : `Variants (${variants.length})`}
            </p>

            {variants.map((variant) => (
              <div
                key={variant.id}
                className="grid grid-cols-2 gap-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 sm:grid-cols-5 sm:items-center"
              >
                {!isSimpleProduct && (
                  <div className="col-span-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 sm:col-span-1">
                    {Object.values(variant.optionValues).join(" / ")}
                  </div>
                )}
                <input
                  value={variant.sku}
                  onChange={(e) => updateVariant(variant.id, { sku: e.target.value.slice(0, SKU_MAX_LENGTH) })}
                  placeholder="SKU (auto)"
                  className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 px-3 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-fuchsia-500/80"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => updateVariant(variant.id, { price: e.target.value })}
                  placeholder="Price"
                  className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 px-3 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-fuchsia-500/80"
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={variant.stock}
                  onChange={(e) => updateVariant(variant.id, { stock: e.target.value })}
                  placeholder="Stock"
                  className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 px-3 py-2 text-sm text-neutral-900 dark:text-white outline-none focus:border-fuchsia-500/80"
                />
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={variant.isActive}
                    onChange={(e) => updateVariant(variant.id, { isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
                  />
                  Active
                </label>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* DETAILS */}
      <div className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-5">
          <Input
            label="Product name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, PRODUCT_NAME_MAX_LENGTH))}
            error={fieldErrors.name?.[0]}
            placeholder="e.g. Essential Hoodie"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full rounded-2xl border border-neutral-300 bg-white/70 px-4 py-3.5 text-sm text-neutral-900 outline-none transition focus:border-fuchsia-500/80 focus:ring-2 focus:ring-fuchsia-500/20 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-white"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {PRODUCT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Description (optional)"
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value.slice(0, PRODUCT_DESCRIPTION_MAX_LENGTH))}
            charCount={(description ?? "").length}
            maxCharCount={PRODUCT_DESCRIPTION_MAX_LENGTH}
            placeholder="Describe this product..."
            rows={6}
          />
        </Card>

        <Card className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white/70 px-4 py-3.5 text-sm text-neutral-900 outline-none transition focus:border-fuchsia-500/80 focus:ring-2 focus:ring-fuchsia-500/20 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-white"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Compare-at price (optional)"
              type="number"
              min="0"
              step="0.01"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              error={fieldErrors.compareAtPrice?.[0]}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded-2xl border border-neutral-300 bg-white/70 px-4 py-3.5 text-sm text-neutral-900 outline-none transition focus:border-fuchsia-500/80 focus:ring-2 focus:ring-fuchsia-500/20 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-white"
            >
              <option value="DRAFT">Draft — only visible to you</option>
              <option value="ACTIVE">Active — visible in the marketplace</option>
              <option value="ARCHIVED">Archived — hidden, kept for records</option>
            </select>
          </div>
        </Card>

        {error && (
          <div
            role="alert"
            className={cn("flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400")}
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} disabled={mediaBusy} className="min-w-[160px]">
            {initialProduct ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
