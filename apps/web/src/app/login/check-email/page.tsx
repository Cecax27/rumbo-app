"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resendConfirmation } from "@repo/supabase/auth";

export default function CheckEmailPage() {
  const router = useRouter();
  const [resent, setResent] = useState(false);
  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("signupEmail")
      : null;

  const handleResend = async () => {
    if (!email) return;
    const { error } = await resendConfirmation(email);
    if (error) {
      toast.error("No pudimos reenviar el enlace. Inténtalo de nuevo.");
      return;
    }
    setResent(true);
    toast.success("Se ha reenviado el enlace de confirmación.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-shamrock-100">
            <MailCheck className="h-6 w-6 text-shamrock-600" />
          </div>
          <CardTitle className="text-2xl">Revisa tu correo</CardTitle>
          <CardDescription>
            Te enviamos un correo de confirmación. Ábrelo para confirmar tu
            cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Revisa tu bandeja de entrada y sigue las instrucciones del correo
            para confirmar tu cuenta. Si no lo ves, revisa la carpeta de spam.
          </p>
          {resent && (
            <p className="mt-2 text-shamrock-600">
              Se ha reenviado el enlace de confirmación.
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-center gap-3">
          <Button
            type="button"
            onClick={() => router.push("/login?mode=login")}
          >
            Ir al inicio de sesión
          </Button>
          {email && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
            >
              Reenviar enlace
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
