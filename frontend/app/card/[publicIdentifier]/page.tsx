import { PublicCardPageClient } from "@/components/public/card-page-client";

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ publicIdentifier: string }>;
}) {
  const { publicIdentifier } = await params;
  return <PublicCardPageClient publicIdentifier={publicIdentifier} />;
}
