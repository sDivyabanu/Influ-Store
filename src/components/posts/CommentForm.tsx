"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/features/auth/auth-context";
import { COMMENT_MAX_LENGTH } from "@/lib/constants/post";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CommentForm({
  onSubmit,
  placeholder = "Add a comment...",
  autoFocus,
  onCancel,
  submitLabel = "Post",
}: CommentFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue("");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/login" className="font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:underline">
          Log in
        </Link>{" "}
        to leave a comment.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <Avatar
        src={user?.profile?.avatarUrl}
        name={user?.profile?.displayName || user?.username}
        size="sm"
      />
      <div className="flex-1 space-y-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
          placeholder={placeholder}
          rows={2}
          autoFocus={autoFocus}
          aria-label={placeholder}
          className="min-h-0"
          charCount={value.length}
          maxCharCount={COMMENT_MAX_LENGTH}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" isLoading={submitting} disabled={!value.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
