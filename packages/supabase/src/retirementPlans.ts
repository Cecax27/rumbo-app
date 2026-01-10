import { supabase } from "./client";

// Creates a saving goal and returns its created ID (or data depending on RPC)
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