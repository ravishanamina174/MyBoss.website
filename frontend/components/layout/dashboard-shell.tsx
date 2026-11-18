import type { ReactNode } from "react";
import "./workspace.css";

import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="workspace-shell bg-background text-foreground">
      <Sidebar />

      <div className="workspace-body min-h-screen min-w-0">
        <AppHeader />
        <MobileNavigation />

        <main className="workspace-main mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
