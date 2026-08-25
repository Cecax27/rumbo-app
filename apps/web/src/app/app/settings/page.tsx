"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { quicksand } from "../../ui/fonts";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { signOut } from "@repo/supabase/auth";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, Monitor, User, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();

    if (error) {
      toast.error("No pudimos cerrar tu sesión. Inténtalo de nuevo.");
      setIsSigningOut(false);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <div id="header" className="flex justify-between items-center select-none">
        <div className="leading-loose">
          <h1
            className={`${quicksand.className} text-3xl font-bold text-neutral-700 dark:text-neutral-200`}
          >
            Configuración
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Personaliza tu experiencia
          </p>
        </div>
      </div>
      <div id="main" className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className={quicksand.className}>Cuenta</CardTitle>
            <CardDescription>
              Gestiona tu perfil y tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link
              href="/app/settings/account"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              <User className="h-4 w-4" />
              Editar perfil y eliminar cuenta
            </Link>
            <Link
              href="/app/settings/password"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Selecciona el tema de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Claro
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Oscuro
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  Sistema
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <Link
                href="/privacy"
                className="inline-flex text-sm font-medium text-neutral-700 underline underline-offset-4 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
              >
                Ver política de privacidad
              </Link>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
