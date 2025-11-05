import { supabase } from "./client";

export type Account = {
    id: number;
    user_id: string;
    created_at: string;
    name: string;
    account_type: number;
    cutt_off_day: number | null;
    color: string;
    icon: string;
    bank_name: string;
    is_primary_account: boolean;
    credit_limit: number | null;
    platform: string | null;
    initial_amount: number | null;
    estimated_return_rate: number | null;
    loan_amount: number | null;
    interest_rate: number | null;
    balance?: number;
}

export const addAccount = async (params: {
    name: string;
    account_type: number;
    color: string;
    icon: string;
    bank_name: string;
    is_primary_account: boolean;
    cutoff_day?: number;
    credit_limit?: number;
    platform?: string;
    initial_amount?: number;
    estimated_return_rate?: number;
    loan_amount?: number;
    interest_rate?: number;
}) => {
  if (params.account_type === 1 || params.account_type === 3) {
    const { data, error } = await supabase.from("accounts").insert([
      {
        name: params.name,
        account_type: params.account_type,
        color: params.color,
        icon: params.icon,
        bank_name: params.bank_name,
        is_primary_account: params.is_primary_account,
      },
    ]);
    if (error) {
      console.error("Error al agregar cuenta de debito:", error);
      return false;
    } else {
      console.log("Cuenta agregada exitosamente:", data);
      return true;
    }
  } else if (params.account_type === 2) {
    const { data, error } = await supabase.from("accounts").insert([
      {
        name: params.name,
        account_type: params.account_type,
        color: params.color,
        icon: params.icon,
        bank_name: params.bank_name,
        is_primary_account: params.is_primary_account,
        cutt_off_day: params.cutoff_day,
        credit_limit: params.credit_limit,
      },
    ]);
    if (error) {
      console.error("Error al agregar cuenta de credito:", error);
      return false;
    } else {
      console.log("Cuenta agregada exitosamente:", data);
      return true;
    }
  } else if (params.account_type === 4) {
    const { data, error } = await supabase.from("accounts").insert([
      {
        name: params.name,
        account_type: params.account_type,
        color: params.color,
        icon: params.icon,
        bank_name: params.bank_name,
        is_primary_account: params.is_primary_account,
        platform: params.platform,
        initial_amount: params.initial_amount,
        estimated_return_rate: params.estimated_return_rate,
      },
    ]);
    if (error) {
      console.error("Error al agregar cuenta de credito:", error);
      return false;
    } else {
      console.log("Cuenta agregada exitosamente:", data);
      return true;
    }
  } else if (params.account_type === 5) {
    const { data, error } = await supabase.from("accounts").insert([
      {
        name: params.name,
        account_type: params.account_type,
        color: params.color,
        icon: params.icon,
        bank_name: params.bank_name,
        is_primary_account: params.is_primary_account,
        loan_amount: params.loan_amount,
        interest_rate: params.interest_rate,
      },
    ]);
    if (error) {
      console.error("Error al agregar cuenta de credito:", error);
      return false;
    } else {
      console.log("Cuenta agregada exitosamente:", data);
      return true;
    }
  }
};

export const updateAccount = async (params:{
    id: number;
    name: string;
    account_type: number;
    color: string;
    icon: string;
    bank_name: string;
    is_primary_account: boolean;
    cutoff_day?: number;
    credit_limit?: number;
    platform?: string;
    initial_amount?: number;
    estimated_return_rate?: number;
    loan_amount?: number;
    interest_rate?: number;
}) => {
  const { data, error } = await supabase
    .from("accounts")
    .update({
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
      interest_rate: params.interest_rate,
    })
    .eq("id", params.id);
  if (error) {
    console.error("Error al actualizar cuenta:", error);
    return false;
  } else {
    return true;
  }
};

export const getAccounts = async () : Promise<Account[]> => {
  const { data, error } = await supabase
    .from("accounts_with_balance")
    .select("*");
  if (error) {
    throw new Error("Error al obtener cuentas:", error);
  } else {
    return data;
  }
};

export const getAccount = async (account_id: number) : Promise<Account> => {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", account_id);
  if (error) {
    throw error;
  } else {
    return data[0];
  }
};

export const deleteAccount = async (account_id: number) => {
  try {
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", account_id);
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    throw error;
  }
};

export const getAccountsTypes = async () => {
  const { data, error } = await supabase.from("accounts_types").select("*");
  if (error) {
    console.error("Error al obtener tipos de cuentas:", error);
  } else {
    return data;
  }
};

export const getCreditCardSpendings = async (account_id: number, year: number, month:number) => {
  const { data, error } = await supabase.rpc("get_credit_card_spendings", {
    p_account_id: account_id,
    p_year: year,
    p_month: month,
  });

  if (error) {
    throw error;
  } else {
    return data;
  }
};

export const getBalanceByAccount = async (account_id: number) => {
  const { data, error } = await supabase
    .from("balance_by_account")
    .select("*")
    .eq("id", account_id);

  if (error) {
    return error;
  } else {
    return data[0];
  }
};