import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/shared/theme-provider";

import "./globals.css";
import { Suspense } from "react";

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyBoss | The small business workspace",
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
        data-scroll-behavior="smooth"
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
