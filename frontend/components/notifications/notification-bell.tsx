"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Bell, Check, LoaderCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";
import type { NotificationResponse } from "@/types/api";

export function NotificationBell() {
  const { getToken, isLoaded } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const businessId = getActiveBusiness();
    if (!businessId || !isLoaded) return;
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [page, count] = await Promise.all([
        api.getNotifications(token, businessId),
        api.getUnreadNotificationCount(token, businessId),
      ]);
      setItems(page.content);
      setUnread(count);
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  async function markRead(item: NotificationResponse) {
    if (item.read) return;
    const businessId = getActiveBusiness();
    const token = await getToken();
    if (!businessId || !token) return;
    await api.markNotificationRead(token, businessId, item.id);
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, read: true } : entry
      )
    );
    setUnread((value) => Math.max(0, value - 1));
  }

  async function markAllRead() {
    const businessId = getActiveBusiness();
    const token = await getToken();
    if (!businessId || !token) return;
    await api.markAllNotificationsRead(token, businessId);
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-8 w-8 items-center justify-center rounded-[5px] text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Bell className="h-3.5 w-3.5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="workspace-notifications absolute right-0 top-10 z-50 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-1 pb-2.5">
            <p className="text-[13px] font-semibold">Notifications</p>
            <button
              onClick={() => void markAllRead()}
              disabled={unread === 0}
              className="text-[11px] font-medium text-primary disabled:opacity-50"
            >
              <Check className="mr-1 inline h-3 w-3" />
              Mark all read
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-6">
              <LoaderCircle className="h-4 w-4 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <div className="max-h-80 divide-y divide-border overflow-auto">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => void markRead(item)}
                  className={`block w-full rounded-[5px] px-2 py-2.5 text-left text-[13px] hover:bg-secondary ${item.read ? "opacity-60" : ""}`}
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {item.message}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
