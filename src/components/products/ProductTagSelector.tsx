"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { MAX_PRODUCT_TAGS_PER_CONTENT } from "@/lib/constants/product";
import { ProductListItem } from "@/types/product";
import { cn } from "@/lib/utils/cn";

interface ProductTagSelectorProps {
  selectedProductIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Lets a seller pick up to MAX_PRODUCT_TAGS_PER_CONTENT of their own
 * ACTIVE products to tag on a post or reel — shared between post and
 * reel creation/edit flows. Only ever offers the caller's own active
 * products (via /api/seller/products), matching the server-side
 * enforcement in product-tag.service.ts.
 */
export function ProductTagSelector({ selectedProductIds, onChange }: ProductTagSelectorProps) {
  const [products, setProducts] = useState<ProductListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/seller/products?status=ACTIVE&limit=50");
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error();
        if (!ignore) setProducts(data.products);
      } catch {
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  function toggle(productId: string) {
    if (selectedProductIds.includes(productId)) {
      onChange(selectedProductIds.filter((id) => id !== productId));
      return;
    }
    if (selectedProductIds.length >= MAX_PRODUCT_TAGS_PER_CONTENT) return;
    onChange([...selectedProductIds, productId]);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-neutral-500 dark:text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your products...
      </div>
    );
  }

  if (error) {
    return <p className="py-3 text-sm text-neutral-500 dark:text-neutral-400">Couldn&apos;t load your products.</p>;
  }

  if (!products || products.length === 0) {
    return (
      <p className="py-3 text-sm text-neutral-500 dark:text-neutral-400">
        You don&apos;t have any active products to tag yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {selectedProductIds.length}/{MAX_PRODUCT_TAGS_PER_CONTENT} tagged
      </p>
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {products.map((product) => {
          const selected = selectedProductIds.includes(product.id);
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggle(product.id)}
              disabled={!selected && selectedProductIds.length >= MAX_PRODUCT_TAGS_PER_CONTENT}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40",
                selected
                  ? "border-fuchsia-500 bg-fuchsia-500/5"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-fuchsia-300"
              )}
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                {product.coverImageUrl && (
                  <img src={product.coverImageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{product.name}</p>
                <p className="text-xs text-neutral-500">{formatMoney(product.basePrice)}</p>
              </div>
              {selected && <Check className="h-4 w-4 shrink-0 text-fuchsia-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
