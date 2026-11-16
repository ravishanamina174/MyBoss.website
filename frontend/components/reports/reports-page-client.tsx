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

  if (!isLoaded || loading) return <div className="flex min-h-[50vh] items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin" /></div>;
  if (error || !report || !business) return <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center"><AlertCircle className="h-8 w-8 text-destructive" /><p className="mt-3 text-sm text-muted-foreground">{error || "No report data available."}</p><button onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" />Try again</button></div>;

  const maxActivity = Math.max(1, ...report.activity.map((point) => point.created));
  const metrics = [
    ["Total tasks", report.totalTasks],
    ["Pending", report.pendingTasks],
    ["Completed", report.completedTasks],
    ["Cancelled", report.cancelledTasks],
  ];
  return <section className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-semibold tracking-tight">Reports & analytics</h1><p className="mt-1 text-sm text-muted-foreground">{business.role === "OWNER" ? "Business-wide activity and staff performance." : "Your task activity for the selected period."}</p></div><div className="flex flex-wrap items-end gap-2"><label className="text-xs text-muted-foreground">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block h-9 rounded-lg border bg-background px-2 text-sm" /></label><label className="text-xs text-muted-foreground">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block h-9 rounded-lg border bg-background px-2 text-sm" /></label><button onClick={() => void load()} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm"><RefreshCw className="h-4 w-4" />Refresh</button></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}<div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Completion rate</p><p className="mt-2 text-2xl font-semibold">{report.completionRate.toFixed(1)}%</p></div></div>
    {report.totalTasks === 0 ? <div className="rounded-xl border border-dashed p-12 text-center"><p className="font-medium">No task activity in this period</p><p className="mt-1 text-sm text-muted-foreground">Try a wider date range or create a task to start seeing analytics.</p></div> : <><section className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Task activity</h2><div className="mt-6 flex h-48 items-end gap-1 overflow-x-auto border-b border-l p-3">{report.activity.map((point) => <div key={point.date} className="group flex min-w-5 flex-1 items-end gap-0.5" title={`${point.date}: ${point.created} created, ${point.completed} completed`}><div className="w-1/2 rounded-t bg-primary/40" style={{ height: `${Math.max(4, point.created / maxActivity * 100)}%` }} /><div className="w-1/2 rounded-t bg-primary" style={{ height: `${Math.max(4, point.completed / maxActivity * 100)}%` }} /></div>)}</div><div className="mt-3 flex gap-4 text-xs text-muted-foreground"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary/40" />Created</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />Completed</span></div></section><section className="rounded-xl border bg-card p-5"><h2 className="font-semibold">{business.role === "OWNER" ? "Staff performance" : "Your performance"}</h2><div className="mt-4 divide-y">{report.staff.map((member) => <div key={member.membershipId} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}</p></div><div className="flex gap-4 text-sm"><span><strong>{member.assigned}</strong> assigned</span><span><strong>{member.completed}</strong> completed</span></div></div>)}</div></section></>}
  </section>;
}
