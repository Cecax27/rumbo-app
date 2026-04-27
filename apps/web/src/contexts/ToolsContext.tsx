"use client";

import { createContext, useState, useEffect, useContext } from "react";
import {
  getBudgetPlans,
  getBudgetPlanDetails,
  BudgetPlanWithDetails,
  BudgetPlan,
  getUserBudgetPlans,
} from "@repo/supabase/tools";
import {
  getRetirementPlans,
  RetirementPlan,
  RetirementPlanWithDetails,
} from "@repo/supabase/retirementPlans";

type BudgetPlanResponse = BudgetPlan[] | BudgetPlanWithDetails[];

type RetirementPlanResponse = RetirementPlan[] | RetirementPlanWithDetails[];

export interface ToolsContextType {
  budgetPlans: BudgetPlanResponse;
  retirementPlans: RetirementPlanResponse;
  loading: boolean;
}

const ToolsContext = createContext<ToolsContextType>({
  budgetPlans: [],
  retirementPlans: [],
  loading: true,
});

export function ToolsProvider({ children }: { children: React.ReactNode }) {
  const [budgetPlans, setBudgetPlans] = useState<
    BudgetPlan[] | BudgetPlanWithDetails[]
  >([]);
  const [retirementPlans, setRetirementPlans] = useState<
    RetirementPlan[] | RetirementPlanWithDetails[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      getUserBudgetPlans(),
      getRetirementPlans()
    ])
      .then(([budgetPlansData, retirementPlansData]) => {
        setBudgetPlans(budgetPlansData);
        setRetirementPlans(retirementPlansData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ToolsContext.Provider value={{ budgetPlans, retirementPlans, loading }}>
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