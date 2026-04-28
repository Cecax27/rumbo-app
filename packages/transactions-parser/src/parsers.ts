import { read, utils } from "xlsx";
import { parse as parseDate, isValid as isValidDate } from "date-fns";
import { BankTransactionType, ParsedTransaction, ParseResult } from "./types";
import { validateParsedTransactions } from "./validators";

/**
 * Parse a BBVA debit Excel file and extract transactions
 *
 * File structure:
 * - First 3 rows are header/metadata (skipped)
 * - Row 4 contains column names: FECHA, DESCRIPCIÓN, CARGO, ABONO, SALDO
 * - Rows 5+ contain transaction data
 *
 * @param file - Excel file (xlsx format)
 * @returns ParseResult with transactions or error
 */
export async function parseBBVADebitFile(file: File): Promise<ParseResult> {
  try {
    const rowsResult = await readRowsFromExcel(file);
    if (!rowsResult.success || !rowsResult.rows) {
      return {
        success: false,
        error: rowsResult.error,
        errorDetails: rowsResult.errorDetails,
      };
    }
    const rows = rowsResult.rows;

    if (!rows || rows.length < 5) {
      return {
        success: false,
        error: "Excel file does not have sufficient data. Expected at least 5 rows (3 header + 1 column names + 1 data row)",
      };
    }

    const columns = findRequiredColumns(rows[3]);
    if (!columns.success || !columns.value) {
      return {
        success: false,
        error: columns.error,
        errorDetails: columns.errorDetails,
      };
    }

    const transactions = parseRowsToTransactions(rows, columns.value, {
      startRowIndex: 4,
      stopOnBlankRow: false,
      skipRowsWithoutDate: true,
    });

    if (!transactions.success) {
      return transactions;
    }

    return {
      success: true,
      transactions: transactions.transactions,
    };
  } catch (error) {
    return {
      success: false,
      error: "Unexpected error while parsing file",
      errorDetails: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Parse a BBVA credit card Excel file and extract transactions.
 *
 * File structure:
 * - First 2 rows are header/metadata
 * - Row 3 contains column names: FECHA, DESCRIPCIÓN, CARGO, ABONO, SALDO
 * - Rows 4+ contain data and may include non-date subheaders
 * - Parsing stops at the first completely blank row
 */
export async function parseBBVACreditFile(file: File): Promise<ParseResult> {
  try {
    const rowsResult = await readRowsFromExcel(file);
    if (!rowsResult.success || !rowsResult.rows) {
      return {
        success: false,
        error: rowsResult.error,
        errorDetails: rowsResult.errorDetails,
      };
    }
    const rows = rowsResult.rows;

    if (!rows || rows.length < 4) {
      return {
        success: false,
        error:
          "Excel file does not have sufficient data. Expected at least 4 rows (2 header + 1 column names + 1 data row)",
      };
    }

    const columns = findRequiredColumns(rows[2]);
    if (!columns.success || !columns.value) {
      return {
        success: false,
        error: columns.error,
        errorDetails: columns.errorDetails,
      };
    }

    const transactions = parseRowsToTransactions(rows, columns.value, {
      startRowIndex: 3,
      stopOnBlankRow: true,
      skipRowsWithoutDate: true,
    });

    if (!transactions.success) {
      return transactions;
    }

    return {
      success: true,
      transactions: transactions.transactions,
    };
  } catch (error) {
    return {
      success: false,
      error: "Unexpected error while parsing file",
      errorDetails: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

type ColumnIndexes = {
  fechaIndex: number;
  descIndex: number;
  cargoIndex: number;
  abonoIndex: number;
};

type ParseRowsOptions = {
  startRowIndex: number;
  stopOnBlankRow: boolean;
  skipRowsWithoutDate: boolean;
};

async function readRowsFromExcel(file: File): Promise<{
  success: boolean;
  rows?: (string | number)[][];
  error?: string;
  errorDetails?: string;
}> {
  const arrayBuffer = await file.arrayBuffer();

  let workbook;
  try {
    workbook = read(arrayBuffer, { cellDates: false });
  } catch (error) {
    return {
      success: false,
      error: "Invalid Excel file format",
      errorDetails: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      success: false,
      error: "Excel file has no sheets",
    };
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return {
      success: false,
      error: "Could not access the first sheet",
    };
  }

  try {
    const rows = utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];
    return {
      success: true,
      rows,
    };
  } catch (err) {
    return {
      success: false,
      error: "Failed to parse sheet data",
      errorDetails: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function findRequiredColumns(headerRow?: (string | number)[]): {
  success: boolean;
  value?: ColumnIndexes;
  error?: string;
  errorDetails?: string;
} {
  if (!headerRow) {
    return {
      success: false,
      error: "Could not find header row",
    };
  }

  const fechaIndex = headerRow.findIndex(
    (col) => String(col).toUpperCase().trim() === "FECHA"
  );
  const descIndex = headerRow.findIndex(
    (col) => String(col).toUpperCase().trim() === "DESCRIPCIÓN"
  );
  const cargoIndex = headerRow.findIndex(
    (col) => String(col).toUpperCase().trim() === "CARGO"
  );
  const abonoIndex = headerRow.findIndex(
    (col) => String(col).toUpperCase().trim() === "ABONO"
  );

  if (fechaIndex === -1 || descIndex === -1 || cargoIndex === -1 || abonoIndex === -1) {
    return {
      success: false,
      error: "Missing required columns. Expected: FECHA, DESCRIPCIÓN, CARGO, ABONO",
      errorDetails: `Found columns at indices - FECHA: ${fechaIndex}, DESCRIPCIÓN: ${descIndex}, CARGO: ${cargoIndex}, ABONO: ${abonoIndex}`,
    };
  }

  return {
    success: true,
    value: {
      fechaIndex,
      descIndex,
      cargoIndex,
      abonoIndex,
    },
  };
}

function parseRowsToTransactions(
  rows: (string | number)[][],
  columns: ColumnIndexes,
  options: ParseRowsOptions
): ParseResult {
  const transactions: ParsedTransaction[] = [];

  for (let i = options.startRowIndex; i < rows.length; i++) {
    const row = rows[i];

    if (!row || row.length === 0) {
      if (options.stopOnBlankRow) {
        break;
      }
      continue;
    }

    if (isRowBlank(row)) {
      if (options.stopOnBlankRow) {
        break;
      }
      continue;
    }

    const rawDate = row[columns.fechaIndex];
    const description = String(row[columns.descIndex] || "").trim();
    const cargoStr = String(row[columns.cargoIndex] || "").trim();
    const abonoStr = String(row[columns.abonoIndex] || "").trim();

    if (!cargoStr && !abonoStr) {
      continue;
    }

    if (!description) {
      continue;
    }

    const date = parseDateFromBBVA(rawDate);
    if (!date) {
      if (options.skipRowsWithoutDate) {
        continue;
      }
      console.warn(`Could not parse date at row ${i + 1}. Skipping row.`);
      continue;
    }

    let amount = 0;
    let transactionType: BankTransactionType;
    let originalCargo: number | undefined;
    let originalAbono: number | undefined;

    if (cargoStr) {
      const cargoNum = parseAmount(cargoStr);
      if (isNaN(cargoNum)) {
        console.warn(`Could not parse CARGO amount at row ${i + 1}: "${cargoStr}". Skipping row.`);
        continue;
      }
      amount = Math.abs(cargoNum);
      transactionType = BankTransactionType.SPENDING;
      originalCargo = cargoNum;
    } else if (abonoStr) {
      const abonoNum = parseAmount(abonoStr);
      if (isNaN(abonoNum)) {
        console.warn(`Could not parse ABONO amount at row ${i + 1}: "${abonoStr}". Skipping row.`);
        continue;
      }
      amount = Math.abs(abonoNum);
      transactionType = BankTransactionType.INCOME;
      originalAbono = abonoNum;
    } else {
      continue;
    }

    transactions.push({
      date,
      description,
      amount,
      transactionType,
      originalCargo,
      originalAbono,
    });
  }

  if (transactions.length === 0) {
    return {
      success: false,
      error: "No valid transactions found in the Excel file",
    };
  }

  const validationResult = validateParsedTransactions(transactions);
  if (!validationResult.valid) {
    const errorMessages = Array.from(validationResult.errors.entries())
      .map(([index, error]) => `Row ${index + options.startRowIndex + 1}: ${error}`)
      .join("; ");
    return {
      success: false,
      error: "Transaction validation failed",
      errorDetails: errorMessages,
    };
  }

  return {
    success: true,
    transactions,
  };
}

function isRowBlank(row: (string | number)[]): boolean {
  return row.every((cell) => String(cell || "").trim() === "");
}

/**
 * Parse date from BBVA format
 * Tries: dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd, etc.
 */
function parseDateFromBBVA(rawValue: string | number | undefined): Date | null {
  if (typeof rawValue === "number") {
    // Excel serial date to JS date
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsedFromSerial = new Date(excelEpoch.getTime() + rawValue * 24 * 60 * 60 * 1000);
    if (isValidDate(parsedFromSerial)) {
      return parsedFromSerial;
    }
  }

  const dateStr = String(rawValue || "").trim();
  if (!dateStr) return null;

  const formats = ["dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "MM/dd/yyyy"];

  for (const format of formats) {
    const parsed = parseDate(dateStr, format, new Date());
    if (isValidDate(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Parse amount from string, handling comma as decimal separator
 * Examples: "1000.50", "1,000.50", "1.000,50" (European format)
 */
function parseAmount(amountStr: string): number {
  if (!amountStr) return NaN;

  // Remove whitespace
  let cleaned = amountStr.trim();

  // Handle European format (e.g., "1.000,50")
  // If there's a comma and a dot, assume European format
  if (cleaned.includes(",") && cleaned.includes(".")) {
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    if (lastComma > lastDot) {
      // European format: comma is decimal separator, dots are thousands
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // US format: dot is decimal separator, commas are thousands
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (cleaned.includes(",")) {
    // Only comma - could be decimal or thousands separator
    // If less than 4 digits before comma, likely decimal
    const parts = cleaned.split(",");
    if (parts[0]!.length <= 3) {
      // Decimal separator
      cleaned = cleaned.replace(",", ".");
    } else {
      // Thousands separator
      cleaned = cleaned.replace(/,/g, "");
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? NaN : num;
}
