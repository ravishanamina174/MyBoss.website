"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { HelpCircle, Bell } from "lucide-react";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/tasks": "Tasks",
  "/dashboard/staff": "Staff",
  "/dashboard/settings": "Settings",
};

export function AppHeader() {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/dashboard/tasks/")
      ? "Task details"
      : "MyBoss");

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
      {/* Mobile brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <Brand collapsed />
        <div className="h-7 w-px bg-border" />
        <h1 className="text-sm font-semibold">{title}</h1>
      </div>

      {/* Desktop page title */}
      <h1 className="hidden text-base font-semibold lg:block">
        {title}
      </h1>

      {/* Header actions */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          disabled
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground opacity-60"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          aria-label="Help"
          title="Help"
          disabled
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground opacity-60 sm:flex"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        <ThemeToggle />

        <div className="ml-1 border-l border-border pl-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}