import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <Sidebar />

      <div className="min-h-screen min-w-0 lg:pl-[220px]">
        <AppHeader />
        <MobileNavigation />

        <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-5 lg:px-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
