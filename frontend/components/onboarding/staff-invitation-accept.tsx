"use client";

import { useState } from "react";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Users,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import { api } from "@/lib/api/client";
import { setActiveBusiness } from "@/lib/business-session";

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

      const result = await api.acceptInvitation(
        token,
        invitationToken
      );

      setActiveBusiness(result.businessId);
      router.replace("/dashboard");
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
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <section className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 text-center sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Users className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Join a business team
          </h1>

          <p className="text-sm leading-6 text-muted-foreground">
            You&apos;ve received a MyBoss staff invitation. Sign in or
            create an account to accept it.
          </p>
        </div>

        {!isSignedIn ? (
          <div className="space-y-3">
            <SignInButton mode="modal">
              <button
                type="button"
                className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Sign in to accept
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm font-semibold hover:bg-secondary"
              >
                Create an account
              </button>
            </SignUpButton>
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
    </main>
  );
}