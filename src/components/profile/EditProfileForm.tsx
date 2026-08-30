"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle, User, AtSign, Globe, Image as ImageIcon, ExternalLink } from "lucide-react";

export function EditProfileForm() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState(
    user?.profile?.displayName || user?.username || ""
  );
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const [website, setWebsite] = useState(user?.profile?.website || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || "");

  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavedSuccess(false);
    setGeneralError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim(),
          bio: bio.trim() || null,
          website: website.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setGeneralError(data.message || "Failed to update profile.");
        return;
      }

      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setGeneralError("An error occurred while updating your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {savedSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-300 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Your profile has been saved successfully.</span>
        </div>
      )}

      {generalError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* AVATAR PREVIEW & URL */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Profile Photo
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Provide an image URL for your avatar. (Direct S3 uploads will be activated with AWS in Phase 2).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar
            src={avatarUrl}
            name={displayName || username}
            size="xl"
          />

          <div className="flex-1 w-full space-y-2">
            <Input
              label="Avatar Image URL"
              type="url"
              placeholder="https://images.unsplash.com/... or https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              error={fieldErrors.avatarUrl?.[0]}
              leftIcon={<ImageIcon className="h-4 w-4" />}
            />
          </div>
        </div>
      </Card>

      {/* BASIC DETAILS */}
      <Card className="p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Basic Information
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your public identity on Influ-Store.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* DISPLAY NAME */}
          <Input
            label="Display Name"
            type="text"
            placeholder="e.g. Priya Sharma"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors.displayName?.[0]}
            required
            leftIcon={<User className="h-4 w-4" />}
          />

          {/* USERNAME */}
          <Input
            label="Username"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username?.[0]}
            required
            leftIcon={<AtSign className="h-4 w-4" />}
            helperText="Changing username will change your public profile URL."
          />
        </div>

        {/* BIO */}
        <Textarea
          label="Bio"
          placeholder="Tell the community about yourself, your style, and what inspires you..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          error={fieldErrors.bio?.[0]}
          charCount={bio.length}
          maxCharCount={160}
          rows={3}
        />

        {/* WEBSITE */}
        <Input
          label="Website"
          type="text"
          placeholder="https://yourwebsite.com or yourbrand.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          error={fieldErrors.website?.[0]}
          leftIcon={<Globe className="h-4 w-4" />}
        />
      </Card>

      {/* ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        {user?.username && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/profile/${user.username}`)}
            className="gap-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <span>View Public Profile</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            isLoading={loading}
            className="min-w-[140px]"
          >
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
