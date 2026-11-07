"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { StaffInvitationAccept } from "@/components/onboarding/staff-invitation-accept";

function InvitationPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return <StaffInvitationAccept invitationToken={token} />;
}

export default function StaffInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">
            Loading invitation...
          </p>
        </div>
      }
    >
      <InvitationPageContent />
    </Suspense>
  );
}