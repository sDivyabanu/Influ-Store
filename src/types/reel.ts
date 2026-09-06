import { PostAuthor } from "@/types/post";

export interface ReelItem {
  id: string;
  caption: string | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  isOwner: boolean;
  /** Whether the viewer follows this reel's author — powers the FollowButton without an extra query. */
  isFollowingAuthor: boolean;
}
