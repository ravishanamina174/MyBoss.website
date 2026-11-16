"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ownerNavigation, staffNavigation } from "@/config/navigation";
import { Brand } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

import { useBusinessRole } from "@/hooks/use-business-role";

export function Sidebar() {
  const pathname = usePathname();

  const { role, loading } = useBusinessRole();
  const navigation = role === "OWNER" ? ownerNavigation : staffNavigation;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* Brand */}
      <div className="flex h-[72px] items-center border-b border-sidebar-border px-6">
        <Brand />
      </div>

      {/* Business identity */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-background p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground">
            M
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              My Business
            </p>
            <p className="text-xs text-muted-foreground">
              Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Workspace
        </p>

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
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground">
          MyBoss
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Business operations
        </p>
      </div>
    </aside>
  );
}