"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Deep links redirect into the Assessment Center learn-more popup. */
export default function AssessmentOverviewRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug || "");

  useEffect(() => {
    if (!slug) {
      router.replace("/assessments");
      return;
    }
    router.replace(`/assessments?learn=${encodeURIComponent(slug)}`);
  }, [slug, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF9FF]">
      <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
    </div>
  );
}
