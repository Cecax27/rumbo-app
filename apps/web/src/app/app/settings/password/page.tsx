"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { quicksand } from "../../../ui/fonts";
import { changePassword } from "@repo/supabase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: ChangePasswordValues) => {
    const { error } = await changePassword(
      values.currentPassword,
      values.newPassword
    );
    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "invalid_credentials" || code === "invalid_grant") {
        toast.error("Tu contraseña actual es incorrecta.");
      } else {
        toast.error("No pudimos cambiar tu contraseña. Inténtalo de nuevo.");
      }
      return;
    }
    toast.success("Contraseña actualizada correctamente.");
    router.push("/app/settings");
  };

  return (
    <>
      <div id="header" className="flex justify-between items-center select-none">
        <div className="leading-loose">
          <h1
            className={`${quicksand.className} text-3xl font-bold text-neutral-700 dark:text-neutral-200`}
          >
            Cambiar contraseña
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Actualiza tu contraseña
          </p>
        </div>
      </div>
      <div id="main" className="flex flex-col gap-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className={quicksand.className}>Nueva contraseña</CardTitle>
            <CardDescription>
              Ingresa tu contraseña actual y la nueva
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña actual</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
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
                      <FormLabel>Confirmar nueva contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Repite tu nueva contraseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Cambiar contraseña
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
