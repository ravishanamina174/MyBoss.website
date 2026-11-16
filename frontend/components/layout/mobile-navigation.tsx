"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ownerNavigation ,staffNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { useBusinessRole } from "@/hooks/use-business-role";

export function MobileNavigation() {
  const pathname = usePathname();

  const { role, loading } = useBusinessRole();

  const navigation =
  role === "OWNER" ? ownerNavigation : staffNavigation;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <div className={`grid ${ role === "OWNER" ? "grid-cols-4" : "grid-cols-3"}`}>
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
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}