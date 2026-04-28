import { differenceInDays } from "date-fns";
import {
  DuplicateMatch,
  DuplicateDetectionResult,
  ParsedTransaction,
} from "./types";

export interface ExistingTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
}

/**
 * Detect potential duplicate transactions
 *
 * A transaction is considered a potential duplicate if:
 * - The amount matches exactly
 * - The date is within ±toleranceDays of the existing transaction
 *
 * @param parsedTransactions - Newly parsed transactions
 * @param existingTransactions - Existing transactions from database
 * @param toleranceDays - Number of days to allow difference (default: 3)
 * @returns DuplicateDetectionResult with matches
 */
export function detectDuplicates(
  parsedTransactions: ParsedTransaction[],
  existingTransactions: ExistingTransaction[],
  toleranceDays: number = 3
): DuplicateDetectionResult {
  const matches: DuplicateMatch[] = [];

  parsedTransactions.forEach((parsedTx, parsedIndex) => {
    existingTransactions.forEach((existingTx) => {
      // Check if amounts match exactly
      if (Math.abs(parsedTx.amount - existingTx.amount) < 0.01) {
        // Check if dates are within tolerance
        const daysDifference = differenceInDays(
          parsedTx.date,
          existingTx.date
        );
        const absDaysDifference = Math.abs(daysDifference);

        if (absDaysDifference <= toleranceDays) {
          matches.push({
            parsedIndex,
            existingTransactionId: existingTx.id,
            existingTransaction: {
              id: existingTx.id,
              date: existingTx.date,
              description: existingTx.description,
              amount: existingTx.amount,
            },
            parsedTransaction: parsedTx,
            daysApart: absDaysDifference,
          });
        }
      }
    });
  });

  return {
    matches,
    hasMatches: matches.length > 0,
  };
}

/**
 * Get a human-readable description of a duplicate match
 */
export function formatDuplicateMatch(match: DuplicateMatch): string {
  return `
New transaction: ${match.parsedTransaction.description}
  Date: ${match.parsedTransaction.date.toLocaleDateString()}
  Amount: ${match.parsedTransaction.amount}

Existing transaction: ${match.existingTransaction.description}
  Date: ${match.existingTransaction.date.toLocaleDateString()}
  Amount: ${match.existingTransaction.amount}

Difference: ${match.daysApart} day(s)
  `.trim();
}
