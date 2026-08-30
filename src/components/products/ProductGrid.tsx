"use client";

import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductListItem } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  /** Cursor-paginated GET endpoint — e.g. "/api/products?sellerSlug=..." */
  fetchBaseUrl: string;
  initialProducts: ProductListItem[];
  initialCursor: string | null;
  emptyMessage: string;
}

/** Simple infinite-load product grid — used on store pages and the profile Store tab. See ShopPageClient for the filterable marketplace variant. */
export function ProductGrid({ fetchBaseUrl, initialProducts, initialCursor, emptyMessage }: ProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const separator = fetchBaseUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${fetchBaseUrl}${separator}cursor=${encodeURIComponent(cursor)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setProducts((current) => [...current, ...data.products]);
      setCursor(data.nextCursor);
    } catch {
      // Button stays visible so the user can retry.
    } finally {
      setLoading(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No products yet</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {cursor && (
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="outline" size="sm" isLoading={loading} onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
