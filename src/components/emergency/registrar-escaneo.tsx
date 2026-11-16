"use client";

import { useEffect } from "react";

interface RegistrarEscaneoProps {
  slug: string;
}

export function RegistrarEscaneo({ slug }: RegistrarEscaneoProps) {
  useEffect(() => {
    void fetch("/api/escaneos/publico", {
      body: JSON.stringify({ slug }),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      method: "POST",
    }).catch(() => undefined);
  }, [slug]);

  return null;
}
