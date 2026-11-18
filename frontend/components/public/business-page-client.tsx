"use client";

import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api/client";
import type { PublicBusinessResponse } from "@/types/api";
import { PublicFrame, PublicLoading, PublicUnavailable } from "./public-frame";

export function PublicBusinessPageClient({ publicIdentifier }: { publicIdentifier: string }) {
  const [business, setBusiness] = useState<PublicBusinessResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        setBusiness(await api.getPublicBusiness(publicIdentifier));
      } catch (err) {
        setError(err instanceof Error ? err.message : "This business page is not available.");
      }
    });
  }, [publicIdentifier]);

  if (!business && !error) {
    return <PublicLoading />;
  }
  if (!business) {
    return <PublicUnavailable title="Business page unavailable" message={error || "This page is unpublished or does not exist."} />;
  }

  const address = [business.addressLine1, business.addressLine2, business.city, business.region, business.postalCode, business.country].filter(Boolean).join(", ");
  const links = [
    ["Website", business.websiteUrl],
    ["Facebook", business.facebookUrl],
    ["Instagram", business.instagramUrl],
    ["LinkedIn", business.linkedinUrl],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <PublicFrame>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section
          className="relative flex min-h-60 items-end overflow-hidden rounded-lg bg-[#202d48] p-5 text-white sm:min-h-80 sm:p-9"
          style={business.coverImageUrl ? {
            backgroundImage: `linear-gradient(to top, #101b2bec, #101b2b1f), url("${business.coverImageUrl}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          } : undefined}
        >
          <div className="relative flex min-w-0 flex-wrap items-end gap-4">
            {business.profileImageUrl ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border-2 border-white/80 bg-white sm:size-20">
                <Image src={business.profileImageUrl} alt="" fill sizes="80px" unoptimized className="object-cover" />
              </div>
            ) : (
              <div className="grid size-16 shrink-0 place-items-center rounded-lg border border-white/25 bg-white/10 text-3xl font-semibold sm:size-20">
                {business.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-white/80">Business profile</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em] [overflow-wrap:anywhere] sm:text-5xl">{business.name}</h1>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid content-start gap-5">
            {business.description && (
              <section className="rounded-lg border border-border bg-card p-5 sm:p-7">
                <h2 className="text-xl font-semibold">About {business.name}</h2>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-muted-foreground [overflow-wrap:anywhere]">{business.description}</p>
              </section>
            )}
            {business.galleryUrls.length > 0 && (
              <section className="rounded-lg border border-border bg-card p-5 sm:p-7">
                <h2 className="text-xl font-semibold">Gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {business.galleryUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <Image src={url} alt={`${business.name} gallery image ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 220px" unoptimized className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
            {links.length > 0 && (
              <section className="rounded-lg border border-border bg-card p-5 sm:p-7">
                <h2 className="text-xl font-semibold">Find us online</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {links.map(([label, url]) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:border-primary hover:text-primary">
                      {label} <ArrowUpRight size={15} />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="h-fit rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Contact</h2>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              {business.phoneNumber && <a href={`tel:${business.phoneNumber}`} className="flex items-start gap-3 hover:text-primary"><Phone className="mt-0.5 size-4 shrink-0" />{business.phoneNumber}</a>}
              {business.contactEmail && <a href={`mailto:${business.contactEmail}`} className="flex items-start gap-3 break-all hover:text-primary"><Mail className="mt-0.5 size-4 shrink-0" />{business.contactEmail}</a>}
              {address && <span className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0" />{address}</span>}
              {!business.phoneNumber && !business.contactEmail && !address && <span>Contact details coming soon.</span>}
            </div>
          </aside>
        </div>
        <p className="mt-8 border-t border-border pt-5 text-center text-xs text-muted-foreground">Powered by MyBoss</p>
      </main>
    </PublicFrame>
  );
}
