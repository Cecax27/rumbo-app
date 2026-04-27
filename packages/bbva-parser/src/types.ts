/**
 * Transaction type enum - determines whether it's spending or income
 */
export enum BankTransactionType {
  SPENDING = "spending",
  INCOME = "income",
}

/**
 * Parsed transaction from BBVA Excel report
 */
export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number; // Always positive, type determines direction
  transactionType: BankTransactionType;
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
