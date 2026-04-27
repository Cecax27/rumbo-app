import { NextRequest, NextResponse } from "next/server";
import { BankTransactionType } from "@repo/bbva-parser";
import { addTransaction, addIncome } from "@repo/supabase/transactions";

interface ImportRequest {
  transactions: Array<{
    date: Date | string;
    amount: number;
    description: string;
    transactionType: "spending" | "income";
    categoryId?: number;
  }>;
  accountId: string;
}

interface ImportResponse {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    index: number;
    transaction: ImportRequest["transactions"][0];
    error: string;
  }>;
}

export async function POST(request: NextRequest): Promise<NextResponse<ImportResponse>> {
  try {
    const body = (await request.json()) as ImportRequest;

    const { transactions, accountId } = body;

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          imported: 0,
          skipped: 0,
          errors: [
            {
              index: -1,
              transaction: {} as ImportRequest["transactions"][0],
              error: "No transactions provided",
            },
          ],
        },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          imported: 0,
          skipped: 0,
          errors: [
            {
              index: -1,
              transaction: {} as ImportRequest["transactions"][0],
              error: "Account ID is required",
            },
          ],
        },
        { status: 400 }
      );
    }

    const accountIdNum = parseInt(accountId, 10);
    if (isNaN(accountIdNum)) {
      return NextResponse.json(
        {
          success: false,
          imported: 0,
          skipped: 0,
          errors: [
            {
              index: -1,
              transaction: {} as ImportRequest["transactions"][0],
              error: "Invalid account ID format",
            },
          ],
        },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: ImportResponse["errors"] = [];

    // Process transactions one by one
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];

      try {
        // Validate transaction
        if (!tx.description || tx.description.trim() === "") {
          errors.push({
            index: i,
            transaction: tx,
            error: "Transaction description is empty",
          });
          skipped++;
          continue;
        }

        if (tx.amount <= 0) {
          errors.push({
            index: i,
            transaction: tx,
            error: "Transaction amount must be greater than 0",
          });
          skipped++;
          continue;
        }

        // Parse date if it's a string
        let txDate: Date;
        if (typeof tx.date === "string") {
          txDate = new Date(tx.date);
          if (isNaN(txDate.getTime())) {
            errors.push({
              index: i,
              transaction: tx,
              error: `Invalid date format: ${tx.date}`,
            });
            skipped++;
            continue;
          }
        } else {
          txDate = tx.date;
        }

        // Insert based on transaction type
        if (tx.transactionType === BankTransactionType.SPENDING) {
          const categoryId = tx.categoryId || 7; // Default to "Otros Gastos"
          await addTransaction({
            date: txDate,
            amount: tx.amount,
            description: tx.description,
            category_id: categoryId,
            account_id: accountIdNum,
          });
        } else if (tx.transactionType === BankTransactionType.INCOME) {
          await addIncome({
            date: txDate,
            amount: tx.amount,
            description: tx.description,
            account_id: accountIdNum,
          });
        } else {
          errors.push({
            index: i,
            transaction: tx,
            error: `Unknown transaction type: ${tx.transactionType}`,
          });
          skipped++;
          continue;
        }

        imported++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        errors.push({
          index: i,
          transaction: tx,
          error: errorMessage,
        });
        skipped++;
      }
    }

    return NextResponse.json(
      {
        success: errors.length === 0,
        imported,
        skipped,
        errors,
      },
      { status: errors.length === 0 ? 200 : 207 } // 207 Partial Content if some failed
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in import-transactions API:", err);

    return NextResponse.json(
      {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [
          {
            index: -1,
            transaction: {} as ImportRequest["transactions"][0],
            error: `Server error: ${errorMessage}`,
          },
        ],
      },
      { status: 500 }
    );
  }
}
