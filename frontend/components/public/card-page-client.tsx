"use client";

import Image from "next/image";
import { AlertCircle, ArrowUpRight, Mail, Phone, Globe2, Link2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api/client";
import type { PublicCardResponse } from "@/types/api";

export function PublicCardPageClient({ publicIdentifier }: { publicIdentifier: string }) {
  const [card, setCard] = useState<PublicCardResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        setCard(await api.getPublicCard(publicIdentifier));
      } catch (err) {
        setError(err instanceof Error ? err.message : "This card is not available.");
      }
    });
  }, [publicIdentifier]);

  if (!card && !error) return <main className="flex min-h-screen items-center justify-center bg-background"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></main>;
  if (!card) return <main className="flex min-h-screen items-center justify-center bg-background px-5"><div className="max-w-md rounded-2xl border border-dashed p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-destructive" /><h1 className="mt-4 text-xl font-semibold">Digital card unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error || "This card is unpublished or does not exist."}</p></div></main>;

  const socials = [
    [Link2, "Facebook", card.facebookUrl],
    [Link2, "Instagram", card.instagramUrl],
    [Link2, "LinkedIn", card.linkedinUrl],
  ].filter((entry): entry is [typeof Link2, string, string] => Boolean(entry[2]));

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><article className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-slate-950/10"><div className="h-28 bg-gradient-to-br from-primary via-blue-500 to-blue-950" /><div className="-mt-14 px-6 pb-7 text-center">{card.logoUrl ? <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg dark:border-card"><Image src={card.logoUrl} alt="" fill sizes="112px" unoptimized className="object-cover" /></div> : <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-xl border-4 border-white bg-primary text-4xl font-bold text-white shadow-lg">{card.businessName.charAt(0)}</div>}<h1 className="mt-5 text-2xl font-bold">{card.businessName}</h1>{card.contactName && <p className="mt-1 text-sm font-medium text-muted-foreground">{card.contactName}</p>}{card.description && <p className="mt-4 leading-6 text-muted-foreground">{card.description}</p>}<div className="mt-6 grid gap-2 text-left">{card.phoneNumber && <a href={`tel:${card.phoneNumber}`} className="flex items-center gap-3 rounded-md bg-secondary px-4 py-3 text-sm font-medium hover:text-primary"><Phone className="h-4 w-4 text-primary" />{card.phoneNumber}</a>}{card.contactEmail && <a href={`mailto:${card.contactEmail}`} className="flex items-center gap-3 rounded-md bg-secondary px-4 py-3 text-sm font-medium hover:text-primary"><Mail className="h-4 w-4 text-primary" />{card.contactEmail}</a>}{card.websiteUrl && <a href={card.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md bg-secondary px-4 py-3 text-sm font-medium hover:text-primary"><Globe2 className="h-4 w-4 text-primary" />Visit website <ArrowUpRight className="ml-auto h-4 w-4" /></a>}</div>{socials.length > 0 && <div className="mt-6 flex justify-center gap-3">{socials.map(([Icon, label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border hover:border-primary hover:text-primary"><Icon className="h-4 w-4" /></a>)}</div>}<p className="mt-8 text-xs text-muted-foreground">Powered by MyBoss</p></div></article></main>;
}
