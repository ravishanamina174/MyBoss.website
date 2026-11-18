
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
  tone = "blue",
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Activity;
  tone?: "blue" | "amber" | "green" | "indigo";
}) {
  return (
    <div className="workspace-box workspace-metric">
      <div>
        <p className="workspace-metric-label">{title}</p>
        <span className="workspace-metric-icon" data-tone={tone}><Icon size={16} /></span>
      </div>
      <strong>{value}</strong>
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
      <div className="workspace-page" role="status">
        <span className="sr-only">Loading your dashboard…</span>
        <div aria-hidden="true" className="workspace-box h-28 animate-pulse" />
        <div aria-hidden="true" className="workspace-stat-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="workspace-box h-28 animate-pulse" />
          ))}
        </div>
        <div aria-hidden="true" className="workspace-box h-52 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="workspace-box workspace-empty min-h-[240px]">
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
    <div className="workspace-page">
      <header className="workspace-box workspace-identity">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="workspace-identity-icon"><BriefcaseBusiness size={23} /></div>
          <div className="min-w-0">
            <h1 className="font-semibold">{business.name}</h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              {isOwner ? "Business owner" : "Staff member"}
              <span className="mx-2" aria-hidden="true">·</span>
              <span className="capitalize">{business.status.toLowerCase()}</span>
            </p>
          </div>
        </div>
        <button
          onClick={loadDashboard}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 font-medium hover:bg-secondary"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </header>

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="mb-3 font-semibold">At a glance</h2>
        <div className="workspace-stat-grid">
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
            tone="amber"
          />

          <StatCard
            title="Completed Tasks"
            value={completedTasks.length}
            description="Successfully completed"
            icon={CheckCircle2}
            tone="green"
          />

          {isOwner ? (
            <StatCard
              title="Active Staff"
              value={activeStaff.length}
              description={`${staff.length} total staff members`}
              icon={Users}
              tone="indigo"
            />
          ) : (
            <StatCard
              title="Cancelled Tasks"
              value={tasks.filter(
                (task) => task.status === "CANCELLED"
              ).length}
              description="Cancelled business tasks"
              icon={AlertCircle}
              tone="amber"
            />
          )}
        </div>
      </section>

      <div className="workspace-overview-panels" data-owner={isOwner}>
        <section className="workspace-box">
          <div className="workspace-box-header">
            <div>
              <h2 className="text-[14px] font-semibold">Recent tasks</h2>
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
            <div className="workspace-empty">
              <span className="workspace-empty-icon"><Activity size={20} /></span>
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
          <section className="workspace-box">
            <div className="workspace-box-header">
              <div>
                <h2 className="text-[14px] font-semibold">Team overview</h2>
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
              <div className="workspace-empty">
                <span className="workspace-empty-icon"><Users size={20} /></span>
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
    </div>
  );
}
