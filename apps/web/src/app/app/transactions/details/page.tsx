"use client";

import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatMoney } from "@repo/formatters";
import {
  deleteTransaction,
  getCategories,
  getTransaction,
  Transaction,
  TransactionType,
  updateTransaction,
} from "@repo/supabase/transactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SpendingForm, type SpendingFormValues } from "../spending-form";
import { IncomeForm, type IncomeFormValues } from "../income-form";
import { TransferForm, type TransferFormValues } from "../transfer-form";
import { AccountsContext } from "@/contexts/AccountsContext";

type EditFormValues = {
  spending?: SpendingFormValues;
  income?: IncomeFormValues;
  transfer?: TransferFormValues;
};

interface CategoryItem {
  id: number;
  name: string;
}

const parseTransactionType = (value: string | null): TransactionType | null => {
  if (value === TransactionType.SPENDING) return TransactionType.SPENDING;
  if (value === TransactionType.INCOME) return TransactionType.INCOME;
  if (value === TransactionType.TRANSFER) return TransactionType.TRANSFER;
  if (value === TransactionType.DEFERRED) return TransactionType.DEFERRED;
  return null;
};

const getTypeLabel = (type: TransactionType) => {
  if (type === TransactionType.SPENDING) return "Gasto";
  if (type === TransactionType.INCOME) return "Ingreso";
  if (type === TransactionType.TRANSFER) return "Transferencia";
  return "Diferido";
};

const getTypeBadgeClass = (type: TransactionType) => {
  if (type === TransactionType.INCOME) return "bg-green-100 text-green-700";
  if (type === TransactionType.TRANSFER) return "bg-blue-100 text-blue-700";
  if (type === TransactionType.SPENDING) return "bg-red-100 text-red-700";
  return "bg-neutral-100 text-neutral-700";
};

function TransactionDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accounts } = useContext(AccountsContext);

  const transactionId = searchParams.get("id");
  const transactionType = useMemo(
    () => parseTransactionType(searchParams.get("type")),
    [searchParams]
  );

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editValues, setEditValues] = useState<EditFormValues>({});
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const getAccountName = useCallback(
    (accountId?: number | null) => {
      if (accountId == null) {
        return null;
      }

      const account = accounts.find((item) => item.id === accountId);
      return account?.name || `Cuenta #${accountId}`;
    },
    [accounts]
  );

  const getCategoryName = useCallback(
    (categoryId?: number | null) => {
      if (categoryId == null) {
        return null;
      }

      const category = categories.find((item) => item.id === categoryId);
      return category?.name || `Categoría #${categoryId}`;
    },
    [categories]
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories((data as CategoryItem[]) || []);
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const loadTransaction = useCallback(async () => {
    if (!transactionId || !transactionType) {
      setError("No se recibió un id o tipo de transacción válido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getTransaction(parseInt(transactionId), transactionType);
      setTransaction(data);

      if (transactionType === TransactionType.SPENDING) {
        setEditValues({
          spending: {
            amount: data.amount.toString(),
            category_id: data.category_id?.toString() || "",
            date: new Date(data.date),
            description: data.description || "",
            account_id: data.account_id.toString(),
            is_deferred: false,
            deferred_months: "1",
          },
        });
      }

      if (transactionType === TransactionType.INCOME) {
        setEditValues({
          income: {
            amount: data.amount.toString(),
            date: new Date(data.date),
            description: data.description || "",
            account_id: data.account_id.toString(),
          },
        });
      }

      if (transactionType === TransactionType.TRANSFER) {
        setEditValues({
          transfer: {
            amount: data.amount.toString(),
            date: new Date(data.date),
            description: data.description || "",
            from_account_id: data.from_account_id?.toString() || "",
            to_account_id: data.to_account_id?.toString() || "",
          },
        });
      }
    } catch {
      setError("No se pudo cargar la transacción.");
    } finally {
      setLoading(false);
    }
  }, [transactionId, transactionType]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  const handleDelete = async () => {
    if (!transactionId || !transactionType) {
      return;
    }

    const confirmed = window.confirm("¿Seguro que quieres eliminar esta transacción?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteTransaction(transactionId, transactionType);
      toast.success("Transacción eliminada correctamente");
      router.push("/app/transactions");
    } catch {
      toast.error("No se pudo eliminar la transacción");
    }
  };

  const handleSpendingEditSubmit = async (values: SpendingFormValues) => {
    if (!transactionId || transactionType !== TransactionType.SPENDING) {
      return;
    }

    try {
      await updateTransaction(transactionId, TransactionType.SPENDING, {
        date: values.date.toISOString(),
        amount: parseFloat(values.amount),
        description: values.description || "",
        category_id: parseInt(values.category_id),
        account_id: parseInt(values.account_id),
      });
      toast.success("Transacción actualizada correctamente");
      setIsEditDialogOpen(false);
      loadTransaction();
    } catch {
      toast.error("No se pudo actualizar la transacción");
    }
  };

  const handleIncomeEditSubmit = async (values: IncomeFormValues) => {
    if (!transactionId || transactionType !== TransactionType.INCOME) {
      return;
    }

    try {
      await updateTransaction(transactionId, TransactionType.INCOME, {
        date: values.date.toISOString(),
        amount: parseFloat(values.amount),
        description: values.description || "",
        account_id: parseInt(values.account_id),
      });
      toast.success("Transacción actualizada correctamente");
      setIsEditDialogOpen(false);
      loadTransaction();
    } catch {
      toast.error("No se pudo actualizar la transacción");
    }
  };

  const handleTransferEditSubmit = async (values: TransferFormValues) => {
    if (!transactionId || transactionType !== TransactionType.TRANSFER) {
      return;
    }

    try {
      await updateTransaction(transactionId, TransactionType.TRANSFER, {
        date: values.date.toISOString(),
        amount: parseFloat(values.amount),
        description: values.description || "",
        from_account_id: parseInt(values.from_account_id),
        to_account_id: parseInt(values.to_account_id),
      });
      toast.success("Transacción actualizada correctamente");
      setIsEditDialogOpen(false);
      loadTransaction();
    } catch {
      toast.error("No se pudo actualizar la transacción");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (error || !transactionType || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <p className="text-sm text-neutral-600">{error || "No se encontró la transacción."}</p>
        <Button variant="outline" onClick={() => router.push("/app/transactions")}>Volver</Button>
      </div>
    );
  }

  const accountName = getAccountName(transaction.account_id);
  const categoryName = getCategoryName(transaction.category_id);
  const fromAccountName = getAccountName(transaction.from_account_id);
  const toAccountName = getAccountName(transaction.to_account_id);

  return (
    <>
      <section className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-neutral-700">Detalle de transacción</h1>
          <p className="text-neutral-600">Consulta todos los datos de la transacción seleccionada.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/app/transactions")}>
            Volver
          </Button>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <p><span className="font-semibold">Tipo:</span> <Badge className={getTypeBadgeClass(transactionType)}>{getTypeLabel(transactionType)}</Badge></p>
          <p><span className="font-semibold">Monto:</span> {formatMoney(transaction.amount)}</p>
          <p><span className="font-semibold">Fecha:</span> {format(new Date(transaction.date), "dd MMM yyyy")}</p>
          <p><span className="font-semibold">Descripción:</span> {transaction.description || "Sin descripción"}</p>
          {accountName && <p><span className="font-semibold">Cuenta:</span> {accountName}</p>}
          {categoryName && <p><span className="font-semibold">Categoría:</span> {categoryName}</p>}
          {fromAccountName && <p><span className="font-semibold">Cuenta origen:</span> {fromAccountName}</p>}
          {toAccountName && <p><span className="font-semibold">Cuenta destino:</span> {toAccountName}</p>}
          {transaction.months != null && <p><span className="font-semibold">Meses diferido:</span> {transaction.months}</p>}
          {transaction.total_amount != null && <p><span className="font-semibold">Monto total diferido:</span> {formatMoney(transaction.total_amount)}</p>}
          {transaction.saving_goal && <p><span className="font-semibold">Meta de ahorro:</span> {transaction.saving_goal}</p>}
          {transaction.created_at && <p><span className="font-semibold">Creado:</span> {format(new Date(transaction.created_at), "dd MMM yyyy HH:mm")}</p>}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar transacción</DialogTitle>
            <DialogDescription>
              Actualiza los datos de esta transacción
            </DialogDescription>
          </DialogHeader>

          {transactionType === TransactionType.SPENDING && (
            <SpendingForm
              onSubmit={handleSpendingEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              initialValues={editValues.spending}
              submitLabel="Guardar cambios"
            />
          )}

          {transactionType === TransactionType.INCOME && (
            <IncomeForm
              onSubmit={handleIncomeEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              initialValues={editValues.income}
              submitLabel="Guardar cambios"
            />
          )}

          {transactionType === TransactionType.TRANSFER && (
            <TransferForm
              onSubmit={handleTransferEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              initialValues={editValues.transfer}
              submitLabel="Guardar cambios"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function TransactionDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center flex-1">
          <Spinner className="size-6" />
        </div>
      }
    >
      <TransactionDetailsContent />
    </Suspense>
  );
}
