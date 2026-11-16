
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Check,
  Copy,
  Link2,
  LoaderCircle,
  Mail,
  RefreshCw,
  Search,
  UserRound,
  UserRoundX,
  Users,
  X,
} from "lucide-react";

import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";
import type {
  BusinessResponse,
  CreateInvitationResponse,
  InvitationResponse,
  StaffResponse,
} from "@/types/api";

type StaffFilter = "ALL" | "ACTIVE" | "SUSPENDED";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStaffName(staff: StaffResponse) {
  return staff.fullName?.trim() || staff.email;
}

export function StaffPageClient() {
  const { isLoaded, getToken } = useAuth();

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [invitationLink, setInvitationLink] =
    useState<CreateInvitationResponse | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StaffFilter>("ALL");

  const [loading, setLoading] = useState(true);
  const [creatingInvitation, setCreatingInvitation] = useState(false);
  const [busyMembershipId, setBusyMembershipId] = useState<string | null>(
    null
  );
  const [busyInvitationId, setBusyInvitationId] = useState<string | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    const activeBusinessId = getActiveBusiness();

    if (!activeBusinessId) {
      setError("No active business selected. Please select your business.");
      setLoading(false);
      return;
    }

    setBusinessId(activeBusinessId);
    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      const currentBusiness = await api.getBusiness(
        token,
        activeBusinessId
      );

      if (currentBusiness.role !== "OWNER") {
        setBusiness(currentBusiness);
        setStaff([]);
        setInvitations([]);
        setError("Only business owners can manage staff.");
        return;
      }

      const [staffResult, invitationResult] = await Promise.all([
        api.getStaff(token, activeBusinessId),
        api.getInvitations(token, activeBusinessId),
      ]);

      setBusiness(currentBusiness);
      setStaff(staffResult);
      setInvitations(invitationResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load staff."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) {
      void loadData();
    }
  }, [isLoaded, loadData]);

  const filteredStaff = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        getStaffName(member).toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        filter === "ALL" || member.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [staff, search, filter]);

  const activeCount = staff.filter(
    (member) => member.status === "ACTIVE"
  ).length;

  const suspendedCount = staff.filter(
    (member) => member.status === "SUSPENDED"
  ).length;

  async function createInvitation() {
    if (!businessId) return;

    setCreatingInvitation(true);
    setError("");
    setNotice("");
    setCopied(false);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      const result = await api.createInvitation(token, businessId);

      setInvitationLink(result);
      setNotice("A new invitation link has been created.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create an invitation."
      );
    } finally {
      setCreatingInvitation(false);
    }
  }

  async function copyInvitation(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setNotice("Invitation link copied.");
    } catch {
      setError("Unable to copy the link. Please copy it manually.");
    }
  }

  async function revokeInvitation(invitationId: string) {
    if (!businessId) return;

    if (!window.confirm("Revoke this invitation link?")) return;

    setBusyInvitationId(invitationId);
    setError("");
    setNotice("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      await api.revokeInvitation(token, businessId, invitationId);

      setInvitationLink(null);
      setNotice("Invitation revoked.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to revoke invitation."
      );
    } finally {
      setBusyInvitationId(null);
    }
  }

  async function updateStaffStatus(member: StaffResponse) {
    if (!businessId) return;

    const action =
      member.status === "ACTIVE" ? "suspend" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${getStaffName(member)}?`
    );

    if (!confirmed) return;

    setBusyMembershipId(member.membershipId);
    setError("");
    setNotice("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      if (member.status === "ACTIVE") {
        await api.suspendStaff(
          token,
          businessId,
          member.membershipId
        );
      } else {
        await api.activateStaff(
          token,
          businessId,
          member.membershipId
        );
      }

      setNotice(
        member.status === "ACTIVE"
          ? "Staff member suspended."
          : "Staff member reactivated."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update staff status."
      );
    } finally {
      setBusyMembershipId(null);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (business?.role !== "OWNER") {
    return (
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Staff management</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This page is available to business owners only."}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Staff management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team and staff invitations for {business.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>{error}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm"
        >
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total staff"
          value={staff.length}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Active"
          value={activeCount}
          icon={<UserRound className="h-5 w-5" />}
        />
        <StatCard
          label="Suspended"
          value={suspendedCount}
          icon={<UserRoundX className="h-5 w-5" />}
        />
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Invite staff</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a secure invitation link valid for 24 hours.
              A new link replaces the previous pending invitation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void createInvitation()}
            disabled={creatingInvitation}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {creatingInvitation ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            Generate invitation
          </button>
        </div>

        {invitationLink && (
          <div className="space-y-3 rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4 text-muted-foreground" />
              New invitation link
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={invitationLink.invitationLink}
                aria-label="Invitation link"
                className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  void copyInvitation(invitationLink.invitationLink)
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-secondary"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Expires: {formatDate(invitationLink.expiresAt)}
            </p>
          </div>
        )}

        {invitations.length > 0 && (
          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="text-sm font-medium">Pending invitation</h3>

            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col justify-between gap-3 rounded-lg bg-secondary/40 p-3 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-medium">Invitation link</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expires: {formatDate(invitation.expiresAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void revokeInvitation(invitation.id)
                  }
                  disabled={busyInvitationId === invitation.id}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-background disabled:opacity-50"
                >
                  {busyInvitationId === invitation.id ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Your team</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage your business staff members.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              aria-label="Search staff"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["ALL", "ACTIVE", "SUSPENDED"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                filter === value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {value === "ALL"
                ? `All (${staff.length})`
                : value === "ACTIVE"
                  ? `Active (${activeCount})`
                  : `Suspended (${suspendedCount})`}
            </button>
          ))}
        </div>

        {filteredStaff.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">
              {staff.length === 0
                ? "No staff members yet"
                : "No matching staff members"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {staff.length === 0
                ? "Generate an invitation link to add your first staff member."
                : "Try changing your search or filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredStaff.map((member) => (
              <div
                key={member.membershipId}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {getStaffName(member).charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {getStaffName(member)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Joined {formatDate(member.joinedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      member.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {member.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => void updateStaffStatus(member)}
                    disabled={busyMembershipId === member.membershipId}
                    className="inline-flex h-9 min-w-28 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-medium transition hover:bg-secondary disabled:opacity-50"
                  >
                    {busyMembershipId === member.membershipId ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : member.status === "ACTIVE" ? (
                      "Suspend"
                    ) : (
                      "Reactivate"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
