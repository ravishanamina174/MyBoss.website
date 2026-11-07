import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

async function ProtectedDashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();

  return <DashboardShell>{children}</DashboardShell>;
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">
            Loading MyBoss...
          </p>
        </div>
      }
    >
      <ProtectedDashboard>{children}</ProtectedDashboard>
    </Suspense>
  );
}