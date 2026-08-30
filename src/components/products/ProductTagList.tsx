import React from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/money";
import { ProductTagPreview } from "@/types/product";

/** Renders a post/reel's tagged products as lightweight linked chips — never the full product objects. */
export function ProductTagList({ tags }: { tags: ProductTagPreview[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/product/${tag.slug}`}
          className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-2 pr-3 transition hover:border-fuchsia-400"
        >
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
            {tag.coverImageUrl && <img src={tag.coverImageUrl} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">{tag.name}</p>
            <p className="text-xs text-neutral-500">{formatMoney(tag.basePrice)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
