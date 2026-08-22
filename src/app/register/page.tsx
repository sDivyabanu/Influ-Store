"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [accountType, setAccountType] = useState<
    "customer" | "influencer"
  >("customer");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    // Validate fields
    if (!name || !username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Validate username
    if (username.trim().length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Terms
    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      console.log("Registration successful:", data);

      alert("Account created successfully!");

      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-orange-400/10" />

          <div className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[140px]" />

          <Link
            href="/"
            className="relative text-2xl font-bold"
          >
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          <div className="relative max-w-lg">
            <p className="mb-5 text-sm uppercase tracking-[0.3em] text-fuchsia-400">
              Join the community
            </p>

            <h1 className="text-6xl font-bold leading-tight">
              Discover.
              <br />
              Create.
              <br />
              Influence.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-gray-400">
              Join a community where inspiration meets shopping. Discover
              creators, share your style, and find products you'll love.
            </p>

            <div className="mt-10 flex gap-8 text-sm text-gray-500">
              <div>
                <p className="text-2xl font-semibold text-white">
                  10K+
                </p>
                <p className="mt-1">Creators</p>
              </div>

              <div>
                <p className="text-2xl font-semibold text-white">
                  50K+
                </p>
                <p className="mt-1">Products</p>
              </div>

              <div>
                <p className="text-2xl font-semibold text-white">
                  100K+
                </p>
                <p className="mt-1">Discoveries</p>
              </div>
            </div>
          </div>

          <p className="relative text-sm text-gray-600">
            © 2026 Influstore
          </p>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <Link
              href="/"
              className="mb-10 block text-center text-2xl font-bold lg:hidden"
            >
              Influ<span className="text-fuchsia-400">store</span>
            </Link>

            {/* HEADING */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold tracking-tight">
                Create your account
              </h2>

              <p className="mt-3 text-gray-400">
                Start your Influstore journey today.
              </p>
            </div>

            {/* ACCOUNT TYPE */}
            <div className="mb-7">
              <p className="mb-3 text-sm font-medium text-gray-300">
                I want to join as
              </p>

              <div className="grid grid-cols-2 gap-3">

                {/* CUSTOMER */}
                <button
                  type="button"
                  onClick={() => setAccountType("customer")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    accountType === "customer"
                      ? "border-fuchsia-400/60 bg-fuchsia-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="mb-2 text-xl">
                    🛍️
                  </div>

                  <p className="font-semibold">
                    Customer
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Discover & shop
                  </p>
                </button>

                {/* INFLUENCER */}
                <button
                  type="button"
                  onClick={() => setAccountType("influencer")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    accountType === "influencer"
                      ? "border-fuchsia-400/60 bg-fuchsia-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="mb-2 text-xl">
                    ✨
                  </div>

                  <p className="font-semibold">
                    Influencer
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Create & influence
                  </p>
                </button>
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >

              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50 focus:bg-white/[0.07]"
                />
              </div>

              {/* USERNAME */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50 focus:bg-white/[0.07]"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50 focus:bg-white/[0.07]"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-16 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50 focus:bg-white/[0.07]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-16 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50 focus:bg-white/[0.07]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-white"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* TERMS */}
              <label className="flex items-start gap-3 text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) =>
                    setAcceptedTerms(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-fuchsia-500"
                />

                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-fuchsia-400 hover:text-fuchsia-300"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-fuchsia-400 hover:text-fuchsia-300"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:scale-[1.01] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Account..."
                  : `Create ${
                      accountType === "influencer"
                        ? "Influencer"
                        : "Customer"
                    } Account`}
              </button>

              {/* DIVIDER */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs uppercase tracking-wider text-gray-600">
                  or
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium transition hover:bg-white/10"
              >
                <span className="text-lg font-bold">
                  G
                </span>

                Continue with Google
              </button>
            </form>

            {/* LOGIN */}
            <p className="mt-7 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-fuchsia-400 transition hover:text-fuchsia-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}