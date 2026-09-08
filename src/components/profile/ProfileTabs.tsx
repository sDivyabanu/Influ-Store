"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Grid, Bookmark, ShoppingBag, Store, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FeedPost } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { ProductListItem } from "@/types/product";
import { PostGrid } from "@/components/posts/PostGrid";
import { ReelGrid } from "@/components/reels/ReelGrid";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";

interface ProfileTabsProps {
  username: string;
  isOwnProfile?: boolean;
  initialPosts: FeedPost[];
  initialCursor: string | null;
  initialReels: ReelItem[];
  initialReelsCursor: string | null;
  /** Non-null only for approved sellers who have finished storefront setup — drives whether the Store tab appears at all. */
  storeSlug: string | null;
  initialStoreProducts: ProductListItem[];
  initialStoreProductsCursor: string | null;
  /** True only when viewing your own profile as an approved seller who hasn't set up a storefront yet — shows a setup prompt instead of hiding the tab entirely. */
  showStoreSetupPrompt?: boolean;
}

export function ProfileTabs({
  username,
  isOwnProfile = false,
  initialPosts,
  initialCursor,
  initialReels,
  initialReelsCursor,
  storeSlug,
  initialStoreProducts,
  initialStoreProductsCursor,
  showStoreSetupPrompt = false,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "saved" | "shop">("posts");
  // Non-sellers never see a fake store tab (Phase 6 spec section 27).
  const showStoreTab = Boolean(storeSlug) || showStoreSetupPrompt;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      {/* TAB NAVIGATION */}
      <div className="flex justify-center border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors",
              activeTab === "posts"
                ? "border-fuchsia-500 text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <Grid className="h-4 w-4" />
            <span>Posts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reels")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors",
              activeTab === "reels"
                ? "border-fuchsia-500 text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <Clapperboard className="h-4 w-4" />
            <span>Reels</span>
          </button>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={cn(
                "flex items-center gap-2 border-b-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors",
                activeTab === "saved"
                  ? "border-fuchsia-500 text-neutral-900 dark:text-white"
                  : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              <Bookmark className="h-4 w-4" />
              <span>Saved</span>
            </button>
          )}

          {showStoreTab && (
            <button
              type="button"
              onClick={() => setActiveTab("shop")}
              className={cn(
                "flex items-center gap-2 border-b-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors",
                activeTab === "shop"
                  ? "border-fuchsia-500 text-neutral-900 dark:text-white"
                  : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Store</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="py-8">
        {activeTab === "posts" && (
          <PostGrid
            username={username}
            initialPosts={initialPosts}
            initialCursor={initialCursor}
            emptyMessage={
              isOwnProfile
                ? "Share your first photo with the community."
                : "This creator hasn't published any posts yet."
            }
          />
        )}

        {activeTab === "reels" && (
          <ReelGrid
            fetchBaseUrl={`/api/users/${username}/reels`}
            initialReels={initialReels}
            initialCursor={initialReelsCursor}
            emptyMessage={
              isOwnProfile
                ? "Share your first video with the community."
                : "This creator hasn't published any reels yet."
            }
          />
        )}

        {activeTab === "saved" && (
          // Saved posts/reels are private — this tab only ever renders for
          // the profile owner, and always links to the dedicated private
          // page rather than listing anything inline here.
          <div className="mx-auto max-w-sm space-y-4 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
              <Bookmark className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Your saved posts &amp; reels
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Saved items are private and only visible to you.
            </p>
            <Link href="/saved">
              <Button size="sm">View saved</Button>
            </Link>
          </div>
        )}

        {activeTab === "shop" && showStoreTab && (
          storeSlug ? (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Link href={`/store/${storeSlug}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Store className="h-3.5 w-3.5" /> Visit full store
                  </Button>
                </Link>
              </div>
              <ProductGrid
                fetchBaseUrl={`/api/products?sellerSlug=${encodeURIComponent(storeSlug)}`}
                initialProducts={initialStoreProducts}
                initialCursor={initialStoreProductsCursor}
                emptyMessage={
                  isOwnProfile
                    ? "Add your first product to start selling."
                    : "This creator hasn't listed any products yet."
                }
              />
            </div>
          ) : (
            <div className="mx-auto max-w-sm space-y-4 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
                <Store className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Set up your storefront
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Add a store name, logo, and banner so shoppers can find and buy your products.
              </p>
              <Link href="/seller/store">
                <Button size="sm">Set up store</Button>
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
