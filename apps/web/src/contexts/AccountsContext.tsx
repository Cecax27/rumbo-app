"use client";

import { createContext, useEffect, useState } from "react";
import { getAccounts, Account } from "@repo/supabase/accounts";

export interface AccountsContextType {
  accounts: Account[];
  fetchAccounts: () => void;
}

export const AccountsContext = createContext<AccountsContextType>(
    {} as AccountsContextType
);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <AccountsContext.Provider value={{ accounts, fetchAccounts }}>
      {children}
    </AccountsContext.Provider>
  );
}