import { useState, useEffect } from "react";
import {
  getAccount,
  Account,
  getBalanceByAccount,
  getSpendingsByCategories,
} from "@repo/supabase/accounts";
import { CATEGORIES } from "@repo/app-constants";

// Define el tipo de categoría basado en los valores de CATEGORIES
export type Category = (typeof CATEGORIES)[number];
export type spendingsByCategories = {
  category: Category;
  icon: string;
  amount: number;
}[];

export function useAccount(accountId: number | null) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [spendingsByCategories, setSpendingsByCategories] =
    useState<spendingsByCategories>([]);
  const [dataRangeForSpendings, setDataRangeForSpendings] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // first of actual month
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // end of actual month
  });

  useEffect(() => {
    const fetchSpendingsByCategories = async () => {
      if (!accountId) return;

      const data = await getSpendingsByCategories(
        accountId,
        dataRangeForSpendings.startDate,
        dataRangeForSpendings.endDate
      );

      setSpendingsByCategories(data ?? []);
    };

    fetchSpendingsByCategories();
  }, [dataRangeForSpendings, accountId]);

  useEffect(() => {
    if (!accountId) return;

    setLoading(true);
    setError(null);

    getAccount(accountId)
      .then((data) => {
        setAccount(data);
        return getBalanceByAccount(accountId);
      })
      .then((balance) => {
        setBalance(balance.balance);
      })
      .catch((err) => {
        console.error("Error fetching account:", err);
        setError("Error al obtener los datos de la cuenta.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accountId]);

  return { account, balance, loading, error, spendingsByCategories, setDataRangeForSpendings, dataRangeForSpendings};
}
