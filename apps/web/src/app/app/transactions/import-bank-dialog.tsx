"use client";

import React, { useContext, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Upload, ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AccountsContext } from "@/contexts/AccountsContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import {
  parseBBVAFile,
  detectDuplicates,
  BankTransactionType,
  type ParsedTransaction,
  type DuplicateMatch,
  type ExistingTransaction,
} from "@repo/bbva-parser";
import { getSpendingsTable } from "@repo/supabase/transactions";

import { ImportStep1FileSelection } from "./import-steps/step1-file-selection";
import { ImportStep2AccountSelection } from "./import-steps/step2-account-selection";
import { ImportStep3DuplicateDetection } from "./import-steps/step3-duplicate-detection";
import { ImportStep4Preview } from "./import-steps/step4-preview";

type ImportStep = 1 | 2 | 3 | 4;

interface ImportBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportBankDialog({ open, onOpenChange }: ImportBankDialogProps) {
  const { accounts } = useContext(AccountsContext);
  const { fetchTransactions } = useContext(TransactionsContext);

  interface ImportApiResult {
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{
      index: number;
      error: string;
    }>;
  }

  // Dialog state
  const [currentStep, setCurrentStep] = useState<ImportStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportApiResult | null>(null);

  // Step 1: File & Bank
  const [file, setFile] = useState<File | null>(null);
  const [bank, setBank] = useState<string>("BBVA");

  // Step 2: Account
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  // Step 3: Duplicates
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [duplicateDecisions, setDuplicateDecisions] = useState<Map<number, boolean>>(new Map());

  // Step 4: Preview
  const [previewTransactions, setPreviewTransactions] = useState<Array<ParsedTransaction & { categoryId?: number; skip?: boolean }>>(
    []
  );

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setIsLoading(true);

    try {
      const parseResult = await parseBBVAFile(selectedFile);

      if (!parseResult.success) {
        setError(parseResult.error || "Error parsing file");
        if (parseResult.errorDetails) {
          console.error("Parse error details:", parseResult.errorDetails);
        }
        return;
      }

      setParsedTransactions(parseResult.transactions || []);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error parsing file:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setError(null);
    setIsLoading(true);

    try {
      // Fetch existing transactions to detect duplicates
      const existingTransactions = await getSpendingsTable(
        new Date(new Date().getFullYear(), 0, 1), // Start of current year
        new Date() // Today
      );

      // Convert to format expected by detectDuplicates
      const existingTxs: ExistingTransaction[] = existingTransactions.map((tx) => ({
        id: String(tx.id),
        date: new Date(tx.date),
        description: tx.description,
        amount: tx.amount,
      }));

      const detectionResult = detectDuplicates(parsedTransactions, existingTxs, 3);
      setDuplicateMatches(detectionResult.matches);

      if (detectionResult.hasMatches) {
        setCurrentStep(3);
      } else {
        // No duplicates, go directly to preview
        setPreviewTransactions(parsedTransactions);
        setCurrentStep(4);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error checking for duplicates");
      console.error("Error detecting duplicates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateDecision = (parsedIndex: number, shouldImport: boolean) => {
    const newDecisions = new Map(duplicateDecisions);
    newDecisions.set(parsedIndex, shouldImport);
    setDuplicateDecisions(newDecisions);
  };

  const handleDuplicatesComplete = () => {
    // Filter out transactions that user decided to skip
    const txsToImport = parsedTransactions.map((tx, index) => {
      const decision = duplicateDecisions.get(index);
      if (decision === false) {
        return { ...tx, skip: true };
      }
      return tx;
    });

    setPreviewTransactions(txsToImport);
    setCurrentStep(4);
  };

  const handlePreviewComplete = async (transactionsToImport: Array<ParsedTransaction & { categoryId?: number }>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/import-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: transactionsToImport,
          accountId: selectedAccountId,
        }),
      });

      const result = (await response.json()) as ImportApiResult;

      if (!response.ok && !result) {
        throw new Error("Failed to import transactions");
      }

      // Refresh transactions
      await fetchTransactions();

      // Show result summary modal with API response
      setImportResult({
        success: result?.success ?? false,
        imported: result?.imported ?? 0,
        skipped: result?.skipped ?? 0,
        errors: result?.errors ?? [],
      });
      setShowResultModal(true);

      // Close dialog and reset
      onOpenChange(false);
      resetDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error importing transactions");
      console.error("Error importing transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setCurrentStep(1);
    setFile(null);
    setBank("BBVA");
    setSelectedAccountId("");
    setParsedTransactions([]);
    setDuplicateMatches([]);
    setDuplicateDecisions(new Map());
    setPreviewTransactions([]);
    setError(null);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setImportResult(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDialog();
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl min-w-fit max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Transacciones desde {bank}
          </DialogTitle>
          <DialogDescription>
            Paso {currentStep} de 4
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Step 1: File Selection */}
          {currentStep === 1 && (
            <ImportStep1FileSelection
              onFileSelect={handleFileSelect}
              bank={bank}
              onBankChange={setBank}
              isLoading={isLoading}
            />
          )}

          {/* Step 2: Account Selection */}
          {currentStep === 2 && (
            <ImportStep2AccountSelection
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onAccountSelect={handleAccountSelect}
              isLoading={isLoading}
              parsedTransactionsCount={parsedTransactions.length}
            />
          )}

          {/* Step 3: Duplicate Detection */}
          {currentStep === 3 && (
            <ImportStep3DuplicateDetection
              matches={duplicateMatches}
              onDecision={handleDuplicateDecision}
              decisions={duplicateDecisions}
              onComplete={handleDuplicatesComplete}
              isLoading={isLoading}
            />
          )}

          {/* Step 4: Preview */}
          {currentStep === 4 && (
            <ImportStep4Preview
              transactions={previewTransactions}
              selectedAccountId={selectedAccountId}
              onImport={handlePreviewComplete}
              isLoading={isLoading}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => (prev > 1 ? (prev - 1) as ImportStep : prev))}
              disabled={currentStep === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>

            {currentStep < 4 && (
              <Button
                onClick={() => {
                  if (currentStep === 1 && file) {
                    handleFileSelect(file);
                  } else if (currentStep === 2 && selectedAccountId) {
                    handleAccountSelect(selectedAccountId);
                  } else if (currentStep === 3) {
                    handleDuplicatesComplete();
                  }
                }}
                disabled={isLoading || (currentStep === 1 && !file) || (currentStep === 2 && !selectedAccountId)}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResultModal} onOpenChange={handleCloseResultModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {importResult?.success ? "Importación completada" : "Importación finalizada con errores"}
            </DialogTitle>
            <DialogDescription>
              Este resumen viene de la respuesta del endpoint de importación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Importadas correctamente</span>
                <span className="font-semibold text-right">{importResult?.imported ?? 0}</span>

                <span className="text-neutral-600 dark:text-neutral-400">Omitidas</span>
                <span className="font-semibold text-right">{importResult?.skipped ?? 0}</span>

                <span className="text-neutral-600 dark:text-neutral-400">Errores</span>
                <span className="font-semibold text-right">{importResult?.errors?.length ?? 0}</span>
              </div>
            </div>

            {(importResult?.errors?.length ?? 0) > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border p-3">
                <p className="text-sm font-medium">Detalle de errores</p>
                {importResult?.errors.slice(0, 10).map((item, idx) => (
                  <p key={`${item.index}-${idx}`} className="text-xs text-red-600 dark:text-red-400">
                    Fila {item.index + 1}: {item.error}
                  </p>
                ))}
              </div>
            )}

            <Button onClick={handleCloseResultModal} className="w-full">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
