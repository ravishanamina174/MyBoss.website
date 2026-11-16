
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Users,
  BriefcaseBusiness,
  ArrowRight,
} from "lucide-react";

import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";
import type {
  BusinessResponse,
  TaskResponse,
  StaffResponse,
} from "@/types/api";

type DashboardData = {
  business: BusinessResponse;
  tasks: TaskResponse[];
  staff: StaffResponse[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { getToken, isLoaded } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const businessId = getActiveBusiness();

      if (!businessId) {
        throw new Error("No active business selected. Please select a business.");
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const business = await api.getBusiness(token, businessId);
      const tasks = await api.getTasks(token, businessId);

      let staff: StaffResponse[] = [];

      if (business.role === "OWNER") {
        staff = await api.getStaff(token, businessId);
      }

      setData({ business, tasks, staff });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <AlertCircle className="mb-3 h-8 w-8 text-destructive" />

        <h2 className="text-lg font-semibold">Unable to load dashboard</h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {error ?? "Something went wrong while loading your business data."}
        </p>

        <button
          onClick={loadDashboard}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  const { business, tasks, staff } = data;

  const pendingTasks = tasks.filter(
    (task) => task.status === "PENDING"
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  );

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const activeStaff = staff.filter(
    (member) => member.status === "ACTIVE"
  );

  const isOwner = business.role === "OWNER";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {isOwner ? "Business overview" : "Your workspace"}
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {business.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to your MyBoss dashboard.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Business information */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium">{business.name}</p>
          <p className="text-xs text-muted-foreground">
            {isOwner ? "Business Owner" : "Staff Member"} ·{" "}
            {business.status}
          </p>
        </div>

        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
          {business.role}
        </span>
      </div>

      {/* Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Overview</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Tasks"
            value={tasks.length}
            description="All business tasks"
            icon={Activity}
          />

          <StatCard
            title="Pending Tasks"
            value={pendingTasks.length}
            description="Tasks awaiting completion"
            icon={Clock3}
          />

          <StatCard
            title="Completed Tasks"
            value={completedTasks.length}
            description="Successfully completed"
            icon={CheckCircle2}
          />

          {isOwner ? (
            <StatCard
              title="Active Staff"
              value={activeStaff.length}
              description={`${staff.length} total staff members`}
              icon={Users}
            />
          ) : (
            <StatCard
              title="Cancelled Tasks"
              value={tasks.filter(
                (task) => task.status === "CANCELLED"
              ).length}
              description="Cancelled business tasks"
              icon={AlertCircle}
            />
          )}
        </div>
      </section>

      {/* Recent tasks */}
      <section className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">Recent Tasks</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Latest tasks in your business
            </p>
          </div>

          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tasks will appear here when they are created.
            </p>

            {isOwner && (
              <Link
                href="/dashboard/tasks"
                className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
              >
                Go to task management
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {task.title}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Created {formatDate(task.createdAt)}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                    task.status === "COMPLETED"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : task.status === "CANCELLED"
                        ? "bg-muted text-muted-foreground"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Owner staff overview */}
      {isOwner && (
        <section className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold">Team Overview</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Your business staff members
              </p>
            </div>

            <Link
              href="/dashboard/staff"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Manage staff <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {staff.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No staff members yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Invite staff members to start managing your team.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {staff.slice(0, 5).map((member) => (
                <div
                  key={member.membershipId}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {member.fullName || member.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
