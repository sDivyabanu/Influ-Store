"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, ProductCategoryValue } from "@/lib/constants/product";
import { ProductListItem } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils/cn";

type SortOption = "newest" | "price_asc" | "price_desc";
type CategoryFilter = ProductCategoryValue | "ALL";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  price_asc: "Price: Low to high",
  price_desc: "Price: High to low",
};

interface ShopPageClientProps {
  initialProducts: ProductListItem[];
  initialCursor: string | null;
}

export function ShopPageClient({ initialProducts, initialCursor }: ShopPageClientProps) {
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [sort, setSort] = useState<SortOption>("newest");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  function buildParams(cursorValue?: string): URLSearchParams {
    const params = new URLSearchParams();
    if (category !== "ALL") params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (search) params.set("search", search);
    if (cursorValue) params.set("cursor", cursorValue);
    return params;
  }

  async function reload() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/products?${buildParams().toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setProducts(data.products);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, search]);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/products?${buildParams(cursor).toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setProducts((current) => [...current, ...data.products]);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* SEARCH */}
      <div className="flex items-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 px-5 py-3.5">
        <Search className="mr-3 h-4 w-4 text-neutral-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          type="text"
          placeholder="Search products or stores..."
          className="w-full bg-transparent text-sm text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400"
        />
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory("ALL")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition",
            category === "ALL"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
              : "border border-neutral-200 bg-white/60 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
          )}
        >
          All
        </button>
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition",
              category === c
                ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                : "border border-neutral-200 bg-white/60 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
            )}
          >
            {PRODUCT_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900 px-4 py-2.5 text-sm text-neutral-900 dark:text-white outline-none"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      {products.length === 0 && !loading ? (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 py-24 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-neutral-400" />
          <h3 className="mt-5 text-lg font-semibold text-neutral-900 dark:text-white">No products found</h3>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Try another search or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Couldn&apos;t load products.</p>
          <Button type="button" variant="outline" size="sm" onClick={cursor ? loadMore : reload}>
            Retry
          </Button>
        </div>
      )}

      {cursor && !error && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" size="sm" isLoading={loading} onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
