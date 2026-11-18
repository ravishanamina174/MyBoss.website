import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

import { PublicFrame } from "@/components/public/public-frame";

export default function NotFound() {
  return (
    <PublicFrame>
      <main className="mx-auto max-w-xl px-5 py-16">
        <section className="rounded-lg border border-border bg-card p-7 sm:p-9">
          <span className="grid size-11 place-items-center rounded-md bg-accent text-accent-foreground">
            <FileQuestion size={23} />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The page may have moved, or the address may be incorrect.</p>
          <Link href="/" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary-hover">
            <ArrowLeft size={16} /> Back to MyBoss
          </Link>
        </section>
      </main>
    </PublicFrame>
  );
}
