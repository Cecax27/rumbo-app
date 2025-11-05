"use client"

import React, {useContext, useState} from "react";
import { quicksand } from "../../ui/fonts";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendingForm } from "./spending-form";
import { addTransaction } from "@repo/supabase/transactions";

export default function TransactionsPage() {
  const { filteredData: transactions } = useContext(TransactionsContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSpendingSubmit = async (values: any) => {
    await addTransaction({
      date: values.date,
      amount: parseFloat(values.amount),
      description: values.description || "",
      category_id: parseInt(values.category_id),
      account_id: parseInt(values.account_id),
    });
    setIsDialogOpen(false);
  };

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
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="create">
                <Plus /> Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nueva transacción</DialogTitle>
                <DialogDescription>
                  Registra un nuevo gasto, ingreso o transferencia
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="expense" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="expense">Gasto</TabsTrigger>
                  <TabsTrigger value="income">Ingreso</TabsTrigger>
                  <TabsTrigger value="transfer">Transferencia</TabsTrigger>
                </TabsList>
                <TabsContent value="expense" className="space-y-4">
                  <SpendingForm 
                    onSubmit={handleSpendingSubmit}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </TabsContent>
                <TabsContent value="income" className="space-y-4">
                  {/* Contenido del formulario de ingreso */}
                </TabsContent>
                <TabsContent value="transfer" className="space-y-4">
                  {/* Contenido del formulario de transferencia */}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
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
