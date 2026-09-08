import { FeedPost, CursorPage } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { UserCardItem } from "@/types/follow";
import { ProductListItem } from "@/types/product";

export interface HashtagItem {
  id: string;
  name: string;
  postCount: number;
}

export type SearchType = "all" | "users" | "posts" | "reels" | "hashtags" | "products";

export interface SearchResults {
  users: CursorPage<UserCardItem>;
  posts: CursorPage<FeedPost>;
  reels: CursorPage<ReelItem>;
  hashtags: CursorPage<HashtagItem>;
  products: CursorPage<ProductListItem>;
}

export interface GlobalSearchResponse {
  success: boolean;
  query: string;
  type: SearchType;
  results: {
    users?: CursorPage<UserCardItem>;
    posts?: CursorPage<FeedPost>;
    reels?: CursorPage<ReelItem>;
    hashtags?: CursorPage<HashtagItem>;
    products?: CursorPage<ProductListItem>;
  };
}
