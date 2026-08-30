import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "Influstore | Social Commerce Platform",
  description: "Discover what inspires you. Follow the people who influence you. Shop what you love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-fuchsia-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}