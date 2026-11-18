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
      className="workspace-mobile-nav sticky z-20 overflow-hidden border-b border-border bg-sidebar lg:hidden"
    >
      <div
        className="mobile-nav-scrollbar flex w-full min-w-0 gap-1.5 overflow-x-auto px-3 py-2"
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
                "flex h-10 shrink-0 items-center gap-2 rounded-md border border-transparent px-3 text-[13px] font-semibold transition-colors",
                isActive
                  ? "text-accent-foreground"
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
