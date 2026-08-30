import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { HashtagText } from "@/components/posts/HashtagText";
import { ReelItem } from "@/types/reel";
import { ReelVideo } from "./ReelVideo";

interface ReelCardProps {
  reel: ReelItem;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

/**
 * One reel's full-viewport card: video + author/caption overlay.
 * The engagement action rail (like/comment/save/share) and options menu
 * land in a follow-up commit — this is the vertical feed + playback shell.
 */
export function ReelCard({ reel, isActive, muted, onToggleMute }: ReelCardProps) {
  return (
    <div className="relative mx-auto h-[calc(100dvh-5rem)] w-full max-w-md overflow-hidden bg-black sm:rounded-3xl">
      <ReelVideo
        src={reel.mediaUrl}
        posterUrl={reel.thumbnailUrl}
        isActive={isActive}
        muted={muted}
        onToggleMute={onToggleMute}
      />

      {/* AUTHOR + CAPTION OVERLAY */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 pb-6">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <Link href={`/profile/${reel.author.username}`}>
            <Avatar
              src={reel.author.avatarUrl}
              name={reel.author.displayName}
              size="sm"
              className="ring-2 ring-white/70"
            />
          </Link>
          <Link href={`/profile/${reel.author.username}`} className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{reel.author.displayName}</p>
            <p className="truncate text-xs text-white/70">@{reel.author.username}</p>
          </Link>
        </div>

        {reel.caption && (
          <p className="pointer-events-auto mt-2 line-clamp-3 pr-14 text-sm text-white/90">
            <HashtagText text={reel.caption} hashtagClassName="text-fuchsia-300 hover:text-fuchsia-200" />
          </p>
        )}
      </div>
    </div>
  );
}
