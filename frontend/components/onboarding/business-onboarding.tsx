"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, LoaderCircle } from "lucide-react";

import { api } from "@/lib/api/client";
import { setActiveBusiness } from "@/lib/business-session";
import type { BusinessResponse } from "@/types/api";

export function BusinessOnboarding() {
  const { isLoaded, getToken } = useAuth();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<BusinessResponse[]>([]);
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-7">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Building2 className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Set up your workspace
          </h1>

          <p className="text-sm leading-6 text-muted-foreground">
            Your business workspace keeps your tasks and team
            organized in one place.
          </p>
        </div>

        {businesses.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">
              Choose your business
            </h2>

            {businesses.map((business) => (
              <button
                key={business.id}
                type="button"
                onClick={() => selectBusiness(business)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground">
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
        ) : (
          <form
            onSubmit={createBusiness}
            className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6"
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
    </main>
  );
}