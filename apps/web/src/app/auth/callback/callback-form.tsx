"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@repo/supabase/client";
import { checkWelcomeSeen } from "@/lib/welcomeSeen";

export default function CallbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const establishSession = async () => {
      const code = searchParams.get("code");

      // 1. Try PKCE code exchange (primary path)
      if (code) {
        try {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && !cancelled) {
            await routeAfterSession();
            return;
          }
        } catch {
          // code exchange failed, fall through
        }
      }

      // 2. Try parsing hash fragment (classic implicit flow)
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (accessToken && refreshToken && type === "signup") {
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!sessionError && !cancelled) {
              await routeAfterSession();
              return;
            }
          } catch {
            // setSession failed, fall through
          }
        }
      }

      // 3. Check if session already established
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session && !cancelled) {
        await routeAfterSession();
        return;
      }

      // 4. Nothing worked — show error
      if (!cancelled) {
        setExchanging(false);
        setError(
          "Enlace inválido o expirado. Solicita un nuevo enlace de confirmación."
        );
      }
    };

    const routeAfterSession = async () => {
      const welcomeSeen = await checkWelcomeSeen();
      router.replace(welcomeSeen ? "/app/home" : "/welcome");
    };

    establishSession();

    // 5. Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && !cancelled) {
        routeAfterSession();
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [searchParams, router]);

  // Prevent an indefinite "Verificando enlace..." state if session
  // establishment stalls (e.g. network drop during code exchange).
  useEffect(() => {
    if (!exchanging) return;
    const timer = setTimeout(() => {
      setExchanging(false);
      setError(
        "El enlace tardó demasiado. Solicita un nuevo enlace de confirmación."
      );
    }, 15000);
    return () => clearTimeout(timer);
  }, [exchanging]);

  if (exchanging) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">Verificando enlace...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Enlace no válido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button
              type="button"
              onClick={() => router.push("/login?mode=register")}
            >
              Volver al registro
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          <p className="text-muted-foreground">Redirigiendo...</p>
        </CardContent>
      </Card>
    </div>
  );
}
