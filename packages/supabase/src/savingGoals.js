import { supabase } from './client'

// Creates a saving goal and returns its created ID (or data depending on RPC)
export const createSavingGoal = async ({ name, account_id, goalAmount, rangeType, range, annualInterestRate, initialAmount }) => {
  const { data, error } = await supabase
    .from('saving_goals')
    .insert([{
    name,
    account_id,
    goal_amount: goalAmount,
    range_type: rangeType,
    range,
    annual_interest_rate: annualInterestRate,
    initial_amount: initialAmount,
  }])
    .select('id')
    .single()
  if (error) {
    console.error(error)
    return error
  }
  return data.id
}

// Returns details including contribution, totals and params
export const getSavingGoal = async (goal_id) => {
  const { data, error } = await supabase.rpc('get_saving_goal', { p_goal_id: goal_id })
  if (error) return error
  return data
}

export const updateSavingGoal = async ({ id, name, account_id, goalAmount, rangeType, range, annualInterestRate, initialAmount }) => {
  const { data, error } = await supabase.rpc('update_saving_goal', {
    p_goal_id: id,
    p_name: name,
    p_account_id: account_id,
    p_goal_amount: goalAmount,
    p_range_type: rangeType,
    p_range: range,
    p_annual_interest_rate: annualInterestRate,
    p_initial_amount: initialAmount,
  })
  if (error) return error
  return data ?? true
}

export const getSavingGoals = async () => {
  const { data, error } = await supabase
    .from('saving_goals')
    .select('*')
    .order('id', { ascending: false })
  if (error) return error
  return data || []
}
