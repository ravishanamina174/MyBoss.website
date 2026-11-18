
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthFrame } from "@/components/shared/auth-frame";

async function AccountContent() {
  await auth.protect();

  return (
    <AuthFrame>
      <section className="myboss-auth-panel space-y-4">
        <h1>Your MyBoss account</h1>
        <p className="text-sm text-muted-foreground">Open your profile to manage your account.</p>
        <UserButton />
      </section>
    </AuthFrame>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<p>Loading account...</p>}>
      <AccountContent />
    </Suspense>
  );
}
