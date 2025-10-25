"use client";

import React, { useEffect } from "react";
import { quicksand, figtree } from "../../ui/fonts";
import Button from "../../ui/components/button";
import NotificationIcon from "@mui/icons-material/Notifications";
import { useTools } from "@/contexts/ToolsContext";
import ToolCard from "@/app/ui/components/tool-card";

export default function Home() {
  const { budgetPlans, loading } = useTools();

  return (
    <>
      <div id="header" className="flex justify-between items-center">
        <div className="leading-loose">
          <h1
            className={`${quicksand.className} text-3xl font-bold text-neutral-700 dark:text-neutral-200`}
          >
            Hola
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Bienvenido a tu dashboard financiero
          </p>
        </div>
        <div className="flex items-center gap-5">
          <NotificationIcon className="text-neutral-600 dark:text-neutral-200" />
          <div className="rounded-full bg-amber-100 w-10 h-10"></div>
        </div>
      </div>
      <div id="main" className="flex flex-col gap-6">
        <div id="tools">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-semibold text-2xl text-neutral-800 dark:text-neutral-200">
              Herramientas
            </h2>
            <Button href="#">+ Agregar</Button>
          </div>
          <div>
            {loading ? (
              <p>Loading budget plans...</p>
            ) : budgetPlans && budgetPlans.length > 0 ? (
              budgetPlans.map((budgetPlan) => (
                <ToolCard
                  key={budgetPlan.name}
                  name={budgetPlan.name}
                  date={budgetPlan.start_date}
                  amount={budgetPlan.groups
                    .reduce((sum, group) => sum + group.real_amount, 0)
                    .toFixed(2)}
                  max={budgetPlan.total_incomes.toFixed(2)}
                />
              ))
            ) : (
              <p>No hay planes de presupuesto disponibles</p>
            )}
          </div>
        </div>
        <div id="row" className="flex gap-10">
          <div id="transactions" className="flex-2">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-semibold text-2xl text-neutral-800 dark:text-neutral-200">
                Transacciones recientes
              </h2>
              <Button href="#" secondary>
                Ver más
              </Button>
            </div>
          </div>
          <div id="accounts" className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-semibold text-2xl text-neutral-800 dark:text-neutral-200">
                Cuentas
              </h2>
              <Button href="#" secondary>
                Ver más
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
