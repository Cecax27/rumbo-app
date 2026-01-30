import { supabase } from "./client";

export interface RetirementPlan {
  id: string;
  name: string;
  account_id: number;
  actual_age: number;
  retirement_age: number;
  retirement_duration: number;
  retirement_pay: number;
  initial_amount: number;
  interest_rate: number;
  inflation_rate: number;
  min_variation_interest: number;
  max_variation_interest: number;
  created_at: string;
  updated_at?: string;
}

interface RetirementPlanDetails {
  monthly_contribution: number;
  total_contributions: number;
  total_accumulated: number;
  years_until_retirement: number;
}

export type RetirementPlanWithDetails = RetirementPlan & RetirementPlanDetails;

// Creates a retirement plan and returns its created ID (or data depending on RPC)
export const createRetirementPlans = async ({
    name,
    account_id,
    actual_age,
    retirement_age,
    retirement_duration,
    retirement_pay,
    initial_amount,
    interest_rate,
    inflation_rate,
    min_variation_interest,
    max_variation_interest
}: {
    name: string;
    account_id: number;
    actual_age: number,
    retirement_age: number,
    retirement_duration: number,
    retirement_pay: number,
    initial_amount: number,
    interest_rate: number,
    inflation_rate: number,
    min_variation_interest: number,
    max_variation_interest: number
}) => {
  const { data, error } = await supabase
    .from("retirement_plans")
    .insert([
      {
        name,
        account_id,
        actual_age,
        retirement_age,
        retirement_duration,
        retirement_pay,
        initial_amount,
        interest_rate,
        inflation_rate,
        min_variation_interest,
        max_variation_interest
      },
    ])
    .select("id")
    .single();
  if (error) {
    console.error(error);
    return error;
  }
  return data.id;
};

// Returns details including contribution, totals and params for a specific retirement plan
export const getRetirementPlan = async (plan_id: number) => {
  const { data, error } = await supabase.rpc("get_retirement_plan", {
    p_plan_id: plan_id,
  });
  if (error) return error;
  return data;
};

// Updates a retirement plan
export const updateRetirementPlan = async ({
  id,
  name,
  account_id,
  actual_age,
  retirement_age,
  retirement_duration,
  retirement_pay,
  initial_amount,
  interest_rate,
  inflation_rate,
  min_variation_interest,
  max_variation_interest
}: {
  id: number;
  name: string;
  account_id: number;
  actual_age: number;
  retirement_age: number;
  retirement_duration: number;
  retirement_pay: number;
  initial_amount: number;
  interest_rate: number;
  inflation_rate: number;
  min_variation_interest: number;
  max_variation_interest: number;
}) => {
  const { data, error } = await supabase.rpc("update_retirement_plan", {
    p_plan_id: id,
    p_name: name,
    p_account_id: account_id,
    p_actual_age: actual_age,
    p_retirement_age: retirement_age,
    p_retirement_duration: retirement_duration,
    p_retirement_pay: retirement_pay,
    p_initial_amount: initial_amount,
    p_interest_rate: interest_rate,
    p_inflation_rate: inflation_rate,
    p_min_variation_interest: min_variation_interest,
    p_max_variation_interest: max_variation_interest,
  });
  if (error) return error;
  return data ?? true;
};

// Returns all retirement plans
export const getRetirementPlans = async (): Promise<RetirementPlan[]> => {
  const { data, error } = await supabase
    .from("retirement_plans")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    throw error;
  }
  return (data as RetirementPlan[]) || [];
};

