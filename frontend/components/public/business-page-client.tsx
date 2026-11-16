"use client";

import Image from "next/image";
import { AlertCircle, ArrowUpRight, LoaderCircle, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api/client";
import type { PublicBusinessResponse } from "@/types/api";

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
    return <LoadingPage />;
  }
  if (!business) {
    return <UnavailablePage message={error} />;
  }

  const address = [business.addressLine1, business.addressLine2, business.city, business.region, business.postalCode, business.country].filter(Boolean).join(", ");
  const links = [
    ["Website", business.websiteUrl],
    ["Facebook", business.facebookUrl],
    ["Instagram", business.instagramUrl],
    ["LinkedIn", business.linkedinUrl],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="relative flex min-h-56 items-end overflow-hidden rounded-xl bg-slate-900 p-6 text-white sm:min-h-72 sm:p-10" style={business.coverImageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.86), rgba(15,23,42,.2)), url("${business.coverImageUrl}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>
          <div className="relative z-10 flex items-end gap-4">
            {business.profileImageUrl ? <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-4 border-white/80 bg-white sm:h-24 sm:w-24"><Image src={business.profileImageUrl} alt="" fill sizes="96px" unoptimized className="object-cover" /></div> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary text-3xl font-bold sm:h-24 sm:w-24">{business.name.charAt(0)}</div>}
            <div><p className="text-sm text-white/70">Business profile</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-5xl">{business.name}</h1></div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            {business.description && <section><h2 className="text-xl font-semibold">About {business.name}</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-muted-foreground">{business.description}</p></section>}
            {business.galleryUrls.length > 0 && <section><h2 className="text-xl font-semibold">Gallery</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{business.galleryUrls.map((url, index) => <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-[10px] bg-muted"><Image src={url} alt={`${business.name} gallery image ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 220px" unoptimized className="object-cover" /></div>)}</div></section>}
            {links.length > 0 && <section><h2 className="text-xl font-semibold">Find us online</h2><div className="mt-4 flex flex-wrap gap-3">{links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"><span>{label}</span><ArrowUpRight className="h-4 w-4" /></a>)}</div></section>}
          </div>
          <aside className="h-fit rounded-[10px] border border-border bg-card p-5">
            <h2 className="font-semibold">Contact</h2>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              {business.phoneNumber && <a href={`tel:${business.phoneNumber}`} className="flex items-start gap-3 hover:text-primary"><Phone className="mt-0.5 h-4 w-4 shrink-0" />{business.phoneNumber}</a>}
              {business.contactEmail && <a href={`mailto:${business.contactEmail}`} className="flex items-start gap-3 break-all hover:text-primary"><Mail className="mt-0.5 h-4 w-4 shrink-0" />{business.contactEmail}</a>}
              {address && <span className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{address}</span>}
              {!business.phoneNumber && !business.contactEmail && !address && <span>Contact details coming soon.</span>}
            </div>
          </aside>
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">Powered by MyBoss</p>
      </div>
    </main>
  );
}

function LoadingPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></main>;
}

function UnavailablePage({ message }: { message: string }) {
  return <main className="flex min-h-screen items-center justify-center bg-background px-5"><div className="max-w-md rounded-2xl border border-dashed p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-destructive" /><h1 className="mt-4 text-xl font-semibold">Business page unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{message || "This page is unpublished or does not exist."}</p></div></main>;
}
