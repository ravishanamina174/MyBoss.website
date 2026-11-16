"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ownerNavigation, staffNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { useBusinessRole } from "@/hooks/use-business-role";

export function MobileNavigation() {
  const pathname = usePathname();

  const { role } = useBusinessRole();

  const navigation =
    role === "OWNER" ? ownerNavigation : staffNavigation;

  return (
    <nav
      aria-label="Mobile navigation"
      className="sticky top-[108px] z-20 overflow-hidden border-b border-border bg-sidebar/95 backdrop-blur-md lg:hidden"
    >
      <div
        className="mobile-nav-scrollbar flex w-full min-w-0 gap-1 overflow-x-auto px-3 py-3"
      >
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
