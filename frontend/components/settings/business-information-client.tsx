"use client";

import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import {
  Copy,
  ExternalLink,
  ImagePlus,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api/client";
import { getActiveBusiness } from "@/lib/business-session";
import type {
  BusinessInformationResponse,
  UpdateBusinessCardRequest,
  UpdateBusinessProfileRequest,
} from "@/types/api";

const emptyProfile: UpdateBusinessProfileRequest = {
  name: "",
  description: "",
  contactEmail: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  websiteUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  profileImageUrl: "",
  coverImageUrl: "",
  galleryUrls: [],
};

const emptyCard: UpdateBusinessCardRequest = {
  description: "",
  contactName: "",
  contactEmail: "",
  phoneNumber: "",
  websiteUrl: "",
  logoUrl: "",
};

function profileFromResponse(
  information: BusinessInformationResponse
): UpdateBusinessProfileRequest {
  return {
    name: information.name,
    description: information.description ?? "",
    contactEmail: information.contactEmail ?? "",
    phoneNumber: information.phoneNumber ?? "",
    addressLine1: information.addressLine1 ?? "",
    addressLine2: information.addressLine2 ?? "",
    city: information.city ?? "",
    region: information.region ?? "",
    postalCode: information.postalCode ?? "",
    country: information.country ?? "",
    websiteUrl: information.websiteUrl ?? "",
    facebookUrl: information.facebookUrl ?? "",
    instagramUrl: information.instagramUrl ?? "",
    linkedinUrl: information.linkedinUrl ?? "",
    profileImageUrl: information.profileImageUrl ?? "",
    coverImageUrl: information.coverImageUrl ?? "",
    galleryUrls: information.galleryUrls,
  };
}

function cardFromResponse(
  information: BusinessInformationResponse
): UpdateBusinessCardRequest {
  return {
    description: information.card.description ?? "",
    contactName: information.card.contactName ?? "",
    contactEmail: information.card.contactEmail ?? "",
    phoneNumber: information.card.phoneNumber ?? "",
    websiteUrl: information.card.websiteUrl ?? "",
    logoUrl: information.card.logoUrl ?? "",
  };
}

export function BusinessInformationClient() {
  const { getToken, isLoaded } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [role, setRole] = useState<"OWNER" | "STAFF" | null>(null);
  const [information, setInformation] =
    useState<BusinessInformationResponse | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [card, setCard] = useState(emptyCard);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"profile" | "card" | null>(null);
  const [publishing, setPublishing] = useState<"profile" | "card" | null>(
    null
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const activeBusinessId = getActiveBusiness();
    if (!activeBusinessId) {
      setError("No active business selected.");
      setLoading(false);
      return;
    }

    setBusinessId(activeBusinessId);
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required. Please sign in again.");
      const [business, result] = await Promise.all([
        api.getBusiness(token, activeBusinessId),
        api.getBusinessInformation(token, activeBusinessId),
      ]);
      setRole(business.role);
      setInformation(result);
      setProfile(profileFromResponse(result));
      setCard(cardFromResponse(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load business information.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) void Promise.resolve().then(() => load());
  }, [isLoaded, load]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId) return;
    setSaving("profile");
    setError("");
    setNotice("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required. Please sign in again.");
      const result = await api.updateBusinessProfile(token, businessId, profile);
      setInformation(result);
      setProfile(profileFromResponse(result));
      setNotice("Business information saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save business information.");
    } finally {
      setSaving(null);
    }
  }

  async function saveCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId) return;
    setSaving("card");
    setError("");
    setNotice("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required. Please sign in again.");
      const result = await api.updateBusinessCard(token, businessId, card);
      setInformation(result);
      setCard(cardFromResponse(result));
      setNotice("Digital business card saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your card.");
    } finally {
      setSaving(null);
    }
  }

  async function setPublished(kind: "profile" | "card", value: boolean) {
    if (!businessId) return;
    const confirmed = window.confirm(
      value
        ? `Publish your ${kind === "profile" ? "business page" : "digital card"}?`
        : `Unpublish your ${kind === "profile" ? "business page" : "digital card"}?`
    );
    if (!confirmed) return;

    setPublishing(kind);
    setError("");
    setNotice("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required. Please sign in again.");
      const result =
        kind === "profile"
          ? await api.setBusinessProfilePublished(token, businessId, value)
          : await api.setBusinessCardPublished(token, businessId, value);
      setInformation(result);
      setNotice(
        `${kind === "profile" ? "Business page" : "Digital card"} ${
          value ? "published" : "unpublished"
        }.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update publishing status.");
    } finally {
      setPublishing(null);
    }
  }

  async function copyLink(path: "business" | "card") {
    if (!information) return;
    const link = `${window.location.origin}/${path}/${information.publicIdentifier}`;
    try {
      await navigator.clipboard.writeText(link);
      setNotice(`${path === "business" ? "Business page" : "Card"} link copied.`);
    } catch {
      setError("Unable to copy the link. Please copy it manually.");
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!information || !businessId) {
    return (
      <section className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-destructive">{error || "Business information is unavailable."}</p>
        <button type="button" onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </section>
    );
  }

  const isOwner = role === "OWNER";
  const businessUrl = `/business/${information.publicIdentifier}`;
  const cardUrl = `/card/${information.publicIdentifier}`;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Business information</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tell the world what you do</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Manage your public business page and shareable digital card. Only owners can edit or publish them.</p>
        </div>
        <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{isOwner ? "Owner access" : "View only"}</span>
      </div>

      {(error || notice) && (
        <div role={error ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-destructive/30 text-destructive" : "border-border"}`}>
          {error || notice}
        </div>
      )}

      <form onSubmit={saveProfile} className="space-y-6 rounded-xl border bg-card p-5 sm:p-6">
        <SectionHeading title="Business profile" description="This information appears on your public business page after you publish it." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" value={profile.name} disabled={!isOwner} required onChange={(value) => setProfile({ ...profile, name: value })} />
          <Field label="Contact email" type="email" value={profile.contactEmail} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, contactEmail: value })} />
          <div className="sm:col-span-2"><TextArea label="Description" value={profile.description} disabled={!isOwner} rows={4} onChange={(value) => setProfile({ ...profile, description: value })} /></div>
          <Field label="Phone number" value={profile.phoneNumber} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, phoneNumber: value })} />
          <Field label="Website URL" type="url" placeholder="https://example.com" value={profile.websiteUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, websiteUrl: value })} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Address</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address line 1" value={profile.addressLine1} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, addressLine1: value })} />
            <Field label="Address line 2" value={profile.addressLine2} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, addressLine2: value })} />
            <Field label="City" value={profile.city} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, city: value })} />
            <Field label="Region / state" value={profile.region} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, region: value })} />
            <Field label="Postal code" value={profile.postalCode} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, postalCode: value })} />
            <Field label="Country" value={profile.country} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, country: value })} />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Brand images</h3>
          <p className="mb-3 text-xs text-muted-foreground">Use secure image URLs from your preferred image host. Upload storage is not configured in this workspace.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageField label="Profile image / logo URL" value={profile.profileImageUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, profileImageUrl: value })} />
            <ImageField label="Cover image URL" value={profile.coverImageUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, coverImageUrl: value })} />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Gallery</h3><p className="text-xs text-muted-foreground">{profile.galleryUrls.length}/8 images</p></div>{isOwner && profile.galleryUrls.length < 8 && <button type="button" onClick={() => setProfile({ ...profile, galleryUrls: [...profile.galleryUrls, ""] })} className="inline-flex items-center gap-1 text-xs font-semibold text-primary"><Plus className="h-4 w-4" /> Add image</button>}</div>
          <div className="space-y-2">
            {profile.galleryUrls.map((url, index) => <div key={`${index}-${url}`} className="flex gap-2"><input type="url" value={url} disabled={!isOwner} onChange={(event) => { const galleryUrls = [...profile.galleryUrls]; galleryUrls[index] = event.target.value; setProfile({ ...profile, galleryUrls }); }} placeholder="https://images.example.com/photo.jpg" className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-60" />{isOwner && <button type="button" aria-label="Remove gallery image" onClick={() => setProfile({ ...profile, galleryUrls: profile.galleryUrls.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg border px-3 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}</div>)}
            {profile.galleryUrls.length === 0 && <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"><ImagePlus className="mx-auto mb-2 h-5 w-5" />Add up to eight gallery image URLs.</div>}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Social links</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Facebook URL" type="url" value={profile.facebookUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, facebookUrl: value })} />
            <Field label="Instagram URL" type="url" value={profile.instagramUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, instagramUrl: value })} />
            <Field label="LinkedIn URL" type="url" value={profile.linkedinUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, linkedinUrl: value })} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          {isOwner && <button type="submit" disabled={saving !== null} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving === "profile" && <LoaderCircle className="h-4 w-4 animate-spin" />}Save business information</button>}
          <a href={businessUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"><ExternalLink className="h-4 w-4" />Preview page</a>
          {isOwner && <button type="button" onClick={() => void setPublished("profile", !information.profilePublished)} disabled={publishing !== null} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50">{publishing === "profile" && <LoaderCircle className="h-4 w-4 animate-spin" />}{information.profilePublished ? "Unpublish page" : "Publish page"}</button>}
          {information.profilePublished && <button type="button" onClick={() => void copyLink("business")} className="inline-flex items-center gap-2 text-sm font-medium text-primary"><Copy className="h-4 w-4" />Copy link</button>}
        </div>
      </form>

      <form onSubmit={saveCard} className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
        <SectionHeading title="Digital business card" description="Your card has its own publishing switch and public link." />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea label="Short description" value={card.description} disabled={!isOwner} rows={3} onChange={(value) => setCard({ ...card, description: value })} />
          <Field label="Public contact name" value={card.contactName} disabled={!isOwner} onChange={(value) => setCard({ ...card, contactName: value })} />
          <Field label="Card email" type="email" value={card.contactEmail} disabled={!isOwner} onChange={(value) => setCard({ ...card, contactEmail: value })} />
          <Field label="Card phone" value={card.phoneNumber} disabled={!isOwner} onChange={(value) => setCard({ ...card, phoneNumber: value })} />
          <Field label="Card website URL" type="url" value={card.websiteUrl} disabled={!isOwner} onChange={(value) => setCard({ ...card, websiteUrl: value })} />
          <ImageField label="Card logo URL" value={card.logoUrl} disabled={!isOwner} onChange={(value) => setCard({ ...card, logoUrl: value })} />
        </div>
        <CardPreview information={information} card={card} />
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          {isOwner && <button type="submit" disabled={saving !== null} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving === "card" && <LoaderCircle className="h-4 w-4 animate-spin" />}Save card</button>}
          <a href={cardUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"><ExternalLink className="h-4 w-4" />Full view</a>
          {isOwner && <button type="button" onClick={() => void setPublished("card", !information.card.published)} disabled={publishing !== null} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50">{publishing === "card" && <LoaderCircle className="h-4 w-4 animate-spin" />}{information.card.published ? "Unpublish card" : "Publish card"}</button>}
          {information.card.published && <button type="button" onClick={() => void copyLink("card")} className="inline-flex items-center gap-2 text-sm font-medium text-primary"><Copy className="h-4 w-4" />Copy card link</button>}
        </div>
      </form>
    </section>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>;
}

function Field({ label, value, onChange, disabled, type = "text", placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; type?: string; placeholder?: string; required?: boolean }) {
  return <label className="block space-y-2 text-sm font-medium">{label}<input required={required} type={type} placeholder={placeholder} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:border-primary disabled:opacity-60" /></label>;
}

function TextArea({ label, value, onChange, disabled, rows }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; rows: number }) {
  return <label className="block space-y-2 text-sm font-medium">{label}<textarea rows={rows} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary disabled:opacity-60" /></label>;
}

function ImageField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean }) {
  return <div className="space-y-2"><Field label={label} type="url" value={value} disabled={disabled} placeholder="https://images.example.com/image.jpg" onChange={onChange} />{value && <div className="relative h-24 overflow-hidden rounded-lg border bg-muted"><Image src={value} alt="" fill sizes="400px" unoptimized className="object-cover" /></div>}</div>;
}

function CardPreview({ information, card }: { information: BusinessInformationResponse; card: UpdateBusinessCardRequest }) {
  const logo = card.logoUrl || information.profileImageUrl;
  return <div className="max-w-xl rounded-2xl bg-[#202124] p-5 text-white shadow-xl"><div className="flex items-start gap-4">{logo ? <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10"><Image src={logo} alt="" fill sizes="56px" unoptimized className="object-cover" /></div> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e51b36] text-xl font-bold">{information.name.charAt(0)}</div>}<div><p className="text-lg font-semibold">{information.name}</p><p className="mt-1 text-sm text-white/65">{card.description || "Your short business description will appear here."}</p></div></div><div className="mt-5 grid gap-2 text-sm text-white/80 sm:grid-cols-2">{card.contactName && <span>Contact: {card.contactName}</span>}{card.phoneNumber && <span>{card.phoneNumber}</span>}{card.contactEmail && <span>{card.contactEmail}</span>}{card.websiteUrl && <span>{card.websiteUrl}</span>}</div></div>;
}
