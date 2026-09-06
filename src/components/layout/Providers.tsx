"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/features/auth/auth-context";
import { ToastProvider } from "@/features/toast/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
