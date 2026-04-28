"use client";

import React, { useState, useMemo } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";
import { type ParsedTransaction, BankTransactionType } from "@repo/transactions-parser";
import { TRANSACTION_CATEGORIES } from "@repo/app-constants";
import { type Account } from "@repo/supabase/accounts";

const formatCategoryLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CATEGORY_GROUPS = TRANSACTION_CATEGORIES.map((group) => ({
  groupId: group.id,
  groupLabel: formatCategoryLabel(group.budget_group),
  categories: group.categories.map((category) => ({
    id: category.id,
    label: formatCategoryLabel(category.name),
  })),
}));

interface PreviewTransaction extends ParsedTransaction {
  categoryId?: number;
  skip?: boolean;
  convertToTransfer?: boolean;
  fromAccountId?: number;
}

interface ImportStep4PreviewProps {
  transactions: PreviewTransaction[];
  selectedAccountId: string;
  accounts: Account[];
  onImport: (transactions: Array<PreviewTransaction & { categoryId?: number }>) => Promise<void>;
  isLoading: boolean;
}

export function ImportStep4Preview({
  transactions: initialTransactions,
  selectedAccountId,
  accounts,
  onImport,
  isLoading,
}: ImportStep4PreviewProps) {
  const [transactions, setTransactions] = useState<PreviewTransaction[]>(initialTransactions);
  const [isImporting, setIsImporting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const destinationAccountId = selectedAccountId ? parseInt(selectedAccountId, 10) : NaN;
  const destinationAccount = accounts.find((account) => account.id === destinationAccountId);
  const isCreditDestination = destinationAccount?.account_type === 2;
  const sourceAccounts = accounts.filter((account) => account.id !== destinationAccountId);

  // Filter out skipped transactions
  const validTransactions = useMemo(
    () => transactions.filter((t) => !t.skip),
    [transactions]
  );

  const handleCategoryChange = (index: number, categoryId: string) => {
    const newTransactions = [...transactions];
    newTransactions[index] = {
      ...newTransactions[index]!,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
    };
    setTransactions(newTransactions);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newTransactions = [...transactions];
    newTransactions[index] = {
      ...newTransactions[index]!,
      description,
    };
    setTransactions(newTransactions);
  };

  const handleSkipToggle = (index: number) => {
    const newTransactions = [...transactions];
    newTransactions[index] = {
      ...newTransactions[index]!,
      skip: !newTransactions[index]!.skip,
    };
    setTransactions(newTransactions);
  };

  const handleConvertToTransferToggle = (index: number) => {
    const current = transactions[index];
    if (!current || current.transactionType !== BankTransactionType.INCOME) {
      return;
    }

    const newTransactions = [...transactions];
    const nextValue = !current.convertToTransfer;
    newTransactions[index] = {
      ...current,
      convertToTransfer: nextValue,
      fromAccountId: nextValue ? current.fromAccountId : undefined,
    };
    setTransactions(newTransactions);
  };

  const handleFromAccountChange = (index: number, fromAccountId: string) => {
    const newTransactions = [...transactions];
    newTransactions[index] = {
      ...newTransactions[index]!,
      fromAccountId: fromAccountId ? parseInt(fromAccountId, 10) : undefined,
    };
    setTransactions(newTransactions);
  };

  const handleImport = async () => {
    setValidationError(null);

    for (const tx of validTransactions) {
      if (tx.transactionType !== BankTransactionType.INCOME || !tx.convertToTransfer) {
        continue;
      }

      if (!tx.fromAccountId) {
        setValidationError("Selecciona una cuenta origen para cada movimiento convertido.");
        return;
      }

      if (tx.fromAccountId === destinationAccountId) {
        setValidationError("La cuenta origen no puede ser la misma que la cuenta destino.");
        return;
      }
    }

    const transactionsToImport = validTransactions.map((tx) => ({
      ...tx,
      transactionType:
        tx.transactionType === BankTransactionType.INCOME && tx.convertToTransfer
          ? BankTransactionType.TRANSFER
          : tx.transactionType,
      categoryId:
        tx.transactionType !== BankTransactionType.SPENDING
          ? undefined
          : tx.categoryId || 7, // Default to "Otros Gastos" for spendings
    }));

    setIsImporting(true);
    try {
      await onImport(transactionsToImport);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Revisa tus transacciones</AlertTitle>
        <AlertDescription>
          Puedes editar la descripción y categoría antes de importar. Se importarán{" "}
          <strong>{validTransactions.length}</strong> transacciones.
        </AlertDescription>
      </Alert>

      {isCreditDestination && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cuenta destino de credito detectada</AlertTitle>
          <AlertDescription>
            Para ingresos puedes activar "Convertir a movimiento" y seleccionar una cuenta origen.
          </AlertDescription>
        </Alert>
      )}

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validacion requerida</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="max-h-[200px] overflow-y-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-900">
            <tr className="border-b">
              <th className="w-8 px-3 py-2"></th>
              <th className="px-3 py-2 text-left font-semibold">Fecha</th>
              <th className="px-3 py-2 text-left font-semibold">Descripción</th>
              <th className="px-3 py-2 text-left font-semibold">Monto</th>
              <th className="px-3 py-2 text-left font-semibold">Categoría</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr
                key={index}
                className={`border-b transition-colors ${
                  tx.skip
                    ? "bg-neutral-50 dark:bg-neutral-800 opacity-50"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                <td className="px-3 py-2">
                  <Checkbox
                    checked={tx.skip || false}
                    onCheckedChange={() => handleSkipToggle(index)}
                    disabled={isImporting}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDate(tx.date, "dd/MMM/yyyy", { locale: es })}
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={tx.description}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    disabled={tx.skip || isImporting}
                    className="text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <span
                    className={
                      tx.transactionType === BankTransactionType.INCOME
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {tx.transactionType === BankTransactionType.INCOME ? "+" : "-"}$
                    {tx.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {tx.transactionType === BankTransactionType.INCOME ? (
                    isCreditDestination ? (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                          <Checkbox
                            checked={tx.convertToTransfer || false}
                            onCheckedChange={() => handleConvertToTransferToggle(index)}
                            disabled={tx.skip || isImporting}
                          />
                          Convertir a movimiento
                        </label>
                        {tx.convertToTransfer && (
                          <Select
                            value={tx.fromAccountId?.toString() || ""}
                            onValueChange={(value) => handleFromAccountChange(index, value)}
                            disabled={tx.skip || isImporting}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Cuenta origen" />
                            </SelectTrigger>
                            <SelectContent>
                              {sourceAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.name} ({account.bank_name})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        No aplica
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {tx.transactionType === BankTransactionType.TRANSFER ? "Movimiento" : "No aplica"}
                    </span>
                  )}

                  {tx.transactionType === BankTransactionType.SPENDING && (
                    <Select
                      value={tx.categoryId?.toString() || ""}
                      onValueChange={(value) => handleCategoryChange(index, value)}
                      disabled={tx.skip || isImporting}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_GROUPS.map((group, groupIndex) => (
                          <React.Fragment key={group.groupId}>
                            {groupIndex > 0 && <SelectSeparator />}
                            <SelectGroup>
                              <SelectLabel>{group.groupLabel}</SelectLabel>
                              {group.categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        onClick={handleImport}
        disabled={isImporting || validTransactions.length === 0}
        className="w-full"
      >
        {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isImporting ? "Importando..." : "Importar Transacciones"}
      </Button>
    </div>
  );
}
