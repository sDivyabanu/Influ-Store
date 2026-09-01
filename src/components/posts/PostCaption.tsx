import Link from "next/link";
import { HashtagText } from "./HashtagText";

export function PostCaption({ username, caption }: { username: string; caption: string | null }) {
  if (!caption) return null;

  return (
    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
      <Link
        href={`/profile/${username}`}
        className="font-semibold text-neutral-900 dark:text-white hover:underline"
      >
        {username}
      </Link>{" "}
      <HashtagText text={caption} />
    </p>
  );
}
