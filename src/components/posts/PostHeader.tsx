import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PostAuthor } from "@/types/post";
import { formatRelativeTime } from "@/lib/utils/format-time";
import { PostMenu } from "./PostMenu";

interface PostHeaderProps {
  author: PostAuthor;
  postId: string;
  createdAt: string | Date;
  isOwner: boolean;
  onEdit?: () => void;
  onDeleted?: () => void;
}

export function PostHeader({ author, postId, createdAt, isOwner, onEdit, onDeleted }: PostHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-5">
      <Link href={`/profile/${author.username}`} className="group flex min-w-0 items-center gap-3">
        <Avatar src={author.avatarUrl} name={author.displayName} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900 transition group-hover:text-fuchsia-500 dark:text-white">
            {author.displayName}
          </p>
          <p className="truncate text-xs text-neutral-500">
            @{author.username} · {formatRelativeTime(createdAt)}
          </p>
        </div>
      </Link>

      <PostMenu postId={postId} isOwner={isOwner} onEdit={onEdit} onDeleted={onDeleted} />
    </div>
  );
}
