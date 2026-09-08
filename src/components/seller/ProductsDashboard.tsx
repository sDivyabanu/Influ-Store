"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Layers, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/features/toast/toast-context";
import { formatMoney } from "@/lib/utils/money";
import { PRODUCT_CATEGORY_LABELS, ProductCategoryValue } from "@/lib/constants/product";
import { ProductListItem } from "@/types/product";
import { cn } from "@/lib/utils/cn";

type FilterTab = "ALL" | "DRAFT" | "ACTIVE" | "ARCHIVED";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "ACTIVE", label: "Active" },
  { key: "ARCHIVED", label: "Archived" },
];

const STATUS_BADGE: Record<Exclude<FilterTab, "ALL">, { label: string; variant: "warning" | "success" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "warning" },
};

interface ProductsDashboardProps {
  initialProducts: ProductListItem[];
  initialCursor: string | null;
}

export function ProductsDashboard({ initialProducts, initialCursor }: ProductsDashboardProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<FilterTab>("ALL");
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isInitialMount = useRef(true);

  async function loadTab() {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (tab !== "ALL") params.set("status", tab);
      const res = await fetch(`/api/seller/products?${params.toString()}`);
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
    loadTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ cursor });
      if (tab !== "ALL") params.set("status", tab);
      const res = await fetch(`/api/seller/products?${params.toString()}`);
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

  async function handleDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/seller/products/${pendingDeleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product.");
      }
      setProducts((current) => current.filter((p) => p.id !== pendingDeleteId));
      showToast("Product deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete product.", "error");
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition",
                  active
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                    : "border border-neutral-200 bg-white/60 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <Link href="/seller/products/new">
          <Button type="button" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add product
          </Button>
        </Link>
      </div>

      {products.length === 0 && !loading ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <Layers className="h-8 w-8 text-neutral-400" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No products in this view.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {products.map((product) => {
            const badge = STATUS_BADGE[product.status];
            return (
              <Card key={product.id} className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  {product.coverImageUrl ? (
                    <img
                      src={product.coverImageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-400">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {PRODUCT_CATEGORY_LABELS[product.category as ProductCategoryValue]} ·{" "}
                    {formatMoney(product.basePrice)} · {product.totalStock} in stock
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <Link
                    href={`/seller/products/${product.id}/edit`}
                    aria-label={`Edit ${product.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-white/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(product.id)}
                    aria-label={`Delete ${product.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Couldn&apos;t load products.</p>
          <Button type="button" variant="outline" size="sm" onClick={cursor ? loadMore : loadTab}>
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

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this product?"
        description="This will permanently remove the product, its variants, and its images. This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
