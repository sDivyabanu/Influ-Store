import React from "react";

export interface PostCardProps {
  id?: string | number;
  title?: string;
  image?: string;
}

export function PostCard({ title }: PostCardProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-4">
      {title && <p className="text-sm font-semibold">{title}</p>}
    </div>
  );
}

export default PostCard;
