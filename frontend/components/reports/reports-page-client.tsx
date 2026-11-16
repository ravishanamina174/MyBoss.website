"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";
import type { BusinessResponse, ReportResponse } from "@/types/api";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ReportsPageClient() {
  const { getToken, isLoaded } = useAuth();
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(isoDate(new Date(today.getTime() - 29 * 86400000)));
  const [to, setTo] = useState(isoDate(today));
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const businessId = getActiveBusiness();
    if (!businessId) { setError("No active business selected."); setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required. Please sign in again.");
      const currentBusiness = await api.getBusiness(token, businessId);
      setBusiness(currentBusiness);
      const start = new Date(`${from}T00:00:00.000Z`);
      const end = new Date(`${to}T23:59:59.999Z`);
      if (!(end > start)) throw new Error("Choose a valid date range.");
      setReport(await api.getReport(token, businessId, start.toISOString(), end.toISOString()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reports.");
    } finally { setLoading(false); }
  }, [from, to, getToken]);

  useEffect(() => { if (isLoaded) void Promise.resolve().then(() => load()); }, [isLoaded, load]);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error || !report || !business) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="mt-2.5 text-[13px] text-muted-foreground">{error || "No report data available."}</p>
        <button onClick={() => void load()} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-3 text-[13px] hover:bg-secondary">
          <RefreshCw className="h-3.5 w-3.5" />Try again
        </button>
      </div>
    );
  }

  const maxActivity = Math.max(1, ...report.activity.map((point) => point.created));
  const metrics = [
    ["Total tasks", report.totalTasks],
    ["Pending", report.pendingTasks],
    ["Completed", report.completedTasks],
    ["Cancelled", report.cancelledTasks],
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Reports & analytics</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {business.role === "OWNER"
              ? "Business-wide activity and staff performance."
              : "Your task activity for the selected period."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[11px] text-muted-foreground">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 block h-8 rounded-[5px] border border-input bg-input-bg px-2 text-[13px]"
            />
          </label>
          <label className="text-[11px] text-muted-foreground">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 block h-8 rounded-[5px] border border-input bg-input-bg px-2 text-[13px]"
            />
          </label>
          <button onClick={() => void load()} className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-3 text-[13px] hover:bg-secondary">
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3.5">
            <p className="text-[13px] text-muted-foreground">{label}</p>
            <p className="mt-2 text-[22px] font-semibold tabular-nums">{value}</p>
          </div>
        ))}
        <div className="rounded-lg border border-border bg-card p-3.5">
          <p className="text-[13px] text-muted-foreground">Completion rate</p>
          <p className="mt-2 text-[22px] font-semibold tabular-nums">{report.completionRate.toFixed(1)}%</p>
        </div>
      </div>

      {report.totalTasks === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-[14px] font-medium">No task activity in this period</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Try a wider date range or create a task to start seeing analytics.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-[14px] font-semibold">Task activity</h2>
            <div className="mt-5 flex h-44 items-end gap-1 overflow-x-auto border-b border-l border-border p-3">
              {report.activity.map((point) => (
                <div
                  key={point.date}
                  className="group flex min-w-5 flex-1 items-end gap-0.5"
                  title={`${point.date}: ${point.created} created, ${point.completed} completed`}
                >
                  <div
                    className="w-1/2 rounded-t bg-primary/40"
                    style={{ height: `${Math.max(4, (point.created / maxActivity) * 100)}%` }}
                  />
                  <div
                    className="w-1/2 rounded-t bg-primary"
                    style={{ height: `${Math.max(4, (point.completed / maxActivity) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-[12px] text-muted-foreground">
              <span>
                <i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary/40" />
                Created
              </span>
              <span>
                <i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />
                Completed
              </span>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-[14px] font-semibold">
              {business.role === "OWNER" ? "Staff performance" : "Your performance"}
            </h2>
            <div className="mt-3 divide-y divide-border">
              {report.staff.map((member) => (
                <div
                  key={member.membershipId}
                  className="flex flex-col gap-1.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[13px] font-medium">{member.name}</p>
                    <p className="text-[12px] text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="flex gap-4 text-[13px]">
                    <span>
                      <strong>{member.assigned}</strong> assigned
                    </span>
                    <span>
                      <strong>{member.completed}</strong> completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
