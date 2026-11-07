const BUSINESS_STORAGE_KEY = "myboss_active_business";

export function setActiveBusiness(businessId: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(BUSINESS_STORAGE_KEY, businessId);
}

export function getActiveBusiness(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(BUSINESS_STORAGE_KEY);
}

export function clearActiveBusiness() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(BUSINESS_STORAGE_KEY);
}