"use client"

import React, {useContext, useState} from "react";
import { quicksand } from "../../ui/fonts";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendingForm, type SpendingFormValues } from "./spending-form";
import { IncomeForm, type IncomeFormValues } from "./income-form";
import { TransferForm, type TransferFormValues } from "./transfer-form";
import { ImportBankDialog } from "./import-bank-dialog";
import {
  addIncome,
  addTransaction,
  addTransfer,
  deleteTransaction,
  getTransaction,
  TransactionType,
  updateTransaction,
} from "@repo/supabase/transactions";
import { toast } from "sonner";

type TransactionTab = "expense" | "income" | "transfer";

export default function TransactionsPage() {
  const { filteredData: transactions, fetchTransactions } = useContext(TransactionsContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTab, setEditTab] = useState<TransactionTab>("expense");
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingTransactionType, setEditingTransactionType] = useState<TransactionType | null>(null);
  const [editingSpendingValues, setEditingSpendingValues] = useState<SpendingFormValues | undefined>(undefined);
  const [editingIncomeValues, setEditingIncomeValues] = useState<IncomeFormValues | undefined>(undefined);
  const [editingTransferValues, setEditingTransferValues] = useState<TransferFormValues | undefined>(undefined);

  const handleSpendingSubmit = async (values: SpendingFormValues) => {
    try {
      await addTransaction({
        date: values.date,
        amount: parseFloat(values.amount),
        description: values.description || "",
        category_id: parseInt(values.category_id),
        account_id: parseInt(values.account_id),
      });
      fetchTransactions();
      setIsDialogOpen(false);
      toast.success("Gasto guardado correctamente");
    } catch {
      toast.error("No se pudo guardar el gasto");
    }
  };

  const handleIncomeSubmit = async (values: IncomeFormValues) => {
    try {
      await addIncome({
        date: values.date,
        amount: parseFloat(values.amount),
        description: values.description || "",
        account_id: parseInt(values.account_id),
      });
      fetchTransactions();
      setIsDialogOpen(false);
      toast.success("Ingreso guardado correctamente");
    } catch {
      toast.error("No se pudo guardar el ingreso");
    }
  };

  const handleTransferSubmit = async (values: TransferFormValues) => {
    try {
      await addTransfer({
        date: values.date,
        amount: parseFloat(values.amount),
        description: values.description || "",
        from_account_id: parseInt(values.from_account_id),
        to_account_id: parseInt(values.to_account_id),
      });
      fetchTransactions();
      setIsDialogOpen(false);
      toast.success("Transferencia guardada correctamente");
    } catch {
      toast.error("No se pudo guardar la transferencia");
    }
  };

  const handleDeleteTransaction = async (transactionId: string, type: TransactionType) => {
    try {
      await deleteTransaction(transactionId, type);
      fetchTransactions();
      toast.success("Transacción eliminada correctamente");
    } catch {
      toast.error("No se pudo eliminar la transacción");
    }
  };

  const clearEditState = () => {
    setEditingTransactionId(null);
    setEditingTransactionType(null);
    setEditingSpendingValues(undefined);
    setEditingIncomeValues(undefined);
    setEditingTransferValues(undefined);
  };

  const handleEditTransaction = async (transactionId: string, type: TransactionType) => {
    try {
      const transaction = await getTransaction(parseInt(transactionId), type);

      setEditingTransactionId(transactionId);
      setEditingTransactionType(type);

      if (type === TransactionType.SPENDING) {
        setEditTab("expense");
        setEditingSpendingValues({
          amount: transaction.amount.toString(),
          category_id: transaction.category_id?.toString() || "",
          date: new Date(transaction.date),
          description: transaction.description || "",
          account_id: transaction.account_id.toString(),
          is_deferred: false,
          deferred_months: "1",
        });
      }

      if (type === TransactionType.INCOME) {
        setEditTab("income");
        setEditingIncomeValues({
          amount: transaction.amount.toString(),
          date: new Date(transaction.date),
          description: transaction.description || "",
          account_id: transaction.account_id.toString(),
        });
      }

      if (type === TransactionType.TRANSFER) {
        setEditTab("transfer");
        setEditingTransferValues({
          amount: transaction.amount.toString(),
          date: new Date(transaction.date),
          description: transaction.description || "",
          from_account_id: transaction.from_account_id?.toString() || "",
          to_account_id: transaction.to_account_id?.toString() || "",
        });
      }

      setIsEditDialogOpen(true);
    } catch {
      toast.error("No se pudo cargar la transacción para editar");
    }
  };

  const handleSpendingEditSubmit = async (values: SpendingFormValues) => {
    if (!editingTransactionId || editingTransactionType !== TransactionType.SPENDING) {
      return;
    }

    try {
      await updateTransaction(editingTransactionId, TransactionType.SPENDING, {
        date: values.date.toISOString(),
        amount: parseFloat(values.amount),
        description: values.description || "",
        category_id: parseInt(values.category_id),
        account_id: parseInt(values.account_id),
      });
      fetchTransactions();
      setIsEditDialogOpen(false);
      clearEditState();
      toast.success("Transacción actualizada correctamente");
    } catch {
      toast.error("No se pudo actualizar la transacción");
    }
  };

  const handleIncomeEditSubmit = async (values: IncomeFormValues) => {
    if (!editingTransactionId || editingTransactionType !== TransactionType.INCOME) {
      return;
    }

    try {
      await updateTransaction(editingTransactionId, TransactionType.INCOME, {
        date: values.date.toISOString(),
        amount: parseFloat(values.amount),
        description: values.description || "",
        account_id: parseInt(values.account_id),
      });
      fetchTransactions();
      setIsEditDialogOpen(false);
      clearEditState();
      toast.success("Transacción actualizada correctamente");
    } catch {
      toast.error("No se pudo actualizar la transacción");
    }
  };

  const handleTransferEditSubmit = async (values: TransferFormValues) => {
    if (!editingTransactionId || editingTransactionType !== TransactionType.TRANSFER) {
      return;
    }

    try {
      await updateTransaction(editingTransactionId, TransactionType.TRANSFER, {
        date: values.date.toISOString(),
        amount: parseFloat(values.amount),
        description: values.description || "",
        from_account_id: parseInt(values.from_account_id),
        to_account_id: parseInt(values.to_account_id),
      });
      fetchTransactions();
      setIsEditDialogOpen(false);
      clearEditState();
      toast.success("Transacción actualizada correctamente");
    } catch {
      toast.error("No se pudo actualizar la transacción");
    }
  };

  const isEditTabDisabled = (tab: TransactionTab) => {
    if (!editingTransactionType) {
      return false;
    }

    if (editingTransactionType === TransactionType.SPENDING) {
      return tab !== "expense";
    }

    if (editingTransactionType === TransactionType.INCOME) {
      return tab !== "income";
    }

    if (editingTransactionType === TransactionType.TRANSFER) {
      return tab !== "transfer";
    }

    return false;
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
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Importar desde Banco
          </Button>
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
                  <IncomeForm
                    onSubmit={handleIncomeSubmit}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </TabsContent>
                <TabsContent value="transfer" className="space-y-4">
                  <TransferForm
                    onSubmit={handleTransferSubmit}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <ImportBankDialog 
        open={isImportDialogOpen} 
        onOpenChange={setIsImportDialogOpen}
      />
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            clearEditState();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar transacción</DialogTitle>
            <DialogDescription>
              Actualiza los datos de la transacción seleccionada
            </DialogDescription>
          </DialogHeader>
          <Tabs value={editTab} onValueChange={(value) => setEditTab(value as TransactionTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expense" disabled={isEditTabDisabled("expense")}>Gasto</TabsTrigger>
              <TabsTrigger value="income" disabled={isEditTabDisabled("income")}>Ingreso</TabsTrigger>
              <TabsTrigger value="transfer" disabled={isEditTabDisabled("transfer")}>Transferencia</TabsTrigger>
            </TabsList>
            <TabsContent value="expense" className="space-y-4">
              <SpendingForm
                onSubmit={handleSpendingEditSubmit}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  clearEditState();
                }}
                initialValues={editingSpendingValues}
                submitLabel="Guardar cambios"
              />
            </TabsContent>
            <TabsContent value="income" className="space-y-4">
              <IncomeForm
                onSubmit={handleIncomeEditSubmit}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  clearEditState();
                }}
                initialValues={editingIncomeValues}
                submitLabel="Guardar cambios"
              />
            </TabsContent>
            <TabsContent value="transfer" className="space-y-4">
              <TransferForm
                onSubmit={handleTransferEditSubmit}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  clearEditState();
                }}
                initialValues={editingTransferValues}
                submitLabel="Guardar cambios"
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <div
        id="main"
        className="flex flex-col gap-6 flex-1 overflow-hidden"
      >
        <DataTable
          columns={columns}
          data={transactions}
          onDeleteTransaction={handleDeleteTransaction}
          onEditTransaction={handleEditTransaction}
        />
      </div>
    </>
  );
}
