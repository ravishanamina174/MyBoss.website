"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";
import { PublicBusinessPageClient } from "@/components/public/business-page-client";
import { PublicCardPageClient } from "@/components/public/card-page-client";
import type { BusinessInformationResponse, PublicBusinessResponse, PublicCardResponse } from "@/types/api";

export function OwnerPreview({ kind }: { kind: "business" | "card" }) {
  const { getToken, isLoaded } = useAuth();
  const [information, setInformation] = useState<BusinessInformationResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    void Promise.resolve().then(async () => {
      try {
        const businessId = getActiveBusiness();
        const token = await getToken();
        if (!businessId || !token) throw new Error("Select a business to preview.");
        const business = await api.getBusiness(token, businessId);
        if (business.role !== "OWNER") throw new Error("Only owners can preview this page.");
        setInformation(await api.getBusinessInformation(token, businessId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Preview unavailable.");
      }
    });
  }, [getToken, isLoaded]);

  if (error) return <main className="mx-auto max-w-xl p-8"><p role="alert">{error}</p><Link href="/dashboard/settings" className="mt-4 inline-block underline">Back to business information</Link></main>;
  if (!information) return <div role="status" className="p-8 text-center">Loading preview…</div>;

  const business: PublicBusinessResponse = {
    publicIdentifier: information.publicIdentifier,
    name: information.name, description: information.description,
    contactEmail: information.contactEmail, phoneNumber: information.phoneNumber,
    addressLine1: information.addressLine1, addressLine2: information.addressLine2,
    city: information.city, region: information.region, postalCode: information.postalCode,
    country: information.country, websiteUrl: information.websiteUrl,
    facebookUrl: information.facebookUrl, instagramUrl: information.instagramUrl,
    linkedinUrl: information.linkedinUrl, profileImageUrl: information.profileImageUrl,
    coverImageUrl: information.coverImageUrl, galleryUrls: information.galleryUrls,
  };
  const card: PublicCardResponse = {
    publicIdentifier: information.publicIdentifier,
    businessName: information.name, description: information.card.description,
    contactName: information.card.contactName, contactEmail: information.card.contactEmail,
    phoneNumber: information.card.phoneNumber, websiteUrl: information.card.websiteUrl,
    logoUrl: information.card.logoUrl || information.profileImageUrl,
    facebookUrl: information.facebookUrl, instagramUrl: information.instagramUrl,
    linkedinUrl: information.linkedinUrl,
  };

  return <>
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-3 text-sm">
      <span>Owner preview · {kind === "card" ? "Digital card" : "Business page"}</span>
      <Link href="/dashboard/settings" className="font-semibold underline">Back to editor</Link>
    </div>
    {kind === "card"
      ? <PublicCardPageClient publicIdentifier={card.publicIdentifier} previewData={card} />
      : <PublicBusinessPageClient publicIdentifier={business.publicIdentifier} previewData={business} />}
  </>;
}
