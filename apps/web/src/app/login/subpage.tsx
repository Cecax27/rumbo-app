"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { quicksand, figtree } from "../ui/fonts";
import Button from "../ui/components/button";
import { signIn, signUp } from "@repo/supabase/auth";
import { checkWelcomeSeen } from "@/lib/welcomeSeen";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo es requerido")
      .email("Correo electrónico inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
  confirmPassword: z.string(),
});

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

function LoginFormInner({
  mode,
  setMode,
}: {
  mode: string;
  setMode: (m: string) => void;
}) {
  const router = useRouter();
  const schema = mode === "register" ? registerSchema : loginSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const handleSubmit = async (values: FormValues) => {
    if (mode === "register") {
      const { data, error } = await signUp(values.email, values.password, {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.session) {
        const welcomeSeen = await checkWelcomeSeen();
        router.push(welcomeSeen ? "/app/home" : "/welcome");
      } else {
        sessionStorage.setItem("signupEmail", values.email);
        router.push("/login/check-email");
      }
    } else {
      const { data, error } = await signIn(values.email, values.password);
      if (error) {
        toast.error(error.message);
        return;
      }
      const welcomeSeen = await checkWelcomeSeen();
      router.push(welcomeSeen ? "/app/home" : "/welcome");
    }
  };

  return (
    <div className="w-80">
      <h2 className={`${quicksand.className} font-bold text-3xl`}>
        {mode === "register" ? "Registro" : "Inicia sesión"}
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4 mt-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {mode === "login" && (
            <Button href="/forgot-password" secondary className="text-sm">
              Olvidé mi contraseña
            </Button>
          )}
          {mode === "register" && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" className="mt-4">
            {mode === "register" ? "Regístrate" : "Iniciar sesión"}
          </Button>
          {mode === "register" && (
            <div>
              <p>¿Ya tienes una cuenta?</p>
              <Button href="" secondary onClick={() => setMode("login")}>
                Inicia sesión
              </Button>
            </div>
          )}
          {mode === "login" && (
            <div className="mt-4">
              <p className={`${figtree.className} text-sm`}>
                ¿No tienes una cuenta?
              </p>
              <Button
                href=""
                secondary
                onClick={() => setMode("register")}
                className="text-left"
              >
                Registrate
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = React.useState(
    searchParams.get("mode") || "register"
  );

  return (
    <div className="flex h-full fixed inset-0">
      <aside className="inset-0 flex-1 h-full bg-[url('/images/background.png')] bg-cover bg-right bg-no-repeat p-10 text-white">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={50} height={50} />
          <h1 className={`${quicksand.className} font-bold text-4xl`}>Rumbo</h1>
        </div>
      </aside>
      <main className="flex-2 flex flex-col justify-center items-center">
        <LoginFormInner key={mode} mode={mode} setMode={setMode} />
      </main>
    </div>
  );
}
