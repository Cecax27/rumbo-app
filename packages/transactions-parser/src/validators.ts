import { z } from "zod";
import { BankTransactionType, ParsedTransaction } from "./types";

/**
 * Schema for validating a parsed transaction
 */
export const ParsedTransactionSchema = z.object({
  date: z.date().describe("Date must be a valid date"),
  description: z
    .string()
    .min(1, "Description cannot be empty")
    .max(500, "Description is too long"),
  amount: z
    .number()
    .positive("Amount must be greater than 0"),
  transactionType: z.enum(
    [
      BankTransactionType.SPENDING,
      BankTransactionType.INCOME,
      BankTransactionType.TRANSFER,
    ],
    {
      errorMap: () => ({
        message:
          "Transaction type must be one of spending, income or transfer",
      }),
    }
  ),
  fromAccountId: z.number().int().positive().optional(),
  originalCargo: z.number().optional(),
  originalAbono: z.number().optional(),
}) satisfies z.ZodType<ParsedTransaction>;

/**
 * Schema for validating an array of parsed transactions
 */
export const ParsedTransactionsArraySchema = z.array(ParsedTransactionSchema);

/**
 * Validate a single parsed transaction
 */
export function validateParsedTransaction(
  transaction: unknown
): { valid: boolean; error?: string } {
  try {
    ParsedTransactionSchema.parse(transaction);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return { valid: false, error: messages.join("; ") };
    }
    return { valid: false, error: "Unknown validation error" };
  }
}

/**
 * Validate multiple parsed transactions
 */
export function validateParsedTransactions(
  transactions: unknown[]
): { valid: boolean; errors: Map<number, string> } {
  const errors = new Map<number, string>();

  transactions.forEach((transaction, index) => {
    const result = validateParsedTransaction(transaction);
    if (!result.valid && result.error) {
      errors.set(index, result.error);
    }
  });

  return {
    valid: errors.size === 0,
    errors,
  };
}
