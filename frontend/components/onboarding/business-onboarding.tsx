"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, LoaderCircle } from "lucide-react";

import { AuthFrame } from "@/components/shared/auth-frame";
import { api } from "@/lib/api/client";
import { setActiveBusiness } from "@/lib/business-session";
import type { BusinessResponse } from "@/types/api";

export function BusinessOnboarding() {
  const { isLoaded, getToken } = useAuth();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
  const [pending, setPending] = useState<BusinessResponse[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    async function loadBusinesses() {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Authentication required. Please sign in again.");
        }

        // Synchronize the Clerk user with the backend.
        await api.getCurrentUser(token);

        const result = await api.getBusinesses(token);

        if (!cancelled) {
          setBusinesses(
            result.filter((business) => business.status === "ACTIVE")
          );
          setPending(result.filter((business) => business.status === "PENDING"));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your business."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBusinesses();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, getToken]);

  useEffect(() => {
    if (!pending.length || businesses.length) return;
    const timer = window.setInterval(async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const result = await api.getBusinesses(token);
        const approved = result.find((business) => business.status === "ACTIVE" && business.role === "STAFF");
        if (approved) {
          setActiveBusiness(approved.id);
          router.replace("/dashboard");
        }
      } catch {
        // Keep the waiting screen visible while the connection recovers.
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [pending.length, businesses.length, getToken, router]);

  function selectBusiness(business: BusinessResponse) {
    setActiveBusiness(business.id);
    router.replace("/dashboard");
  }

  async function createBusiness(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = businessName.trim();

    if (!name) {
      setError("Please enter your business name.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      const business = await api.registerBusiness(token, name);

      setActiveBusiness(business.id);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your business."
      );
    } finally {
      setCreating(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <AuthFrame>
        <div role="status" className="flex items-center gap-2 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-primary" /> Loading workspaces…
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <div className="myboss-auth-panel space-y-7">
        <div className="space-y-3">
          <div className="myboss-auth-icon">
            <Building2 className="size-6" />
          </div>

          <h1>
            {businesses.length ? "Choose your workspace" : pending.length ? "Waiting for approval" : "Set up your workspace"}
          </h1>

          <p className="text-sm leading-6 text-muted-foreground">
            {businesses.length ? "Select a business to open its dashboard." : pending.length ? `The owner of ${pending[0].name} will review your request. This page will open your workspace automatically when approved.` : "Start with the name of your business."}
          </p>
        </div>

        {businesses.length > 0 ? (
          <section aria-label="Your businesses" className="space-y-3">

            {businesses.map((business) => (
              <button
                key={business.id}
                type="button"
                onClick={() => selectBusiness(business)}
                className="flex w-full items-center gap-3 rounded-[7px] border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">
                  {business.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {business.name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {business.role === "OWNER" ? "Owner" : "Staff"}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </section>
        ) : pending.length ? (
          <div role="status" className="rounded-lg border border-border bg-background p-5 text-sm text-muted-foreground">
            <LoaderCircle className="mb-3 h-5 w-5 animate-spin text-primary" />
            Your invitation has been accepted. Waiting for the business owner to approve your access.
          </div>
        ) : (
          <form
            onSubmit={createBusiness}
            className="space-y-5 rounded-lg border border-border bg-background p-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="businessName"
                className="text-sm font-medium"
              >
                Business name
              </label>

              <input
                id="businessName"
                type="text"
                maxLength={150}
                required
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="e.g. My Store"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />

              <p className="text-xs text-muted-foreground">
                You can update this later in Settings.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={creating || !businessName.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creating workspace...
                </>
              ) : (
                <>
                  Create business
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {error && businesses.length > 0 && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    </AuthFrame>
  );
}
