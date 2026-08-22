"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      console.log("Login successful:", data);

      // Store basic user information locally for now.
      // We can replace this with proper JWT/cookie authentication next.
      if (data.user) {
        localStorage.setItem(
          "influstore_user",
          JSON.stringify(data.user)
        );
      }

      // Redirect after successful login
      router.push("/home");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError(
        "Unable to connect to the server. Please try again."
      );
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

          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[140px]" />

          {/* LOGO */}
          <Link
            href="/"
            className="relative text-2xl font-bold"
          >
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          {/* CONTENT */}
          <div className="relative max-w-lg">

            <p className="mb-5 text-sm uppercase tracking-[0.3em] text-fuchsia-400">
              Welcome back
            </p>

            <h1 className="text-6xl font-bold leading-tight">
              Your next
              <br />
              discovery
              <br />
              awaits.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-gray-400">
              Pick up where you left off. Discover creators,
              explore products and find something you'll love.
            </p>

          </div>

          {/* COPYRIGHT */}
          <p className="relative text-sm text-gray-600">
            © 2026 Influstore
          </p>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <Link
              href="/"
              className="mb-12 block text-center text-2xl font-bold lg:hidden"
            >
              Influ<span className="text-fuchsia-400">store</span>
            </Link>

            {/* HEADING */}
            <div className="mb-10">

              <h2 className="text-4xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-3 text-gray-400">
                Sign in to continue to Influstore.
              </p>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleLogin}
              className="space-y-6"
            >

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
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50 focus:bg-white/[0.07]"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm text-fuchsia-400 transition hover:text-fuchsia-300"
                    onClick={() => {
                      // Forgot password functionality
                      // will be implemented later.
                      alert(
                        "Password reset will be available soon."
                      );
                    }}
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-16 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50 focus:bg-white/[0.07]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-white"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:scale-[1.01] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
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
                <span className="text-lg">
                  G
                </span>

                Continue with Google
              </button>

            </form>

            {/* REGISTER */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{" "}

              <Link
                href="/register"
                className="font-medium text-fuchsia-400 hover:text-fuchsia-300"
              >
                Create one
              </Link>

            </p>

          </div>

        </section>
      </div>
    </main>
  );
}