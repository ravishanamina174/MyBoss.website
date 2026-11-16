"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";
import type { BusinessResponse } from "@/types/api";

export function BusinessSettingsClient() {
  const { getToken, isLoaded } = useAuth();
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const businessId = getActiveBusiness();
    if (!businessId) {
      setError("No active business selected.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required. Please sign in again.");
      const result = await api.getBusiness(token, businessId);
      setBusiness(result);
      setName(result.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) void Promise.resolve().then(() => load());
  }, [isLoaded, load]);

  async function save() {
    if (!business || !name.trim()) {
      setError("Business name is required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required. Please sign in again.");
      const result = await api.updateBusiness(token, business.id, name.trim());
      setBusiness(result);
      setName(result.name);
      setMessage("Business profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded || loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin" /></div>;
  }
  if (!business) {
    return <section className="rounded-xl border p-6"><p className="text-sm text-destructive">{error}</p><button className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm" onClick={() => void load()}><RefreshCw className="h-4 w-4" />Try again</button></section>;
  }

  const isOwner = business.role === "OWNER";
  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">View your workspace profile and membership.</p>
      </div>
      {(error || message) && <div role={error ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-destructive/30 text-destructive" : "border-border"}`}>{error || message}</div>}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div>
          <h2 className="font-semibold">Business profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Only the business owner can edit this information.</p>
        </div>
        <label className="block space-y-2 text-sm font-medium">
          Business name
          <input value={name} onChange={(event) => setName(event.target.value)} disabled={!isOwner || saving} maxLength={150} className="h-10 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none focus:border-primary disabled:opacity-60" />
        </label>
        {isOwner ? <div className="flex gap-2"><button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}Save changes</button><button onClick={() => setName(business.name)} disabled={saving} className="rounded-lg border px-4 py-2 text-sm font-medium">Cancel</button></div> : <p className="text-sm text-muted-foreground">Staff members have view-only access.</p>}
      </section>
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Your account and membership</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Name</dt><dd className="mt-1 font-medium">{business.userFullName || "Not provided"}</dd></div>
          <div><dt className="text-muted-foreground">Email</dt><dd className="mt-1 font-medium">{business.userEmail}</dd></div>
          <div><dt className="text-muted-foreground">Role</dt><dd className="mt-1 font-medium">{business.role}</dd></div>
          <div><dt className="text-muted-foreground">Membership status</dt><dd className="mt-1 font-medium">{business.status}</dd></div>
          <div><dt className="text-muted-foreground">Member since</dt><dd className="mt-1 font-medium">{new Date(business.membershipCreatedAt).toLocaleDateString()}</dd></div>
        </dl>
      </section>
    </section>
  );
}
