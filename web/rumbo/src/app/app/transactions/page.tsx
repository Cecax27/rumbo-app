"use client"

import React, {useContext} from "react";
import { quicksand } from "../../ui/fonts";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function TransactionsPage() {
  const { data: transactions } = useContext(TransactionsContext);

  return (
    <>
      <div id="header" className="flex justify-between items-center select-none">
        <div className="leading-loose">
          <h1
            className={`${quicksand.className} text-3xl font-bold text-neutral-700 dark:text-neutral-200`}
          >
            Transacciones
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Revisa todas tus transacciones aquí
          </p>
        </div>
      </div>
      <div
        id="main"
        className="flex flex-col gap-6 flex-1 overflow-hidden"
      >
        <DataTable columns={columns} data={transactions}/>
      </div>
    </>
  );
}
