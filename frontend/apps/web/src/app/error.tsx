"use client";

import { useEffect } from "react";
import { SystemStatusPage } from "@/components/ui/SystemStatusPage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <SystemStatusPage kind="server-error" digest={error.digest} onRetry={reset} />;
}
