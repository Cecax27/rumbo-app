export type TransactionParserId = "bbva-debit" | "bbva-credit";

export interface TransactionParserDefinition {
  id: TransactionParserId;
  labels: {
    es: string;
  };
}

export const TRANSACTION_PARSERS: TransactionParserDefinition[] = [
  {
    id: "bbva-debit",
    labels: { es: "BBVA Cuenta de debito" },
  },
  {
    id: "bbva-credit",
    labels: { es: "BBVA Tarjeta de credito" },
  },
];

/**
 * Transaction type enum - determines whether it's spending, income or transfer
 */
export enum BankTransactionType {
  SPENDING = "spending",
  INCOME = "income",
  TRANSFER = "transfer",
}

/**
 * Parsed transaction from BBVA Excel report
 */
export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number; // Always positive, type determines direction
  transactionType: BankTransactionType;
  fromAccountId?: number;
  originalCargo?: number;
  originalAbono?: number;
}

/**
 * Match between a parsed transaction and an existing one (potential duplicate)
 */
export interface DuplicateMatch {
  parsedIndex: number;
  existingTransactionId: string;
  existingTransaction: {
    id: string;
    date: Date;
    description: string;
    amount: number;
  };
  parsedTransaction: ParsedTransaction;
  daysApart: number;
}

/**
 * Result of parsing a BBVA Excel file
 */
export interface ParseResult {
  success: boolean;
  transactions?: ParsedTransaction[];
  error?: string;
  errorDetails?: string;
}

/**
 * Result of duplicate detection
 */
export interface DuplicateDetectionResult {
  matches: DuplicateMatch[];
  hasMatches: boolean;
}
