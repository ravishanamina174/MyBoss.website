import { PublicBusinessPageClient } from "@/components/public/business-page-client";

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ publicIdentifier: string }>;
}) {
  const { publicIdentifier } = await params;
  return <PublicBusinessPageClient publicIdentifier={publicIdentifier} />;
}
