"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { type DuplicateMatch } from "@repo/bbva-parser";

interface ImportStep3DuplicateDetectionProps {
  matches: DuplicateMatch[];
  onDecision: (parsedIndex: number, shouldImport: boolean) => void;
  decisions: Map<number, boolean>;
  onComplete: () => void;
  isLoading: boolean;
}

export function ImportStep3DuplicateDetection({
  matches,
  onDecision,
  decisions,
  onComplete,
  isLoading,
}: ImportStep3DuplicateDetectionProps) {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(true);

  const currentMatch = matches[currentMatchIndex];
  const hasDecidedAll = matches.every((match) => decisions.has(match.parsedIndex));

  const handleImportAnyway = () => {
    if (currentMatch) {
      onDecision(currentMatch.parsedIndex, true);
      moveToNext();
    }
  };

  const handleSkip = () => {
    if (currentMatch) {
      onDecision(currentMatch.parsedIndex, false);
      moveToNext();
    }
  };

  const moveToNext = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      setShowDialog(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Posibles transacciones duplicadas</AlertTitle>
        <AlertDescription>
          Se detectaron {matches.length} transacciones que podrían ser duplicadas. Por favor, confirma
          cada una.
        </AlertDescription>
      </Alert>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {currentMatch && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                ¿Es esta una transacción duplicada? ({currentMatchIndex + 1} de {matches.length})
              </DialogTitle>
              <DialogDescription>
                Comparar la transacción del archivo con una existente
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              {/* New Transaction */}
              <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Transacción del archivo
                </p>
                <p className="text-sm font-medium">{currentMatch.parsedTransaction.description}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {formatDate(currentMatch.parsedTransaction.date, "dd/MMM/yyyy", { locale: es })}
                </p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                  ${currentMatch.parsedTransaction.amount.toFixed(2)}
                </p>
              </div>

              {/* Existing Transaction */}
              <div className="space-y-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                  Transacción existente
                </p>
                <p className="text-sm font-medium">{currentMatch.existingTransaction.description}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {formatDate(currentMatch.existingTransaction.date, "dd/MMM/yyyy", { locale: es })}
                </p>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-300">
                  ${currentMatch.existingTransaction.amount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <p>Diferencia: <strong>{currentMatch.daysApart} día(s)</strong></p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                No importar esta
              </Button>
              <Button
                onClick={handleImportAnyway}
                disabled={isLoading}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Importar de todas formas
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {!showDialog && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Se han procesado todas las transacciones potencialmente duplicadas.
          </p>
          <Button onClick={handleComplete} className="w-full">
            Continuar al siguiente paso
          </Button>
        </div>
      )}
    </div>
  );
}
