"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedUser } from "@/types/user";

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthenticatedUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthenticatedUser | null;
}) {
  const [user, setUser] = useState<AuthenticatedUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadUser() {
      if (!initialUser) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { "Cache-Control": "no-cache" },
          });
          if (!ignore) {
            if (res.ok) {
              const data = await res.json();
              setUser(data.user);
            } else {
              setUser(null);
            }
          }
        } catch {
          if (!ignore) setUser(null);
        } finally {
          if (!ignore) setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [initialUser]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshUser,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
