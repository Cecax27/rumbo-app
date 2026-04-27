"use client"

import React, { useContext } from "react";
import { quicksand } from "../../ui/fonts";
import { AccountsContext } from "@/contexts/AccountsContext";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AccountsPage() {
  const { accounts } = useContext(AccountsContext);

  const handleNewAccount = () => {
    // TODO: Implementar lógica para crear nueva cuenta
    console.log("Crear nueva cuenta");
  };

  return (
    <>
      <div id="header" className="flex justify-between items-center select-none">
        <div className="leading-loose">
          <h1
            className={`${quicksand.className} text-3xl font-bold text-neutral-700 dark:text-neutral-200`}
          >
            Cuentas
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Administra todas tus cuentas aquí
          </p>
        </div>
        <Button onClick={handleNewAccount} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva cuenta
        </Button>
      </div>
      <div
        id="main"
        className="flex flex-col gap-6 flex-1 overflow-hidden"
      >
        <DataTable columns={columns} data={accounts} />
      </div>
    </>
  );
}
