"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Share2, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/features/toast/toast-context";
import { formatMoney } from "@/lib/utils/money";
import { PRODUCT_CATEGORY_LABELS, ProductCategoryValue } from "@/lib/constants/product";
import { ProductDetailItem, VariantOptionValueMap } from "@/types/product";
import { cn } from "@/lib/utils/cn";
import { ProductGallery } from "./ProductGallery";

function sameCombo(a: VariantOptionValueMap, b: VariantOptionValueMap): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => a[k] === b[k]);
}

interface ProductDetailClientProps {
  product: ProductDetailItem;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<VariantOptionValueMap>(() => {
    const firstActive = product.variants.find((v) => v.isActive) ?? product.variants[0];
    return firstActive?.optionValues ?? {};
  });
  const [copied, setCopied] = useState(false);

  const matchedVariant = useMemo(
    () => product.variants.find((v) => sameCombo(v.optionValues, selected)) ?? null,
    [product.variants, selected]
  );

  const displayPrice = matchedVariant?.price ?? product.basePrice;
  const hasOptions = product.options.length > 0;

  const stockLabel = !matchedVariant
    ? "Not available in this combination"
    : matchedVariant.stock > 0
      ? "In stock"
      : "Out of stock";
  const stockBadgeVariant: "success" | "outline" | "warning" = !matchedVariant
    ? "warning"
    : matchedVariant.stock > 0
      ? "success"
      : "outline";

  function selectOption(optionName: string, value: string) {
    setSelected((current) => ({ ...current, [optionName]: value }));
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Couldn't copy link", "error");
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 lg:grid-cols-2 lg:px-10">
      <ProductGallery media={product.media} alt={product.name} />

      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-500">
            {PRODUCT_CATEGORY_LABELS[product.category as ProductCategoryValue]}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {product.name}
          </h1>
          <Link
            href={`/store/${product.seller.slug}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 transition hover:text-fuchsia-500"
          >
            <StoreIcon className="h-3.5 w-3.5" /> {product.seller.storeName}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">{formatMoney(displayPrice)}</span>
          {product.compareAtPrice && (
            <span className="text-base text-neutral-400 line-through">{formatMoney(product.compareAtPrice)}</span>
          )}
          <Badge variant={stockBadgeVariant}>{stockLabel}</Badge>
        </div>

        {hasOptions && (
          <div className="space-y-4">
            {product.options.map((option) => (
              <div key={option.id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  {option.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const active = selected[option.name] === value.value;
                    return (
                      <button
                        key={value.id}
                        type="button"
                        onClick={() => selectOption(option.name, value.value)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-medium transition",
                          active
                            ? "border-fuchsia-500 bg-fuchsia-500 text-white"
                            : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-fuchsia-400"
                        )}
                      >
                        {value.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {product.description && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Description
            </p>
            <p className="whitespace-pre-line text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              {product.description}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            disabled
            className="flex-1"
            title="Cart & checkout are coming in a future update"
          >
            Add to Cart — Coming Soon
          </Button>
          <Button type="button" variant="outline" onClick={handleShare} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Copied" : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
}
