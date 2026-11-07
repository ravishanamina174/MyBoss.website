"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDashed,
  ListTodo,
  LoaderCircle,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";

import { StatCard } from "@/components/dashboard/stat-card";
import { RecentTaskItem } from "@/components/dashboard/recent-task-item";

import type { BusinessResponse, TaskResponse } from "@/types/api";

export default function DashboardPage() {
  const { isLoaded, getToken } = useAuth();
  const router = useRouter();

  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

const loadDashboard = useCallback(async () => {
  try {
    setError("");

    const businessId = getActiveBusiness();

    if (!businessId) {
      router.replace("/onboarding");
      return;
    }

    const token = await getToken();

    if (!token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const [businessData, taskData] = await Promise.all([
      api.getBusiness(token, businessId),
      api.getTasks(token, businessId),
    ]);

    if (businessData.status !== "ACTIVE") {
      throw new Error("This business membership is not active.");
    }

    setBusiness(businessData);
    setTasks(taskData);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to load your dashboard."
    );
  }
}, [getToken, router]);

useEffect(() => {
  if (!isLoaded) return;

  let cancelled = false;

  async function initializeDashboard() {
    await loadDashboard();

    if (!cancelled) {
      setLoading(false);
    }
  }

  void initializeDashboard();

  return () => {
    cancelled = true;
  };
}, [isLoaded, loadDashboard]);


  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "PENDING"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading your business...
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <CircleDashed className="h-6 w-6" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error}
        </p>

        <button
          type="button"
          onClick={async () => {
          setRefreshing(true);
          await loadDashboard();
          setRefreshing(false);
        }}
        disabled={refreshing}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span>Business workspace</span>
          </div>

          <h2 className="mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {business?.name ?? "Overview"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening in your business.
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
  setRefreshing(true);
  await loadDashboard();
  setRefreshing(false);
}}
disabled={refreshing}
          aria-label="Refresh dashboard"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </section>

      {/* Quick actions */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/tasks"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          View tasks
        </Link>

        <Link
          href="/dashboard/staff"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <Users className="h-4 w-4" />
          Manage staff
        </Link>
      </section>

      {/* Task statistics */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">
            Task overview
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Current task activity across your business.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total tasks"
            value={totalTasks}
            description="All non-deleted business tasks"
            icon={ListTodo}
          />

          <StatCard
            title="Pending tasks"
            value={pendingTasks}
            description="Tasks waiting to be completed"
            icon={CircleDashed}
            accent
          />

          <StatCard
            title="Completed tasks"
            value={completedTasks}
            description="Successfully completed tasks"
            icon={CheckCircle2}
          />
        </div>
      </section>

      {/* Recent tasks */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h3 className="text-base font-semibold">
              Recent tasks
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Your latest business tasks.
            </p>
          </div>

          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="px-5">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <RecentTaskItem key={task.id} task={task} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <ListTodo className="h-6 w-6" />
              </div>

              <h4 className="mt-4 text-sm font-semibold">
                No tasks yet
              </h4>

              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Create your first task to start organizing your business.
              </p>

              <Link
                href="/dashboard/tasks"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Go to tasks
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Staff management */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              Your team
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage staff members and invitations.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/staff"
          className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-border px-3 text-sm font-medium hover:bg-secondary sm:self-auto"
        >
          Manage staff
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Dashboard refresh failed: {error}
        </p>
      )}
    </div>
  );
}