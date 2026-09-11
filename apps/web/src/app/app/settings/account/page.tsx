"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { quicksand } from "../../../ui/fonts";
import { supabase } from "@repo/supabase/client";
import { updateProfile, deleteAccount } from "@repo/supabase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setFullName(profile?.full_name || "");
      }
    };
    load();
  }, []);

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error("El nombre no puede estar vacío.");
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName.trim() });
    setSaving(false);
    if (error) {
      toast.error("No pudimos guardar tu nombre. Inténtalo de nuevo.");
      return;
    }
    toast.success("Perfil actualizado correctamente.");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción eliminará todos tus datos de forma permanente y no se puede deshacer."
    );
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    if (error) {
      toast.error("No pudimos eliminar tu cuenta. Inténtalo de nuevo.");
      return;
    }
    toast.success("Tu cuenta ha sido eliminada.");
    router.push("/login");
  };

  return (
    <>
      <div id="header" className="flex justify-between items-center select-none">
        <div className="leading-loose">
          <h1
            className={`${quicksand.className} text-3xl font-bold text-neutral-700 dark:text-neutral-200`}
          >
            Cuenta
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Edita tu nombre y administra tu cuenta
          </p>
        </div>
      </div>
      <div id="main" className="flex flex-col gap-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className={quicksand.className}>Nombre</CardTitle>
            <CardDescription>Así aparecerás en la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Label htmlFor="fullName">Nombre</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
            />
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={handleSaveName} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className={`${quicksand.className} text-destructive`}>
              Zona de peligro
            </CardTitle>
            <CardDescription>
              Elimina tu cuenta y todos tus datos de forma permanente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar mi cuenta"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
