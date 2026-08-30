import { MediaType } from "@prisma/client";

export interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface PostMediaItem {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  order: number;
  width: number | null;
  height: number | null;
}

export interface FeedPost {
  id: string;
  caption: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  author: PostAuthor;
  media: PostMediaItem[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  isOwner: boolean;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string | Date;
  parentId: string | null;
  author: PostAuthor;
  likeCount: number;
  likedByMe: boolean;
  replyCount: number;
  isOwner: boolean;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}
