import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Apna Project - Property Listing Platform",
  description: "Buy, sell, and rent properties. Connect with buyers and sellers across India.",
  manifest: "/manifest.json",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
