
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LoaderCircle, AlertCircle, RefreshCw } from "lucide-react";

import TasksPageClient from "@/components/tasks/tasks-page-client";
import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";
import type { BusinessResponse } from "@/types/api";

export default function TasksPage() {
  const { isLoaded, getToken } = useAuth();
  const router = useRouter();

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [role, setRole] = useState<BusinessResponse["role"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBusiness = useCallback(async () => {

    try {
      const activeBusinessId = getActiveBusiness();

      if (!activeBusinessId) {
        router.replace("/onboarding");
        return;
}

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      const business = await api.getBusiness(token, activeBusinessId);

      if (business.status !== "ACTIVE") {
        throw new Error("Your business membership is not active.");
      }

      setBusinessId(business.id);
      setRole(business.role);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your business."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
  if (!isLoaded) return;

     void Promise.resolve().then(() => loadBusiness());
  }, [isLoaded, loadBusiness]);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading tasks...
        </div>
      </div>
    );
  }

  if (error || !businessId || !role) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          Unable to load tasks
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error || "Business information could not be found."}
        </p>

        <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              void loadBusiness();
            }}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
        </button>
      </div>
    );
  }

  return (
    <TasksPageClient
      businessId={businessId}
      role={role}
    />
  );
}
