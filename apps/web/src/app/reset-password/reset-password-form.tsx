"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@repo/supabase/client";
import { updateUserPassword } from "@repo/supabase/auth";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(true);

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    let cancelled = false;

    const establishSession = async () => {
      const code = searchParams.get("code");

      // 1. Try PKCE code exchange (primary path for web)
      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && !cancelled) {
            setReady(true);
            setExchanging(false);
            return;
          }
        } catch {
          // code exchange failed, fall through to next method
        }
      }

      // 2. Try parsing hash fragment (classic implicit flow: #access_token=...&refresh_token=...&type=recovery)
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (accessToken && refreshToken && type === "recovery") {
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!sessionError && !cancelled) {
              setReady(true);
              setExchanging(false);
              return;
            }
          } catch {
            // setSession failed, fall through
          }
        }
      }

      // 3. Check if PASSWORD_RECOVERY already established a session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session && !cancelled) {
        setReady(true);
        setExchanging(false);
        return;
      }

      // 4. Nothing worked — show error
      if (!cancelled) {
        setExchanging(false);
        setError("Enlace inválido o expirado. Solicita un nuevo restablecimiento.");
      }
    };

    establishSession();

    // 5. Listen for real-time PASSWORD_RECOVERY event (Supabase client may emit it asynchronously)
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !cancelled) {
        setReady(true);
        setExchanging(false);
        setError(null);
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [searchParams]);

  // Prevent an indefinite "Verificando enlace..." state if session
  // establishment stalls (e.g. network drop during code exchange).
  useEffect(() => {
    if (!exchanging) return;
    const timer = setTimeout(() => {
      setExchanging(false);
      setError("El enlace tardó demasiado. Solicita un nuevo restablecimiento.");
    }, 15000);
    return () => clearTimeout(timer);
  }, [exchanging]);

  const handleSubmit = async (values: ResetPasswordValues) => {
    try {
      const { error: updateError } = await updateUserPassword(values.password);
      if (updateError) {
        toast.error(updateError.message);
        return;
      }
      toast.success("Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con tu nueva contraseña.");
      router.push("/login?mode=login");
    } catch {
      toast.error("Error al actualizar la contraseña. Intenta de nuevo.");
    }
  };

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
            <Button type="button" onClick={() => router.push("/forgot-password")}>
              Solicitar nuevo enlace
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña abajo.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Repite tu contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full">
                <KeyRound className="mr-2 h-4 w-4" />
                Actualizar contraseña
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/login?mode=login")}
              >
                Volver al inicio de sesión
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
