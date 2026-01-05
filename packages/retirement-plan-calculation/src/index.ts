export function calculateRetirementPlan(
    actual_age: number,
    retirement_age: number,
    retirement_duration: number,
    retirement_pay: number,
    initial_amount: number,
    interest_rate: number,
    inflation_rate: number,
    min_variation_interest: number,
    max_variation_interest: number
) {
  let month_contribution = 0
  let total_acumulated = 0
  let total_contributed = 0
  let interest_acumulated = 0
  let table = []

  const plan_duration = retirement_age - actual_age;
  const plan_duration_months = plan_duration * 12;
  const retirement_duration_months = retirement_duration * 12;

  const future_retirement_pay = calculateInflation(retirement_pay, inflation_rate, plan_duration);

  const real_interest_rate = ((1 + interest_rate / 100) / (1 + inflation_rate / 100)) - 1
  const real_interest_rate_month = (1 + real_interest_rate)**(1/12) - 1

  total_acumulated = future_retirement_pay * ((1 - (1 + real_interest_rate_month)**-retirement_duration_months) / real_interest_rate_month)

  month_contribution = (total_acumulated - initial_amount) * real_interest_rate_month / ((1 + real_interest_rate_month)**plan_duration_months - 1)

  total_contributed = month_contribution * retirement_duration_months

  interest_acumulated = total_acumulated - total_contributed

  return {
    month_contribution,
    total_acumulated,
    total_contributed,
    interest_acumulated,
    table
  }
}

export function calculateInflation(amount: number, inflation_rate: number, years: number){
    const calculated_amount = amount * (1 + inflation_rate / 100) ** years
    return calculated_amount
}