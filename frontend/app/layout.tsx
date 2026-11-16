import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/shared/theme-provider";

import "./globals.css";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MyBoss | Run the business. Own the momentum.",
    template: "%s | MyBoss",
  },
  description:
    "MyBoss gives small business owners one calm, clear place to organize work, lead their team, and make better decisions every day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={inter.variable}
      >
        <body className="min-h-screen antialiased">
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}