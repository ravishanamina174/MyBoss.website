import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

import { BusinessOnboarding } from "@/components/onboarding/business-onboarding";

async function ProtectedOnboarding() {
  await auth.protect();

  return <BusinessOnboarding />;
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">
            Loading onboarding...
          </p>
        </div>
      }
    >
      <ProtectedOnboarding />
    </Suspense>
  );
}