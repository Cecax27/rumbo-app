"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resetPasswordForEmail } from "@repo/supabase/auth";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Correo electrónico inválido"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (values: ForgotPasswordValues) => {
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await resetPasswordForEmail(values.email, { redirectTo });
      if (error) {
        toast.error(
          "No pudimos enviar el enlace. Verifica tu conexión e inténtalo de nuevo."
        );
        return;
      }
      sessionStorage.setItem("resetEmail", values.email);
      router.push("/forgot-password/check-email");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Enviar enlace
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => router.push("/login?mode=login")}>
                Volver al inicio de sesión
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
