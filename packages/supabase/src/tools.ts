import { supabase } from "./client";

interface BudgetPlanGroup {
  group_name: string;
  limit_percentage: number;
  alert_threshold: number;
}

export interface BudgetPlanGroupDetails {
  id: string;
  name: string;
  real_amount: number;
  real_percentage: number;
  target_amount: number;
}

export interface BudgetPlan {
  id: string;
  name: string;
  period_type: string;
  period_length_days: number;
  groups: BudgetPlanGroup[];
}

interface BudgetPlanDetails {
  end_date: string;
  start_date: string;
  total_incomes: number;
  groups: BudgetPlanGroupDetails[];
}

export type BudgetPlanWithDetails = BudgetPlan & BudgetPlanDetails;

export async function addBudget({
  name,
  period_type,
  period_length_days = null,
  plan_groups,
}: {
  name: string;
  period_type: string;
  period_length_days?: number | null;
  plan_groups: {
    essentials: BudgetPlanGroup;
    discretionary: BudgetPlanGroup;
    savings: BudgetPlanGroup;
  };
}) {
  const transformed_plan_groups = plan_groups;
  if (transformed_plan_groups.essentials?.limit_percentage > 1) {
    transformed_plan_groups.essentials.limit_percentage =
      transformed_plan_groups.essentials.limit_percentage / 100;
    transformed_plan_groups.essentials.alert_threshold =
      transformed_plan_groups.essentials.alert_threshold / 100;
  }
  if (transformed_plan_groups.discretionary?.limit_percentage > 1) {
    transformed_plan_groups.discretionary.limit_percentage =
      transformed_plan_groups.discretionary.limit_percentage / 100;
    transformed_plan_groups.discretionary.alert_threshold =
      transformed_plan_groups.discretionary.alert_threshold / 100;
  }
  if (transformed_plan_groups.savings?.limit_percentage > 1) {
    transformed_plan_groups.savings.limit_percentage =
      transformed_plan_groups.savings.limit_percentage / 100;
    transformed_plan_groups.savings.alert_threshold =
      transformed_plan_groups.savings.alert_threshold / 100;
  }

  const { data, error } = await supabase.rpc("create_budget_plan", {
    p_name: name,
    p_period_type: period_type,
    p_period_length_days: period_length_days,
    p_plan_groups: transformed_plan_groups,
  });

  if (error) {
    return error;
  }
  return data;
}

export async function updateBudget({
  id,
  name,
  period_type,
  period_length_days = null,
  plan_groups,
}: {
  id: string;
  name: string;
  period_type: string;
  period_length_days?: number | null;
  plan_groups: {
    essentials: BudgetPlanGroup;
    discretionary: BudgetPlanGroup;
    savings: BudgetPlanGroup;
  };
}) {
  const transformed_plan_groups = plan_groups;
  if (transformed_plan_groups.essentials?.limit_percentage > 1) {
    transformed_plan_groups.essentials.limit_percentage =
      transformed_plan_groups.essentials.limit_percentage / 100;
    transformed_plan_groups.essentials.alert_threshold =
      transformed_plan_groups.essentials.alert_threshold / 100;
  }
  if (transformed_plan_groups.discretionary?.limit_percentage > 1) {
    transformed_plan_groups.discretionary.limit_percentage =
      transformed_plan_groups.discretionary.limit_percentage / 100;
    transformed_plan_groups.discretionary.alert_threshold =
      transformed_plan_groups.discretionary.alert_threshold / 100;
  }
  if (transformed_plan_groups.savings?.limit_percentage > 1) {
    transformed_plan_groups.savings.limit_percentage =
      transformed_plan_groups.savings.limit_percentage / 100;
    transformed_plan_groups.savings.alert_threshold =
      transformed_plan_groups.savings.alert_threshold / 100;
  }

  let { error } = await supabase
    .from("budget_plans")
    .update({ name, period_type, period_length_days })
    .eq("id", id);
  if (error) {
    return error;
  }
  ({ error } = await supabase.rpc("update_budget_plan_groups", {
    p_plan_id: id,
    p_plan_groups: transformed_plan_groups,
  }));
  if (error) {
    return error;
  }
  return true;
}

export async function deleteBudget(id: string) {
  const { error } = await supabase.from("budget_plans").delete().eq("id", id);
  if (error) {
    return error;
  }
  return true;
}

export async function getBudgetPlans(): Promise<BudgetPlan[]> {
  const { data, error } = await supabase.rpc("get_user_budget_plans");
  if (error) {
    throw error;
  } else {
    return data;
  }
}

export async function getUserBudgetPlans(): Promise<BudgetPlanWithDetails[]> {
  const { data, error } = await supabase.rpc("get_user_budget_plans");
  if (error) {
    throw error;
  } else {
    const promises = (data as BudgetPlan[]).map((budget) => {
      const nowDate = new Date().toISOString().split("T");
      return getBudgetPlanDetails(budget.id, nowDate[0] as string);
    });
    return await Promise.all(promises);
  }
}

export async function getBudgetPlanDetails(
  id: string,
  reference_date: string
): Promise<BudgetPlanWithDetails> {
  const { data, error } = await supabase.rpc("get_budget_plan", {
    p_plan_id: id,
    p_reference_date: reference_date,
  });
  if (error) {
    throw error;
  } else {
    return data;
  }
}

export async function getBudgetGroups() {
  const { data, error } = await supabase.from("budget_groups").select("*");
  if (error) {
    return error;
  } else {
    return data;
  }
}
