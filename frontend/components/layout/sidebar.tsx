"use client";

import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
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
    <aside className="workspace-sidebar z-40 hidden flex-col border-r border-sidebar-border lg:flex">
      <div className="workspace-sidebar-brand flex items-center border-b border-sidebar-border px-5">
        <Brand />
      </div>

      <div className="px-3 pt-4">
        <Link
          href="/"
          aria-label="Open MyBoss home"
          className="flex items-center gap-2.5 rounded-[7px] border border-sidebar-border bg-card px-2.5 py-2.5 transition-colors hover:bg-accent"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[5px] bg-accent text-accent-foreground">
            <Store size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-sidebar-foreground">
              MyBoss home
            </p>
            <p className="text-[11px] text-muted-foreground">Public website</p>
          </div>
          <ArrowUpRight size={14} className="shrink-0 text-muted-foreground" />
        </Link>
      </div>

      <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-3 py-5">
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
                      "flex h-10 items-center gap-2.5 rounded-[6px] border border-transparent px-2.5 text-[13px] font-medium transition-colors",
                      isActive
                        ? "font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
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
