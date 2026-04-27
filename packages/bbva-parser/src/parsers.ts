import { read, utils } from "xlsx";
import { parse as parseDate, isValid as isValidDate } from "date-fns";
import { BankTransactionType, ParsedTransaction, ParseResult } from "./types";
import { validateParsedTransactions } from "./validators";

/**
 * Parse a BBVA Excel file and extract transactions
 *
 * File structure:
 * - First 3 rows are header/metadata (skipped)
 * - Row 4 contains column names: FECHA, DESCRIPCIÓN, CARGO, ABONO, SALDO
 * - Rows 5+ contain transaction data
 *
 * @param file - Excel file (xlsx format)
 * @returns ParseResult with transactions or error
 */
export async function parseBBVAFile(file: File): Promise<ParseResult> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse workbook
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

    // Get first sheet
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

    // Convert sheet to array of arrays using utils
    let rows: (string | number)[][] = [];
    try {
      rows = utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];
    } catch (err) {
      return {
        success: false,
        error: "Failed to parse sheet data",
        errorDetails: err instanceof Error ? err.message : "Unknown error",
      };
    }

    if (!rows || rows.length < 5) {
      return {
        success: false,
        error: "Excel file does not have sufficient data. Expected at least 5 rows (3 header + 1 column names + 1 data row)",
      };
    }

    // Row at index 3 (0-indexed) contains column headers
    const headerRow = rows[3];
    if (!headerRow) {
      return {
        success: false,
        error: "Could not find header row at row 4",
      };
    }

    // Find column indices
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

    // Validate that we found all required columns
    if (
      fechaIndex === -1 ||
      descIndex === -1 ||
      cargoIndex === -1 ||
      abonoIndex === -1
    ) {
      return {
        success: false,
        error: "Missing required columns. Expected: FECHA, DESCRIPCIÓN, CARGO, ABONO",
        errorDetails: `Found columns at indices - FECHA: ${fechaIndex}, DESCRIPCIÓN: ${descIndex}, CARGO: ${cargoIndex}, ABONO: ${abonoIndex}`,
      };
    }

    // Parse transaction rows (starting from row 5, index 4)
    const transactions: ParsedTransaction[] = [];

    for (let i = 4; i < rows.length; i++) {
      const row = rows[i];

      if (!row || row.length === 0) {
        continue;
      }

      const fechaStr = String(row[fechaIndex] || "").trim();
      const description = String(row[descIndex] || "").trim();
      const cargoStr = String(row[cargoIndex] || "").trim();
      const abonoStr = String(row[abonoIndex] || "").trim();

      if (!cargoStr && !abonoStr) {
        continue;
      }

      if (!description) {
        continue;
      }

      const date = parseDateFromBBVA(fechaStr);
      if (!date) {
        console.warn(
          `Could not parse date at row ${i + 1}: "${fechaStr}". Skipping row.`
        );
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
        .map(([index, error]) => `Row ${index + 5}: ${error}`)
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
  } catch (error) {
    return {
      success: false,
      error: "Unexpected error while parsing file",
      errorDetails: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Parse date from BBVA format
 * Tries: dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd, etc.
 */
function parseDateFromBBVA(dateStr: string): Date | null {
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
