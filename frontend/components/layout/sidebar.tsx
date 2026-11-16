"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ownerNavigation, staffNavigation } from "@/config/navigation";
import { Brand } from "@/components/shared/brand";
import { cn } from "@/lib/utils";

import { useBusinessRole } from "@/hooks/use-business-role";

function groupNavigation<T extends { section: string }>(items: T[]) {
  const groups: { section: string; items: T[] }[] = [];

  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) {
      last.items.push(item);
    } else {
      groups.push({ section: item.section, items: [item] });
    }
  }

  return groups;
}

export function Sidebar() {
  const pathname = usePathname();

  const { role } = useBusinessRole();
  const navigation = role === "OWNER" ? ownerNavigation : staffNavigation;
  const groups = groupNavigation(navigation);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-[52px] items-center border-b border-sidebar-border px-4">
        <Brand />
      </div>

      <div className="px-3 pt-3">
        <Link
          href="/"
          aria-label="Open MyBoss home"
          className="flex cursor-pointer items-center gap-2.5 rounded-[5px] border border-sidebar-border bg-background px-2.5 py-2 transition-colors hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-surface-elevated text-[11px] font-semibold text-foreground">
            M
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-sidebar-foreground">
              My Business
            </p>
            <p className="text-[11px] text-muted-foreground">Workspace</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {groups.map((group, index) => (
          <div key={group.section} className={cn(index > 0 && "mt-4")}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group.section}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
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
                      "flex h-8 items-center gap-2.5 rounded-[5px] px-2 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-surface-elevated text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[11px] font-medium text-muted-foreground">MyBoss</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Business operations
        </p>
      </div>
    </aside>
  );
}
