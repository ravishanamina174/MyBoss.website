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

  if (!card && !error) return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] dark:bg-[#101011]"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></main>;
  if (!card) return <main className="flex min-h-screen items-center justify-center bg-background px-5"><div className="max-w-md rounded-2xl border border-dashed p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-destructive" /><h1 className="mt-4 text-xl font-semibold">Digital card unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error || "This card is unpublished or does not exist."}</p></div></main>;

  const socials = [
    [Link2, "Facebook", card.facebookUrl],
    [Link2, "Instagram", card.instagramUrl],
    [Link2, "LinkedIn", card.linkedinUrl],
  ].filter((entry): entry is [typeof Link2, string, string] => Boolean(entry[2]));

  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-5 py-10 dark:bg-[#101011]"><article className="w-full max-w-md overflow-hidden rounded-[2rem] border border-black/[0.08] bg-white shadow-2xl shadow-black/10 dark:border-white/[0.08] dark:bg-[#191919] dark:shadow-black/40"><div className="h-28 bg-gradient-to-br from-[#e51b36] via-[#f34d64] to-[#202124]" /><div className="-mt-14 px-6 pb-7 text-center">{card.logoUrl ? <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg dark:border-[#191919]"><Image src={card.logoUrl} alt="" fill sizes="112px" unoptimized className="object-cover" /></div> : <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-[#e51b36] text-4xl font-bold text-white shadow-lg dark:border-[#191919]">{card.businessName.charAt(0)}</div>}<h1 className="mt-5 text-2xl font-bold">{card.businessName}</h1>{card.contactName && <p className="mt-1 text-sm font-medium text-[#68696c] dark:text-[#b2b2b8]">{card.contactName}</p>}{card.description && <p className="mt-4 leading-6 text-[#68696c] dark:text-[#b2b2b8]">{card.description}</p>}<div className="mt-6 grid gap-2 text-left">{card.phoneNumber && <a href={`tel:${card.phoneNumber}`} className="flex items-center gap-3 rounded-xl bg-[#f7f7f8] px-4 py-3 text-sm font-medium hover:text-[#e51b36] dark:bg-white/[0.06]"><Phone className="h-4 w-4 text-[#e51b36]" />{card.phoneNumber}</a>}{card.contactEmail && <a href={`mailto:${card.contactEmail}`} className="flex items-center gap-3 rounded-xl bg-[#f7f7f8] px-4 py-3 text-sm font-medium hover:text-[#e51b36] dark:bg-white/[0.06]"><Mail className="h-4 w-4 text-[#e51b36]" />{card.contactEmail}</a>}{card.websiteUrl && <a href={card.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-[#f7f7f8] px-4 py-3 text-sm font-medium hover:text-[#e51b36] dark:bg-white/[0.06]"><Globe2 className="h-4 w-4 text-[#e51b36]" />Visit website <ArrowUpRight className="ml-auto h-4 w-4" /></a>}</div>{socials.length > 0 && <div className="mt-6 flex justify-center gap-3">{socials.map(([Icon, label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border hover:border-[#e51b36] hover:text-[#e51b36]"><Icon className="h-4 w-4" /></a>)}</div>}<p className="mt-8 text-xs text-[#8b8c90]">Powered by MyBoss</p></div></article></main>;
}
