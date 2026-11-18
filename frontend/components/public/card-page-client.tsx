"use client";

import Image from "next/image";
import { ArrowUpRight, Mail, Phone, Globe2, Link2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api/client";
import type { PublicCardResponse } from "@/types/api";
import { PublicFrame, PublicLoading, PublicUnavailable } from "./public-frame";

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

  if (!card && !error) return <PublicLoading />;
  if (!card) return <PublicUnavailable title="Digital card unavailable" message={error || "This card is unpublished or does not exist."} />;

  const socials = [
    [Link2, "Facebook", card.facebookUrl],
    [Link2, "Instagram", card.instagramUrl],
    [Link2, "LinkedIn", card.linkedinUrl],
  ].filter((entry): entry is [typeof Link2, string, string] => Boolean(entry[2]));

  return (
    <PublicFrame>
      <main className="mx-auto max-w-lg px-5 py-12">
        <article className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="h-24 bg-[#263b63]" />
          <div className="relative -mt-10 px-5 pb-6 sm:px-7">
            {card.logoUrl ? (
              <div className="relative size-20 overflow-hidden rounded-lg border-2 border-card bg-white">
                <Image src={card.logoUrl} alt="" fill sizes="80px" unoptimized className="object-cover" />
              </div>
            ) : (
              <div className="grid size-20 place-items-center rounded-lg border-2 border-card bg-accent text-3xl font-semibold text-accent-foreground">
                {card.businessName.charAt(0)}
              </div>
            )}
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] [overflow-wrap:anywhere]">{card.businessName}</h1>
            {card.contactName && <p className="mt-1 text-sm font-medium text-muted-foreground">{card.contactName}</p>}
            {card.description && <p className="mt-4 leading-6 text-muted-foreground [overflow-wrap:anywhere]">{card.description}</p>}
            <div className="mt-5 grid gap-2 text-sm font-medium">
              {card.phoneNumber && (
                <a href={`tel:${card.phoneNumber}`} className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-3 hover:text-primary">
                  <Phone className="size-4 shrink-0 text-primary" /> {card.phoneNumber}
                </a>
              )}
              {card.contactEmail && (
                <a href={`mailto:${card.contactEmail}`} className="flex items-center gap-3 break-all rounded-md border border-border bg-background px-4 py-3 hover:text-primary">
                  <Mail className="size-4 shrink-0 text-primary" /> {card.contactEmail}
                </a>
              )}
              {card.websiteUrl && (
                <a href={card.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-3 hover:text-primary">
                  <Globe2 className="size-4 shrink-0 text-primary" /> Visit website <ArrowUpRight className="ml-auto size-4" />
                </a>
              )}
            </div>
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(([Icon, label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-xs hover:border-primary hover:text-primary">
                    <Icon size={14} /> {label}
                  </a>
                ))}
              </div>
            )}
            <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">Powered by MyBoss</p>
          </div>
        </article>
      </main>
    </PublicFrame>
  );
}
