
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
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <p className="mt-3 text-[22px] font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
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
    void Promise.resolve().then(() => loadDashboard());
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded-[5px] bg-muted" />
          <div className="h-3.5 w-56 animate-pulse rounded-[5px] bg-muted" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg border border-border bg-muted/40"
            />
          ))}
        </div>

        <div className="h-52 animate-pulse rounded-lg border border-border bg-muted/40" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
        <AlertCircle className="mb-2.5 h-5 w-5 text-destructive" />

        <h2 className="text-[16px] font-semibold">Unable to load dashboard</h2>

        <p className="mt-1.5 max-w-md text-[13px] text-muted-foreground">
          {error ?? "Something went wrong while loading your business data."}
        </p>

        <button
          onClick={loadDashboard}
          className="mt-4 inline-flex h-8 items-center gap-2 rounded-[5px] bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <RefreshCw className="h-3.5 w-3.5" />
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[12px] text-muted-foreground">
            {isOwner ? "Business overview" : "Your workspace"}
          </p>

          <h1 className="mt-0.5 text-[22px] font-semibold tracking-tight">
            {business.name}
          </h1>

          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Welcome to your MyBoss dashboard.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex h-8 w-fit items-center gap-1.5 rounded-[5px] border border-border px-3 text-[13px] font-medium hover:bg-secondary"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Business information */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-secondary">
          <BriefcaseBusiness className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium">{business.name}</p>
          <p className="text-[12px] text-muted-foreground">
            {isOwner ? "Business Owner" : "Staff Member"} ·{" "}
            {business.status}
          </p>
        </div>

        <span className="rounded-[4px] border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium">
          {business.role}
        </span>
      </div>

      {/* Statistics */}
      <section>
        <h2 className="mb-3 text-[16px] font-semibold">Overview</h2>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      <section className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-[14px] font-semibold">Recent Tasks</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Latest tasks in your business
            </p>
          </div>

          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Activity className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-[13px] font-medium">No tasks yet</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Tasks will appear here when they are created.
            </p>

            {isOwner && (
              <Link
                href="/dashboard/tasks"
                className="mt-3 inline-flex text-[13px] font-medium text-primary hover:underline"
              >
                Go to task management
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">
                    {task.title}
                  </p>

                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Created {formatDate(task.createdAt)}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-[4px] border border-border bg-secondary px-1.5 py-0.5 text-[11px] font-medium ${
                    task.status === "COMPLETED"
                      ? "text-success"
                      : task.status === "CANCELLED"
                        ? "text-muted-foreground"
                        : "text-warning"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      task.status === "COMPLETED"
                        ? "bg-success"
                        : task.status === "CANCELLED"
                          ? "bg-muted-foreground"
                          : "bg-warning"
                    }`}
                  />
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Owner staff overview */}
      {isOwner && (
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-[14px] font-semibold">Team Overview</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Your business staff members
              </p>
            </div>

            <Link
              href="/dashboard/staff"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
            >
              Manage staff <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {staff.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Users className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-[13px] font-medium">No staff members yet</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Invite staff members to start managing your team.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {staff.slice(0, 5).map((member) => (
                <div
                  key={member.membershipId}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">
                      {member.fullName || member.email}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {member.email}
                    </p>
                  </div>

                  <span className="rounded-[4px] border border-border bg-secondary px-1.5 py-0.5 text-[11px]">
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
