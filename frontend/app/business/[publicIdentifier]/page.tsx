import { Suspense } from "react";

import { PublicBusinessPageClient } from "@/components/public/business-page-client";
import { PublicLoading } from "@/components/public/public-frame";

type PageProps = {
  params: Promise<{ publicIdentifier: string }>;
};

async function PublicBusinessContent({ params }: PageProps) {
  const { publicIdentifier } = await params;
  return <PublicBusinessPageClient publicIdentifier={publicIdentifier} />;
}

export default function PublicBusinessPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PublicLoading />}>
      <PublicBusinessContent params={params} />
    </Suspense>
  );
}
