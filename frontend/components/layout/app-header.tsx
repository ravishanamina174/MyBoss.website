"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ChevronRight, HelpCircle } from "lucide-react";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/tasks": "Tasks",
  "/dashboard/staff": "Staff",
  "/dashboard/settings": "Business info",
  "/dashboard/reports": "Reports",
};

export function AppHeader() {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/dashboard/tasks/")
      ? "Task details"
      : "MyBoss");

  return (
    <header className="workspace-header sticky top-0 z-30 flex items-center border-b border-border bg-header px-4 sm:px-6 lg:justify-between lg:px-8 xl:px-10">
      <div className="flex w-full items-center justify-between lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <Brand collapsed />
          <div className="min-w-0">
            <p className="truncate text-[12px] leading-4 text-muted-foreground">
              myboss
            </p>
            <p className="truncate text-[15px] font-semibold leading-5">
              {title}
            </p>
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-0.5">
          <NotificationBell />
          <button
            type="button"
            aria-label="Help"
            title="Help"
            disabled
            className="hidden h-8 w-8 items-center justify-center rounded-[5px] text-muted-foreground opacity-60 min-[380px]:flex"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <div className="ml-1 border-l border-border pl-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 text-sm lg:flex">
        <span className="text-muted-foreground">Workspace</span>
        <ChevronRight size={14} className="text-muted-foreground" aria-hidden="true" />
        <span className="font-semibold">{title}</span>
      </div>

      <div className="ml-auto hidden items-center gap-0.5 lg:flex">
        <NotificationBell />

        <button
          type="button"
          aria-label="Help"
          title="Help"
          disabled
          className="hidden h-8 w-8 items-center justify-center rounded-[5px] text-muted-foreground opacity-60 sm:flex"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>

        <ThemeToggle />

        <div className="ml-1.5 border-l border-border pl-2.5">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-7 w-7",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
