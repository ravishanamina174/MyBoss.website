import { Suspense } from "react";

import { PublicCardPageClient } from "@/components/public/card-page-client";
import { PublicLoading } from "@/components/public/public-frame";

type PageProps = {
  params: Promise<{ publicIdentifier: string }>;
};

async function PublicCardContent({ params }: PageProps) {
  const { publicIdentifier } = await params;
  return <PublicCardPageClient publicIdentifier={publicIdentifier} />;
}

export default function PublicCardPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PublicLoading />}>
      <PublicCardContent params={params} />
    </Suspense>
  );
}
