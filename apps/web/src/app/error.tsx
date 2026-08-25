"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-bold">Algo salió mal</h2>
      <p className="text-muted-foreground">
        Ocurrió un error inesperado. Inténtalo de nuevo.
      </p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </div>
  );
}
