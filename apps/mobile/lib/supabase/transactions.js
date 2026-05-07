import { supabase } from './client'
import { DatabaseError } from '../errors';

export const addTransaction = async ({date, amount, description, category_id, account_id}) => {
  const { error } = await supabase
    .from('spendings')
    .insert([{
      date,
      amount, 
      description,
      category_id,
      account_id
    }])
    .select();

  if (error) {
    console.error('Error adding transaction to supabase:', error);
    return error
  } 
  return true
};

export const addIncome = async ({date, amount, description, account_id}) => {
  const { error } = await supabase
    .from('incomes')
    .insert([{
      date,
      amount,
      description,
      account_id
    }])
    .select();

    if (error) {
      console.error('Error adding income to supabase:', error);
      return error;
    }
    return true
  }

export const addTransfer = async ({date, amount, description, from_account_id, to_account_id}) => {
  const { error } = await supabase
    .from('transfers')
    .insert([{
      date,
      amount,
      description,
      from_account_id,
      to_account_id
    }])
    .select();

    if (error) {
      console.error('Error adding transfer to supabase:', error);
      return error;
    } else {
      return true
    }
  }

export const addDeferred = async ({date, amount, description, account_id, category_id, months}) => {
  const { error } = await supabase
    .from('deferred_spendings')
    .insert([{
      start_date: date,
      total_amount: amount,
      description,
      account_id,
      category_id,
      months
    }])
    .select();

    if (error) {
      return error;
    } else {
      return true
    }
  }

export const updateTransaction = async (transaction_id, type, params ) => {
  let table = ''
  if (type==='spending') table = 'spendings'
  else if (type==='income') table = 'incomes'
  else if (type==='transfer') table = 'transfers'
  else if (type==='deferred') table = 'deferred_spendings'
  else return Error('Invalid transaction type');

  const {data, error} = await supabase
    .from(table)
    .update(params)
    .eq('id', transaction_id)
    
  if (error) {
    console.error('Error al actualizar transaccion:', error);
    return error
  } else {
    return true
  }
}

export const getTransaction = async (transaction_id, type) => {
  const table = type==='spending' ? 'spendings' : type==='income' ? 'incomes' : 'transfers';
  let data, error;
  if (type === 'spending') {
    ({ data, error } = await supabase
      .from(table)
      .select('*, deferred_spendings(months, total_amount)')
      .eq('id', transaction_id)
      .single());
      data.months = data.deferred_spendings ? data.deferred_spendings.months : null;
      if (data.deferred_spendings) data.amount = data.deferred_spendings.total_amount;
      delete data.deferred_spendings;
  } else {
    ({ data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', transaction_id)
      .single());
  }

  if (error) {
    console.error(`Error fetching ${type}:`, error);
    throw error;
  }
  return data;
}

export const deleteTransaction = async (transaction_id, type) => {

  let table = ''
  if (type==='spending') table = 'spendings'
  else if (type==='income') table = 'incomes'
  else if (type==='transfer') table = 'transfers'
  else if (type==='deferred') table = 'deferred_spendings'
  else return Error('Invalid transaction type');

  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', transaction_id)

  if (error) {
    return error
  }
  return true;
}

export const getMonthlyBalance = async (month = null) => {
  const { data, error } = await supabase.rpc('get_monthly_balance', {
    p_month: month // o puedes omitirlo si tienes default en la función
  })
  return { data, error }
}

export const getMonthlyIncomes = async (month = null) => {
  const { data, error } = await supabase.rpc('get_monthly_incomes', {
    p_month: month // o puedes omitirlo si tienes default en la función
  })
  return { data, error }
}

export const getMonthlySpendings = async (month = null) => {
    const { data, error } = await supabase.rpc('get_monthly_spendings', {
      p_month: month // o puedes omitirlo si tienes default en la función
    })
    return { data, error }
  }

export const getSpendingsTable = async (
  start_date = null,
  end_date = null,
  account = null,
  category = null,
  budget_group = null
) => {
  const { data, error } = await supabase
  .rpc('get_filtered_spendings', {
    date_start_range: start_date,
    date_end_range: end_date,
    account: account,
    category: category,
    p_budget_group: budget_group
  });

if (error) {
  console.error('Error al obtenfer gastos:', error);
} else {
  return data
}
}

export const addAccount = async (params) => {
  console.log(params)
  if (params.account_type === 1 || params.account_type === 3){
    const { data, error } = await supabase.from('accounts').insert([
      {
        name: params.name,
        account_type: params.account_type,
        color: params.color,
        icon: params.icon,
        bank_name: params.bank_name,
        is_primary_account: params.is_primary_account,
      }
    ]);
    if (error) {
      console.error('Error al agregar cuenta de debito:', error);
      return false
    } else {
      console.log('Cuenta agregada exitosamente:', data);
      return true
    }
  } else if (params.account_type === 2) {
    const { data, error } = await supabase.from('accounts').insert([
      {
        name: params.name,
        account_type: params.account_type,
        color: params.color,
        icon: params.icon,
        bank_name: params.bank_name,
        is_primary_account: params.is_primary_account,
        cutt_off_day: params.cutoff_day,
        credit_limit: params.credit_limit
      }
    ]);
    if (error) {
      console.error('Error al agregar cuenta de credito:', error);
      return false
    } else {
      console.log('Cuenta agregada exitosamente:', data);
      return true
    }
  } else if (params.account_type === 4){
    const { data, error } = await supabase.from('accounts').insert([
      {
        name: params.name,
        account_type: params.account_type,
        color: params.color,
        icon: params.icon,
        bank_name: params.bank_name,
        is_primary_account: params.is_primary_account,
        platform: params.platform,
        initial_amount: params.initial_amount,
        estimated_return_rate: params.estimated_return_rate
      }
    ]);
    if (error) {
      console.error('Error al agregar cuenta de credito:', error);
      return false
    } else {
      console.log('Cuenta agregada exitosamente:', data);
      return true
    }
  } else if (params.account_type === 5){
    const { data, error } = await supabase.from('accounts').insert([
      {
        name: params.name,
        account_type: params.account_type,
        color: params.color,
        icon: params.icon,
        bank_name: params.bank_name,
        is_primary_account: params.is_primary_account,
        loan_amount: params.loan_amount,
        interest_rate: params.interest_rate
      }
    ]);
    if (error) {
      console.error('Error al agregar cuenta de credito:', error);
      return false
    } else {
      console.log('Cuenta agregada exitosamente:', data);
      return true
    }
  }
}

export const updateAccount = async (params) => {
  const { data, error} = await supabase.from('accounts').update({
    name: params.name,
    account_type: params.account_type,
    color: params.color,
    icon: params.icon,
    bank_name: params.bank_name,
    is_primary_account: params.is_primary_account,
    cutt_off_day: params.cutoff_day,
    credit_limit: params.credit_limit,
    estimated_return_rate: params.estimated_return_rate,
    platform: params.platform,
    initial_amount: params.initial_amount,
    loan_amount: params.loan_amount,
    interest_rate: params.interest_rate
  }).eq('id', params.id)
  if (error) {
    console.error('Error al actualizar cuenta:', error);
    return false
  } else {
    return true
  }
}

export const getAccounts = async () => { 
  const { data, error } = await supabase.from('accounts_with_balance').select('*');
  if (error) {
    console.error('Error al obtener cuentas:', error);
  } else {
    return data
  }
}

export const getAccount = async (account_id) => {
  const { data, error } = await supabase.from('accounts').select('*').eq('id', account_id);
  if (error) {
    console.error('Error al obtener cuentas:', error);
  } else {
    return data[0]
  }
}

export const deleteAccount = async (account_id) => {
  try {
    const { error } = await supabase.from('accounts').delete().eq('id', account_id);
    if (error) throw new Error(error.message);
    return true
  } catch (error) {
    throw new DatabaseError(error.message);
  }
}

export const getAccountsTypes = async () => {
  const { data, error } = await supabase.from('accounts_types').select('*');
  if (error) {
    console.error('Error al obtener tipos de cuentas:', error);
  } else {
    return data
  }
}

export const getCategories = async () => {
  const { data, error } = await supabase.from('spendings_categories').select('*');
  if (error) {
    console.error('Error al obtener categorías:', error);
  } else {
    return data
  }
}

export const getBudgetGroups = async () => {
  const { data, error } = await supabase.from('budget_groups').select('*');
  if (error) {
    console.error('Error al obtener grupos de presupuesto:', error);
  } else {
    return data
  }
}

export const getCreditCardSpendings = async (account_id, year, month) => {
  const { data, error } = await supabase.rpc('get_credit_card_spendings', {
    p_account_id: account_id,
    p_year: year,
    p_month: month
  });

  if (error) {
    console.error(('Error al obtener gastos de tarjeta de credito:', error));
  } else {
    return data;
  }
}

export const getBalanceByAccount = async (account_id) => {
  const { data, error } = await supabase.from('balance_by_account').select('*').eq('id', account_id);

  if (error) {
    return error;
  } else {
    return data[0];
  }
}