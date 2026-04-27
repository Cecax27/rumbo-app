// Types
export {
  BankTransactionType,
  type ParsedTransaction,
  type DuplicateMatch,
  type ParseResult,
  type DuplicateDetectionResult,
} from "./types";

// Parsers
export { parseBBVAFile } from "./parsers";

// Validators
export {
  ParsedTransactionSchema,
  ParsedTransactionsArraySchema,
  validateParsedTransaction,
  validateParsedTransactions,
} from "./validators";

// Duplicate Detection
export {
  detectDuplicates,
  formatDuplicateMatch,
  type ExistingTransaction,
} from "./duplicate-detector";
