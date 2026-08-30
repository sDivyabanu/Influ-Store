"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/auth-context";
import { Eye, EyeOff, Lock, Mail, User, AtSign, AlertCircle, Sparkles, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function RegisterForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"CUSTOMER" | "INFLUENCER">("CUSTOMER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ["Passwords do not match."] });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setGeneralError(data.message || "Registration failed. Please check the form.");
        return;
      }

      await refreshUser();
      router.push("/home");
      router.refresh();
    } catch {
      setGeneralError("Unable to connect to the registration server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* ACCOUNT TYPE SELECTOR */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAccountType("CUSTOMER")}
            className={cn(
              "flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all",
              accountType === "CUSTOMER"
                ? "border-fuchsia-500/80 bg-fuchsia-500/10 dark:bg-fuchsia-500/15"
                : "border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="flex items-center gap-2 font-semibold text-sm text-neutral-900 dark:text-white">
              <ShoppingBag className="h-4 w-4 text-fuchsia-500" />
              <span>Customer</span>
            </div>
            <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Discover & shop
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("INFLUENCER")}
            className={cn(
              "flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all",
              accountType === "INFLUENCER"
                ? "border-fuchsia-500/80 bg-fuchsia-500/10 dark:bg-fuchsia-500/15"
                : "border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="flex items-center gap-2 font-semibold text-sm text-neutral-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-fuchsia-500" />
              <span>Influencer</span>
            </div>
            <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Create & inspire
            </span>
          </button>
        </div>
      </div>

      {/* FULL NAME */}
      <Input
        label="Full Name"
        type="text"
        placeholder="Your display name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name?.[0]}
        autoComplete="name"
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
        autoComplete="username"
        required
        leftIcon={<AtSign className="h-4 w-4" />}
      />

      {/* EMAIL */}
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email?.[0]}
        autoComplete="email"
        required
        leftIcon={<Mail className="h-4 w-4" />}
      />

      {/* PASSWORD */}
      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Min. 8 characters (upper, lower, digit)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password?.[0]}
        autoComplete="new-password"
        required
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      {/* CONFIRM PASSWORD */}
      <Input
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Re-enter password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword?.[0]}
        autoComplete="new-password"
        required
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      {/* SUBMIT BUTTON */}
      <Button
        type="submit"
        isLoading={loading}
        className="w-full h-12 text-sm font-semibold rounded-2xl mt-2"
      >
        Create Account
      </Button>

      {/* LOGIN LINK */}
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 pt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
