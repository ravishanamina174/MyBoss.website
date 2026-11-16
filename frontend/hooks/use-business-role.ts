"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";

type BusinessRole = "OWNER" | "STAFF";

export function useBusinessRole() {
  const { isLoaded, getToken } = useAuth();
  const [role, setRole] = useState<BusinessRole | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    async function loadRole() {
      try {
        const businessId = getActiveBusiness();
        const token = await getToken();

        if (!businessId || !token) return;

        const business = await api.getBusiness(token, businessId);

        if (!cancelled) {
          setRole(business.role);
        }
      } catch {
        if (!cancelled) {
          setRole(null);
        }
      }
    }

    void loadRole();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, getToken]);

  return role;
}