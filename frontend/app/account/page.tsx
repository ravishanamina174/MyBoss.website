
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Suspense } from "react";

async function AccountContent() {
  await auth.protect();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">MyBoss Account</h1>
      <p>Authentication successful.</p>
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
