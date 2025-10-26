import { supabase } from "./client";


export interface Transaction {
  id: number;
  created_at: string;
  user_id: string;
  date: string;
  amount: number;
  description: string;
  category_id?: number; // Used in spendings
  account_id: number;
  to_account_id?: number; // Used in transfers
  from_account_id?: number; // Used in transfers
  months?: number; // Used in deferred spendings
  total_amount?: number; // Used in deferred spendings
  saving_goal?: string; // Used in incomes and transfers
}

export interface TransactionDetails {
  account_color: `#${string}`;
  account_name: string;
  budget_group: string;
  budget_group_id: number;
  category_icon: string ;
  category_name: string;
  transaction_type: TransactionType; 
}

export interface TransactionWithDetails extends Transaction, TransactionDetails {}

export const enum TransactionType {
  SPENDING = "spending",
  INCOME = "income",
  TRANSFER = "transfer",
  DEFERRED = "deferred",
}

export const addTransaction = async ({
  date,
  amount,
  description,
  category_id,
  account_id,
}) => {
  const { error } = await supabase
    .from("spendings")
    .insert([
      {
        date,
        amount,
        description,
        category_id,
        account_id,
      },
    ])
    .select();

  if (error) {
    console.error("Error adding transaction to supabase:", error);
    return error;
  }
  return true;
};

export const addIncome = async ({ date, amount, description, account_id }) => {
  const { error } = await supabase
    .from("incomes")
    .insert([
      {
        date,
        amount,
        description,
        account_id,
      },
    ])
    .select();

  if (error) {
    console.error("Error adding income to supabase:", error);
    return error;
  }
  return true;
};

export const addTransfer = async ({
  date,
  amount,
  description,
  from_account_id,
  to_account_id,
}) => {
  const { error } = await supabase
    .from("transfers")
    .insert([
      {
        date,
        amount,
        description,
        from_account_id,
        to_account_id,
      },
    ])
    .select();

  if (error) {
    console.error("Error adding transfer to supabase:", error);
    return error;
  } else {
    return true;
  }
};

export const addDeferred = async ({
  date,
  amount,
  description,
  account_id,
  category_id,
  months,
}) => {
  const { error } = await supabase
    .from("deferred_spendings")
    .insert([
      {
        start_date: date,
        total_amount: amount,
        description,
        account_id,
        category_id,
        months,
      },
    ])
    .select();

  if (error) {
    return error;
  } else {
    return true;
  }
};

export const updateTransaction = async (transaction_id, type, params) => {
  let table = "";
  if (type === "spending") table = "spendings";
  else if (type === "income") table = "incomes";
  else if (type === "transfer") table = "transfers";
  else if (type === "deferred") table = "deferred_spendings";
  else return Error("Invalid transaction type");

  const { data, error } = await supabase
    .from(table)
    .update(params)
    .eq("id", transaction_id);

  if (error) {
    console.error("Error al actualizar transaccion:", error);
    return error;
  } else {
    return true;
  }
};

export const getTransaction = async (
  transaction_id: number,
  type: TransactionType
): Promise<Transaction> => {

  let data, error;
  if (type === "spending") {
    ({ data, error } = await supabase
      .from("spendings")
      .select("*, deferred_spendings(months, total_amount)")
      .eq("id", transaction_id)
      .single());
    data.months = data.deferred_spendings
      ? data.deferred_spendings.months
      : null;
    if (data.deferred_spendings)
      data.amount = data.deferred_spendings.total_amount;
    delete data.deferred_spendings;
  } else {
    const table = type === "income" ? "incomes" : "transfers";
    ({ data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", transaction_id)
      .single());
  }
  if (error) {
    throw error;
  }
  return data;

};

export const deleteTransaction = async (transaction_id, type) => {
  let table = "";
  if (type === "spending") table = "spendings";
  else if (type === "income") table = "incomes";
  else if (type === "transfer") table = "transfers";
  else if (type === "deferred") table = "deferred_spendings";
  else return Error("Invalid transaction type");

  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", transaction_id);

  if (error) {
    return error;
  }
  return true;
};

export const getMonthlyBalance = async (month = null) => {
  const { data, error } = await supabase.rpc("get_monthly_balance", {
    p_month: month, // o puedes omitirlo si tienes default en la función
  });
  return { data, error };
};

export const getMonthlyIncomes = async (month = null) => {
  const { data, error } = await supabase.rpc("get_monthly_incomes", {
    p_month: month, // o puedes omitirlo si tienes default en la función
  });
  return { data, error };
};

export const getMonthlySpendings = async (month = null) => {
  const { data, error } = await supabase.rpc("get_monthly_spendings", {
    p_month: month, // o puedes omitirlo si tienes default en la función
  });
  return { data, error };
};

export const getSpendingsTable = async (
  start_date?:Date,
  end_date?:Date,
  account?:number,
  category?:number,
  budget_group?:number
) :Promise<TransactionWithDetails[]> => {
  const { data, error } = await supabase.rpc("get_filtered_spendings", {
    date_start_range: start_date || null,
    date_end_range: end_date || null,
    account: account || null,
    category: category || null,
    p_budget_group: budget_group || null,
  });

  if (error) {
    throw error;
  } else {
    return data;
  }
};


export const getCategories = async () => {
  const { data, error } = await supabase
    .from("spendings_categories")
    .select("*");
  if (error) {
    console.error("Error al obtener categorías:", error);
  } else {
    return data;
  }
};

export const getBudgetGroups = async () => {
  const { data, error } = await supabase.from("budget_groups").select("*");
  if (error) {
    console.error("Error al obtener grupos de presupuesto:", error);
  } else {
    return data;
  }
};


