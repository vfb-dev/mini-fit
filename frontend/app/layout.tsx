import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import { MobileMenu } from "@/components/MobileMenu";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiniFit",
  description: "Fitness Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          {/* Sidebar: hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Content */}
          <main className="flex-1">
            {/* Topbar: only mobile */}
            <div className="block md:hidden">
              <MobileMenu />
            </div>

            <div className="flex min-h-screen justify-center">
              <Providers>{children}</Providers>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
