"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause, Loader2, AlertTriangle } from "lucide-react";

interface ReelVideoProps {
  src: string;
  posterUrl?: string | null;
  /** Whether this reel is the one currently in view — controls play/pause. */
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

const CONTROL_HINT_DURATION_MS = 500;

export function ReelVideo({ src, posterUrl, isActive, muted, onToggleMute }: ReelVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState(false);
  const [lastAction, setLastAction] = useState<"play" | "pause" | null>(null);

  // Play the active reel, pause everything else. Only one video plays (and
  // has audio) at a time — never simultaneous playback across cards.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Autoplay blocked by the browser — leave it paused; the tap
          // overlay lets the user start playback manually.
        });
      }
    } else {
      video.pause();
    }
  }, [isActive]);

  function togglePlayPause() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setLastAction("play");
    } else {
      video.pause();
      setLastAction("pause");
    }

    window.setTimeout(() => setLastAction(null), CONTROL_HINT_DURATION_MS);
  }

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={posterUrl ?? undefined}
        preload={isActive ? "auto" : "metadata"}
        loop
        playsInline
        muted={muted}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onError={() => setError(true)}
        className="h-full w-full object-cover"
      />

      {/* TAP-TO-TOGGLE OVERLAY (keyboard accessible, sits above the video, below chrome) */}
      <button
        type="button"
        onClick={togglePlayPause}
        aria-label="Play or pause video"
        className="absolute inset-0 z-0 cursor-pointer"
      />

      {buffering && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-white/80" />
        </div>
      )}

      {error && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black text-white/70">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm">This video couldn&apos;t be played.</p>
        </div>
      )}

      {lastAction && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-white animate-in fade-in zoom-in-95 duration-150">
            {lastAction === "pause" ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute bottom-24 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 sm:bottom-6"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
    </div>
  );
}
