"use client";

import { createContext, useState, useEffect, useContext } from "react";
import {
  getBudgetPlans,
  getBudgetPlanDetails,
  BudgetPlanWithDetails,
  BudgetPlan,
  getUserBudgetPlans,
} from "@repo/supabase/tools";

type BudgetPlanResponse = BudgetPlan[] | BudgetPlanWithDetails[];

export interface ToolsContextType {
  budgetPlans: BudgetPlanResponse;
  loading: boolean;
}

const ToolsContext = createContext<ToolsContextType>({
  budgetPlans: [],
  loading: true,
});

export function ToolsProvider({ children }: { children: React.ReactNode }) {
  const [budgetPlans, setBudgetPlans] = useState<
    BudgetPlan[] | BudgetPlanWithDetails[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getUserBudgetPlans()
      .then((plans) => {
        setBudgetPlans(plans);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ToolsContext.Provider value={{ budgetPlans, loading }}>
      {children}
    </ToolsContext.Provider>
  );
}

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error("useTools must be used within a ToolsProvider");
  }
  return context;
};