import { createContext, useState } from "react";

export const TransactionsFiltersContext = createContext()

export function TransactionsFiltersProvider({ children }){
    const [filter, setFilter] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        account: null,
        category: null,
        budget_group: null
      });

    return (
        <TransactionsFiltersContext.Provider
        value={{
            filter,
            setFilter
        }}>
            { children }
        </TransactionsFiltersContext.Provider>
    )
}