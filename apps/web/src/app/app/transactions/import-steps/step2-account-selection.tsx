"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type Account } from "@repo/supabase/accounts";

interface ImportStep2AccountSelectionProps {
  accounts: Account[];
  selectedAccountId: string;
  onAccountSelect: (accountId: string) => void;
  isLoading: boolean;
  parsedTransactionsCount: number;
}

export function ImportStep2AccountSelection({
  accounts,
  selectedAccountId,
  onAccountSelect,
  isLoading,
  parsedTransactionsCount,
}: ImportStep2AccountSelectionProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Archivo validado</AlertTitle>
        <AlertDescription>
          Se encontraron <strong>{parsedTransactionsCount} transacciones</strong> en el archivo
        </AlertDescription>
      </Alert>

      <div>
        <label className="text-sm font-medium mb-2 block">Selecciona la cuenta de destino</label>
        <Select value={selectedAccountId} onValueChange={onAccountSelect} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una cuenta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.name} ({account.bank_name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500 mt-1">
          Las transacciones se importarán a la cuenta seleccionada
        </p>
      </div>

      {selectedAccountId && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ Cuenta seleccionada
        </p>
      )}
    </div>
  );
}
