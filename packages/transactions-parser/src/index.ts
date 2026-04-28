// Types
export {
  TRANSACTION_PARSERS,
  type TransactionParserId,
  type TransactionParserDefinition,
  BankTransactionType,
  type ParsedTransaction,
  type DuplicateMatch,
  type ParseResult,
  type DuplicateDetectionResult,
} from "./types";

// Parsers
export { parseBBVADebitFile, parseBBVACreditFile } from "./parsers";

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
