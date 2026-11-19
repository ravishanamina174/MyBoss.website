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
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [role, setRole] = useState<"OWNER" | "STAFF" | null>(null);
  const [information, setInformation] =
    useState<BusinessInformationResponse | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [card, setCard] = useState(emptyCard);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"profile" | "card" | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
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
      const business = await api.getBusiness(token, activeBusinessId);
      setRole(business.role);
      if (business.role !== "OWNER") {
        router.replace("/dashboard");
        return;
      }
      const result = await api.getBusinessInformation(token, activeBusinessId);
      setInformation(result);
      setProfile(profileFromResponse(result));
      setCard(cardFromResponse(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load business information.");
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

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
      const result = await api.updateBusinessProfile(token, businessId, {
        ...profile,
        galleryUrls: profile.galleryUrls.map((url) => url.trim()).filter(Boolean),
      });
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

  async function uploadImage(file: File, target: string, onUploaded: (url: string) => void) {
    if (!businessId) return;
    setUploading(target);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("businessId", businessId);
      const response = await fetch("/api/uploads/business-image", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Image upload failed.");
      onUploaded(result.url);
      setNotice("Image uploaded. Save the business information to keep it on your page.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(null);
    }
  }

  if (!isLoaded || loading || role === "STAFF") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!information || !businessId) {
    return (
      <section className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-[13px] text-destructive">{error || "Business information is unavailable."}</p>
        <button type="button" onClick={() => void load()} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-3 text-[13px] hover:bg-secondary">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </section>
    );
  }

  const isOwner = role === "OWNER";
  const businessUrl = `/preview/business`;
  const cardUrl = `/preview/card`;

  return (
    <section className="workspace-page">
      <div className="workspace-page-header">
        <div>
          <h1 className="font-semibold">Business information</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">Manage your public business page and shareable digital card. Only owners can edit or publish them.</p>
        </div>
        <span className="w-fit rounded-[4px] border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium">{isOwner ? "Owner access" : "View only"}</span>
      </div>

      {(error || notice) && (
        <div role={error ? "alert" : "status"} className={`rounded-[5px] border px-3 py-2.5 text-[13px] ${error ? "border-destructive/30 text-destructive" : "border-border"}`}>
          {error || notice}
        </div>
      )}

      <form onSubmit={saveProfile} className="workspace-box space-y-6 p-5 sm:p-7">
        <SectionHeading title="Business profile" description="This information appears on your public business page after you publish it." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" value={profile.name} disabled={!isOwner} required onChange={(value) => setProfile({ ...profile, name: value })} />
          <Field label="Contact email" type="email" value={profile.contactEmail} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, contactEmail: value })} />
          <div className="sm:col-span-2"><TextArea label="Description" value={profile.description} disabled={!isOwner} rows={4} onChange={(value) => setProfile({ ...profile, description: value })} /></div>
          <Field label="Phone number" value={profile.phoneNumber} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, phoneNumber: value })} />
          <Field label="Website URL" type="url" placeholder="https://example.com" value={profile.websiteUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, websiteUrl: value })} />
        </div>

        <div>
          <h3 className="mb-3 text-[13px] font-semibold">Address</h3>
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
          <h3 className="mb-3 text-[13px] font-semibold">Brand images</h3>
          <p className="mb-3 text-[12px] text-muted-foreground">Upload images from your computer, then save to update your public page.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageField label="Profile image / logo" value={profile.profileImageUrl} disabled={!isOwner} uploading={uploading === "profile"} onUpload={(file) => uploadImage(file, "profile", (url) => setProfile((current) => ({ ...current, profileImageUrl: url })))} onChange={(value) => setProfile({ ...profile, profileImageUrl: value })} />
            <ImageField label="Cover image" value={profile.coverImageUrl} disabled={!isOwner} uploading={uploading === "cover"} onUpload={(file) => uploadImage(file, "cover", (url) => setProfile((current) => ({ ...current, coverImageUrl: url })))} onChange={(value) => setProfile({ ...profile, coverImageUrl: value })} />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between"><div><h3 className="text-[13px] font-semibold">Gallery</h3><p className="text-[12px] text-muted-foreground">{profile.galleryUrls.length}/8 images</p></div>{isOwner && profile.galleryUrls.length < 8 && <button type="button" onClick={() => setProfile({ ...profile, galleryUrls: [...profile.galleryUrls, ""] })} className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary"><Plus className="h-3.5 w-3.5" /> Add image</button>}</div>
          <div className="space-y-2">
            {profile.galleryUrls.map((url, index) => <div key={index} className="flex flex-wrap gap-2"><input type="url" value={url} disabled={!isOwner} onChange={(event) => { const galleryUrls = [...profile.galleryUrls]; galleryUrls[index] = event.target.value; setProfile({ ...profile, galleryUrls }); }} placeholder="https://images.example.com/photo.jpg" className="h-9 min-w-0 flex-1 rounded-[5px] border border-input bg-input-bg px-3 text-[13px] outline-none focus:border-primary disabled:opacity-60" />{isOwner && <label className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-[5px] border border-border px-3 text-[12px] font-medium hover:bg-secondary"><ImagePlus className="h-3.5 w-3.5" />{uploading === `gallery-${index}` ? "Uploading" : "Upload"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={uploading !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, `gallery-${index}`, (imageUrl) => setProfile((current) => ({ ...current, galleryUrls: current.galleryUrls.map((item, i) => i === index ? imageUrl : item) }))); event.target.value = ""; }} /></label>}{isOwner && <button type="button" aria-label="Remove gallery image" onClick={() => setProfile({ ...profile, galleryUrls: profile.galleryUrls.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-[5px] border border-border px-2.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>}{url && <div className="relative h-20 w-full overflow-hidden rounded-[5px] border border-border"><Image src={url} alt="Gallery preview" fill sizes="400px" unoptimized className="object-cover" /></div>}</div>)}
            {profile.galleryUrls.length === 0 && <div className="rounded-[5px] border border-dashed border-border p-5 text-center text-[13px] text-muted-foreground"><ImagePlus className="mx-auto mb-2 h-4 w-4" />Add up to eight gallery image URLs.</div>}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-[13px] font-semibold">Social links</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Facebook URL" type="url" value={profile.facebookUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, facebookUrl: value })} />
            <Field label="Instagram URL" type="url" value={profile.instagramUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, instagramUrl: value })} />
            <Field label="LinkedIn URL" type="url" value={profile.linkedinUrl} disabled={!isOwner} onChange={(value) => setProfile({ ...profile, linkedinUrl: value })} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          {isOwner && <button type="submit" disabled={saving !== null || uploading !== null} className="inline-flex h-8 items-center gap-1.5 rounded-[5px] bg-primary px-3 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving === "profile" && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}Save business information</button>}
          <a href={businessUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-3 text-[13px] font-medium hover:bg-secondary"><ExternalLink className="h-3.5 w-3.5" />Preview page</a>
          {isOwner && <button type="button" onClick={() => void setPublished("profile", !information.profilePublished)} disabled={publishing !== null} className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-3 text-[13px] font-medium hover:bg-secondary disabled:opacity-50">{publishing === "profile" && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}{information.profilePublished ? "Unpublish page" : "Publish page"}</button>}
          {information.profilePublished && <button type="button" onClick={() => void copyLink("business")} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary"><Copy className="h-3.5 w-3.5" />Copy link</button>}
        </div>
      </form>

      <form onSubmit={saveCard} className="workspace-box space-y-6 p-5 sm:p-7">
        <SectionHeading title="Digital business card" description="Your card has its own publishing switch and public link." />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea label="Short description" value={card.description} disabled={!isOwner} rows={3} onChange={(value) => setCard({ ...card, description: value })} />
          <Field label="Public contact name" value={card.contactName} disabled={!isOwner} onChange={(value) => setCard({ ...card, contactName: value })} />
          <Field label="Card email" type="email" value={card.contactEmail} disabled={!isOwner} onChange={(value) => setCard({ ...card, contactEmail: value })} />
          <Field label="Card phone" value={card.phoneNumber} disabled={!isOwner} onChange={(value) => setCard({ ...card, phoneNumber: value })} />
          <Field label="Card website URL" type="url" value={card.websiteUrl} disabled={!isOwner} onChange={(value) => setCard({ ...card, websiteUrl: value })} />
          <ImageField label="Card logo" value={card.logoUrl} disabled={!isOwner} uploading={uploading === "card"} onUpload={(file) => uploadImage(file, "card", (url) => setCard((current) => ({ ...current, logoUrl: url })))} onChange={(value) => setCard({ ...card, logoUrl: value })} />
        </div>
        <CardPreview information={information} card={card} />
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          {isOwner && <button type="submit" disabled={saving !== null || uploading !== null} className="inline-flex h-8 items-center gap-1.5 rounded-[5px] bg-primary px-3 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">{saving === "card" && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}Save card</button>}
          <a href={cardUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-3 text-[13px] font-medium hover:bg-secondary"><ExternalLink className="h-3.5 w-3.5" />Full view</a>
          {isOwner && <button type="button" onClick={() => void setPublished("card", !information.card.published)} disabled={publishing !== null} className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-3 text-[13px] font-medium hover:bg-secondary disabled:opacity-50">{publishing === "card" && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}{information.card.published ? "Unpublish card" : "Publish card"}</button>}
          {information.card.published && <button type="button" onClick={() => void copyLink("card")} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary"><Copy className="h-3.5 w-3.5" />Copy card link</button>}
        </div>
      </form>
    </section>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-[14px] font-semibold">{title}</h2><p className="mt-1 text-[13px] text-muted-foreground">{description}</p></div>;
}

function Field({ label, value, onChange, disabled, type = "text", placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; type?: string; placeholder?: string; required?: boolean }) {
  return <label className="block space-y-1.5 text-[12px] font-medium">{label}<input required={required} type={type} placeholder={placeholder} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-[5px] border border-input bg-input-bg px-3 text-[13px] font-normal outline-none focus:border-primary disabled:opacity-60" /></label>;
}

function TextArea({ label, value, onChange, disabled, rows }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; rows: number }) {
  return <label className="block space-y-1.5 text-[12px] font-medium">{label}<textarea rows={rows} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full resize-y rounded-[5px] border border-input bg-input-bg px-3 py-2 text-[13px] font-normal outline-none focus:border-primary disabled:opacity-60" /></label>;
}

function ImageField({ label, value, onChange, disabled, onUpload, uploading }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; onUpload: (file: File) => void; uploading: boolean }) {
  return <div className="space-y-2"><Field label={`${label} URL`} type="url" value={value} disabled={disabled} placeholder="https://images.example.com/image.jpg" onChange={onChange} />{!disabled && <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[5px] border border-border px-3 text-[12px] font-medium hover:bg-secondary"><ImagePlus className="h-4 w-4" />{uploading ? "Uploading…" : "Choose image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.target.value = ""; }} /></label>}{value && <div className="relative h-24 overflow-hidden rounded-[5px] border border-border bg-muted"><Image src={value} alt="" fill sizes="400px" unoptimized className="object-cover" /></div>}</div>;
}

function CardPreview({ information, card }: { information: BusinessInformationResponse; card: UpdateBusinessCardRequest }) {
  const logo = card.logoUrl || information.profileImageUrl;
  return <div className="max-w-xl rounded-lg border border-border bg-surface-elevated p-4"><div className="flex items-start gap-3">{logo ? <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[5px] bg-secondary"><Image src={logo} alt="" fill sizes="48px" unoptimized className="object-cover" /></div> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[5px] bg-primary text-base font-semibold text-primary-foreground">{information.name.charAt(0)}</div>}<div><p className="text-[15px] font-semibold">{information.name}</p><p className="mt-1 text-[13px] text-muted-foreground">{card.description || "Your short business description will appear here."}</p></div></div><div className="mt-4 grid gap-1.5 text-[13px] text-muted-foreground sm:grid-cols-2">{card.contactName && <span>Contact: {card.contactName}</span>}{card.phoneNumber && <span>{card.phoneNumber}</span>}{card.contactEmail && <span>{card.contactEmail}</span>}{card.websiteUrl && <span>{card.websiteUrl}</span>}</div></div>;
}
