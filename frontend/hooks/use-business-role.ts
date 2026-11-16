
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";

type BusinessRole = "OWNER" | "STAFF";

export function useBusinessRole() {
  const { getToken, isLoaded } = useAuth();
  const [role, setRole] = useState<BusinessRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      if (!isLoaded) return;

      const businessId = getActiveBusiness();

      if (!businessId) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        const token = await getToken();

        if (!token) throw new Error("Authentication required");

        const business = await api.getBusiness(token, businessId);

        if (!cancelled) {
          setRole(business.role);
        }
      } catch {
        if (!cancelled) {
          setRole(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void Promise.resolve().then(() => {
      setLoading(true);
      void loadRole();
    });

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded]);

  return { role, loading };
}
