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
  if (arguments.length < 9) {
    throw new Error('Insufficient parameters: 9 parameters are required.');
  }
  if (actual_age >= retirement_age) {
    throw new Error('Actual age must be less than retirement age.');
  }

  let month_contribution = 0;
  let total_acumulated = 0;
  let total_contributed = 0;
  let interest_acumulated = 0;
  let table = [];

  const plan_duration = retirement_age - actual_age;
  const plan_duration_months = plan_duration * 12;
  const retirement_duration_months = retirement_duration * 12;

  const future_retirement_pays = [];
  for (let year = 0; year < retirement_duration; year++) {
    const future_pay = calculateInflation(retirement_pay, inflation_rate, plan_duration+year) * 12;
    future_retirement_pays.push(future_pay);
  }

  const real_interest_rate = ((1 + (interest_rate / 100)) / (1 + (inflation_rate / 100))) - 1;
  const real_interest_rate_month = (1 + real_interest_rate)**(1/12) - 1;

  //total_acumulated = future_retirement_pay * ((1 - (1 + real_interest_rate_month)**-retirement_duration_months) / real_interest_rate_month);
  total_acumulated = future_retirement_pays.reduce((acummulator, currentValue)=> acummulator + currentValue, 0);
  
  month_contribution = ((total_acumulated - initial_amount) * real_interest_rate_month) / ((1 + real_interest_rate_month)**plan_duration_months - 1);

  total_contributed = month_contribution * plan_duration_months;

  interest_acumulated = total_acumulated - total_contributed;

  let years_contributions = [];

  for (let year = 1; year <= plan_duration; year++) {
    const contribution = (((1+(inflation_rate/100))**(year-1))*((total_acumulated*(((interest_rate-inflation_rate)/100))))/(((1+(interest_rate/100))**(plan_duration))-((1+(inflation_rate/100))**(plan_duration-year))));
    years_contributions.push({
      year,
      contribution
    });
  }

  // Generar datos de simulación para la tabla
  let current_acumulated = initial_amount;
  let current_contributed = 0;
  let current_interest = 0;

  for (let month = 1; month <= plan_duration_months; month++) {
    const interest_gained = current_acumulated * real_interest_rate_month;
    current_acumulated += month_contribution + interest_gained;
    let this_month_contribution = years_contributions[Math.floor((month - 1) / 12)].contribution / 12;
    current_contributed += this_month_contribution;
    current_interest += interest_gained;

    table.push({
      month: month % 12 === 0 ? 12 : month % 12, // Mes calculado
      year: Math.floor((actual_age * 12 + month) / 12), // Año calculado
      contribution: this_month_contribution,
      total_contributed: current_contributed,
      interest_gained,
      total_interest: current_interest,
      total_acumulated: current_acumulated
    });
  }

  return {
    years_contributions,
    total_acumulated,
    total_contributed,
    interest_acumulated,
    table
  };
}

export function calculateInflation(amount: number, inflation_rate: number, years: number) {
    const calculated_amount = amount * (1 + (inflation_rate / 100)) ** years;
    return calculated_amount;
}