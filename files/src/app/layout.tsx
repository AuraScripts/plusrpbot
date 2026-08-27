import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLUSRP Restore",
  description: "Self-hosted Discord member verification & recovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
