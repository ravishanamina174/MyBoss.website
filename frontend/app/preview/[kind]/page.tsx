import { auth } from "@clerk/nextjs/server";
import { OwnerPreview } from "@/components/settings/owner-preview";

export default async function PreviewPage({ params }: { params: Promise<{ kind: string }> }) {
  await auth.protect();
  const { kind } = await params;
  return <OwnerPreview kind={kind === "card" ? "card" : "business"} />;
}
