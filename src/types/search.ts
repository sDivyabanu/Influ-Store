import { FeedPost, CursorPage } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { UserCardItem } from "@/types/follow";

export interface HashtagItem {
  id: string;
  name: string;
  postCount: number;
}

export type SearchType = "all" | "users" | "posts" | "reels" | "hashtags";

export interface SearchResults {
  users: CursorPage<UserCardItem>;
  posts: CursorPage<FeedPost>;
  reels: CursorPage<ReelItem>;
  hashtags: CursorPage<HashtagItem>;
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
  };
}
