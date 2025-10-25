"use client";

import { createContext, useEffect, useState, useRef } from "react";
import { getSpendingsTable, Transaction, TransactionWithDetails } from "@shared/supabase/transactions";
import i18n from "i18next";

function filterData(
  data: TransactionWithDetails[],
  start_date: Date,
  end_date: Date,
  account: number | null,
  category: number | null,
  budget_group: number | null
) {
  const startStr = start_date.toISOString().slice(0, 10); // "yyyy-mm-dd"
  const endStr = end_date.toISOString().slice(0, 10);

  const filteredData = data.filter((value) => {
    return (
      value.date >= startStr &&
      value.date <= endStr &&
      (account ? value.account_id === account : true) &&
      (category ? value.category_id === category : true) &&
      (budget_group ? value.budget_group_id === budget_group : true)
    );
  });

  return filteredData;
}

interface Filter{
    start_date: Date;
    end_date: Date;
    account: number | null;
    category: number | null;
    budget_group: number | null;
}

interface GroupedData {
    date: string;
    originalDate: string;
    transactions: Transaction[];
}

export interface TransactionsContextType {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  groupedData: GroupedData[];
  data: TransactionWithDetails[];
  fetchTransactions: () => void;
}

export const TransactionsContext = createContext<TransactionsContextType>(
    {} as TransactionsContextType
);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<Filter>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    account: null,
    category: null,
    budget_group: null,
  });
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [data, setData] = useState<TransactionWithDetails[]>([]);
  const prevStartDate = useRef(new Date());
  const prevEndDate = useRef(new Date);

  useEffect(() => {
    const startChanged =
      prevStartDate.current && prevStartDate.current > filter.start_date;
    const endChanged =
      prevEndDate.current && prevEndDate.current < filter.end_date;

    if (startChanged || endChanged) {
      fetchTransactions();
      prevStartDate.current = filter.start_date;
      prevEndDate.current = filter.end_date;
    }
  }, [filter.start_date, filter.end_date]);

  useEffect(() => {
    const filteredData = filterData(
      data,
      filter.start_date,
      filter.end_date,
      filter.account,
      filter.category,
      filter.budget_group
    );

    const grouped = filteredData.reduce((acc : Record<string, Transaction[]>, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});

    const groupedArray = Object.entries(grouped).map(
      ([date, transactions]) => ({
        date: new Date(date).toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        }),
        originalDate: date,
        transactions,
      })
    );

    const sortedArray = groupedArray.sort((a, b) => {
      return new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime();
    });

    // sortedArray.forEach((group) => {
    //   if (group.deferred_id) group.transaction_type = "deferred";
    // });

    setGroupedData(sortedArray);
  }, [data, filter]);

  const fetchTransactions = () => {
    let start_date = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    );
    start_date =
      start_date < filter.start_date ? start_date : filter.start_date;

    let end_date = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1
    );
    end_date = end_date > filter.end_date ? end_date : filter.end_date;

    getSpendingsTable(start_date, end_date).then((transactions) => {
      setData(transactions);
    });
  };

  return (
    <TransactionsContext.Provider
      value={{
        filter,
        setFilter,
        groupedData,
        data,
        fetchTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}
