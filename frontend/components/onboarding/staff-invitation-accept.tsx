"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Users,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import { AuthFrame } from "@/components/shared/auth-frame";
import { api } from "@/lib/api/client";

export function StaffInvitationAccept({
  invitationToken,
}: {
  invitationToken: string;
}) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();

  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  async function acceptInvitation() {
    if (!invitationToken) {
      setError("This invitation link is invalid.");
      return;
    }

    setAccepting(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Please sign in again.");
      }

      // Ensure the authenticated user exists in our database.
      await api.getCurrentUser(token);

      await api.acceptInvitation(
        token,
        invitationToken
      );
      router.replace("/onboarding");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to accept this invitation."
      );
    } finally {
      setAccepting(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthFrame>
      <section className="myboss-auth-panel space-y-6">
        <div className="myboss-auth-icon">
          <Users className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1>
            Join a business team
          </h1>

          <p className="text-sm leading-6 text-muted-foreground">
            You&apos;ve received a MyBoss staff invitation. Sign in or
            create an account to accept it.
          </p>
        </div>

        {!isSignedIn ? (
          <div className="space-y-3">
            <SignInButton mode="modal" forceRedirectUrl={`/staff-invitation/accept?token=${encodeURIComponent(invitationToken)}`}>
              <button
                type="button"
                className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Accept invitation
              </button>
            </SignInButton>
            <p className="text-xs text-muted-foreground">You can sign in or create an account after selecting Accept invitation.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={acceptInvitation}
            disabled={accepting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {accepting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Accepting invitation...
              </>
            ) : (
              <>
                Accept invitation
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Invitation validity is checked securely by MyBoss.
        </p>
      </section>
    </AuthFrame>
  );
}
