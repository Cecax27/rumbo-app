"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setWelcomeSeen } from "@/lib/welcomeSeen";

export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = async () => {
    await setWelcomeSeen();
    router.replace("/app/home");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-shamrock-50 px-4 dark:bg-background">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold text-shamrock-800">
          ¡Bienvenido a Rumbo!
        </h1>
        <p className="mt-3 text-shamrock-700">
          Aquí tienes una guía rápida para empezar a gestionar tus finanzas.
        </p>

        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                1. Crea tu primera cuenta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Una cuenta representa el lugar donde haces tus movimientos, por
                ejemplo, una cuenta de débito.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                2. Añade ingresos y gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comienza a rastrear tu dinero añadiendo tus ingresos y gastos.
                ¡Descubre a dónde va tu dinero!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                3. Explora tu panel de control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Accede a tu panel para agregar herramientas, ver resúmenes y
                obtener información sobre tus finanzas.
              </p>
            </CardContent>
          </Card>
        </div>

        <Button className="mt-8 w-full" onClick={handleGetStarted}>
          Comenzar
        </Button>
      </div>
    </div>
  );
}
