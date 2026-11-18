import type { ReactNode } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function PublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Brand href="/" />
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
}

export function PublicLoading() {
  return (
    <PublicFrame>
      <main role="status" className="grid min-h-[55dvh] place-content-center justify-items-center gap-3 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin text-primary" />
        Loading business information…
      </main>
    </PublicFrame>
  );
}

export function PublicUnavailable({ title, message }: { title: string; message: string }) {
  return (
    <PublicFrame>
      <main className="mx-auto max-w-xl px-5 py-16">
        <section className="rounded-lg border border-border bg-card p-7">
          <AlertCircle className="size-6 text-destructive" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </section>
      </main>
    </PublicFrame>
  );
}
