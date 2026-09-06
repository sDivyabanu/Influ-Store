import { Loader2 } from "lucide-react";

export function ReelFeedSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-5rem)] snap-start items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-white/60" />
    </div>
  );
}
