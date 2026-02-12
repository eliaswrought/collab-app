import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandForge — Instant Brand Generator",
  description: "Generate a complete brand identity in seconds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
