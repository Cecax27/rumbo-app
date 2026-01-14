interface RetirementPlanResult {
  years_contributions: Array<{ year: number; contribution: number }>;
  total_acumulated: number;
  total_contributed: number;
  interest_acumulated: number;
  table: Array<{
    month: number;
    year: number;
    contribution: number;
    total_contributed: number;
    interest_gained: number;
    total_interest: number;
    total_acumulated: number;
  }>;
}

interface RetirementPlanVariants {
  normal: RetirementPlanResult;
  min: RetirementPlanResult;
  max: RetirementPlanResult;
}

function calculateFutureRetirementPays(
  retirement_pay: number,
  inflation_rate: number,
  plan_duration: number,
  retirement_duration: number
): number[] {
  const future_retirement_pays = [];
  for (let year = 0; year < retirement_duration; year++) {
    const future_pay = calculateInflation(retirement_pay, inflation_rate, plan_duration + year) * 12;
    future_retirement_pays.push(future_pay);
  }
  return future_retirement_pays;
}

function calculateYearlyContributions(
  plan_duration: number,
  total_acumulated: number,
  interest_rate: number,
  inflation_rate: number
): Array<{ year: number; contribution: number }> {
  const years_contributions = [];
  
  for (let year = 1; year <= plan_duration; year++) {
    const contribution = (((1 + (inflation_rate / 100)) ** (year - 1)) * 
      ((total_acumulated * (((interest_rate - inflation_rate) / 100)))) / 
      (((1 + (interest_rate / 100)) ** plan_duration) - 
      ((1 + (inflation_rate / 100)) ** (plan_duration - year))));
    years_contributions.push({
      year,
      contribution
    });
  }
  
  return years_contributions;
}

function generateSimulationTable(
  plan_duration_months: number,
  initial_amount: number,
  month_contribution: number,
  real_interest_rate_month: number,
  years_contributions: Array<{ year: number; contribution: number }>,
  actual_age: number
) {
  const table = [];
  let current_acumulated = initial_amount;
  let current_contributed = 0;
  let current_interest = 0;

  for (let month = 1; month <= plan_duration_months; month++) {
    const interest_gained = current_acumulated * real_interest_rate_month;
    current_acumulated += month_contribution + interest_gained;
    const this_month_contribution = years_contributions[Math.floor((month - 1) / 12)].contribution / 12;
    current_contributed += this_month_contribution;
    current_interest += interest_gained;

    table.push({
      month: month % 12 === 0 ? 12 : month % 12,
      year: Math.floor((actual_age * 12 + month) / 12),
      contribution: this_month_contribution,
      total_contributed: current_contributed,
      interest_gained,
      total_interest: current_interest,
      total_acumulated: current_acumulated
    });
  }

  return table;
}

function calculateSinglePlan(
  actual_age: number,
  retirement_age: number,
  retirement_duration: number,
  retirement_pay: number,
  initial_amount: number,
  interest_rate: number,
  inflation_rate: number
): RetirementPlanResult {
  const plan_duration = retirement_age - actual_age;
  const plan_duration_months = plan_duration * 12;
  const retirement_duration_months = retirement_duration * 12;

  const future_retirement_pays = calculateFutureRetirementPays(
    retirement_pay,
    inflation_rate,
    plan_duration,
    retirement_duration
  );

  const real_interest_rate = ((1 + (interest_rate / 100)) / (1 + (inflation_rate / 100))) - 1;
  const real_interest_rate_month = (1 + real_interest_rate) ** (1 / 12) - 1;

  const total_acumulated = future_retirement_pays.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

  const month_contribution =
    ((total_acumulated - initial_amount) * real_interest_rate_month) /
    ((1 + real_interest_rate_month) ** plan_duration_months - 1);

  const total_contributed = month_contribution * plan_duration_months;
  const interest_acumulated = total_acumulated - total_contributed;

  const years_contributions = calculateYearlyContributions(
    plan_duration,
    total_acumulated,
    interest_rate,
    inflation_rate
  );

  const table = generateSimulationTable(
    plan_duration_months,
    initial_amount,
    month_contribution,
    real_interest_rate_month,
    years_contributions,
    actual_age
  );

  return {
    years_contributions,
    total_acumulated,
    total_contributed,
    interest_acumulated,
    table
  };
}

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
): RetirementPlanVariants {
  if (arguments.length < 9) {
    throw new Error('Insufficient parameters: 9 parameters are required.');
  }
  if (actual_age >= retirement_age) {
    throw new Error('Actual age must be less than retirement age.');
  }

  const normal = calculateSinglePlan(
    actual_age,
    retirement_age,
    retirement_duration,
    retirement_pay,
    initial_amount,
    interest_rate,
    inflation_rate
  );

  const min = calculateSinglePlan(
    actual_age,
    retirement_age,
    retirement_duration,
    retirement_pay,
    initial_amount,
    interest_rate + min_variation_interest,
    inflation_rate
  );

  const max = calculateSinglePlan(
    actual_age,
    retirement_age,
    retirement_duration,
    retirement_pay,
    initial_amount,
    interest_rate + max_variation_interest,
    inflation_rate
  );

  return {
    normal,
    min,
    max
  };
}

export function calculateInflation(amount: number, inflation_rate: number, years: number) {
    const calculated_amount = amount * (1 + (inflation_rate / 100)) ** years;
    return calculated_amount;
}