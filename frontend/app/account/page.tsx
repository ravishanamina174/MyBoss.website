
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Suspense } from "react";

async function AccountContent() {
  await auth.protect();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-5">
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">MyBoss Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Authentication successful.</p>
      </div>
      <UserButton />
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<p>Loading account...</p>}>
      <AccountContent />
    </Suspense>
  );
}
