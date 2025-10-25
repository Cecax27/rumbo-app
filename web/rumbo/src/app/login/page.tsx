"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { quicksand, figtree } from "../ui/fonts";
import Button from "../ui/components/button";
import {useRouter} from "next/navigation";
import { signIn } from "@shared/supabase/auth";

export default function Login() {
  const searchParams = useSearchParams();
  const router = useRouter()
  console.log(searchParams.get("mode"));
  const [mode, setMode] = React.useState(
    searchParams.get("mode") || "register"
  );

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await signIn(email, password);
    if (error) {
      console.error("Error logging in:", error.message);
    } else {
      console.log("Logged in user:", data);
      router.push("/app/home");
    }
  };

  return (
    <div className="flex h-full fixed inset-0">
      <aside className="inset-0 flex-1 h-full bg-[url('/images/background.png')] bg-cover bg-right bg-no-repeat p-10 text-white">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={50} height={50} />
          <h1 className={`${quicksand.className} font-bold text-4xl`}>Rumbo</h1>
        </div>
      </aside>
      <main className="flex-2 flex flex-col items-left justify-center items-center">
        <div className="w-70">
          <h2 className={`${quicksand.className} font-bold text-3xl`}>
            {mode === "register" ? "Registro" : "Inicia sesión"}
          </h2>
          <form
            className="flex flex-col gap-4 mt-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const email = (e.currentTarget.email as HTMLInputElement).value;
              const password = (e.currentTarget.password as HTMLInputElement)
                .value;
              handleLogin(email, password);
            }}
            action=""
          >
            <label
              htmlFor="email"
              className={`${figtree.className} font-semibold`}
            >
              Correl electrónico
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="border-neutral-400 border-1 rounded-lg px-2 py-1"
            />
            <label
              htmlFor="password"
              className={`${figtree.className} font-semibold`}
            >
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="border-neutral-400 border-1 rounded-lg px-2 py-1"
            />
            {mode === "login" && (
              <Button href="" secondary className="text-sm">
                Olvidé mi contraseña
              </Button>
            )}
            {mode === "register" && (
              <>
                <label
                  htmlFor="confirm-password"
                  className={`${figtree.className} font-semibold`}
                >
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  name="confirm-password"
                  id="confirm-password"
                  className="border-neutral-400 border-1 rounded-lg px-2 py-1"
                />
              </>
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
        </div>
      </main>
    </div>
  );
}
